from django.conf import settings
from django.utils import timezone

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from rest_framework_simplejwt.tokens import RefreshToken

from .models import EmailOTP, User, Plan, UserSubscription
from .serializers import (
    SendOTPSerializer,
    VerifyOTPSerializer,
    PlanSerializer,
    UpgradeSubscriptionSerializer,
)
from .services import generate_otp, hash_otp, send_otp_email, can_resend


def ensure_free_plan_and_subscription(user: User):
    free_plan, _ = Plan.objects.get_or_create(
        name="Free",
        defaults={
            "ad_free": False,
            "max_downloads_per_month": 0,
            "audio_quality": "standard",
            "is_active": True,
        },
    )

    sub, created = UserSubscription.objects.get_or_create(
        user=user,
        defaults={
            "plan": free_plan,
            "billing_cycle": "none",
            "start_date": timezone.now().date(),
            "is_active": True,
        },
    )

    if not created and sub.plan is None:
        sub.plan = free_plan
        sub.save(update_fields=["plan"])

    return sub


class SendEmailOTP(APIView):
    def post(self, request):
        serializer = SendOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"].lower().strip()

        existing = (
            EmailOTP.objects.filter(email=email, is_used=False)
            .order_by("-created_at")
            .first()
        )

        if existing and not can_resend(existing):
            return Response(
                {"error": "Please wait before requesting another OTP."},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        otp = generate_otp(getattr(settings, "OTP_LENGTH", 6))
        otp_h = hash_otp(email, otp)
        expires_at = EmailOTP.default_expiry()

        if existing and not existing.is_expired():
            existing.otp_hash = otp_h
            existing.expires_at = expires_at
            existing.attempts = 0
            existing.last_sent_at = timezone.now()
            existing.save()
        else:
            EmailOTP.objects.create(
                email=email,
                otp_hash=otp_h,
                expires_at=expires_at,
                last_sent_at=timezone.now(),
            )

        # Sends OTP using your configured email backend
        send_otp_email(email, otp)

        return Response({"message": "OTP sent"}, status=status.HTTP_200_OK)


class VerifyEmailOTP(APIView):
    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"].lower().strip()
        otp = serializer.validated_data["otp"]

        otp_row = (
            EmailOTP.objects.filter(email=email, is_used=False)
            .order_by("-created_at")
            .first()
        )

        if not otp_row:
            return Response(
                {"error": "No OTP request found. Please request OTP again."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if otp_row.is_expired():
            return Response(
                {"error": "OTP expired. Please request a new OTP."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if otp_row.attempts >= getattr(settings, "OTP_MAX_ATTEMPTS", 5):
            return Response(
                {"error": "Too many attempts. Please request a new OTP."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if otp_row.otp_hash != hash_otp(email, otp):
            otp_row.attempts += 1
            otp_row.save(update_fields=["attempts"])
            return Response(
                {"error": "Invalid OTP."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        otp_row.is_used = True
        otp_row.save(update_fields=["is_used"])

        user, _created = User.objects.get_or_create(
            email=email,
            defaults={"username": email},
        )

        sub = ensure_free_plan_and_subscription(user)
        refresh = RefreshToken.for_user(user)
        plan = sub.plan

        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "id": user.id,
                    "email": user.email,
                },
                "plan": {
                    "name": plan.name,
                    "ad_free": plan.ad_free,
                    "max_downloads_per_month": plan.max_downloads_per_month,
                    "audio_quality": plan.audio_quality,
                },
            },
            status=status.HTTP_200_OK,
        )


class Me(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        sub = UserSubscription.objects.filter(user=user).select_related("plan").first()

        if not sub:
            sub = ensure_free_plan_and_subscription(user)

        plan = sub.plan
        remaining = max(
            0,
            (plan.max_downloads_per_month if plan else 0) - sub.downloads_used_this_month,
        )

        return Response(
            {
                "id": user.id,
                "email": user.email,
                "plan": {
                    "name": plan.name if plan else None,
                    "ad_free": plan.ad_free if plan else False,
                    "max_downloads_per_month": plan.max_downloads_per_month if plan else 0,
                    "audio_quality": plan.audio_quality if plan else "standard",
                },
                "usage": {
                    "downloads_used_this_month": sub.downloads_used_this_month,
                    "downloads_remaining": remaining,
                },
            }
        )


class PlanList(APIView):
    def get(self, request):
        plans = Plan.objects.filter(is_active=True).order_by("id")
        return Response(PlanSerializer(plans, many=True).data)


class UpgradeSubscription(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = UpgradeSubscriptionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        plan_name = serializer.validated_data["plan_name"]
        plan = Plan.objects.filter(name=plan_name, is_active=True).first()

        if not plan:
            return Response(
                {"error": "Plan not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        sub = UserSubscription.objects.filter(user=request.user).select_related("plan").first()
        if not sub:
            sub = ensure_free_plan_and_subscription(request.user)

        sub.plan = plan
        sub.billing_cycle = (
            UserSubscription.BILL_MONTHLY
            if plan.name != "Free"
            else UserSubscription.BILL_NONE
        )
        sub.start_date = timezone.now().date()
        sub.is_active = True
        sub.save()

        return Response(
            {
                "message": "Subscription updated successfully.",
                "plan": {
                    "name": plan.name,
                    "ad_free": plan.ad_free,
                    "max_downloads_per_month": plan.max_downloads_per_month,
                    "audio_quality": plan.audio_quality,
                },
            },
            status=status.HTTP_200_OK,
        )
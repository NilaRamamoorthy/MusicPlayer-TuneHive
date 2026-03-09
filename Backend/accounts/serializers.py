from rest_framework import serializers


class SendOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()


class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(min_length=6, max_length=6)

    def validate_otp(self, value):
        if not value.isdigit():
            raise serializers.ValidationError("OTP must be 6 digits.")
        return value
    

from .models import Plan


class PlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plan
        fields = [
            "id",
            "name",
            "ad_free",
            "max_downloads_per_month",
            "audio_quality",
            "is_active",
        ]


class UpgradeSubscriptionSerializer(serializers.Serializer):
    plan_name = serializers.CharField()

    def validate_plan_name(self, value):
        allowed = {"Free", "Pro", "Premium"}
        if value not in allowed:
            raise serializers.ValidationError("Invalid plan.")
        return value
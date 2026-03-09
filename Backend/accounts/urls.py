from django.urls import path
from .views import (
    SendEmailOTP,
    VerifyEmailOTP,
    Me,
    PlanList,
    UpgradeSubscription,
)

urlpatterns = [
    path("auth/email/send-otp/", SendEmailOTP.as_view()),
    path("auth/email/verify-otp/", VerifyEmailOTP.as_view()),
    path("me/", Me.as_view()),
    path("plans/", PlanList.as_view()),
    path("subscription/upgrade/", UpgradeSubscription.as_view()),
]
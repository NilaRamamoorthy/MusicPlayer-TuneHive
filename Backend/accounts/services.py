import hashlib
import random
from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone
from datetime import timedelta


def generate_otp(length=6):
    return "".join(random.choices("0123456789", k=length))


def hash_otp(email, otp):
    raw = f"{email}:{otp}:{settings.SECRET_KEY}"
    return hashlib.sha256(raw.encode()).hexdigest()


def can_resend(otp_obj):
    cooldown = getattr(settings, "OTP_RESEND_COOLDOWN_SECONDS", 30)
    if not otp_obj.last_sent_at:
        return True
    return timezone.now() >= otp_obj.last_sent_at + timedelta(seconds=cooldown)


def send_otp_email(email, otp):
    subject = "Your Tune Hive OTP"
    message = f"Your OTP is {otp}. It will expire in 10 minutes."
    
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [email],
        fail_silently=True,
    )
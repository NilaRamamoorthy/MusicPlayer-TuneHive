from django.conf import settings
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils import timezone
from datetime import timedelta, date


class UserManager(BaseUserManager):
    use_in_migrations = True

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, username=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email=email, password=password, **extra_fields)


class User(AbstractUser):
    # We’ll use email as the login identifier
    username = models.CharField(max_length=150, unique=True)  # keep for Django admin compatibility
    email = models.EmailField(unique=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []  # no username required for createsuperuser in prompts

    objects = UserManager()

    def __str__(self):
        return self.email


class Plan(models.Model):
    QUALITY_STANDARD = "standard"
    QUALITY_HIGH = "high"
    QUALITY_LOSSLESS = "lossless"

    QUALITY_CHOICES = [
        (QUALITY_STANDARD, "Standard"),
        (QUALITY_HIGH, "High"),
        (QUALITY_LOSSLESS, "Lossless"),
    ]

    name = models.CharField(max_length=50, unique=True)  # Free/Pro/Premium
    ad_free = models.BooleanField(default=False)
    max_downloads_per_month = models.IntegerField(default=0)
    audio_quality = models.CharField(max_length=20, choices=QUALITY_CHOICES, default=QUALITY_STANDARD)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class UserSubscription(models.Model):
    BILL_NONE = "none"
    BILL_MONTHLY = "monthly"
    BILL_YEARLY = "yearly"

    BILLING_CHOICES = [
        (BILL_NONE, "None"),
        (BILL_MONTHLY, "Monthly"),
        (BILL_YEARLY, "Yearly"),
    ]

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    plan = models.ForeignKey(Plan, on_delete=models.SET_NULL, null=True, blank=True)

    billing_cycle = models.CharField(max_length=20, choices=BILLING_CHOICES, default=BILL_NONE)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    downloads_used_this_month = models.IntegerField(default=0)
    last_reset_date = models.DateField(default=date.today)

    def __str__(self):
        return f"{self.user.email} - {self.plan.name if self.plan else 'No Plan'}"


class EmailOTP(models.Model):
    email = models.EmailField(db_index=True)
    otp_hash = models.CharField(max_length=128)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    attempts = models.IntegerField(default=0)
    is_used = models.BooleanField(default=False)
    last_sent_at = models.DateTimeField(null=True, blank=True)

    def is_expired(self):
        return timezone.now() > self.expires_at

    @staticmethod
    def default_expiry():
        return timezone.now() + timedelta(minutes=getattr(settings, "OTP_EXPIRY_MINUTES", 5))

    def __str__(self):
        return f"{self.email} OTP"
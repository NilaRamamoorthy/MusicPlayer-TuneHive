from django.apps import AppConfig
from django.db.models.signals import post_migrate


def seed_plans(sender, **kwargs):
    from .models import Plan

    defaults = [
        dict(
            name="Free",
            ad_free=False,
            max_downloads_per_month=0,
            audio_quality=Plan.QUALITY_STANDARD,
            is_active=True,
        ),
        dict(
            name="Pro",
            ad_free=True,
            max_downloads_per_month=50,
            audio_quality=Plan.QUALITY_HIGH,
            is_active=True,
        ),
        dict(
            name="Premium",
            ad_free=True,
            max_downloads_per_month=999999,
            audio_quality=Plan.QUALITY_LOSSLESS,
            is_active=True,
        ),
    ]

    for data in defaults:
        Plan.objects.update_or_create(
            name=data["name"],
            defaults=data,
        )


class AccountsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "accounts"

    def ready(self):
        post_migrate.connect(seed_plans, sender=self)
# Generated by Django 5.1.7 on 2025-04-23 13:32

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('bildirim', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='bildirim',
            name='alici',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='bildirimler', to=settings.AUTH_USER_MODEL),
        ),
    ]

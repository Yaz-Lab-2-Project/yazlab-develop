# Generated by Django 5.1.7 on 2025-04-23 13:32

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('ilanlar', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='JuriDegerlendirme',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('sonuc', models.CharField(choices=[('OLUMLU', 'Olumlu'), ('OLUMSUZ', 'Olumsuz')], max_length=10, verbose_name='Değerlendirme Sonucu')),
                ('rapor', models.FileField(upload_to='juri_raporlari/', verbose_name='Jüri Raporu')),
                ('degerlendirme_tarihi', models.DateTimeField(auto_now_add=True)),
                ('aciklama', models.TextField(blank=True, null=True, verbose_name='Açıklama')),
            ],
            options={
                'verbose_name': 'Jüri Değerlendirme',
                'verbose_name_plural': 'Jüri Değerlendirmeleri',
            },
        ),
        migrations.CreateModel(
            name='JuriAtama',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('atama_tarihi', models.DateTimeField(auto_now_add=True)),
                ('ilan', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='juri_atamalari', to='ilanlar.ilan')),
            ],
            options={
                'verbose_name': 'Jüri Atama',
                'verbose_name_plural': 'Jüri Atamaları',
            },
        ),
    ]

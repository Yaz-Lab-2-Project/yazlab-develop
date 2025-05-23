# Generated by Django 5.1.7 on 2025-04-23 13:32

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='LogKaydi',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('islem_turu', models.CharField(choices=[('GIRIS', 'Giriş'), ('CIKIS', 'Çıkış'), ('EKLEME', 'Ekleme'), ('GUNCELLEME', 'Güncelleme'), ('SILME', 'Silme'), ('BILDIRIM', 'Bildirim'), ('DIGER', 'Diğer')], max_length=15, verbose_name='İşlem Türü')),
                ('islem_detayi', models.TextField(verbose_name='İşlem Detayı')),
                ('islem_tarihi', models.DateTimeField(auto_now_add=True)),
                ('ip_adresi', models.GenericIPAddressField(blank=True, null=True, verbose_name='IP Adresi')),
            ],
            options={
                'verbose_name': 'Log Kaydı',
                'verbose_name_plural': 'Log Kayıtları',
                'ordering': ['-islem_tarihi'],
            },
        ),
    ]

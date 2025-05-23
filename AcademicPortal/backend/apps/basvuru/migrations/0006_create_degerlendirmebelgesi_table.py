# Generated by Django manually

from django.db import migrations, models
import django.db.models.deletion
import apps.basvuru.models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
        ('basvuru', '0005_degerlendirmebelgesi'),
    ]

    operations = [
        migrations.CreateModel(
            name='DegerlendirmeBelgesi',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('belge', models.FileField(upload_to=apps.basvuru.models.degerlendirme_belgesi_path)),
                ('belge_adi', models.CharField(blank=True, max_length=255)),
                ('yukleme_tarihi', models.DateTimeField(auto_now_add=True)),
                ('basvuru', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='degerlendirme_belgeleri', to='basvuru.basvuru')),
                ('yukleyen', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='users.user')),
            ],
            options={
                'verbose_name': 'Değerlendirme Belgesi',
                'verbose_name_plural': 'Değerlendirme Belgeleri',
                'ordering': ['-yukleme_tarihi'],
                'db_table': 'basvuru_degerlendirmebelgesi',
            },
        ),
    ] 
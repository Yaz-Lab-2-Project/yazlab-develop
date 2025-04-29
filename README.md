# Akademik Personel Başvuru Sistemi

## Proje Özeti
Akademik Personel Başvuru Sistemi, Kocaeli Üniversitesi'nin akademik personel başvuru süreçlerini dijitalleştiren bir web uygulamasıdır. Sistem, üniversitenin Öğretim Üyeliği Atama ve Yükseltme Yönergesi'ne uygun olarak tasarlanmış olup, Dr. Öğretim Üyesi, Doçent ve Profesör kadrolarına başvuruların online olarak alınması, değerlendirilmesi ve sonuçlandırılması süreçlerini yönetir.

## Temel Özellikler
- Dört farklı kullanıcı rolü (Aday, Admin, Yönetici, Jüri Üyesi) için özelleştirilmiş arayüzler
- İlan oluşturma ve yönetme
- Akademik faaliyet ekleme ve belge yükleme
- Akademik kriterlere göre otomatik puan hesaplama
- Tablo 5 otomatik oluşturma
- Jüri değerlendirme süreci
- PDF rapor oluşturma

## Geliştirme Ortamı

### Kullanılan Teknolojiler
- **Frontend**: React.js, Redux, Material-UI
- **Backend**: Django, Django REST Framework
- **Veritabanı**: SQLite
- **Diğer**: JWT, Celery, Redis, WeasyPrint

### Gereksinimler
- Node.js v16.17.0 veya üzeri
- Python 3.9.7 veya üzeri
- npm 8.15.0 veya üzeri
- Git

## Kurulum

### Backend Kurulumu
```bash
# Repoyu klonlayın
git clone https://github.com/kullaniciadi/akademik-portal.git
cd akademik-portal/backend

# Sanal ortam oluşturun ve aktif edin
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Bağımlılıkları yükleyin
pip install -r requirements.txt

# Veritabanı migrasyonlarını uygulayın
python manage.py migrate

# Test verileri yükleyin (isteğe bağlı)
python manage.py loaddata initial_data

# Geliştirme sunucusunu başlatın
python manage.py runserver
```

### Frontend Kurulumu
```bash
# Proje dizinine gidin
cd ../frontend

# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm start
```

## Kullanım
Sistem başarıyla kurulduktan sonra, tarayıcınızdan `http://localhost:3000` adresine giderek uygulamaya erişebilirsiniz.

### Test Kullanıcıları
Sistem test kullanıcıları aşağıdaki gibidir:

| Rol | TC Kimlik No | Şifre |
|-----|-------------|-------|
| Aday | 12345678901 | test123 |
| Admin | 23456789012 | admin123 |
| Yönetici | 34567890123 | yonetici123 |
| Jüri Üyesi | 45678901234 | juri123 |

## Proje Yapısı
```
akademik-portal/
├── backend/
│   ├── academic_portal/    # Ana Django projesi
│   ├── apps/               # Django uygulamaları
│   │   ├── users/          # Kullanıcı yönetimi
│   │   ├── ilanlar/        # İlan yönetimi
│   │   ├── basvuru/        # Başvuru işlemleri
│   │   ├── faaliyet/       # Akademik faaliyet yönetimi
│   │   ├── juri/           # Jüri ve değerlendirme süreci
│   │   └── ...
│   ├── manage.py
│   └── requirements.txt
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/     # Yeniden kullanılabilir bileşenler
    │   ├── pages/          # Sayfa bileşenleri
    │   ├── services/       # API servisleri
    │   ├── redux/          # Redux state yönetimi
    │   └── ...
    ├── package.json
    └── README.md
```

## Modüller

### Aday Modülü
- İlan görüntüleme ve başvuru
- Akademik faaliyet ekleme ve belge yükleme
- Tablo 5 oluşturma ve düzenleme
- Başvuru durumu takibi

### Admin Modülü
- İlan oluşturma ve yönetme
- Organizasyon yapısı yönetimi
- Kullanıcı yönetimi
- Sistem ayarları yapılandırma

### Yönetici Modülü
- Atama kriterleri yönetimi
- Başvuru ön değerlendirme
- Jüri atama
- Nihai karar verme

### Jüri Üyesi Modülü
- Başvuru inceleme
- Faaliyet doğrulama
- Değerlendirme raporu oluşturma

## Arayüz Görüntüleri

![Ekran görüntüsü 2025-04-29 192817](https://github.com/user-attachments/assets/2da1fa79-cae4-4ddb-88c0-eadb7dcd5b61)

*Aday Ana Sayfası*

![Ekran görüntüsü 2025-04-29 193130](https://github.com/user-attachments/assets/01d89fdb-e378-4ae2-b9ea-e4590af14017)
*Başvuru Formu*

![image](https://github.com/user-attachments/assets/5b69e14e-552f-44ce-9f58-522383cf8e2a)
*Yönetici Paneli*

## Veritabanı Şeması
Projenin veritabanı şeması [bu bağlantıdan]([Adsız doküman (5).pdf](https://github.com/user-attachments/files/19965602/Adsiz.dokuman.5.pdf)) görüntülenebilir.

## Katkıda Bulunma
1. Projeyi fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)

3. Değişikliklerinizi commit edin (`git commit -m 'Add some amazing feature'`)
4. Branch'inize push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## İletişim
Proje sorumlusu: 
- Yusuf Samet ÖZAL - 221307017

- Doğukan KIRALI - 221307039

## Lisans
Bu proje [KOU Lisansı](LICENSE) altında lisanslanmıştır.

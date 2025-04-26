import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // useParams ve useNavigate import edin
import UserNavbar from "../../components/navbars/UserNavbar";
import { useAuth } from "../../context/AuthContext"; // AuthContext'i import edin

// CSRF token'ı almak için getCookie fonksiyonu (AuthContext'ten veya global olarak import edilebilir)
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Sabit verileri kaldırın
// const academicAnnouncements = [ ... ];

const Apply = () => {
  const { ilanId } = useParams(); // URL'den ilanId'yi al
  const { user } = useAuth(); // Giriş yapmış kullanıcıyı Context'ten al
  const navigate = useNavigate();

  const [announcement, setAnnouncement] = useState(null); // İlan detayları
  const [requiredDocs, setRequiredDocs] = useState([]); // Backend'den gelen gerekli belgeler listesi
  const [applicationData, setApplicationData] = useState({}); // Yüklenecek dosyaları tutacak state {docKey: File}
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true); // İlan yükleme durumu
  const [error, setError] = useState(null); // Hata durumu
  const [submitting, setSubmitting] = useState(false); // Başvuru gönderme durumu

  // İlan detaylarını çekme
  useEffect(() => {
    if (!ilanId) return;

    setLoading(true);
    setError(null);
    fetch(`http://localhost:8000/api/ilanlar/${ilanId}/`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) {
          throw new Error(`İlan detayı alınamadı (${res.status})`);
        }
        return res.json();
      })
      .then(data => {
        setAnnouncement(data);
        // ===> Backend'den Gelen Gerekli Belge Listesi <===
        // Backend ilan detayında gerekli belgelerin listesini nasıl döndürüyor?
        // Varsayım: data.gerekli_belgeler_listesi gibi bir alan var
        // VEYA kadro_tipi'ne göre kriterlerden almanız gerekebilir.
        // Şimdilik örnek bir liste kullanıyoruz, burayı backend yanıtınıza göre GÜNCELLEYİN!
        // Örneğin: Özgeçmiş, Diploma, Yabancı Dil Belgesi backend model field isimleri olabilir.
        const backendRequiredDocs = [
            { key: 'ozgecmis_dosyasi', label: 'Özgeçmiş Dosyası' },
            { key: 'diploma_belgeleri', label: 'Diploma Belgeleri' },
            { key: 'yabanci_dil_belgesi', label: 'Yabancı Dil Belgesi' },
            // ... ilana veya kadro tipine göre backend'den gelen diğer belgeler ...
            // Örnek: { key: 'yaygin_yayim', label: 'Yaygın Yayım Kanıtı'}
        ];
        setRequiredDocs(backendRequiredDocs);
        // Gerekli belgeler için applicationData state'ini başlangıçta boş File nesneleriyle doldur
        const initialDocState = {};
        backendRequiredDocs.forEach(doc => {
            initialDocState[doc.key] = null; // Başlangıçta dosya yok
        });
        setApplicationData(initialDocState);

      })
      .catch(err => {
        console.error("İlan detayı çekme hatası:", err);
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [ilanId]); // ilanId değiştiğinde tekrar çalışır

  // Dosya seçildiğinde state'i güncelle
  const handleFileChange = (e, docKey) => {
    const file = e.target.files[0] || null;
    setApplicationData(prevData => ({
      ...prevData,
      [docKey]: file,
    }));
  };

  // Formu gönderme
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const csrftoken = getCookie('csrftoken');
    if (!csrftoken) {
      setError("Güvenlik token'ı alınamadı.");
      setSubmitting(false);
      return;
    }

    // FormData oluştur
    const formData = new FormData();
    formData.append('ilan', ilanId); // İlan ID'sini gönderiyoruz (backend 'ilan' field bekliyor varsayımı)
    // aday_id backend'de request.user'dan alınmalı

    let hasMissingFile = false;
    // State'teki dosyaları FormData'ya ekle
    requiredDocs.forEach(doc => {
      if (applicationData[doc.key] instanceof File) {
        formData.append(doc.key, applicationData[doc.key]); // Anahtar isimleri backend ile eşleşmeli!
      } else {
          // Gerekli dosya seçilmemişse hata ver
          console.error(`Eksik dosya: ${doc.label}`);
          hasMissingFile = true;
      }
    });

    if (hasMissingFile) {
        setError("Lütfen gerekli tüm belgeleri yükleyin.");
        setSubmitting(false);
        return;
    }

    console.log("Gönderilen FormData içeriği:");
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }


    try {
      const response = await fetch('http://localhost:8000/api/basvurular/', {
        method: 'POST',
        headers: {
          // 'Content-Type': 'multipart/form-data', // FormData kullanırken BUNU AYARLAMAYIN! Tarayıcı otomatik yapar.
          'X-CSRFToken': csrftoken
        },
        credentials: 'include',
        body: formData // FormData nesnesini gönder
      });

      if (response.ok) {
        // Başvuru başarılı
        setSubmitted(true);
        setShowForm(false); // Formu gizle
        console.log("Başvuru başarıyla gönderildi!");
      } else {
        // Başvuru hatası
        const errorData = await response.json();
        console.error("Başvuru gönderme hatası:", errorData);
        // Backend'den gelen detaylı hata mesajlarını göstermeye çalış
        let errorMsg = `Hata (${response.status}): Başvuru gönderilemedi. `;
        for (const key in errorData) {
            if (Array.isArray(errorData[key])) {
                errorMsg += `${key}: ${errorData[key].join(', ')} `;
            } else {
                errorMsg += `${key}: ${errorData[key]} `;
            }
        }
        setError(errorMsg.trim());
      }
    } catch (err) {
      console.error("Başvuru isteği sırasında hata:", err);
      setError("Başvuru gönderilirken bir ağ hatası oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  // --- Yükleme ve Hata Durumları ---
  if (loading) {
    return (
      <div className="container">
        <UserNavbar />
        <div className="section">İlan bilgileri yükleniyor...</div>
      </div>
    );
  }

  if (error && !announcement) { // Eğer ilan yüklenirken hata olduysa
     return (
       <div className="container">
         <UserNavbar />
         <div className="section">Hata: {error}</div>
       </div>
     );
   }

  if (!announcement) {
    return (
      <div className="container">
        <UserNavbar />
        <div className="section">İlan bulunamadı veya yüklenemedi.</div>
      </div>
    );
  }

  // --- İlan ve Başvuru Formu ---
  return (
    <>
      {/* CSS Kodları (Değişiklik Yok) */}
      <style>
        {`
          /* Genel Konteyner */
          .container {
              background-color: #f4f6f9;
              padding: 2rem;
              border-radius: 16px;
              max-width: 800px;
              margin: 2rem auto;
              font-family: sans-serif;
              color: #555;
          }

          .title {
              color: #333;
              font-size: 2rem;
              margin-bottom: 1rem;
              text-align: center;
          }

          .subtitle {
              color: #009944;
              font-size: 1.25rem;
              margin-bottom: 0.5rem;
          }

          .section {
              background-color: #fff;
              border: 1px solid #eee;
              padding: 1rem;
              border-radius: 12px;
              margin-bottom: 1.5rem;
          }

          ul {
              padding-left: 1.2rem;
          }

          li {
              margin-bottom: 0.3rem;
              color: #666;
          }

          .form {
              display: flex;
              flex-direction: column;
              gap: 1rem;
          }

          label {
              display: flex;
              flex-direction: column;
              font-weight: bold;
              color: #555;
          }

          input[type="text"],
          input[type="email"],
          input[type="file"] {
              margin-top: 0.5rem;
              padding: 0.5rem;
              border-radius: 8px;
              border: 1px solid #ccc;
          }

          .submitButton {
              background-color: #009944;
              color: #fff;
              border: none;
              padding: 0.75rem 1rem;
              border-radius: 10px;
              cursor: pointer;
              transition: background-color 0.3s;
              font-size: 1rem;
              font-weight: bold;
          }

          .submitButton:hover {
              background-color: #007c39;
          }

          /* Scrollbar */
          ::-webkit-scrollbar {
              width: 10px;
          }

          ::-webkit-scrollbar-thumb {
              background-color: #ccc;
              border-radius: 5px;
          }

          ::-webkit-scrollbar-track {
              background: transparent;
          }

          /* Hover efektleri */
          .section:hover {
              background-color: #e6f0e6;
          }
        `}
      </style>
      <UserNavbar />
      <div className="container">
        <div className="section">
          {/* İlan Detayları (API'den gelen 'announcement' state'ine göre) */}
          <h1 className="title">{announcement.baslik || 'İlan Başlığı Yok'}</h1>
           {/* Backend modelinize göre alanları güncelleyin */}
          <p><strong>Fakülte/Birim:</strong> {announcement.birim_ad || announcement.birim || 'Belirtilmemiş'}</p>
          <p><strong>Bölüm:</strong> {announcement.bolum_ad || announcement.bolum || 'Belirtilmemiş'}</p>
          <p><strong>Anabilim Dalı:</strong> {announcement.anabilim_dali_ad || announcement.anabilim_dali || 'Belirtilmemiş'}</p>
          <p><strong>Kadro:</strong> {announcement.kadro_tipi_ad || announcement.kadro_tipi || 'Belirtilmemiş'}</p>
          <p>
            <strong>Başvuru Tarihleri:</strong>
            {new Date(announcement.baslangic_tarihi).toLocaleDateString('tr-TR')} -{' '}
            {new Date(announcement.bitis_tarihi).toLocaleDateString('tr-TR')}
          </p>
          <p><strong>Açıklama:</strong> {announcement.aciklama || 'Açıklama yok.'}</p>

          {/* Gerekli Belgeler (Backend'den gelen 'requiredDocs' state'ine göre) */}
          <h3 className="subtitle">Gerekli Belgeler</h3>
          <ul>
            {requiredDocs.length > 0
                ? requiredDocs.map((doc) => <li key={doc.key}>{doc.label}</li>)
                : <li>Gerekli belge bilgisi bulunamadı.</li>
            }
          </ul>

          {/* Başvuru Butonu / Formu / Sonuç Mesajı */}
          {!showForm && !submitted && (
            <button
              onClick={() => setShowForm(true)}
              className="submitButton"
            >
              Başvuru Yap
            </button>
          )}

          {showForm && !submitted && (
            <form onSubmit={handleSubmit} className="form">
              <h3 className="subtitle">Belgeleri Yükle</h3>
               {/* Ad/Soyad ve Email alanları kaldırıldı, backend user'dan almalı */}
              {requiredDocs.map((doc) => (
                <label key={doc.key}>
                  {doc.label}:
                  <input
                    type="file"
                    // name={doc.key} // FormData için name'e gerek yok, key'i kullanıyoruz
                    onChange={(e) => handleFileChange(e, doc.key)}
                    required // Tüm belgeler zorunlu mu? Backend kontrol etmeli.
                    disabled={submitting}
                  />
                  {/* Seçilen dosya adını gösterme (isteğe bağlı) */}
                  {applicationData[doc.key] && <span> Seçildi: {applicationData[doc.key].name}</span>}
                </label>
              ))}

              {/* Başvuru sırasındaki hata mesajı */}
              {error && <p className="error-message" style={{color: 'red'}}>{error}</p>}

              <button type="submit" className="submitButton" disabled={submitting}>
                {submitting ? 'Gönderiliyor...' : 'Başvuruyu Gönder'}
              </button>
            </form>
          )}

          {submitted && (
            <div className="section" style={{borderColor: 'green', color: 'green'}}>
              ✅ Başvurunuz başarıyla alınmıştır. Teşekkür ederiz! Başvurularım sayfasından durumunu takip edebilirsiniz.
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Apply;
import React, { useState, useEffect } from "react";
import { FaUserCircle } from "react-icons/fa";
import UserNavbar from "../../components/navbars/UserNavbar";
import { useAuth } from "../../context/AuthContext"; // AuthContext'i import et
import api from '../../services/api';

// CSRF token'ı almak için getCookie fonksiyonu
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


export default function UserProfile() {
  const { user, isLoading: authLoading, login: updateUserInContext } = useAuth(); // Context'ten kullanıcıyı ve login fonksiyonunu al (state güncellemek için)
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    telefon: "",
    TC_KIMLIK: "", // Backend field adı
    akademik_unvan: "", // Backend'e gönderilecek ID'yi tutacak
    // Kurum ve Bölüm kaldırıldı
  });
  const [academicTitles, setAcademicTitles] = useState([]); // Kadro tiplerini tutacak state
  const [loading, setLoading] = useState(true); // Genel yükleme durumu
  const [submitting, setSubmitting] = useState(false); // Form gönderme durumu
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // 1. Akademik Unvanları (Kadro Tiplerini) Çekme
  useEffect(() => {
    api.get('/kadro-tipi/')
      .then(res => {
        setAcademicTitles(res.data.results || res.data);
      })
      .catch(err => {
        setError(err.message || "Akademik unvanlar yüklenemedi.");
      });
  }, []);

  // 2. Context'ten gelen kullanıcı bilgisiyle formu doldurma
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        telefon: user.telefon || "",
        TC_KIMLIK: user.TC_KIMLIK || "",
        // Backend'den user.akademik_unvan ID olarak gelmeli (serializer'da ayarlıysa)
        // Eğer user.akademik_unvan nested obje ise user.akademik_unvan.id olmalı
        akademik_unvan: user.akademik_unvan || "",
      });
      setLoading(false); // Formu doldurduktan sonra yüklemeyi bitir
    } else if (!authLoading) {
        // Auth context yüklemesi bitti ama kullanıcı yoksa hata ver/login'e yönlendir
        setError("Kullanıcı bilgileri alınamadı. Lütfen tekrar giriş yapın.");
        setLoading(false);
    }
  }, [user, authLoading]); // user veya authLoading değiştiğinde çalışır

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage('');
    setSubmitting(true);

    const csrftoken = getCookie('csrftoken');
    if (!csrftoken) {
      setError("Güvenlik token'ı alınamadı.");
      setSubmitting(false);
      return;
    }

    // Backend'e gönderilecek veriyi hazırla (sadece güncellenebilir alanlar)
    // Şifre ve TCKN genellikle buradan güncellenmez
    const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        telefon: formData.telefon,
        // akademik_unvan ID olarak gönderilmeli. Select'in value'su ID olmalı.
        akademik_unvan: formData.akademik_unvan ? parseInt(formData.akademik_unvan, 10) : null
    };
     // Sadece dolu olan (değiştirilen) alanları göndermek PATCH için daha uygundur,
     // ama şimdilik tümünü gönderelim, backend serializer halleder varsayalım.

    console.log("Gönderilen Payload:", payload);

    try {
      await api.patch('/auth/user/', payload);
      setSuccessMessage("Profil bilgileri başarıyla güncellendi!");
      updateUserInContext({ ...user, ...payload });
    } catch (err) {
      setError(err.message || "Profil güncellenirken bir ağ hatası oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  // --- Yükleme veya Context Yükleme Durumu ---
   if (authLoading || loading) {
     return (
       <>
         <UserNavbar />
         <div className="profile-wrapper">
           <div className="profile-card">Profil bilgileri yükleniyor...</div>
         </div>
         <style>{` /* ... CSS ... */ `}</style>
       </>
     );
   }

   // Kullanıcı yoksa veya hata varsa (Context'ten veya fetch'ten)
   if (!user || (error && !formData.email)) { // formData.email kontrolü, fetch hatası mı context hatası mı anlamak için
     return (
       <>
         <UserNavbar />
         <div className="profile-wrapper">
           <div className="profile-card" style={{ color: 'red' }}>
               Hata: Kullanıcı bilgileri yüklenemedi. Lütfen tekrar giriş yapmayı deneyin. {error && `(${error})`}
           </div>
         </div>
         <style>{` /* ... CSS ... */ `}</style>
       </>
     );
   }

  // --- Profil Formu ---
  return (
    <>
      <UserNavbar />
      <div className="profile-wrapper">
        <div className="profile-card">
          <div className="profile-header">
            <FaUserCircle size={48} color="#009944" />
            <h2 className="profile-title">Profil Bilgilerim</h2>
          </div>

          {successMessage && <div style={{ color: 'green', marginBottom: '1rem', textAlign: 'center' }}>{successMessage}</div>}
          {error && !successMessage && <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}


          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-section">
              <h3 className="section-title">Kişisel Bilgiler</h3>
              <label>Ad
                 {/* Ad Soyad birleşik gösterilip, state'de ayrı tutulabilir veya iki ayrı input yapılabilir */}
                <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required disabled={submitting}/>
              </label>
               <label>Soyad
                <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required disabled={submitting}/>
              </label>
              <label>T.C. Kimlik No (Değiştirilemez)
                {/* TCKN değiştirilemez olmalı */}
                <input type="text" name="TC_KIMLIK" value={formData.TC_KIMLIK} readOnly disabled style={{ backgroundColor: '#eee' }} />
              </label>
              <label>E-posta
                <input type="email" name="email" value={formData.email} onChange={handleChange} required disabled={submitting}/>
              </label>
              <label>Telefon Numarası
                <input type="tel" name="telefon" value={formData.telefon} onChange={handleChange} disabled={submitting}/>
              </label>
              {/* Yeni Şifre alanı kaldırıldı. Ayrı bir sayfada/modalda yapılmalı. */}
            </div>

            <div className="form-section">
              <h3 className="section-title">Akademik Bilgiler</h3>
               {/* Kurum ve Bölüm alanları kaldırıldı (DB'de yoktu) */}
              <label>Akademik Unvan
                <select
                    name="akademik_unvan" // name backend'deki field adı olmalı (veya ona maplenmeli)
                    value={formData.akademik_unvan || ""} // value ID olmalı
                    onChange={handleChange}
                    required
                    disabled={submitting}
                >
                  <option value="" disabled>Seçiniz...</option>
                  {academicTitles.map(title => (
                    // Option'ın value'su ID, görünen kısmı unvanın adı/tipi olmalı
                    <option key={title.id} value={title.id}>
                        {title.tip || title.ad || title.id} {/* Backend'den gelen unvan alanına göre */}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <button type="submit" className="profile-btn" disabled={submitting}>
                {submitting ? 'Güncelleniyor...' : 'Bilgileri Güncelle'}
            </button>
          </form>
        </div>
      </div>
      <style>{`
        /* Navbar ve Profil Wrapper Ayırma */
        .profile-wrapper {
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding: 2rem;
          background-color: #f4f6f9;
          min-height: calc(100vh - 70px); /* Navbar yüksekliği çıkarıldı */
          margin-top: 70px; /* Navbarın altında yer alır */
        }

        .profile-card {
          background-color: #fff;
          border-radius: 1rem;
          padding: 2rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          max-width: 700px;
          width: 100%;
        }

        .profile-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .profile-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #333;
        }

        .profile-form {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .form-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .section-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #007c39;
          margin-bottom: 0.5rem;
        }

        label {
          color: #555;
          font-size: 0.95rem;
          display: flex;
          flex-direction: column;
        }

        input, select {
          margin-top: 0.25rem;
          padding: 0.5rem;
          border: 1px solid #ccc;
          border-radius: 0.5rem;
          font-size: 1rem;
        }

        .profile-btn {
          background-color: #009944;
          color: white;
          padding: 0.75rem;
          border: none;
          border-radius: 0.5rem;
          font-weight: bold;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        .profile-btn:hover {
          background-color: #007c39;
        }

        /* Responsive Tasarım */
        @media (max-width: 768px) {
          .profile-wrapper {
            padding: 1rem;
          }

          .profile-card {
            padding: 1.5rem;
          }

          .profile-header {
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
          }

          .profile-title {
            font-size: 1.25rem;
            text-align: center;
          }

          .form-section {
            gap: 0.75rem;
          }

          input, select {
            font-size: 0.9rem;
            padding: 0.5rem;
          }

          .profile-btn {
            font-size: 0.9rem;
            padding: 0.5rem;
          }
        }

        @media (max-width: 480px) {
          .profile-card {
            padding: 1rem;
          }

          .profile-title {
            font-size: 1.1rem;
          }

          .section-title {
            font-size: 1rem;
          }

          input, select {
            font-size: 0.85rem;
            padding: 0.4rem;
          }

          .profile-btn {
            font-size: 0.85rem;
            padding: 0.4rem;
          }
        }
      `}</style>
    </>
  );
}
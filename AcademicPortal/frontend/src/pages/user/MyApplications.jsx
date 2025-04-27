import React, { useState, useEffect } from "react";
// useNavigate burada doğrudan kullanılmıyor, kaldırılabilir
// import { useNavigate } from "react-router-dom";
import UserNavbar from "../../components/navbars/UserNavbar";
import { FaFileAlt } from "react-icons/fa";
// AuthContext'i kullanmıyoruz çünkü backend zaten kullanıcıya göre filtreliyor olmalı
// import { useAuth } from "../../context/AuthContext";
import api from '../../services/api';

// Sabit verileri kaldırıyoruz
// const academicAnnouncements = [ ... ];
// const myApplications = [ ... ];

const statusColors = {
  Beklemede: "#ffc107", // Sarı
  Onaylandı: "#28a745", // Yeşil
  Reddedildi: "#dc3545", // Kırmızı
  // Backend'den gelebilecek diğer durumlar için renkler eklenebilir
  bilinmiyor: "#6c757d", // Gri
};

export default function MyApplications() {
  const [applications, setApplications] = useState([]); // API'den gelen başvurular
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openId, setOpenId] = useState(null); // Hangi modalın açık olduğu

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.get('/basvurular/')
      .then(res => {
        setApplications(res.data.results || res.data);
      })
      .catch(err => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const toggleDialog = (id) => {
    setOpenId(prev => (prev === id ? null : id));
  };

  // Tarih formatlama (isteğe bağlı)
  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleString("tr-TR", {
          year: 'numeric', month: 'long', day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };


  // --- Yükleme ve Hata Durumları ---
  if (loading) {
    return (
      <>
        <UserNavbar />
        <div className="container"><p>Başvurularınız yükleniyor...</p></div>
        {/* Stil etiketi burada da olabilir veya global CSS'e taşınabilir */}
        <style>{` /* ... CSS kodları ... */ `}</style>
      </>
    );
  }

  if (error) {
    return (
      <>
        <UserNavbar />
        <div className="container">
           <h1 className="title">Başvurularım</h1>
           <p style={{color:'red'}}>Hata: {error}</p>
        </div>
        <style>{` /* ... CSS kodları ... */ `}</style>
      </>
    );
  }

  // --- Başvuruları Listeleme ---
  return (
    <>
      <UserNavbar />
      <div className="container">
        <h1 className="title">Başvurularım</h1>
        <div className="grid">
          {applications.length > 0 ? applications.map(app => {
            // Başvuruyla ilişkili ilan verisine erişim (nested olduğunu varsayıyoruz)
            // Backend Serializer'ınızın 'ilan' detayını döndürdüğünden emin olun.
            const announcement = app.ilan; // API yanıtınızda ilan detayları 'ilan' anahtarı altında varsayılıyor
            const isOpen = openId === app.id; // Başvurunun ID'si app.id varsayılıyor

            // Durum için renk belirle, bilinmeyen durumlar için varsayılan renk
            const statusColor = statusColors[app.durum] || statusColors.bilinmiyor;

            return (
              <div
                key={app.id} // Başvurunun ID'si
                className="card"
                style={{ borderLeftColor: statusColor }}
              >
                <div>
                  {/* İlan bilgilerini nested objeden al (alan adları serializer'a göre değişebilir) */}
                  <h2>{announcement?.baslik || 'İlan Başlığı Yok'}</h2>
                  <p className="text-gray">{announcement?.birim_ad || announcement?.birim?.ad || 'Birim Yok'}</p>
                  <p className="text-gray">{announcement?.bolum_ad || announcement?.bolum?.ad || 'Bölüm Yok'}</p>
                  <p className="text-gray-light">
                      Başvuru Tarihleri: {formatDate(announcement?.baslangic_tarihi)} - {formatDate(announcement?.bitis_tarihi)}
                  </p>
                  <p className="text-gray-light">
                      Başvurduğunuz Tarih: {formatDate(app.basvuru_tarihi)}
                  </p>
                  <p className="text-gray-light status">
                      Durum: <span style={{ color: statusColor }}>{app.durum || 'Bilinmiyor'}</span>
                  </p>
                </div>
                <button className="btn mt-4" onClick={() => toggleDialog(app.id)}>Yüklediğim Belgeleri Gör</button>

                {/* Modal */}
                {isOpen && (
                  <div className="modal-overlay" onClick={() => setOpenId(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                      <div className="modal-header">
                        <h2>Yüklenen Belgeler</h2>
                        <button
                          className="close-btn"
                          onClick={() => setOpenId(null)}
                          aria-label="Close"
                        >
                          &times;
                        </button>
                      </div>
                      <ul className="document-list">
                        {/*
                          Backend'den gelen dosya URL'lerini burada listele.
                          Varsayım: Başvuru objesi içinde *_url ile biten alanlar var.
                          Backend Serializer'ınızın bu URL'leri sağladığından emin olun.
                          (settings.py'da MEDIA_URL doğru ayarlanmalı)
                        */}
                        {app.ozgecmis_dosyasi ? <li><a href={app.ozgecmis_dosyasi} target="_blank" rel="noopener noreferrer"><FaFileAlt style={{ marginRight: "6px", color: "#009944" }} /> Özgeçmiş</a></li> : null}
                        {app.diploma_belgeleri ? <li><a href={app.diploma_belgeleri} target="_blank" rel="noopener noreferrer"><FaFileAlt style={{ marginRight: "6px", color: "#009944" }} /> Diploma Belgeleri</a></li> : null}
                        {app.yabanci_dil_belgesi ? <li><a href={app.yabanci_dil_belgesi} target="_blank" rel="noopener noreferrer"><FaFileAlt style={{ marginRight: "6px", color: "#009944" }} /> Yabancı Dil Belgesi</a></li> : null}
                        {/* Başvuruya bağlı diğer potansiyel dosyalar (AdayFaaliyet vb.) burada listelenebilir */}
                        {/* Eğer API'den sadece dosya adları değil, URL'ler geliyorsa 'href' kısmını ona göre ayarlayın */}
                         {/* Eğer hiç belge URL'i yoksa bir mesaj gösterilebilir */}
                         {!(app.ozgecmis_dosyasi || app.diploma_belgeleri || app.yabanci_dil_belgesi) && <li>Yüklü belge bulunamadı veya API yanıtında URL eksik.</li>}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            );
          }) : <p>Henüz hiç başvurunuz bulunmuyor.</p>}
        </div>
        <style>{`
          .container {
            display: flex;
            flex-direction: column;
            align-items: center;
            background-color: #f4f6f9;
            padding: 1rem;
            font-family: sans-serif;
            margin: 100px auto; 
            text-align: center;
          }

          .title {
            font-size: 1.5rem;
            font-weight: bold;
            color: #333;
            text-align: center;
          }

          .grid {
            display: grid;
            gap: 2rem;
            width: 100%; /* Grid genişliği tam olur */
            max-width: 1200px; /* İçeriği sınırlamak için maksimum genişlik */
          }

          @media (min-width: 768px) {
            .grid {
              grid-template-columns: repeat(2, 1fr);
            }
          }

          @media (min-width: 1024px) {
            .grid {
              grid-template-columns: repeat(3, 1fr);
            }
          }

          .card {
            background: white;
            border-radius: 1rem;
            padding: 1rem;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            border-left: 8px solid transparent;
            position: relative;
          }

          .card h2 {
            font-size: 1.25rem;
            font-weight: 600;
            color: #333;
          }

          .text-gray {
            color: #555;
          }

          .text-gray-light {
            color: #666;
          }

          .status {
            font-weight: 500;
            margin-top: 0.5rem;
          }

          .btn {
            background-color: #009944;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
            width: 100%;
            cursor: pointer;
            transition: background-color 0.3s;
          }

          .btn:hover {
            background-color: #007c39;
          }

          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
          }

          .modal {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            width: 400px;
            max-width: 90%;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            position: relative;
            animation: fadeIn 0.3s ease-in-out;
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
            border-bottom: 1px solid #ddd; /* Alt çizgi ekleyerek başlığı ayırır */
            padding-bottom: 0.5rem;
          }

          .modal-header h2 {
            font-size: 1.25rem;
            font-weight: bold;
            color: #333;
            margin: 0;
          }

          .close-btn {
            background: none;
            border: none;
            font-size: 1.5rem;
            font-weight: bold;
            color: #333;
            cursor: pointer;
            transition: color 0.3s ease, transform 0.2s ease;
          }

          .close-btn:hover {
            color: #dc3545; /* Hover durumunda kırmızı renk */
            transform: scale(1.2); /* Hover durumunda hafif büyütme efekti */
          }

          .document-list {
            list-style: none;
            padding: 0;
            margin: 0;
          }

          .document-list li {
            margin-bottom: 0.5rem;
          }

          .document-list a {
            color: #1d4ed8;
            text-decoration: none;
          }

          .document-list a:hover {
            text-decoration: underline;
          }
        `}</style>
      </div>
    </>
  );
}
import React, { useState, useEffect } from "react";
import JuryNavbar from "../../components/navbars/JuryNavbar.jsx";
// import { useAuth } from "../../context/AuthContext"; // Gerekli değilse kaldırılabilir

const JuryDashboard = () => {
  // State tanımlamaları
  const [statsData, setStatsData] = useState({ totalApplications: 0, completedEvaluations: 0, pendingReports: 0 });
  const [recentEvaluations, setRecentEvaluations] = useState([]);
  // notificationsData -> assignedIlanlarData olarak yeniden adlandırıldı
  const [assignedIlanlarData, setAssignedIlanlarData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // API isteklerini aynı anda başlatalım
        const [statsRes, evaluationsRes, assignmentsRes] = await Promise.all([
          // 1. İstatistikler (Değişiklik yok)
          fetch('http://localhost:8000/api/jury-stats/', { credentials: 'include' }),
          // 2. Son Değerlendirmeler (Değişiklik yok - ama serializer nested veri sağlamalı)
          fetch('http://localhost:8000/api/juri-degerlendirmeler/?my_evaluations=true&ordering=-degerlendirme_tarihi&limit=5', { credentials: 'include' }),
          // 3. Atanmış İlanlar (Bildirimler yerine)
          // Backend'in juri_uyesi'ne göre filtrelediğini varsayıyoruz (?juri_uyesi_id=me veya benzeri)
          fetch('http://localhost:8000/api/juri-atamalar/?my_assignments=true', { credentials: 'include' }) // ÖRNEK URL ve Filtre
        ]);

        // Yanıtları kontrol et
        if (!statsRes.ok) throw new Error(`İstatistikler alınamadı (${statsRes.status})`);
        if (!evaluationsRes.ok) throw new Error(`Değerlendirmeler alınamadı (${evaluationsRes.status})`);
        if (!assignmentsRes.ok) throw new Error(`Atanmış ilanlar alınamadı (${assignmentsRes.status})`);

        // Verileri JSON'a çevir
        const statsJson = await statsRes.json();
        const evaluationsJson = await evaluationsRes.json();
        const assignmentsJson = await assignmentsRes.json(); // Atama verisi

        console.log("Stats:", statsJson);
        console.log("Evaluations:", evaluationsJson);
        console.log("Assignments:", assignmentsJson); // Atamaları logla

        // State'leri güncelle
        setStatsData(statsJson);
        setRecentEvaluations(evaluationsJson.results || evaluationsJson);
        // notificationsData yerine assignedIlanlarData'yı set et
        setAssignedIlanlarData(assignmentsJson.results || assignmentsJson);

      } catch (err) {
        console.error("Jüri Dashboard verileri çekilirken hata:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Sadece component mount olduğunda çalışır

   // Tarih formatlama
   const formatDate = (dateString) => {
     if (!dateString) return "-";
     try {
       return new Date(dateString).toLocaleDateString("tr-TR", { day: '2-digit', month: '2-digit', year: 'numeric' });
     } catch (e) { return dateString; }
   };


  // --- Dashboard İçeriği ---
  return (
    <>
      {/* Stil etiketi */}
      <style>{css}</style>

      <JuryNavbar />
      <div className="dashboard-container">
        <h1 className="dashboard-title" >JÜRİ DASHBOARD</h1>

        {/* İstatistik Kutuları (Değişiklik yok) */}
        <div className="stats-grid">
            {/* ... stats kutuları ... */}
             <div className="stats-box stats-total-applications"><p className="stats-label">Toplam Atanan Başvuru</p><p className="stats-value">{statsData.totalApplications || 0}</p></div>
             <div className="stats-box stats-completed-evaluations"><p className="stats-label">Tamamlanan Değerlendirme</p><p className="stats-value">{statsData.completedEvaluations || 0}</p></div>
             <div className="stats-box stats-pending-reports"><p className="stats-label">Bekleyen Rapor</p><p className="stats-value">{statsData.pendingReports || 0}</p></div>
        </div>

        {/* Ana İçerik Grid'i */}
        <div className="main-grid">
          {/* Son Değerlendirmeler (Değişiklik yok, sadece veri kaynağı API) */}
          <div className="recent-candidates">
            <h2 className="section-title">Son Değerlendirmeler</h2>
            <ul className="candidates-list">
              {recentEvaluations.length > 0 ? recentEvaluations.map((evaluation) => (
                <li key={evaluation.id} className="candidate-item">
                  <span>{evaluation.basvuru?.aday?.first_name || 'Aday'} {evaluation.basvuru?.aday?.last_name || ''}</span>
                  <span className="candidate-date">{formatDate(evaluation.degerlendirme_tarihi)}</span>
                </li>
              )) : <li>Henüz değerlendirme yok.</li>}
            </ul>
          </div>

          {/* Atanmış İlanlar (Bildirimler yerine) */}
          <div className="notifications"> {/* Class adı aynı kalabilir veya değiştirebilirsiniz */}
            <h2 className="section-title">Atanmış İlanlar</h2> {/* Başlık değişti */}
            <ul className="notifications-list"> {/* Class adı aynı kalabilir */}
              {assignedIlanlarData.length > 0 ? assignedIlanlarData.map((atama) => (
                 // JuriAtama serializer'ı 'ilan' detayını nested döndürmeli
                 // Gösterilecek ilan bilgisi size kalmış (örn: başlık, bitiş tarihi)
                 <li key={atama.id} className="notification-item"> {/* Class adı aynı kalabilir */}
                    {atama.ilan ? (
                        <span>
                            <strong>{atama.ilan.baslik || 'İlan Başlığı Yok'}</strong>
                             (Bitiş: {formatDate(atama.ilan.bitis_tarihi)})
                             {/* Belki ilanın başvurularına bir link eklenebilir */}
                        </span>
                    ) : (
                        <span>İlan bilgisi eksik (Atama ID: {atama.id})</span>
                    )}
                 </li>
              )) : <li>Size atanmış aktif ilan bulunmuyor.</li>}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};


const css = `
  .dashboard-container {
    min-height: calc(100vh - 70px); /* Navbar yüksekliğini varsayarak (ayarlamanız gerekebilir) */
    padding: 2rem; /* Padding artırıldı */
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    max-width: 1400px;
    margin-left: auto;
    margin-right: auto;
  }

  .dashboard-title {
    font-size: 2.2rem; /* Biraz büyütüldü */
    font-weight: 700; /* Daha kalın */
    margin-bottom: 2rem; /* Daha fazla boşluk */
    color: #2c3e50; /* Koyu renk */
    text-align: left; /* Sola yaslandı */
    padding-bottom: 0.5rem;
    border-bottom: 3px solid #009944; /* Yeşil alt çizgi */
    display: inline-block; /* Çizginin sadece yazı kadar olmasını sağlar */
  }

  /* İstatistik Kutuları */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); /* Min genişlik artırıldı */
    gap: 1.5rem; /* Aralık artırıldı */
    margin-bottom: 2.5rem; /* Daha fazla boşluk */
  }

  .stats-box {
    padding: 1.5rem; /* İç boşluk artırıldı */
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.07); /* Gölge belirginleştirildi */
    background-color: #fff;
    text-align: left; /* İçerik sola yaslandı */
    border-left: 5px solid; /* Renkli kenar eklendi */
    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  }

   .stats-box:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  }

  .stats-label {
    font-size: 0.95rem; /* Biraz büyütüldü */
    color: #555; /* Renk koyulaştırıldı */
    margin-bottom: 0.5rem;
    font-weight: 500;
  }

  .stats-value {
    font-size: 2rem; /* Daha büyük */
    font-weight: 700; /* Daha kalın */
    margin: 0;
    line-height: 1.2;
  }

  /* Renkli Kenarlar */
  .stats-total-applications { border-left-color: #ffc107; }
  .stats-completed-evaluations { border-left-color: #28a745; }
  .stats-pending-reports { border-left-color: #dc3545; }

  /* Değer Renkleri (opsiyonel, kenar rengi yeterli olabilir) */
  /* .stats-total-applications .stats-value { color: #ffc107; } */
  /* .stats-completed-evaluations .stats-value { color: #28a745; } */
  /* .stats-pending-reports .stats-value { color: #dc3545; } */

  /* Ana İçerik Alanı */
  .main-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem; /* Aralık artırıldı */
  }

  /* Orta (tablet) ve büyük ekranlar için 2 sütun */
  @media (min-width: 768px) {
    .main-grid {
      grid-template-columns: 1fr 1fr;
      gap: 2rem; /* Aralık artırıldı */
    }
  }
   /* Daha büyük ekranlar için (isteğe bağlı) */
  /* @media (min-width: 1200px) {
      .main-grid { grid-template-columns: 2fr 1fr; }
  } */

  .recent-candidates, .notifications {
    padding: 1.5rem; /* İç boşluk artırıldı */
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.07);
    background-color: #fff;
  }

  .section-title {
    font-size: 1.3rem; /* Biraz büyütüldü */
    font-weight: 600;
    margin-top: 0;
    margin-bottom: 1.5rem; /* Daha fazla boşluk */
    color: #009944; /* Ana renk */
    border-bottom: 2px solid #eee; /* Daha belirgin ayırıcı */
    padding-bottom: 0.75rem;
  }

  .candidates-list, .notifications-list {
    list-style: none;
    padding: 0;
    margin: 0;
    max-height: 350px; /* Yükseklik artırıldı */
    overflow-y: auto;
  }

  .candidate-item, .notification-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 0.5rem; /* Padding ayarlandı */
    border-bottom: 1px solid #f0f0f0; /* Daha ince çizgi */
    color: #444; /* Daha koyu yazı */
    font-size: 1rem;
    transition: background-color 0.15s ease;
  }
   .candidate-item:hover, .notification-item:hover {
       background-color: #f8f9fa; /* Hafif hover efekti */
   }

  .candidate-item:last-child, .notification-item:last-child {
    border-bottom: none;
  }

  .candidate-date {
    font-size: 0.9rem;
    color: #777; /* Renk açıldı */
    white-space: nowrap;
    margin-left: 1rem;
  }

  .notification-item {
      justify-content: flex-start;
      line-height: 1.4; /* Okunabilirlik için */
  }

  /* Scrollbar Stilleri */
  ::-webkit-scrollbar { width: 8px; }
  ::-webkit-scrollbar-thumb { background-color: #ccc; border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background-color: #aaa; }
  ::-webkit-scrollbar-track { background: transparent; }

  /* Genel Loading/Error Container Stili */
  .loading-error-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 100px); /* Navbar'ı hesaba kat */
      font-size: 1.2rem;
      color: #555;
  }
`;

// Yükleme veya Hata Durumları için basit stil objesi (CSS string'i dışında)
const styles = {
  loadingErrorContainer: {
      display: 'flex',
      flexDirection: 'column', // Hata mesajını başlığın altına almak için
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 'calc(100vh - 100px)',
      padding: '2rem',
      textAlign: 'center',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
   dashboardTitle: { // Hata durumunda da başlığı göstermek için
     fontSize: '2rem',
     fontWeight: 'bold',
     marginBottom: '24px',
     color: '#333',
  }
};

export default JuryDashboard;
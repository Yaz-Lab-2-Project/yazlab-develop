import React, { useState, useEffect } from "react";
import JuryNavbar from "../../components/navbars/JuryNavbar.jsx";
import api from '../../services/api';
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
        const [statsRes, evaluationsRes, assignmentsRes] = await Promise.all([
          api.get('/jury-stats/'),
          api.get('/juri-degerlendirmeler/?my_evaluations=true&ordering=-degerlendirme_tarihi&limit=5'),
          api.get('/juri-atamalar/?my_assignments=true')
        ]);

        setStatsData(statsRes.data);
        setRecentEvaluations(evaluationsRes.data.results || evaluationsRes.data);
        setAssignedIlanlarData(assignmentsRes.data.results || assignmentsRes.data);
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
       return new Date(dateString).toLocaleDateString("tr-TR", {
         day: '2-digit',
         month: '2-digit',
         year: 'numeric'
       });
     } catch  {
       return dateString;
     }
   };

  if (loading) {
    return (
      <>
        <JuryNavbar />
        <div className="dashboard-container">
          <p>Yükleniyor...</p>
        </div>
        <style>{css}</style>
      </>
    );
  }

  if (error) {
    return (
      <>
        <JuryNavbar />
        <div className="dashboard-container">
          <h1 className="dashboard-title">JÜRİ DASHBOARD</h1>
          <p style={{ color: 'red' }}>Hata: {error}</p>
        </div>
        <style>{css}</style>
      </>
    );
  }

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
                            <br />
                            <small>Bitiş: {formatDate(atama.ilan.bitis_tarihi)}</small>
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
    min-height: calc(100vh - 70px);
    padding: 2rem;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    max-width: 1400px;
    margin-left: auto;
    margin-right: auto;
  }

  .dashboard-title {
    font-size: 2.2rem;
    font-weight: 700;
    margin-bottom: 2rem;
    color: #2c3e50;
    text-align: left;
    padding-bottom: 0.5rem;
    border-bottom: 3px solid #009944;
    display: inline-block;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2.5rem;
  }

  .stats-box {
    padding: 1.5rem;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.07);
    background-color: #fff;
    text-align: left;
    border-left: 5px solid;
    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  }

  .stats-box:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  }

  .stats-label {
    font-size: 0.95rem;
    color: #555;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }

  .stats-value {
    font-size: 2rem;
    font-weight: 700;
    margin: 0;
    line-height: 1.2;
  }

  .stats-total-applications { border-left-color: #ffc107; }
  .stats-completed-evaluations { border-left-color: #28a745; }
  .stats-pending-reports { border-left-color: #dc3545; }

  .main-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  @media (min-width: 768px) {
    .main-grid {
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }
  }

  .recent-candidates, .notifications {
    padding: 1.5rem;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.07);
    background-color: #fff;
  }

  .section-title {
    font-size: 1.3rem;
    font-weight: 600;
    margin-top: 0;
    margin-bottom: 1.5rem;
    color: #009944;
    border-bottom: 2px solid #eee;
    padding-bottom: 0.75rem;
  }

  .candidates-list, .notifications-list {
    list-style: none;
    padding: 0;
    margin: 0;
    max-height: 350px;
    overflow-y: auto;
  }

  .candidate-item, .notification-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 0.5rem;
    border-bottom: 1px solid #f0f0f0;
    color: #444;
    font-size: 1rem;
    transition: background-color 0.15s ease;
  }

  .candidate-item:hover, .notification-item:hover {
    background-color: #f8f9fa;
  }

  .candidate-item:last-child, .notification-item:last-child {
    border-bottom: none;
  }

  .candidate-date {
    font-size: 0.9rem;
    color: #777;
    white-space: nowrap;
    margin-left: 1rem;
  }

  .notification-item {
    justify-content: flex-start;
    line-height: 1.4;
  }

  ::-webkit-scrollbar { width: 8px; }
  ::-webkit-scrollbar-thumb { background-color: #ccc; border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background-color: #aaa; }
  ::-webkit-scrollbar-track { background: transparent; }
`;

export default JuryDashboard;
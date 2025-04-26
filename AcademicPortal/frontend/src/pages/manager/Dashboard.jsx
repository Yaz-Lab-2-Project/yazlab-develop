import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Link için import
import ManagerNavbar from "../../components/navbars/ManagerNavbar";

const quickLinks = [
  { label: "Kadro Kriterleri", href: "/manager-criteriapage" }, // Rota adını App.jsx'e göre düzelttim
  { label: "Jüri Atama", href: "/manager-juri-atama" },
  { label: "Başvuruları İncele", href: "/manager-basvurular" }, // Başlık düzenlendi
  { label: "Yeni İlan Oluştur", href: "/manager-ilan" }, // Yeni link örneği
];

const alertColors = {
    // Arka plan renkleri
  danger: "#f8d7da",
  warning: "#fff3cd",
};
const alertTextColors = {
    // Metin renkleri
   danger: "#721c24", 
   warning: "#856404",
}

const ManagerDashboard = () => {
  // State Tanımlamaları
  const [dashboardData, setDashboardData] = useState({
      stats: {},
      upcomingDeadlines: [],
      alerts: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Veri Çekme
  useEffect(() => {
    setLoading(true);
    setError(null);
    // Backend'de oluşturulacak özel dashboard endpoint'i
    fetch('http://localhost:8000/api/manager-stats/', { credentials: 'include' })
      .then(res => {
        if (!res.ok) {
          throw new Error(`Dashboard verileri alınamadı (${res.status})`);
        }
        return res.json();
      })
      .then(data => {
        console.log("Gelen Dashboard Verisi:", data);
        // Gelen verinin yukarıda varsayılan yapıda olduğunu kontrol edin
        setDashboardData({
            stats: data.stats || {},
            upcomingDeadlines: data.upcomingDeadlines || [],
            alerts: data.alerts || []
        });
      })
      .catch(err => {
        console.error("Dashboard verisi çekilirken hata:", err);
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []); // Sadece component mount olduğunda çalışır


  // Tarih formatlama
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("tr-TR", { day: '2-digit', month: 'short', year: 'numeric'});
    } catch (e) { return dateString; }
  };


  // --- Render ---

   // Yükleme veya Hata Durumları
  if (loading) {
    return (
        <>
         <ManagerNavbar />
         <div className="dashboard-container" style={styles.container}>
             <p>Yönetici paneli verileri yükleniyor...</p>
         </div>
         <style>{css}</style>
        </>
    );
  }

  if (error) {
       return (
        <>
         <ManagerNavbar />
         <div className="dashboard-container" style={styles.container}>
             <h1 className="dashboard-title" style={styles.title}>Yönetici Paneli - Dashboard</h1>
             <p style={{color:'red', textAlign:'center', border:'1px solid red', padding:'1rem', borderRadius:'8px'}}>Hata: {error}</p>
         </div>
         <style>{css}</style>
        </>
       );
   }

  // Ana İçerik
  return (
    <>
      {/* CSS Stilleri */}
      <style>{css}</style>

      <ManagerNavbar />
      <div className="dashboard-container">
        <h1 className="dashboard-title">Yönetici Paneli - Dashboard</h1>

        {/* İstatistik Kartları */}
        <div className="stats-grid">
          <div className="stat-card">
            <p>Toplam Aktif İlan</p>
            {/* API'den gelen statsData state'ini kullan */}
            <p className="stat-value" style={{ color: "#009944" }}>{dashboardData.stats?.totalAnnouncements ?? '-'}</p>
          </div>
          <div className="stat-card">
            <p>Bugün Başvuru Alınan</p>
            <p className="stat-value" style={{ color: "#28a745" }}>{dashboardData.stats?.todayApplications ?? '-'}</p>
          </div>
          <div className="stat-card">
            <p>Tamamlanan Değerlendirme</p>
            <p className="stat-value" style={{ color: "#17a2b8" }}>{dashboardData.stats?.completedEvaluations ?? '-'}</p>
          </div>
          <div className="stat-card">
            <p>Eksik Rapor</p>
            <p className="stat-value" style={{ color: "#dc3545" }}>{dashboardData.stats?.missingReports ?? '-'}</p>
          </div>
        </div>

        {/* Yaklaşan Başvuru Bitişleri */}
        <div className="deadlines-section">
          <h2 className="deadlines-title">Yaklaşan Başvuru Bitişleri</h2>
          {/* API'den gelen deadlineData state'ini kullan */}
           {dashboardData.upcomingDeadlines?.length > 0 ? (
                <ul>
                    {dashboardData.upcomingDeadlines.map((item, idx) => (
                    <li key={item.id || idx} className="deadline-item">
                        {/* Alan adlarını API yanıtına göre ayarla (örn: baslik, bitis_tarihi) */}
                        <span>{item.baslik || 'İlan Başlığı Yok'}</span>
                        <span>Bitiş: {formatDate(item.bitis_tarihi)}</span>
                    </li>
                    ))}
                </ul>
           ) : (
               <p style={{color:'#6c757d', fontStyle:'italic'}}>Yaklaşan bitiş tarihli aktif ilan bulunmuyor.</p>
           )}
        </div>

        {/* Uyarılar */}
        <div className="alerts-section">
          {/* API'den gelen alertsData state'ini kullan */}
           {dashboardData.alerts?.length > 0 ? (
                dashboardData.alerts.map((alert, idx) => (
                    <div
                    key={alert.id || idx}
                    className="alert"
                    // Arkaplan ve metin rengini ayarla
                    style={{ backgroundColor: alertColors[alert.type] || '#e9ecef', color: alertTextColors[alert.type] || '#343a40' }}
                    >
                    ⚠️ {alert.text}
                    </div>
                ))
           ) : (
               <p style={{color:'#6c757d', fontStyle:'italic'}}>Gösterilecek uyarı bulunmuyor.</p>
           )}
        </div>

        {/* Hızlı Erişim Butonları (Statik kaldı) */}
        <div>
             <h2 className="quick-links-title">Hızlı Erişim</h2>
             <div className="quick-links">
                {quickLinks.map((link, idx) => (
                  // React Router Link bileşeni kullanmak daha iyi olabilir
                  <Link key={idx} to={link.href} className="quick-link">
                    {link.label}
                  </Link>
                ))}
             </div>
         </div>

      </div>
    </>
  );
};

// Stil Tanımları (CSS Değişkeni)
const css = `
  .dashboard-container { padding: 24px; background-color: #f4f6f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; min-height: calc(100vh - 70px); max-width: 1400px; margin: 0 auto; }
  .dashboard-title { font-size: 2rem; font-weight: 600; margin-bottom: 24px; color: #343a40; }
  .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem; }
  .stat-card { padding: 1.25rem; background-color: #fff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.06); border-left: 5px solid; transition: transform 0.2s ease, box-shadow 0.2s ease; }
  .stat-card:hover { transform: translateY(-3px); box-shadow: 0 6px 12px rgba(0,0,0,0.08); }
  .stat-card p { margin: 0; color: #495057; font-size: 0.95rem; margin-bottom: 0.5rem;}
  .stat-card .stat-value { font-size: 2rem; font-weight: 700; margin-top: 0.25rem; line-height: 1.2; }
  /* Kart kenar renkleri (örnek) */
  .stat-card:nth-child(1) { border-left-color: #009944; }
  .stat-card:nth-child(2) { border-left-color: #28a745; }
  .stat-card:nth-child(3) { border-left-color: #17a2b8; }
  .stat-card:nth-child(4) { border-left-color: #dc3545; }

  .deadlines-section { background-color: #fff; border-radius: 8px; padding: 1.5rem; box-shadow: 0 4px 8px rgba(0,0,0,0.06); margin-bottom: 2rem; }
  .deadlines-title, .alerts-title, .quick-links-title { font-size: 1.3rem; font-weight: 600; margin-top:0; margin-bottom: 1rem; color: #007c39; padding-bottom: 0.5rem; border-bottom: 1px solid #eee; }
  .deadlines-section ul { list-style: none; padding: 0; margin: 0; }
  .deadline-item { display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px dashed #eee; font-size: 0.95rem; color: #343a40; }
  .deadline-item:last-child { border-bottom: none; }
  .deadline-item span:last-child { font-weight: 500; color: #5a6268; }

  .alerts-section { margin-bottom: 2rem; }
  .alert { padding: 1rem; border-radius: 8px; margin-bottom: 0.75rem; font-weight: 500; border: 1px solid; }

  .quick-links-title { margin-bottom: 0.75rem;}
  .quick-links { display: flex; flex-wrap: wrap; gap: 1rem; }
  .quick-link { padding: 0.8rem 1.2rem; background-color: #009944; color: #fff; border-radius: 6px; text-decoration: none; font-weight: 500; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); transition: background-color 0.2s ease, transform 0.2s ease; display: inline-block; }
  .quick-link:hover { background-color: #007c39; transform: translateY(-2px); }

  /* Küçük Ekranlar için Basit Responsive Ayarı */
  @media (max-width: 640px) {
      .stats-grid { grid-template-columns: 1fr; } /* Stats kartları alt alta */
      .dashboard-title { font-size: 1.8rem; }
  }
`;

// Stil objesi (Yükleme/Hata için)
const styles = {
    container: { padding: 24, backgroundColor: "#f4f6f9", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", minHeight:'calc(100vh - 70px)' },
    title: { fontSize: "2rem", fontWeight: "600", margin: "0 0 24px 0", color: "#343a40" },
    // ... (gerekirse diğer stiller)
};


export default ManagerDashboard; // Component adını değiştirdik
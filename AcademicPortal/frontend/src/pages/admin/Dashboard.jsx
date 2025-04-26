import React, { useState, useEffect } from "react"; // useEffect eklendi
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend, Cell
} from "recharts";
import AdminNavbar from "../../components/navbars/AdminNavbar.jsx";

const COLORS = ["#009944", "#ffc107", "#28a745", "#dc3545", "#007c39", "#6f42c1"]; // Gerekirse daha fazla renk

const styles = {
  body: {
    backgroundColor: "#f4f6f9",
    padding: "40px 20px",
    fontFamily: "Arial, sans-serif"
  },
  header: {
    textAlign: "center",
    marginBottom: "40px"
  },
  headerTitle: {
    fontSize: "32px",
    color: "#333"
  },
  container: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "30px"
  },
  card: {
    backgroundColor: "#fff",
    width: "260px",
    height: "180px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center", // İçeriği dikey olarak ortalar
    alignItems: "center", // İçeriği yatay olarak ortalar
    textAlign: "center", // Yazıları ortalar
    borderRadius: "20px",
    boxShadow: "0 6px 12px rgba(0,0,0,0.1)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    padding: "10px" // İçerik için boşluk ekler
  },
  cardHover: {
    transform: "scale(1.05)",
    boxShadow: "0 10px 20px rgba(0,0,0,0.15)"
  },
  title: {
    color: "#333",
    marginBottom: "10px",
    fontSize: "16px", // Daha küçük yazı boyutu
    fontWeight: "500", // Yazıyı daha belirgin hale getirir
    lineHeight: "1.4", // Satır yüksekliğini artırır
    textAlign: "center" // Yazıyı ortalar
  },
  value: {
    fontSize: "24px", // Yazı boyutunu biraz küçültür
    fontWeight: "bold",
    color: "#000", // Yazı rengini siyah yapar
    textAlign: "center" // Yazıyı ortalar
  },
  yellow: { backgroundColor: "#ffc107", color: "#fff" },
  green: { backgroundColor: "#28a745", color: "#fff" },
  red: { backgroundColor: "#dc3545", color: "#fff" },
  chartContainer: {
    backgroundColor: "#fff",
    borderRadius: "20px",
    padding: "20px",
    boxShadow: "0 6px 12px rgba(0,0,0,0.1)",
    marginTop: "40px",
    maxWidth: "700px",
    marginLeft: "auto",
    marginRight: "auto"
  },
  chartTitle: {
    textAlign: "center",
    marginBottom: "20px",
    fontSize: "20px",
    color: "#333"
  }
};

const Card = ({ title, value, style }) => {
  const [hovered, setHovered] = React.useState(false);
  return (
    <div
      style={{ ...styles.card, ...style, ...(hovered ? styles.cardHover : {}) }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <h3 style={styles.title}>{title}</h3>
      <p style={styles.value}>{value}</p>
    </div>
  );
};

const AdminDashboard = () => {
  // State tanımlamaları
  const [dashboardStats, setDashboardStats] = useState({
      stats: {},
      departmentApplications: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Veri çekme
  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch('http://localhost:8000/api/admin-stats/', { credentials: 'include' }) // Backend endpoint'iniz
      .then(res => {
        if (!res.ok) {
          throw new Error(`Admin dashboard verileri alınamadı (${res.status})`);
        }
        return res.json();
      })
      .then(data => {
        console.log("Gelen Admin Dashboard Verisi:", data);
        // Gelen verinin beklenen yapıda olduğunu kontrol edin
        setDashboardStats({
            stats: data.stats || {},
            departmentApplications: data.departmentApplications || []
        });
      })
      .catch(err => {
        console.error("Admin dashboard verisi çekilirken hata:", err);
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []); // Sadece component mount olduğunda çalışır


  // --- Render ---

  if (loading) {
    return ( <><AdminNavbar /><div style={styles.body}><p>Admin paneli verileri yükleniyor...</p></div></> );
  }

  if (error) {
    return ( <><AdminNavbar /><div style={styles.body}><h1 style={styles.headerTitle}>Admin Dashboard</h1><p style={{color:'red', textAlign:'center'}}>Hata: {error}</p></div></> );
  }

  // Veri varsa render et
  return (
    <>
      <AdminNavbar />
      <div style={styles.body}>
        <header style={styles.header}>
          <h1 style={styles.headerTitle}>Admin Dashboard</h1>
        </header>
        <div style={styles.container}>
          {/* Kartları API'den gelen veriyle doldur */}
          <Card title="Toplam İlan Sayısı" value={dashboardStats.stats?.totalPostings ?? '-'} />
          <Card title="Aktif İlan Sayısı" value={dashboardStats.stats?.activePostings ?? '-'} style={styles.green} />
          <Card title="Devam Eden Başvuru Süreçleri" value={dashboardStats.stats?.ongoingApplications ?? '-'} style={styles.yellow} />
          {/* En çok başvuru alan ilan için backend'den gelen veriyi kullanın */}
          {/* Eğer obje dönüyorsa: dashboardStats.stats?.mostApplied?.baslik ?? '-' */}
          <Card title="En Çok Başvuru Yapılan İlan" value={dashboardStats.stats?.mostApplied ?? '-'} style={styles.red} />
        </div>

        {/* Grafik Alanı */}
        <div style={styles.chartContainer}>
          <h2 style={styles.chartTitle}>Başvuru Yapılan Bölümlerin Dağılımı</h2>
           {dashboardStats.departmentApplications?.length > 0 ? (
               <ResponsiveContainer width="100%" height={320}>
                 {/* Grafiği API'den gelen veriyle doldur */}
                 <BarChart data={dashboardStats.departmentApplications} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
                   <CartesianGrid strokeDasharray="3 3" />
                   {/* dataKey'lerin API yanıtındaki alan adlarıyla eşleştiğinden emin olun */}
                   <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                   <YAxis allowDecimals={false} />
                   <Tooltip />
                   <Legend />
                   <Bar dataKey="value" fill="#009944">
                     {/* Renkleri dinamik ata */}
                     {(dashboardStats.departmentApplications || []).map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                     ))}
                   </Bar>
                 </BarChart>
               </ResponsiveContainer>
           ) : (
               <p style={{textAlign:'center', color:'#6c757d'}}>Grafik için bölüm verisi bulunamadı.</p>
           )}
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
import React, { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend, Cell
} from "recharts";
import AdminNavbar from "../../components/navbars/AdminNavbar.jsx";
import { dashboardService } from "../../services/adminService";

const COLORS = ["#009944", "#ffc107", "#28a745", "#dc3545", "#007c39", "#6f42c1"];

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
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    borderRadius: "20px",
    boxShadow: "0 6px 12px rgba(0,0,0,0.1)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    padding: "10px"
  },
  cardHover: {
    transform: "scale(1.05)",
    boxShadow: "0 10px 20px rgba(0,0,0,0.15)"
  },
  title: {
    color: "#333",
    marginBottom: "10px",
    fontSize: "16px",
    fontWeight: "500",
    lineHeight: "1.4",
    textAlign: "center"
  },
  value: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#000",
    textAlign: "center"
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
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalPostings: 0,
      activePostings: 0,
      ongoingApplications: 0,
      mostApplied: '-',
      totalUsers: 0,
      totalApplications: 0
    },
    departmentApplications: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await dashboardService.getStats();
        console.log('Dashboard data:', response);

        // Veri yapısını kontrol et ve düzelt
        const stats = response?.stats || {};
        const departmentApplications = Array.isArray(response?.departmentApplications) 
          ? response.departmentApplications.map(item => ({
              name: item.name || 'Bilinmeyen',
              value: parseInt(item.value) || 0
            }))
          : [];

        setDashboardData({
          stats: {
            totalPostings: parseInt(stats.totalPostings) || 0,
            activePostings: parseInt(stats.activePostings) || 0,
            ongoingApplications: parseInt(stats.ongoingApplications) || 0,
            mostApplied: stats.mostApplied || '-',
            totalUsers: parseInt(stats.totalUsers) || 0,
            totalApplications: parseInt(stats.totalApplications) || 0
          },
          departmentApplications
        });
      } catch (err) {
        console.error("Dashboard verisi çekilirken hata:", err);
        setError(err.message || "Veriler yüklenirken bir hata oluştu");
        setDashboardData({
          stats: {
            totalPostings: 0,
            activePostings: 0,
            ongoingApplications: 0,
            mostApplied: '-',
            totalUsers: 0,
            totalApplications: 0
          },
          departmentApplications: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return ( <><AdminNavbar /><div style={styles.body}><p>Admin paneli verileri yükleniyor...</p></div></> );
  }

  const { stats, departmentApplications } = dashboardData;

  return (
    <>
      <AdminNavbar />
      <div style={styles.body}>
        <header style={styles.header}>
          <h1 style={styles.headerTitle}>Admin Dashboard</h1>
          {error && <p style={{color: 'red', textAlign: 'center', marginTop: '1rem'}}>{error}</p>}
        </header>
        <div style={styles.container}>
          <Card title="Toplam İlan Sayısı" value={stats.totalPostings} />
          <Card title="Aktif İlan Sayısı" value={stats.activePostings} style={styles.green} />
          <Card title="Devam Eden Başvuru Süreçleri" value={stats.ongoingApplications} style={styles.yellow} />
          <Card title="En Çok Başvuru Yapılan İlan" value={stats.mostApplied} style={styles.red} />
        </div>

        <div style={styles.chartContainer}>
          <h2 style={styles.chartTitle}>Başvuru Yapılan Bölümlerin Dağılımı</h2>
          {departmentApplications.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart 
                data={departmentApplications} 
                margin={{ top: 20, right: 30, left: 0, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#009944">
                  {departmentApplications.map((entry, index) => (
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
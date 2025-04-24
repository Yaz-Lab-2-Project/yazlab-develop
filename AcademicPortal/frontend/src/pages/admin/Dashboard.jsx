import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Cell
} from "recharts";
import AdminNavbar from "../../components/navbars/AdminNavbar.jsx"; // AdminNavbar bileşenini import ettik

const dashboardData = {
  totalPostings: 35,
  activePostings: 22,
  ongoingApplications: 18,
  mostApplied: "Bilgisayar Müh. Doçentliği"
};

const departmentApplications = [
  { name: "Bilgisayar Müh.", value: 10 },
  { name: "Elektrik-Elektronik Müh.", value: 6 },
  { name: "Makine Müh.", value: 4 },
  { name: "İnşaat Müh.", value: 3 },
  { name: "Endüstri Müh.", value: 2 }
];

const COLORS = ["#009944", "#ffc107", "#28a745", "#dc3545", "#007c39"];

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
  return (
    <>
      <AdminNavbar /> {/* Navbar bileşeni */}
      <div style={styles.body}>
        <header style={styles.header}>
          <h1 style={styles.headerTitle}>Admin Dashboard</h1>
        </header>
        <div style={styles.container}>
          <Card title="Toplam İlan Sayısı" value={dashboardData.totalPostings} />
          <Card title="Aktif İlan Sayısı" value={dashboardData.activePostings} style={styles.green} />
          <Card title="Devam Eden Başvuru Süreçleri" value={dashboardData.ongoingApplications} style={styles.yellow} />
          <Card title="En Çok Başvuru Yapılan İlan" value={dashboardData.mostApplied} style={styles.red} />
        </div>

        <div style={styles.chartContainer}>
          <h2 style={styles.chartTitle}>Başvuru Yapılan Bölümlerin Dağılımı</h2>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={departmentApplications} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
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
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
// src/pages/manager/Dashboard.jsx

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ManagerNavbar from "../../components/navbars/ManagerNavbar";
import { getCookie } from "../../utils/Cookies";

const quickLinks = [
  { label: "Jüri Atama",        href: "/manager-juri-atama" },
  { label: "Başvuruları İncele", href: "/manager-basvurular" },
  { label: "Yeni İlan Oluştur",  href: "/manager-ilan" },
];

const alertColors = {
  danger: "#f8d7da"
};

const alertTextColors = {
  danger: "#721c24",
  warning: "#856404"
};

const ManagerDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: {},
    upcomingDeadlines: [],
    alerts: []
  });
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1) CSRF cookie’sini set eden endpoint’i çağır
        await fetch("http://localhost:8000/api/set-csrf/", {
          credentials: "include"
        });

        // 2) Tarayıcıdaki cookie’den CSRF token’ı al
        const csrftoken = getCookie("csrftoken");

        // 3) Manager-stats isteğini CSRF header’ı ile yap
        const res = await fetch("http://localhost:8000/api/manager-stats/", {
          method: "GET",
          credentials: "include",
          headers: {
            "Accept":      "application/json",
            "X-CSRFToken": csrftoken
          },
        });

        if (!res.ok) throw new Error(`Veri alınamadı (${res.status})`);
        const data = await res.json();

        setDashboardData({
          stats: data.stats || {},
          upcomingDeadlines: data.upcomingDeadlines || [],
          alerts: data.alerts || []
        });
      } catch (err) {
        console.error("Dashboard hatası:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("tr-TR", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "-";

  if (loading) {
    return (
      <>
        <ManagerNavbar />
        <div style={styles.container}>
          <p>Yönetici paneli yükleniyor…</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <ManagerNavbar />
        <div style={styles.container}>
          <h1 style={styles.title}>Yönetici Paneli - Dashboard</h1>
          <p style={styles.error}>Hata: {error}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{css}</style>
      <ManagerNavbar />
      <div className="dashboard-container">
        <h1 className="dashboard-title">Yönetici Paneli - Dashboard</h1>

        {/* İstatistik Kartları */}
        <div className="stats-grid">
        <div className="stat-card">
            <p>Toplam Aktif İlan</p>
            <p className="stat-value" style={{ color: "#009944" }}>
              {dashboardData.stats.activePostings ?? "-"}
            </p>
          </div>
          <div className="stat-card">
            <p>Bugün Başvuru Alınan</p>
            <p className="stat-value" style={{ color: "#28a745" }}>
              {dashboardData.stats.todayApplications ?? "-"}
            </p>
          </div>
          <div className="stat-card">
            <p>Tamamlanan Değerlendirme</p>
            <p className="stat-value" style={{ color: "#17a2b8" }}>
              {dashboardData.stats.completedEvaluations ?? "-"}
            </p>
          </div>
          <div className="stat-card">
            <p>Eksik Rapor</p>
            <p className="stat-value" style={{ color: "#dc3545" }}>
              {dashboardData.stats.missingReports ?? "-"}
            </p>
          </div>
        </div>

        {/* Yaklaşan Bitişler */}
        <div className="deadlines-section">
          <h2 className="deadlines-title">Yaklaşan Başvuru Bitişleri</h2>
          {dashboardData.upcomingDeadlines.length > 0 ? (
            <ul>
              {dashboardData.upcomingDeadlines.map((item) => (
                <li key={item.id} className="deadline-item">
                  <span>{item.baslik}</span>
                  <span>Bitiş: {formatDate(item.bitis_tarihi)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty">Yaklaşan bitişli ilan yok.</p>
          )}
        </div>

        {/* Uyarılar */}
        <div className="alerts-section">
          {dashboardData.alerts.length > 0 ? (
            dashboardData.alerts.map((alert) => (
              <div
                key={alert.id}
                className="alert"
                style={{
                  backgroundColor: alertColors[alert.type] || "#e9ecef",
                  color: alertTextColors[alert.type] || "#343a40",
                }}
              >
                ⚠️ {alert.text}
              </div>
            ))
          ) : (
            <p className="empty">Gösterilecek uyarı yok.</p>
          )}
        </div>

        {/* Hızlı Erişim */}
        <div>
          <h2 className="quick-links-title">Hızlı Erişim</h2>
          <div className="quick-links">
            {quickLinks.map((link, i) => (
              <Link key={i} to={link.href} className="quick-link">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

const css = `
  .dashboard-container { padding: 24px; background-color: #f4f6f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; min-height: calc(100vh - 70px); max-width: 1400px; margin: 0 auto; }
  .dashboard-title { font-size: 2rem; font-weight: 600; margin-bottom: 24px; color: #343a40; }
  .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem; }
  .stat-card { padding: 1.25rem; background-color: #fff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.06); border-left: 5px solid; transition: transform 0.2s ease, box-shadow 0.2s ease; }
  .stat-card:nth-child(1) { border-left-color: #009944; }
  .stat-card:nth-child(2) { border-left-color: #28a745; }
  .stat-card:nth-child(3) { border-left-color: #17a2b8; }
  .stat-card:nth-child(4) { border-left-color: #dc3545; }
  .stat-card p { margin: 0; color: #495057; font-size: 0.95rem; margin-bottom: 0.5rem; }
  .stat-card .stat-value { font-size: 2rem; font-weight: 700; margin-top: 0.25rem; line-height: 1.2; }

  .deadlines-section { background-color: #fff; border-radius: 8px; padding: 1.5rem; box-shadow: 0 4px 8px rgba(0,0,0,0.06); margin-bottom: 2rem; }
  .deadlines-title, .quick-links-title { font-size: 1.3rem; font-weight: 600; margin-bottom: 1rem; color: #007c39; padding-bottom: 0.5rem; border-bottom: 1px solid #eee; }
  .deadlines-section ul { list-style: none; padding: 0; margin: 0; }
  .deadline-item { display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px dashed #eee; font-size: 0.95rem; color: #343a40; }
  .deadline-item:last-child { border-bottom: none; }
  .deadline-item span:last-child { font-weight: 500; color: #5a6268; }

  .alerts-section { margin-bottom: 2rem; }
  .alert { padding: 1rem; border-radius: 8px; margin-bottom: 0.75rem; font-weight: 500; border: 1px solid; }

  .quick-links { display: flex; flex-wrap: wrap; gap: 1rem; }
  .quick-link { padding: 0.8rem 1.2rem; background-color: #009944; color: #fff; border-radius: 6px; text-decoration: none; font-weight: 500; box-shadow: 0 2px 5px rgba(0,0,0,0.1); transition: background-color 0.2s ease, transform 0.2s ease; display: inline-block; }
  .quick-link:hover { background-color: #007c39; transform: translateY(-2px); }

  .empty { color: #6c757d; font-style: italic; text-align: center; }

  @media (max-width: 640px) {
    .stats-grid { grid-template-columns: 1fr; }
    .dashboard-title { font-size: 1.8rem; }
  }
`;

const styles = {
  container: {
    padding: 24,
    backgroundColor: "#f4f6f9",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    minHeight: "calc(100vh - 70px)"
  },
  title: {
    fontSize: "2rem",
    fontWeight: 600,
    marginBottom: 24,
    color: "#343a40"
  },
  error: {
    color: "red",
    textAlign: "center",
    border: "1px solid red",
    padding: "1rem",
    borderRadius: 8
  }
};

export default ManagerDashboard;

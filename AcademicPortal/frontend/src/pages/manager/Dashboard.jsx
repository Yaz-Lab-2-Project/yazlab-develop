import React from "react";
import ManagerNavbar from "../../components/navbars/ManagerNavbar";

const Dashboard = () => {
  const stats = {
    totalAnnouncements: 12,
    todayApplications: 3,
    completedEvaluations: 8,
    missingReports: 2,
  };

  const upcomingDeadlines = [
    { title: "Yapay Zeka Kadrosu", endDate: "01.04.2025" },
    { title: "Veri Bilimi Kadrosu", endDate: "02.04.2025" },
  ];

  const alerts = [
    { type: "danger", text: "3 ilan için jüri ataması yapılmamış." },
    { type: "warning", text: "2 başvurunun süresi dolmuş." },
  ];

  const quickLinks = [
    { label: "Kadro Kriterleri", href: "/manager/kriterler" },
    { label: "Jüri Atama", href: "/manager/juri-atama" },
    { label: "Değerlendirmeler", href: "/manager/basvurular" },
  ];

  const alertColors = {
    danger: "#dc3545",
    warning: "#ffc107",
  };

  return (
    <>
      <style>
        {`
          .dashboard-container {
            padding: 24px;
            background-color: #f4f6f9;
            font-family: 'Arial', sans-serif;
          }

          .dashboard-title {
            font-size: 2rem;
            font-weight: bold;
            margin-bottom: 24px;
            color: #333;
          }

          .stats-grid {
            display: grid;
            grid-template-columns: repeat(1, 1fr);
            gap: 16px;
            margin-bottom: 32px;
          }

          @media (min-width: 640px) {
            .stats-grid {
              grid-template-columns: repeat(2, 1fr);
            }
          }

          @media (min-width: 1024px) {
            .stats-grid {
              grid-template-columns: repeat(4, 1fr);
            }
          }

          .stat-card {
            padding: 16px;
            background-color: #fff;
            border-radius: 16px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }

          .stat-card p {
            margin: 0;
            color: #555;
          }

          .stat-card .stat-value {
            font-size: 1.5rem;
            font-weight: bold;
            margin-top: 8px;
          }

          .deadlines-section {
            background-color: #fff;
            border-radius: 16px;
            padding: 16px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            margin-bottom: 32px;
          }

          .deadlines-title {
            font-size: 1.25rem;
            font-weight: bold;
            margin-bottom: 16px;
            color: #009944;
          }

          .deadline-item {
            display: flex;
            justify-content: space-between;
            padding: 8px;
            border-radius: 8px;
            background-color: #e6f0e6;
            color: #333;
          }

          .alerts-section {
            margin-bottom: 32px;
          }

          .alert {
            padding: 12px;
            border-radius: 8px;
            color: #fff;
            margin-bottom: 8px;
          }

          .quick-links {
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
          }

          .quick-link {
            padding: 12px 16px;
            background-color: #009944;
            color: #fff;
            border-radius: 8px;
            text-decoration: none;
            font-weight: bold;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            transition: background-color 0.3s ease;
          }

          .quick-link:hover {
            background-color: #007c39;
          }
        `}
      </style>
      <ManagerNavbar />
      <div className="dashboard-container">
        <h1 className="dashboard-title">Yönetici Paneli - Dashboard</h1>

        {/* İstatistik Kartları */}
        <div className="stats-grid">
          <div className="stat-card">
            <p>Toplam Aktif İlan</p>
            <p className="stat-value" style={{ color: "#009944" }}>{stats.totalAnnouncements}</p>
          </div>
          <div className="stat-card">
            <p>Bugün Başvuru Alınan</p>
            <p className="stat-value" style={{ color: "#28a745" }}>{stats.todayApplications}</p>
          </div>
          <div className="stat-card">
            <p>Tamamlanan Değerlendirme</p>
            <p className="stat-value" style={{ color: "#007c39" }}>{stats.completedEvaluations}</p>
          </div>
          <div className="stat-card">
            <p>Eksik Rapor</p>
            <p className="stat-value" style={{ color: "#dc3545" }}>{stats.missingReports}</p>
          </div>
        </div>

        {/* Yaklaşan Başvuru Bitişleri */}
        <div className="deadlines-section">
          <h2 className="deadlines-title">Yaklaşan Başvuru Bitişleri</h2>
          <ul>
            {upcomingDeadlines.map((item, idx) => (
              <li key={idx} className="deadline-item">
                <span>{item.title}</span>
                <span>{item.endDate}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Uyarılar */}
        <div className="alerts-section">
          {alerts.map((alert, idx) => (
            <div
              key={idx}
              className="alert"
              style={{ backgroundColor: alertColors[alert.type] }}
            >
              ⚠️ {alert.text}
            </div>
          ))}
        </div>

        {/* Hızlı Erişim Butonları */}
        <div className="quick-links">
          {quickLinks.map((link, idx) => (
            <a key={idx} href={link.href} className="quick-link">
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
import React from "react";
import JuryNavbar from "../../components/navbars/JuryNavbar.jsx"; // JuryNavbar bileşenini import ettik

const JuryDashboard = () => {
  // Demo veriler
  const stats = {
    totalApplications: 12,
    completedEvaluations: 8,
    pendingReports: 4,
  };

  const recentCandidates = [
    { name: "Ahmet Yılmaz", date: "28.03.2025" },
    { name: "Ayşe Demir", date: "27.03.2025" },
    { name: "Mehmet Koç", date: "25.03.2025" },
  ];

  const notifications = [
    "Yeni bir başvuru atandı.",
    "Yönetici: Lütfen Prof. kadrosu için belgeleri detaylı kontrol edin.",
  ];

  return (
    <>
      <style>
        {`
          .dashboard-container {
            min-height: 100vh;
            padding: 24px;
            font-family: 'Sans-serif';
            background-color: #f4f6f9;
          }

          .dashboard-title {
            font-size: 2rem;
            font-weight: bold;
            margin-bottom: 24px;
            color: #333;
          }

          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            margin-bottom: 32px;
          }

          .stats-box {
            padding: 16px;
            border-radius: 16px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            background-color: #fff;
          }

          .stats-label {
            font-size: 0.875rem;
            color: #666;
          }

          .stats-value {
            font-size: 1.5rem;
            font-weight: 600;
          }

          .stats-total-applications .stats-value {
            color: #ffc107;
          }

          .stats-completed-evaluations .stats-value {
            color: #28a745;
          }

          .stats-pending-reports .stats-value {
            color: #dc3545;
          }

          .main-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 24px;
          }

          @media (min-width: 768px) {
            .main-grid {
              grid-template-columns: 1fr 1fr;
            }
          }

          .recent-candidates, .notifications {
            padding: 20px;
            border-radius: 16px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            background-color: #fff;
            border-bottom: 1px solid #eee;
          }

          .section-title {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 16px;
            color: #009944;
          }

          .candidates-list, .notifications-list {
            list-style: none;
            padding: 0;
            margin: 0;
          }

          .candidate-item, .notification-item {
            display: flex;
            justify-content: space-between;
            padding-bottom: 8px;
            border-bottom: 1px solid #eee;
            color: #555;
          }

          .candidate-item:last-child, .notification-item:last-child {
            border-bottom: none;
          }

          .candidate-date {
            font-size: 0.875rem;
            color: #666;
          }
        `}
      </style>
      <JuryNavbar /> {/* Navbar bileşeni */}
      <div className="dashboard-container">
        <h1 className="dashboard-title" >DASHBOARD</h1>

        {/* İstatistik Kutuları */}
        <div className="stats-grid">
          <div className="stats-box stats-total-applications">
            <p className="stats-label">Toplam Başvuru</p>
            <p className="stats-value">{stats.totalApplications}</p>
          </div>
          <div className="stats-box stats-completed-evaluations">
            <p className="stats-label">Tamamlanan Değerlendirme</p>
            <p className="stats-value">{stats.completedEvaluations}</p>
          </div>
          <div className="stats-box stats-pending-reports">
            <p className="stats-label">Bekleyen Rapor</p>
            <p className="stats-value">{stats.pendingReports}</p>
          </div>
        </div>

        {/* İki ana blok: Son Adaylar ve Bildirimler */}
        <div className="main-grid">
          {/* Son Değerlendirilen Adaylar */}
          <div className="recent-candidates">
            <h2 className="section-title">Son Değerlendirilen Adaylar</h2>
            <ul className="candidates-list">
              {recentCandidates.map((candidate, index) => (
                <li key={index} className="candidate-item">
                  <span>{candidate.name}</span>
                  <span className="candidate-date">{candidate.date}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Bildirimler */}
          <div className="notifications">
            <h2 className="section-title">Bildirimler</h2>
            <ul className="notifications-list">
              {notifications.map((note, index) => (
                <li key={index} className="notification-item">{note}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default JuryDashboard;
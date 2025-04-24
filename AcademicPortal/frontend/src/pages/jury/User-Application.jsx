import React from "react";
import { useParams } from "react-router-dom";
import JuryNavbar from "../../components/navbars/JuryNavbar.jsx"; // JuryNavbar bileşenini import ettik

const UserApplication = () => {
  const { id } = useParams();

  // Sahte başvuru verisi (ID ile eşleştirme simülasyonu)
  const application = {
    id,
    name: "Ahmet Yılmaz",
    position: "Doçent",
    title: "Bilgisayar Mühendisliği Kadrosu",
    date: "25.03.2025",
    status: "Beklemede",
    documents: [
      { name: "Yüksek Lisans Diploması", url: "#" },
      { name: "Yayın Listesi", url: "#" },
      { name: "Katılım Belgeleri", url: "#" },
    ],
  };

  const statusColors = {
    Beklemede: "#ffc107",
    Onaylandı: "#28a745",
    Reddedildi: "#dc3545",
  };

  return (
    <>
      <style>
        {`
          .application-container {
            min-height: 100vh;
            padding: 24px;
            background-color: #f4f6f9;
            font-family: 'Arial', sans-serif;
          }

          .application-card {
            max-width: 900px;
            margin: 0 auto;
            background-color: #fff;
            border-radius: 16px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            padding: 32px;
            position: relative;
          }

          .application-header {
            text-align: center;
            margin-bottom: 24px;
          }

          .application-name {
            font-size: 2rem;
            font-weight: bold;
            color: #333;
          }

          .application-title {
            font-size: 1.2rem;
            font-weight: 500;
            color: #555;
          }

          .status-badge {
            position: absolute;
            top: 16px;
            right: 16px;
            padding: 8px 16px;
            border-radius: 12px;
            font-size: 0.9rem;
            font-weight: 600;
            color: #fff;
          }

          .application-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-top: 24px;
          }

          .detail-item {
            background-color: #f9f9f9;
            padding: 16px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }

          .detail-item strong {
            display: block;
            font-size: 0.9rem;
            color: #555;
            margin-bottom: 4px;
          }

          .detail-item span {
            font-size: 1rem;
            font-weight: 500;
            color: #333;
          }

          .documents-section h2 {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 16px;
            color: #333;
            border-bottom: 2px solid #009944;
            display: inline-block;
            padding-bottom: 4px;
          }

          .documents-list {
            list-style: none;
            padding: 0;
            margin: 0;
          }

          .documents-list li {
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .documents-list a {
            text-decoration: none;
            color: #007bff;
            font-weight: 500;
            transition: color 0.3s ease;
          }

          .documents-list a:hover {
            color: #0056b3;
          }

          .download-icon {
            font-size: 1.2rem;
            color: #28a745;
          }

          @media (max-width: 768px) {
            .application-details {
              grid-template-columns: 1fr;
            }

            .application-card {
              padding: 24px;
            }

            .application-name {
              font-size: 1.5rem;
            }
          }
        `}
      </style>
      <JuryNavbar /> {/* Navbar bileşeni */}
      <div className="application-container">
        <div className="application-card">
          <span
            className="status-badge"
            style={{ backgroundColor: statusColors[application.status] }}
          >
            {application.status}
          </span>
          <div className="application-header">
            <h1 className="application-name">{application.name}</h1>
            <p className="application-title">{application.title}</p>
          </div>

          <div className="application-details">
            <div className="detail-item">
              <strong>Başvurduğu Kadro</strong>
              <span>{application.position}</span>
            </div>
            <div className="detail-item">
              <strong>Başvuru Tarihi</strong>
              <span>{application.date}</span>
            </div>
          </div>

          <div className="documents-section" style={{ marginTop: "24px" }}>
            <h2>Belgeler</h2>
            <ul className="documents-list">
              {application.documents.map((doc, index) => (
                <li key={index}>
                  <span className="download-icon">📥</span>
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {doc.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserApplication;
import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // React Router'dan useNavigate import edildi
import JuryNavbar from "../../components/navbars/JuryNavbar.jsx"; // JuryNavbar bileşenini import ettik

const Applications = () => {
  const [sortKey, setSortKey] = useState("name");
  const [filter, setFilter] = useState("");
  const navigate = useNavigate(); // Yönlendirme için useNavigate kullanılıyor

  const applications = [
    {
      id: 1,
      name: "Ahmet Yılmaz",
      position: "Doçent",
      title: "Bilgisayar Mühendisliği Kadrosu",
      date: "25.03.2025",
      status: "Beklemede",
    },
    {
      id: 2,
      name: "Zeynep Aksoy",
      position: "Dr. Öğr. Üyesi",
      title: "Yazılım Mühendisliği Kadrosu",
      date: "24.03.2025",
      status: "Değerlendiriliyor",
    },
    {
      id: 3,
      name: "Ali Kaya",
      position: "Profesör",
      title: "Veri Bilimi Kadrosu",
      date: "23.03.2025",
      status: "Değerlendirme Tamamlandı",
    },
  ];

  const statusColors = {
    Beklemede: "#ffc107",
    Değerlendiriliyor: "#28a745",
    "Değerlendirme Tamamlandı": "#009944",
  };

  const filtered = applications
    .filter((app) =>
      app.name.toLowerCase().includes(filter.toLowerCase()) ||
      app.position.toLowerCase().includes(filter.toLowerCase()) ||
      app.title.toLowerCase().includes(filter.toLowerCase()) ||
      app.date.includes(filter)
    )
    .sort((a, b) => a[sortKey].localeCompare(b[sortKey]));

  const handleViewDetails = (id) => {
    navigate(`/user-application/${id}`); // İlgili başvuru id'si ile yönlendirme yapılıyor
  };

  return (
    <>
      <style>
        {`
          .applications-container {
            padding: 24px;
            background-color: #f4f6f9;
            font-family: 'Sans-serif';
          }

          .applications-title {
            font-size: 2rem;
            font-weight: bold;
            margin-bottom: 24px;
            color: #333;
          }

          .filter-input {
            width: 100%;
            padding: 8px;
            border-radius: 8px;
            border: 1px solid #ccc;
            background-color: #fff;
            color: #333;
            margin-bottom: 16px;
          }

          .applications-table {
            width: 100%;
            border-collapse: collapse;
            background-color: #fff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }

          .applications-table th {
            background-color: #009944;
            color: #fff;
            text-align: left;
            padding: 12px;
            cursor: pointer;
          }

          .applications-table td {
            padding: 12px;
            color: #555;
            border-bottom: 1px solid #eee;
          }

          .applications-table tr:last-child td {
            border-bottom: none;
          }

          .status {
            font-weight: 600;
          }

          .action-button {
            padding: 6px 12px;
            border-radius: 8px;
            font-size: 0.875rem;
            background-color: #007c39;
            color: #fff;
            border: none;
            cursor: pointer;
          }

          .action-button:hover {
            background-color: #005f2a;
          }
        `}
      </style>
      <JuryNavbar /> {/* Navbar bileşeni */}
      <div className="applications-container">
        <h1 className="applications-title">Başvurular</h1>

        {/* Filtreleme Alanı */}
        <input
          type="text"
          placeholder="Filtrele: Aday, kadro, ilan..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="filter-input"
        />

        {/* Başvurular Tablosu */}
        <div className="overflow-x-auto">
          <table className="applications-table">
            <thead>
              <tr>
                <th onClick={() => setSortKey("name")}>Aday Adı</th>
                <th onClick={() => setSortKey("position")}>Kadro</th>
                <th onClick={() => setSortKey("title")}>İlan Başlığı</th>
                <th onClick={() => setSortKey("date")}>Başvuru Tarihi</th>
                <th>Durum</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((app) => (
                <tr key={app.id}>
                  <td>{app.name}</td>
                  <td>{app.position}</td>
                  <td>{app.title}</td>
                  <td>{app.date}</td>
                  <td>
                    <span
                      className="status"
                      style={{ color: statusColors[app.status] }}
                    >
                      {app.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="action-button"
                      onClick={() => handleViewDetails(app.id)}
                    >
                      İncele
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Applications;
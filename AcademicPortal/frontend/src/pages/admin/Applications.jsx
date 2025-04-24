import React, { useState } from "react";
import AdminNavbar from "../../components/navbars/AdminNavbar.jsx"; // AdminNavbar bileşenini import ettik

const sampleApplications = [
  {
    id: 1,
    candidateName: "Ahmet Yılmaz",
    tc: "12345678901",
    date: "2025-04-10",
    status: "Beklemede",
    documents: [
      { name: "Özgeçmiş.pdf", type: "CV" },
      { name: "A1_Yayin.pdf", type: "A1 Yayını" },
      { name: "Konferans.pdf", type: "Konferans Katılımı" }
    ],
    summaryPDF: "basvuru_ozeti_ahmet.pdf"
  },
  {
    id: 2,
    candidateName: "Zeynep Demir",
    tc: "10987654321",
    date: "2025-04-12",
    status: "Onaylandı",
    documents: [
      { name: "Yuksek_Lisans.pdf", type: "Diploma" },
      { name: "Makale.pdf", type: "A2 Yayını" }
    ],
    summaryPDF: "basvuru_ozeti_zeynep.pdf"
  }
];

const Applications = () => {
  const [selectedApp, setSelectedApp] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredApps = sampleApplications.filter((app) => {
    return (
      (!statusFilter || app.status === statusFilter) &&
      (app.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.tc.includes(searchTerm))
    );
  });

  return (
    <>
      <AdminNavbar /> {/* Navbar bileşeni */}
      <div className="applications-container">
        <h2 className="title">Başvurular</h2>

        {/* Filtreleme Alanı */}
        <div className="filters">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Tüm Durumlar</option>
            <option value="Onaylandı">Onaylandı</option>
            <option value="Beklemede">Beklemede</option>
            <option value="Reddedildi">Reddedildi</option>
          </select>
          <input
            type="text"
            placeholder="Ad / TC Ara"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Masaüstü Tablo */}
        <div className="desktop-table">
          <table>
            <thead>
              <tr>
                <th>Başvuru No</th>
                <th>Aday Adı</th>
                <th>TC Kimlik No</th>
                <th>Başvuru Tarihi</th>
                <th>Durum</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.map((app) => (
                <tr key={app.id}>
                  <td>{app.id}</td>
                  <td>{app.candidateName}</td>
                  <td>{app.tc}</td>
                  <td>{app.date}</td>
                  <td className={app.status === "Onaylandı" ? "aktif" : app.status === "Beklemede" ? "beklemede" : "pasif"}>{app.status}</td>
                  <td>
                    <div className="actions">
                      <button onClick={() => setSelectedApp(app)}>Detay</button>
                      <button>PDF</button>
                      <button className="yonlendir">Yönlendir</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobil Kartlar */}
        <div className="mobile-cards">
          {filteredApps.map((app) => (
            <div className="application-card" key={app.id}>
              <div className="card-header">
                <h3>{app.candidateName}</h3>
                <span className={`status-tag ${app.status === "Onaylandı" ? "aktif" : app.status === "Beklemede" ? "beklemede" : "pasif"}`}>{app.status}</span>
              </div>
              <div className="card-body">
                <div><strong>Başvuru No:</strong> {app.id}</div>
                <div><strong>TC:</strong> {app.tc}</div>
                <div><strong>Tarih:</strong> {app.date}</div>
              </div>
              <div className="actions">
                <button onClick={() => setSelectedApp(app)}>Detay</button>
                <button>PDF</button>
                <button className="yonlendir">Yönlendir</button>
              </div>
            </div>
          ))}
        </div>

        {/* Detay Modal */}
        {selectedApp && (
          <div className="modal-overlay" onClick={() => setSelectedApp(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Başvuru Detayı - {selectedApp.candidateName}</h3>
              <p><strong>Başvuru No:</strong> {selectedApp.id}</p>
              <p><strong>TC Kimlik No:</strong> {selectedApp.tc}</p>
              <p><strong>Başvuru Tarihi:</strong> {selectedApp.date}</p>
              <p><strong>Durum:</strong> {selectedApp.status}</p>

              <h4>Belgeler</h4>
              <ul>
                {selectedApp.documents.map((doc, i) => (
                  <li key={i}>{doc.name} <em>({doc.type})</em></li>
                ))}
              </ul>

              <h4>Başvuru Özeti</h4>
              <p>
                {selectedApp.summaryPDF} - <button className="indir">İndir</button>
              </p>

              <button className="geri" onClick={() => setSelectedApp(null)}>Kapat</button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .applications-container {
          padding: 20px;
          background: #f4f6f9;
          min-height: 100vh;
          font-family: 'Segoe UI', sans-serif;
        }

        .title {
          color: #009944;
          margin-bottom: 16px;
        }

        .filters {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 20px;
        }

        .filters select, .filters input {
        height: 40px;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 8px;
          flex: 1 1 200px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          border-radius: 12px;
          overflow: hidden;
        }

        th, td {
          padding: 12px;
          border-bottom: 1px solid #eee;
          text-align: left;
        }

        th {
          background: #009944;
          color: white;
        }

        .aktif { color: #28a745; }
        .pasif { color: #dc3545; }
        .beklemede { color: #ffc107; }

        .actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 12px;
        }

        .actions button {
          padding: 6px 10px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }

        .actions button:nth-child(1) { background: #007c39; color: white; }
        .actions button:nth-child(2) { background: #ccc; }
        .actions button.yonlendir { background: #ffc107; }

        .application-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          padding: 20px;
          margin-bottom: 20px;
          transition: 0.3s ease;
        }

        .application-card:hover {
          transform: scale(1.01);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .card-header h3 {
          margin: 0;
          font-size: 1.2rem;
          color: #007c39;
        }

        .status-tag {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .status-tag.aktif { background-color: #d4edda; color: #155724; }
        .status-tag.pasif { background-color: #f8d7da; color: #721c24; }
        .status-tag.beklemede { background-color: #fff3cd; color: #856404; }

        .card-body div {
          margin-bottom: 6px;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          padding: 24px;
          border-radius: 12px;
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-content h3 {
          margin-top: 0;
          color: #007c39;
        }

        .modal-content ul {
          padding-left: 20px;
        }

        .indir {
          background: #28a745;
          color: white;
          border: none;
          padding: 4px 8px;
          border-radius: 4px;
        }

        .geri {
          margin-top: 20px;
          background: #ccc;
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
        }

        .mobile-cards { display: none; }

        @media (max-width: 768px) {
          .desktop-table { display: none; }
          .mobile-cards { display: block; }
        }
      `}</style>
    </>
  );
};

export default Applications;
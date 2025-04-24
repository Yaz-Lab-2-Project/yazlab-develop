import React, { useState, useEffect, useRef } from "react";
import { FaFileAlt } from "react-icons/fa";
import UserNavbar from "../../components/navbars/UserNavbar";

const academicAnnouncements = [
  {
    id: 1,
    title: "Bilgisayar Mühendisliği Bölümü - Dr. Öğr. Üyesi Kadrosu",
    position: "Dr. Öğr. Üyesi",
    faculty: "Mühendislik Fakültesi",
    department: "Bilgisayar Mühendisliği",
    startDate: "2025-04-01",
    endDate: "2025-04-20"
  },
  {
    id: 2,
    title: "İktisat Bölümü - Doçent Kadrosu",
    position: "Doçent",
    faculty: "İktisadi ve İdari Bilimler Fakültesi",
    department: "İktisat",
    startDate: "2025-04-05",
    endDate: "2025-04-25"
  },
  {
    id: 3,
    title: "Elektrik-Elektronik Mühendisliği - Profesör Kadrosu",
    position: "Profesör",
    faculty: "Mühendislik Fakültesi",
    department: "Elektrik-Elektronik Mühendisliği",
    startDate: "2025-03-30",
    endDate: "2025-04-20"
  },
  {
    id: 4,
    title: "Hukuk Fakültesi - Dr. Öğr. Üyesi Kadrosu (Özel Alan)",
    position: "Dr. Öğr. Üyesi",
    faculty: "Hukuk Fakültesi",
    department: "Kamu Hukuku",
    startDate: "2025-04-02",
    endDate: "2025-04-18"
  }
];

const myApplications = [
  {
    applicationId: 101,
    userId: 1,
    announcementId: 1,
    status: "Beklemede",
    appliedDate: "2025-04-02",
    documents: ["Özgeçmiş.pdf", "Doktora_Belgesi.pdf", "A1_Yayin.pdf", "Baslica_Yazar_Kaniti.pdf"]
  },
  {
    applicationId: 102,
    userId: 1,
    announcementId: 2,
    status: "Onaylandı",
    appliedDate: "2025-04-06",
    documents: ["Docentlik_Belgesi.pdf", "Yayinlar.pdf", "Konferans_Belgesi.pdf", "Atif_Belgeleri.pdf"]
  },
  {
    applicationId: 103,
    userId: 1,
    announcementId: 3,
    status: "Reddedildi",
    appliedDate: "2025-04-01",
    documents: ["Prof_Dilekce.pdf", "10_Yayin.pdf", "Proje_Belgesi.pdf", "Baslica_Yazar.pdf"]
  },
  {
    applicationId: 104,
    userId: 1,
    announcementId: 4,
    status: "Beklemede",
    appliedDate: "2025-04-03",
    documents: ["Alan_Disi_Yayin_Kaniti.pdf", "A1_Yayin.pdf", "Katilim_Belgesi.pdf"]
  },
  {
    applicationId: 105,
    userId: 1,
    announcementId: 1,
    status: "Onaylandı",
    appliedDate: "2025-04-05",
    documents: ["YuksekLisans_Belgesi.pdf", "IndeksliYayin.pdf", "Baslica_Yazar_Kaniti.pdf"]
  }
];

const statusColors = {
  Beklemede: "#ffc107", // Sarı
  Onaylandı: "#28a745", // Yeşil
  Reddedildi: "#dc3545" // Kırmızı
};

export default function MyApplications() {
  const [openId, setOpenId] = useState(null);

  const toggleDialog = (id) => {
    setOpenId(prev => (prev === id ? null : id));
  };

  return (
    <>
      <UserNavbar />
      <div className="container">
        <h1 className="title">Başvurularım</h1>
        <div className="grid">
          {myApplications.map(app => {
            const announcement = academicAnnouncements.find(a => a.id === app.announcementId);
            const isOpen = openId === app.applicationId;

            return (
              <div
                key={app.applicationId}
                className="card"
                style={{ borderLeftColor: statusColors[app.status] }}
              >
                <div>
                  <h2>{announcement?.position}</h2>
                  <p className="text-gray">{announcement?.faculty}</p>
                  <p className="text-gray">{announcement?.department}</p>
                  <p className="text-gray-light">Başvuru Tarihleri: {announcement?.startDate} - {announcement?.endDate}</p>
                  <p className="text-gray-light status">Durum: <span style={{ color: statusColors[app.status] }}>{app.status}</span></p>
                </div>
                <button className="btn mt-4" onClick={() => toggleDialog(app.applicationId)}>Yüklediğim Belgeleri Gör</button>

                {/* Modal */}
                {isOpen && (
                  <div className="modal-overlay" onClick={() => setOpenId(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                      <div className="modal-header">
                        <h2>Yüklenen Belgeler</h2>
                        <button
                          className="close-btn"
                          onClick={() => setOpenId(null)} // Modalı kapatır
                          aria-label="Close"
                        >
                          &times; {/* Daha şık bir kapatma simgesi */}
                        </button>
                      </div>
                      <ul className="document-list">
                        {app.documents.map((doc, idx) => (
                          <li key={idx}>
                            <a href="#" download>
                              <FaFileAlt style={{ marginRight: "6px", color: "#009944" }} />
                              {doc}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <style>{`
          .container {
            display: flex;
            flex-direction: column;
            align-items: center;
            background-color: #f4f6f9;
            padding: 1rem;
            font-family: sans-serif;
            margin: 100px auto; 
            text-align: center;
          }

          .title {
            font-size: 1.5rem;
            font-weight: bold;
            color: #333;
            text-align: center;
          }

          .grid {
            display: grid;
            gap: 2rem;
            width: 100%; /* Grid genişliği tam olur */
            max-width: 1200px; /* İçeriği sınırlamak için maksimum genişlik */
          }

          @media (min-width: 768px) {
            .grid {
              grid-template-columns: repeat(2, 1fr);
            }
          }

          @media (min-width: 1024px) {
            .grid {
              grid-template-columns: repeat(3, 1fr);
            }
          }

          .card {
            background: white;
            border-radius: 1rem;
            padding: 1rem;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            border-left: 8px solid transparent;
            position: relative;
          }

          .card h2 {
            font-size: 1.25rem;
            font-weight: 600;
            color: #333;
          }

          .text-gray {
            color: #555;
          }

          .text-gray-light {
            color: #666;
          }

          .status {
            font-weight: 500;
            margin-top: 0.5rem;
          }

          .btn {
            background-color: #009944;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
            width: 100%;
            cursor: pointer;
            transition: background-color 0.3s;
          }

          .btn:hover {
            background-color: #007c39;
          }

          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
          }

          .modal {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            width: 400px;
            max-width: 90%;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            position: relative;
            animation: fadeIn 0.3s ease-in-out;
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
            border-bottom: 1px solid #ddd; /* Alt çizgi ekleyerek başlığı ayırır */
            padding-bottom: 0.5rem;
          }

          .modal-header h2 {
            font-size: 1.25rem;
            font-weight: bold;
            color: #333;
            margin: 0;
          }

          .close-btn {
            background: none;
            border: none;
            font-size: 1.5rem;
            font-weight: bold;
            color: #333;
            cursor: pointer;
            transition: color 0.3s ease, transform 0.2s ease;
          }

          .close-btn:hover {
            color: #dc3545; /* Hover durumunda kırmızı renk */
            transform: scale(1.2); /* Hover durumunda hafif büyütme efekti */
          }

          .document-list {
            list-style: none;
            padding: 0;
            margin: 0;
          }

          .document-list li {
            margin-bottom: 0.5rem;
          }

          .document-list a {
            color: #1d4ed8;
            text-decoration: none;
          }

          .document-list a:hover {
            text-decoration: underline;
          }
        `}</style>
      </div>
    </>
  );
}
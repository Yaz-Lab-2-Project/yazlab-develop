import React, { useState } from "react";
import JuryNavbar from "../../components/navbars/JuryNavbar.jsx"; // Navbar bileşenini import ettik

const Rapor = () => {
  const [uploadModal, setUploadModal] = useState(null);

  const reports = [
    {
      id: 1,
      candidate: "Ahmet Yılmaz",
      title: "Bilgisayar Mühendisliği Kadrosu",
      position: "Doçent",
      file: "ahmet-rapor.pdf",
      date: "25.03.2025",
    },
    {
      id: 2,
      candidate: "Zeynep Aksoy",
      title: "Yazılım Mühendisliği Kadrosu",
      position: "Dr. Öğr. Üyesi",
      file: null,
      date: "-",
    },
  ];

  const selectedReport = reports.find((r) => r.id === uploadModal);

  return (
    <>
      <style>
        {`
          .reports-container {
            padding: 24px;
            background-color: #f4f6f9;
            font-family: 'Arial', sans-serif;
          }

          .reports-title {
            font-size: 2rem;
            font-weight: bold;
            margin-bottom: 24px;
            color: #333;
          }

          .reports-table {
            width: 100%;
            border-collapse: collapse;
            background-color: #fff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }

          .reports-table th {
            background-color: #009944;
            color: #fff;
            text-align: left;
            padding: 12px;
          }

          .reports-table td {
            padding: 12px;
            color: #555;
            border-bottom: 1px solid #eee;
          }

          .reports-table tr:last-child td {
            border-bottom: none;
          }

          .modal-overlay {
            position: fixed;
            inset: 0;
            background-color: rgba(0, 0, 0, 0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 50;
          }

          .modal-content {
            background-color: #fff;
            border-radius: 16px;
            padding: 24px;
            width: 100%;
            max-width: 600px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          }

          .modal-header {
            font-size: 1.5rem;
            font-weight: bold;
            margin-bottom: 16px;
            color: #009944;
          }

          .modal-close {
            text-align: right;
            margin-top: 16px;
          }

          .modal-close button {
            padding: 8px 16px;
            background-color: #f4f4f4;
            border: none;
            border-radius: 8px;
            cursor: pointer;
          }

          .modal-close button:hover {
            background-color: #e0e0e0;
          }

          .button-primary {
            padding: 8px 16px;
            background-color: #007c39;
            color: #fff;
            border: none;
            border-radius: 8px;
            cursor: pointer;
          }

          .button-primary:hover {
            background-color: #005f2a;
          }

          .button-secondary {
            padding: 8px 16px;
            background-color: #fff;
            color: #007c39;
            border: 1px solid #007c39;
            border-radius: 8px;
            cursor: pointer;
          }

          .button-secondary:hover {
            background-color: #f4f4f4;
          }

          @media (max-width: 768px) {
            .reports-title {
              font-size: 1.5rem;
            }

            .modal-content {
              padding: 16px;
            }
          }
        `}
      </style>
      <JuryNavbar /> {/* Navbar bileşeni */}
      <div className="reports-container">
        <h1 className="reports-title">Raporlar</h1>

        <div className="overflow-x-auto">
          <table className="reports-table">
            <thead>
              <tr>
                <th>Aday</th>
                <th>İlan</th>
                <th>Kadro</th>
                <th>Rapor Dosyası</th>
                <th>Yükleme Tarihi</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id}>
                  <td>{report.candidate}</td>
                  <td>{report.title}</td>
                  <td>{report.position}</td>
                  <td>
                    {report.file ? (
                      <a href="#" className="text-blue-600 underline" download>
                        {report.file}
                      </a>
                    ) : (
                      <span className="text-red-500">Eksik</span>
                    )}
                  </td>
                  <td>{report.date}</td>
                  <td>
                    {report.file && (
                      <button className="button-primary">Görüntüle</button>
                    )}
                    <button
                      className="button-secondary"
                      onClick={() => setUploadModal(report.id)}
                    >
                      Yenisini Yükle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Yükleme Modal */}
        {selectedReport && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2 className="modal-header">Rapor Yükle</h2>
              <form>
                <label className="block mb-2 text-sm">Açıklama (isteğe bağlı)</label>
                <textarea className="w-full mb-4 border p-2 rounded" rows="3" />

                <label className="block mb-2 text-sm">PDF Rapor Dosyası</label>
                <input type="file" accept=".pdf" className="w-full mb-4 border p-2 rounded" />

                <label className="block mb-2 text-sm">Karar</label>
                <select className="w-full mb-4 border p-2 rounded">
                  <option>Olumlu</option>
                  <option>Olumsuz</option>
                </select>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setUploadModal(null)}
                    className="button-secondary"
                  >
                    İptal
                  </button>
                  <button type="submit" className="button-primary">
                    Yükle
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Rapor;
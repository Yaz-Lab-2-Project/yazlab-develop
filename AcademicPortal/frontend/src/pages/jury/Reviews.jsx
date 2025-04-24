import React, { useState } from "react";
import { useNavigate, BrowserRouter as Router } from "react-router-dom";
import JuryNavbar from "../../components/navbars/JuryNavbar.jsx"; // Navbar bileşenini import ettik

const Reviews = () => {
  const navigate = useNavigate();
  const [viewModal, setViewModal] = useState(null);
  const [editModal, setEditModal] = useState(null);

  const evaluations = [
    {
      id: 1,
      candidate: "Ahmet Yılmaz",
      title: "Bilgisayar Mühendisliği Kadrosu",
      position: "Doçent",
      score: 87,
      decision: "Olumlu",
      reportStatus: "Yüklendi",
      reportFile: "ahmet-rapor.pdf",
      notes: "Adayın yayın sayısı yeterli ve çeşitliliği iyi.",
    },
    {
      id: 2,
      candidate: "Zeynep Aksoy",
      title: "Yazılım Mühendisliği Kadrosu",
      position: "Dr. Öğr. Üyesi",
      score: null,
      decision: "Olumsuz",
      reportStatus: "Eksik",
      reportFile: null,
      notes: "Belgelerde eksiklik var.",
    },
  ];

  const decisionColors = {
    Olumlu: "#28a745",
    Olumsuz: "#dc3545",
  };

  const reportColors = {
    Yüklendi: "#28a745",
    Eksik: "#ffc107",
  };

  const selectedView = evaluations.find((e) => e.id === viewModal);
  const selectedEdit = evaluations.find((e) => e.id === editModal);

  return (
    <>
      <style>
        {`
          .evaluations-container {
            padding: 24px;
            background-color: #f4f6f9;
            font-family: 'Arial', sans-serif;
          }

          .evaluations-title {
            font-size: 2rem;
            font-weight: bold;
            margin-bottom: 24px;
            color: #333;
          }

          .evaluations-table {
            width: 100%;
            border-collapse: collapse;
            background-color: #fff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }

          .evaluations-table th {
            background-color: #009944;
            color: #fff;
            text-align: left;
            padding: 12px;
          }

          .evaluations-table td {
            padding: 12px;
            color: #555;
            border-bottom: 1px solid #eee;
          }

          .evaluations-table tr:last-child td {
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
            .evaluations-title {
              font-size: 1.5rem;
            }

            .modal-content {
              padding: 16px;
            }
          }
        `}
      </style>
      <JuryNavbar /> {/* Navbar bileşeni */}
      <div className="evaluations-container">
        <h1 className="evaluations-title">Değerlendirmelerim</h1>

        <div className="overflow-x-auto">
          <table className="evaluations-table">
            <thead>
              <tr>
                <th>Aday Adı</th>
                <th>İlan</th>
                <th>Kadro</th>
                <th>Puan</th>
                <th>Karar</th>
                <th>Rapor Durumu</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {evaluations.map((evalItem) => (
                <tr key={evalItem.id}>
                  <td>{evalItem.candidate}</td>
                  <td>{evalItem.title}</td>
                  <td>{evalItem.position}</td>
                  <td>{evalItem.score ?? "-"}</td>
                  <td>
                    <span style={{ color: decisionColors[evalItem.decision], fontWeight: 600 }}>
                      {evalItem.decision}
                    </span>
                  </td>
                  <td>
                    <span style={{ color: reportColors[evalItem.reportStatus], fontWeight: 600 }}>
                      {evalItem.reportStatus}
                    </span>
                  </td>
                  <td>
                    <button
                      className="button-primary"
                      onClick={() => setViewModal(evalItem.id)}
                    >
                      Görüntüle
                    </button>
                    <button
                      className="button-secondary"
                      onClick={() => setEditModal(evalItem.id)}
                    >
                      Güncelle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Görüntüle Modal */}
        {selectedView && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2 className="modal-header">Rapor Detayı</h2>
              <p><strong>Aday:</strong> {selectedView.candidate}</p>
              <p><strong>Kadro:</strong> {selectedView.position}</p>
              <p><strong>İlan:</strong> {selectedView.title}</p>
              <p><strong>Karar:</strong> {selectedView.decision}</p>
              <p className="my-2"><strong>Notlar:</strong> {selectedView.notes}</p>
              {selectedView.reportFile ? (
                <a
                  href="#"
                  className="text-blue-600 underline"
                  download={selectedView.reportFile}
                >
                  PDF Raporu İndir
                </a>
              ) : <p className="text-red-500">Yüklenmiş rapor bulunamadı.</p>}
              <div className="modal-close">
                <button onClick={() => setViewModal(null)}>Kapat</button>
              </div>
            </div>
          </div>
        )}

        {/* Güncelle Modal */}
        {selectedEdit && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2 className="modal-header">Rapor Güncelle</h2>
              <form>
                <label className="block mb-2 text-sm">Karar</label>
                <select defaultValue={selectedEdit.decision} className="w-full mb-4 border p-2 rounded">
                  <option>Olumlu</option>
                  <option>Olumsuz</option>
                </select>

                <label className="block mb-2 text-sm">Notlar</label>
                <textarea defaultValue={selectedEdit.notes} className="w-full mb-4 border p-2 rounded" rows="3" />

                <label className="block mb-2 text-sm">Rapor Dosyası (PDF)</label>
                <input type="file" accept=".pdf" className="w-full mb-4 border p-2 rounded" />

                <div className="flex justify-between">
                  <button type="button" onClick={() => setEditModal(null)} className="button-secondary">
                    İptal
                  </button>
                  <button type="submit" className="button-primary">
                    Kaydet
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

const EvaluationsPage = () => (
  <Router>
    <EvaluationsPageContent />
  </Router>
);

export default Reviews;
// src/pages/jury/Reviews.jsx (Dosya adını da Reviews.jsx yapmanız önerilir)

import React, { useState, useEffect } from "react";
import { FaFileAlt } from "react-icons/fa";
// useNavigate burada doğrudan kullanılmıyor, kaldırılabilir
// import { useNavigate } from "react-router-dom";
import JuryNavbar from "../../components/navbars/JuryNavbar.jsx";
// import { useAuth } from "../../context/AuthContext"; // Gerekirse
import api from "../../services/api";

// CSRF token'ı almak için getCookie fonksiyonu
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


// Sabit veriyi kaldır
// const evaluations = [ ... ];

const decisionColors = {
  Olumlu: "#28a745",
  Olumsuz: "#dc3545",
  // Diğer kararlar eklenebilir
};

const reportColors = {
  Yüklendi: "#28a745", // Yeşil
  Eksik: "#ffc107", // Sarı (veya kırmızı dc3545)
};

// Bileşen adını Reviews yapalım
const Reviews = () => {
  // const navigate = useNavigate(); // Kullanılmıyor
  const [evaluationsData, setEvaluationsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewModalData, setViewModalData] = useState(null); // Görüntülenecek objeyi tutar
  const [editModalData, setEditModalData] = useState(null); // Düzenlenecek objeyi tutar
  // Edit modal form state'i
  const [editFormData, setEditFormData] = useState({ sonuc: '', aciklama: '' });
  const [editReportFile, setEditReportFile] = useState(null); // Yeni dosya
  const [submitting, setSubmitting] = useState(false); // Güncelleme gönderim durumu
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');


  // Değerlendirmeleri çekme
  useEffect(() => {
    setLoading(true);
    setError(null);
    // Backend'in jüri üyesine göre filtrelediğini varsayıyoruz
    api.get('/juri-degerlendirmeler/?my_evaluations=true')
      .then(response => {
        console.log("Gelen Değerlendirmeler:", response.data);
        // Gelen yanıtı array'e dönüştür
        const evaluations = Array.isArray(response.data) ? response.data : 
                          response.data.results ? response.data.results : [];
        setEvaluationsData(evaluations);
      })
      .catch(err => {
        console.error("Değerlendirmeleri çekerken hata:", err);
        setError(err.message);
        setEvaluationsData([]); // Hata durumunda boş array set et
      })
      .finally(() => setLoading(false));
  }, []);


  // Görüntüleme modalını aç/kapat
  const openViewModal = (evaluation) => setViewModalData(evaluation);
  const closeViewModal = () => setViewModalData(null);

  // Düzenleme modalını aç/kapat ve formu doldur
  const openEditModal = (evaluation) => {
    setEditModalData(evaluation); // Düzenlenecek değerlendirme objesi
    // Form state'ini mevcut değerlerle doldur
    setEditFormData({
      sonuc: evaluation.sonuc || 'Olumlu', // Mevcut karar veya varsayılan
      aciklama: evaluation.aciklama || '', // Mevcut açıklama
    });
    setEditReportFile(null); // Yeni dosya seçimini temizle
    setModalError('');
    setModalSuccess('');
    setSubmitting(false);
  };
  const closeEditModal = () => setEditModalData(null);

  // Düzenleme formu inputlarını handle etme
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };
  const handleEditFileChange = (e) => {
    setEditReportFile(e.target.files[0] || null);
  };

  // Güncelleme formunu gönderme (PATCH)
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');
    setModalSuccess('');

    const formData = new FormData();
    formData.append('sonuc', editFormData.sonuc);
    formData.append('aciklama', editFormData.aciklama);
    if (editReportFile) {
      formData.append('rapor', editReportFile);
    }

    try {
      const response = await api.patch(`/juri-degerlendirmeler/${editModalData.id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data) {
        setModalSuccess("Değerlendirme başarıyla güncellendi!");
        // State'teki ilgili değerlendirmeyi güncelle
        setEvaluationsData(prev => prev.map(ev =>
          ev.id === editModalData.id ? response.data : ev
        ));
        // Modalı kapat
        setTimeout(() => closeEditModal(), 1500);
      }
    } catch (err) {
      console.error("Güncelleme isteği sırasında hata:", err);
      setModalError(err.response?.data?.detail || "Güncelleme yapılırken bir hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  };


  // Tarih formatlama
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try { return new Date(dateString).toLocaleDateString("tr-TR", { day: '2-digit', month: '2-digit', year: 'numeric' }); }
    catch (e) { return dateString; }
  };


  // --- Render ---
  if (loading) return (<><JuryNavbar /><div className="evaluations-container"><p>Yükleniyor...</p></div><style>{css}</style></>);
  if (error) return (<><JuryNavbar /><div className="evaluations-container"><h1 className="evaluations-title">Değerlendirmelerim</h1><p style={{color:'red'}}>Hata: {error}</p></div><style>{css}</style></>);

  return (
    <>
      <style>{css}</style> {/* Stilleri başa aldık */}
      <JuryNavbar />
      <div className="evaluations-container">
        <h1 className="evaluations-title">Değerlendirmelerim</h1>

        <div className="overflow-x-auto">
          <table className="evaluations-table">
            <thead>
              <tr>
                <th>Aday Adı</th>
                <th>İlan</th>
                <th>Kadro</th>
                {/* <th>Puan</th> Kaldırıldı */}
                <th>Karar</th>
                <th>Rapor Durumu</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {evaluationsData.length > 0 ? evaluationsData.map((evalItem) => {
                const aday = evalItem.basvuru?.aday;
                const ilan = evalItem.juri_atama?.ilan; // Değerlendirmenin ataması üzerinden ilana erişim
                const kadro = ilan?.kadro_tipi;

                const reportStatus = evalItem.rapor ? "Yüklendi" : "Eksik";

                return (
                  <tr key={evalItem.id}>
                    <td>{`${aday?.first_name || ''} ${aday?.last_name || 'Aday Bilgisi Yok'}`}</td>
                    <td>{ilan?.baslik || 'İlan Bilgisi Yok'}</td>
                    <td>{kadro?.tip || 'Kadro Yok'}</td>
                    {/* Puan sütunu kaldırıldı */}
                    <td>
                      <span style={{ color: decisionColors[evalItem.sonuc] || '#6c757d', fontWeight: 600 }}>
                        {evalItem.sonuc || '-'}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: reportColors[reportStatus], fontWeight: 600 }}>
                        {reportStatus}
                      </span>
                    </td>
                    <td>
                      {/* Görüntüle butonu - viewModalData'yı set eder */}
                      <button
                        className="button-primary"
                        style={{marginRight: '5px'}}
                        onClick={() => openViewModal(evalItem)}
                      >
                        Görüntüle
                      </button>
                      {/* Güncelle butonu - editModalData'yı set eder */}
                      <button
                        className="button-secondary"
                        onClick={() => openEditModal(evalItem)}
                      >
                        Güncelle/Yükle
                      </button>
                    </td>
                  </tr>
                )
              }) : (
                 <tr><td colSpan="6" style={{textAlign: 'center', padding: '1rem'}}>Gösterilecek değerlendirme bulunmamaktadır.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Görüntüle Modal */}
        {viewModalData && (
          <div className="modal-overlay" onClick={closeViewModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
               <div className="modal-header">
                   <h2>Değerlendirme Detayı</h2>
                   <button className="close-btn" onClick={closeViewModal} aria-label="Close">&times;</button>
               </div>
              {/* Nested verilerle doldur */}
              <p><strong>Aday:</strong> {`${viewModalData.basvuru?.aday?.first_name || ''} ${viewModalData.basvuru?.aday?.last_name || ''}`}</p>
              <p><strong>Kadro:</strong> {viewModalData.juri_atama?.ilan?.kadro_tipi?.tip || '-'}</p>
              <p><strong>İlan:</strong> {viewModalData.juri_atama?.ilan?.baslik || '-'}</p>
              <p><strong>Karar:</strong> {viewModalData.sonuc || '-'}</p>
              <p style={{marginTop:'1rem', marginBottom:'1rem'}}><strong>Notlar/Açıklama:</strong> {viewModalData.aciklama || '-'}</p>
              {viewModalData.rapor ? (
                <a
                  href={viewModalData.rapor} // API'den gelen URL
                  className="button-primary" // Buton stili
                  target="_blank"
                  rel="noopener noreferrer"
                  download // İndirme özelliği ekleyebilir veya kaldırılabilir
                >
                   PDF Raporu Görüntüle/İndir
                </a>
              ) : <p style={{color: reportColors['Eksik']}}>Yüklenmiş rapor bulunamadı.</p>}
              {/* Kapat butonu modal-close içinde değil, doğrudan burada olabilir */}
              {/* <div className="modal-close"> <button onClick={closeViewModal}>Kapat</button> </div> */}
            </div>
          </div>
        )}

        {/* Güncelle Modal */}
        {editModalData && (
          <div className="modal-overlay" onClick={closeEditModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
               <div className="modal-header">
                   <h2>Değerlendirmeyi Güncelle</h2>
                   <button className="close-btn" onClick={closeEditModal} aria-label="Close">&times;</button>
               </div>

              <form onSubmit={handleUpdateSubmit}>
                 {/* Başarı veya hata mesajları */}
                  {modalSuccess && <p style={{ color: 'green', marginBottom: '1rem' }}>{modalSuccess}</p>}
                  {modalError && <p style={{ color: 'red', marginBottom: '1rem' }}>{modalError}</p>}

                <label style={{display:'block', marginBottom:'0.5rem', fontWeight:'bold'}}>Karar*</label>
                <select
                    name="sonuc" // State'deki anahtarla eşleşmeli
                    value={editFormData.sonuc}
                    onChange={handleEditInputChange}
                    className="modal-input" // Stil için class
                    required
                    disabled={submitting}
                >
                  <option value="Olumlu">Olumlu</option>
                  <option value="Olumsuz">Olumsuz</option>
                   {/* Backend model choices ile eşleşmeli */}
                </select>

                <label style={{display:'block', marginBottom:'0.5rem', fontWeight:'bold', marginTop:'1rem'}}>Notlar/Açıklama</label>
                <textarea
                    name="aciklama" // State'deki anahtarla eşleşmeli
                    value={editFormData.aciklama}
                    onChange={handleEditInputChange}
                    className="modal-input"
                    rows="4"
                    disabled={submitting}
                 />

                <label style={{display:'block', marginBottom:'0.5rem', fontWeight:'bold', marginTop:'1rem'}}>Rapor Dosyası (PDF) {editModalData.rapor ? '(Mevcut Raporun Üzerine Yazar)' : '(Yeni Yükle)*'}</label>
                <input
                    type="file"
                    accept=".pdf"
                    className="modal-input"
                    onChange={handleEditFileChange}
                    // Yeni rapor yüklemek zorunlu olmayabilir, güncelleme için
                    // required={!editModalData.rapor} // Eğer rapor yoksa zorunlu yap
                    disabled={submitting}
                />
                 {/* Seçilen dosya adı */}
                 {editReportFile && <p style={{fontSize: '0.8em', marginTop: '0.25rem'}}>Seçilen Yeni Dosya: {editReportFile.name}</p>}


                <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem'}}>
                  <button type="button" onClick={closeEditModal} className="button-secondary" disabled={submitting}>
                    İptal
                  </button>
                  <button type="submit" className="button-primary" disabled={submitting}>
                    {submitting ? 'Kaydediliyor...' : 'Kaydet'}
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


// CSS Stilleri (Önceki Rapor.jsx kodundan alındı, küçük eklemelerle)
const css = `
    .evaluations-container { padding: 24px; background-color: #f4f6f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 1400px; margin: 0 auto; }
    .evaluations-title { font-size: 2rem; font-weight: bold; margin-bottom: 24px; color: #333; }
    .overflow-x-auto { overflow-x: auto; }
    .evaluations-table { width: 100%; border-collapse: separate; border-spacing: 0; background-color: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05); }
    .evaluations-table th { background-color: #009944; color: #fff; text-align: left; padding: 12px 15px; font-weight: 600; white-space: nowrap; }
    .evaluations-table td { padding: 12px 15px; color: #555; border-bottom: 1px solid #eee; vertical-align: middle; }
    .evaluations-table tbody tr:hover { background-color: #f8f9fa; }
    .evaluations-table tr:last-child td { border-bottom: none; }
    .evaluations-table td a { color: #007bff; text-decoration: none; }
    .evaluations-table td a:hover { text-decoration: underline; }
    .text-red-500 { color: #dc3545; font-style: italic; }
    .text-blue-600 { color: #007bff; }
    .button-primary, .button-secondary { padding: 6px 12px; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; transition: background-color 0.2s ease; margin-left: 5px; vertical-align: middle; }
    .button-primary { background-color: #007c39; color: #fff; }
    .button-primary:hover { background-color: #005f2a; }
    .button-primary:disabled { background-color: #a3d4a3; cursor: not-allowed; }
    .button-secondary { background-color: #6c757d; color: #fff; }
    .button-secondary:hover { background-color: #5a6268; }
    .button-secondary:disabled { background-color: #adb5bd; cursor: not-allowed; }
    .mt-4 { margin-top: 1rem; }
    .modal-overlay { position: fixed; inset: 0; background-color: rgba(0, 0, 0, 0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
    .modal-content { background-color: #fff; border-radius: 8px; padding: 2rem; width: 100%; max-width: 600px; box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3); animation: fadeInModal 0.3s ease-out; }
    @keyframes fadeInModal { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; padding-bottom: 0.75rem; border-bottom: 1px solid #dee2e6; }
    .modal-header h2 { font-size: 1.4rem; font-weight: 600; color: #333; margin: 0; }
    .close-btn { background: none; border: none; font-size: 1.8rem; font-weight: bold; color: #6c757d; cursor: pointer; padding: 0 0.5rem; line-height: 1; }
    .close-btn:hover { color: #343a40; }
    .modal-content form { display: flex; flex-direction: column; gap: 1rem; }
    .modal-input { width: 100%; padding: 0.75rem; border: 1px solid #ced4da; border-radius: 4px; font-size: 0.95rem; box-sizing: border-box; }
    .modal-input:disabled { background-color: #e9ecef; }
    label { display: block; margin-bottom: 0.5rem; font-weight: 500; color: #495057; }
    .document-list { list-style: none; padding: 0; margin: 1rem 0 0 0; }
    .document-list li { margin-bottom: 0.5rem; }
    .document-list a { color: #007bff; text-decoration: none; display: inline-flex; align-items: center; }
    .document-list a:hover { text-decoration: underline; }
    /* Responsive Table */
    @media (max-width: 768px) {
      .evaluations-table thead { display: none; }
      .evaluations-table, .evaluations-table tbody, .evaluations-table tr, .evaluations-table td { display: block; width: 100%; }
      .evaluations-table tr { border: 1px solid #eee; border-radius: 8px; margin-bottom: 1rem; padding: 0.5rem; }
      .evaluations-table td { text-align: right; padding-left: 45%; position: relative; border-bottom: none; padding-top: 8px; padding-bottom: 8px; min-height: 30px; display: flex; align-items: center; justify-content: flex-end;}
      .evaluations-table td::before {
        content: attr(data-label);
        position: absolute;
        left: 10px;
        width: calc(45% - 15px); /* Genişliği ayarla */
        padding-right: 10px;
        font-weight: 600;
        text-align: left;
        color: #009944;
         white-space: nowrap;
      }
       .evaluations-table td:last-child { text-align: right; padding-left: 0; justify-content: flex-end; } /* İşlem butonu sağa yaslı */
       .evaluations-table td:last-child::before { display: none; }
       .button-primary, .button-secondary { display: inline-block; margin-top: 0px; margin-left: 5px; }
    }
`;

export default Reviews;
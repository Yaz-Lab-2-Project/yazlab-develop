import React, { useState, useEffect } from "react";
import { FaFileAlt } from "react-icons/fa";
import JuryNavbar from "../../components/navbars/JuryNavbar.jsx";
import api from '../../services/api';
// import { useAuth } from "../../context/AuthContext"; // Gerekirse import edilebilir

const Rapor = () => {
  // State'ler
  const [assignments, setAssignments] = useState([]); // Jüri atamaları ve ilişkili veriler
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadModalData, setUploadModalData] = useState(null); // Modal açık mı? Hangi atama/başvuru için? { juriAtamaId: number, basvuruId: number, candidateName: string, ilanTitle: string }
  // Modal Form State'leri
  const [reportFile, setReportFile] = useState(null);
  const [decision, setDecision] = useState("OLUMLU"); // Varsayılan karar
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false); // Form gönderme durumu
  const [modalError, setModalError] = useState(''); // Modal içi hata mesajı
  const [modalSuccess, setModalSuccess] = useState(''); // Modal içi başarı mesajı

  // Atamaları ve ilişkili verileri çek
  useEffect(() => {
    const fetchAssignments = async () => {
      setLoading(true);
      try {
        const response = await api.get('/juri-atamalar/?my_assignments=true');
        // Gelen yanıtı array'e dönüştür
        const assignments = Array.isArray(response.data) ? response.data : 
                          response.data.results ? response.data.results : [];
        setAssignments(assignments);
      } catch (err) {
        console.error("Atamaları çekerken hata:", err);
        setError(err.message);
        setAssignments([]); // Hata durumunda boş array set et
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  // Modal açma fonksiyonu - Gerekli ID'leri state'e atar
  const openUploadModal = (atama) => {
     // Değerlendirmenin hangi başvuru için yapılacağını bilmemiz lazım.
     // Backend atama yanıtında başvuru ID'sini de döndürmeli.
     // Varsayım: API yanıtındaki her 'atama' objesi ilgili 'basvuru' ID'sini içerir.
     // Eğer atama birden fazla başvuruya yapılıyorsa (bu mantıksız olurdu), yapı değişmeli.
     // Tek bir başvuru olduğunu varsayalım: atama.basvuru.id gibi bir alandan alınabilir.
     // VEYA juri_degerlendirme endpoint'i juri_atama_id + basvuru_id ile çalışıyorsa ikisi de lazım.
     // Şimdilik JuriAtama'nın ilişkili olduğu İlan'ın BAŞVURULARINDAN sadece birini alabildiğimizi varsayalım.
     // Bu kısım backend yapınıza çok bağlı!
     // Örnek: const basvuruId = atama.ilan?.basvurular[0]?.id; // Çok kaba bir varsayım!
     // Daha sağlam yöntem: Backend atama bilgisinde ilgili başvuru ID'sini net olarak vermeli.
     // Varsayım: atama objesi içinde basvuru_id var.

     // Jüri Değerlendirme endpoint'i ne bekliyor? Muhtemelen basvuru ID'si ve juri_atama ID'si.
     const basvuruId = atama.basvuru?.id; // Bu alanın API yanıtınızda olduğundan emin olun!
     const juriAtamaId = atama.id;
     const candidateName = `${atama.basvuru?.aday?.first_name || ''} ${atama.basvuru?.aday?.last_name || ''}`.trim() || 'Bilinmiyor';
     const ilanTitle = atama.ilan?.baslik || 'Bilinmiyor';


     if (!basvuruId) {
         alert("Bu atama için ilişkili başvuru ID'si bulunamadı. Backend yanıtını kontrol edin.");
         return;
     }

     setUploadModalData({ juriAtamaId, basvuruId, candidateName, ilanTitle });
     setModalError('');
     setModalSuccess('');
     setReportFile(null); // Önceki seçimi temizle
     setDecision("OLUMLU"); // Varsayılana dön
     setDescription(""); // Açıklamayı temizle
  };

  const closeModal = () => {
    setUploadModalData(null);
  };

  // Modal içindeki dosya seçimini handle etme
  const handleFileSelect = (e) => {
    setReportFile(e.target.files[0] || null);
  };

  // Modal formunu gönderme (Yeni değerlendirme oluşturma - POST)
  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportFile || !uploadModalData) return;

    setModalError('');
    setModalSuccess('');
    setSubmitting(true);

    const formData = new FormData();
    formData.append('juri_atama_id', uploadModalData.juriAtamaId);
    formData.append('basvuru_id', uploadModalData.basvuruId);
    formData.append('sonuc', decision);
    formData.append('aciklama', description);
    formData.append('rapor', reportFile);

    try {
      const response = await api.post('/juri-degerlendirmeler/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setModalSuccess("Rapor başarıyla yüklendi!");
      setAssignments(prev => prev.map(assign =>
        assign.id === uploadModalData.juriAtamaId
          ? { ...assign, juri_degerlendirme: response.data }
          : assign
      ));
      setTimeout(() => closeModal(), 1500);
    } catch (err) {
      console.error("Rapor yükleme hatası:", err);
      setModalError(err.response?.data?.detail || "Rapor yüklenirken bir hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  // Tarih formatlama
   const formatDate = (dateString) => {
     if (!dateString) return "-";
     try {
       return new Date(dateString).toLocaleDateString("tr-TR", { day: '2-digit', month: '2-digit', year: 'numeric' });
     } catch { return dateString; }
   };


  // --- Render ---
  if (loading) {
    return ( <><JuryNavbar /><div className="reports-container"><p>Yükleniyor...</p></div> <style>{css}</style></> );
  }
  if (error) {
       return ( <><JuryNavbar /><div className="reports-container"><h1 className="reports-title">Raporlar</h1><p style={{color:'red'}}>Hata: {error}</p></div><style>{css}</style></> );
   }

  return (
    <>
      {/* Stil etiketini direkt ekleyelim */}
       <style>{css}</style>
      <JuryNavbar />
      <div className="reports-container">
        <h1 className="reports-title">Rapor Yönetimi</h1> {/* Başlık değişti */}

        <div className="overflow-x-auto">
          <table className="reports-table">
            <thead>
              <tr>
                <th>Aday</th>
                <th>İlan</th>
                <th>Kadro</th>
                <th>Rapor Dosyası</th>
                <th>Değerlendirme Tarihi</th> {/* Başlık değişti */}
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {assignments.length > 0 ? assignments.map((atama) => {
                 // Atama ile ilişkili verileri al (nested olduğunu varsayıyoruz)
                 const basvuru = atama.basvuru;
                 const aday = basvuru?.aday;
                 const ilan = atama.ilan;
                 const degerlendirme = atama.juri_degerlendirme; // Backend bu bilgiyi atama ile birlikte göndermeli

                 return (
                    <tr key={atama.id}>
                      <td>{`${aday?.first_name || ''} ${aday?.last_name || 'Aday Bilgisi Yok'}`}</td>
                      <td>{ilan?.baslik || 'İlan Bilgisi Yok'}</td>
                      <td>{ilan?.kadro_tipi?.tip || ilan?.kadro_tipi_ad || 'Kadro Yok'}</td>
                      <td>
                        {/* Değerlendirme varsa ve rapor URL'i varsa link göster */}
                        {degerlendirme?.rapor ? (
                          <a href={degerlendirme.rapor} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                            {/* URL'den dosya adını almaya çalışabiliriz veya backend adı gönderebilir */}
                            {degerlendirme.rapor.split('/').pop() || 'Rapor'}
                          </a>
                        ) : (
                          <span className="text-red-500">Eksik</span>
                        )}
                      </td>
                      <td>{formatDate(degerlendirme?.degerlendirme_tarihi)}</td>
                      <td>
                         {/* Eğer rapor varsa görüntüle butonu (şimdilik linkle aynı işlevi görüyor) */}
                        {degerlendirme?.rapor && (
                          <a href={degerlendirme.rapor} target="_blank" rel="noopener noreferrer" className="button-primary" style={{marginRight:'5px'}}>Görüntüle</a>
                        )}
                         {/* Rapor yükle/güncelle butonu */}
                        <button
                          className="button-secondary"
                           // Modal'ı açarken gerekli ID'leri ve bilgileri ver
                          onClick={() => openUploadModal(atama)}
                        >
                          {degerlendirme?.rapor ? 'Güncelle' : 'Yükle'} {/* Buton metni duruma göre değişir */}
                        </button>
                      </td>
                    </tr>
                 )
              }) : (
                  <tr><td colSpan="6" style={{textAlign: 'center', padding: '1rem'}}>Size atanmış başvuru bulunmamaktadır.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Yükleme Modal */}
        {uploadModalData && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header"> {/* Header'ı modal içine aldık */}
                 <h2>Rapor Yükle / Güncelle</h2>
                 <button className="close-btn" onClick={closeModal} aria-label="Close">&times;</button>
              </div>
               {/* Aday ve ilan bilgisini göster */}
               <p style={{marginBottom: '1rem', color: '#555'}}><strong>Aday:</strong> {uploadModalData.candidateName}<br/><strong>İlan:</strong> {uploadModalData.ilanTitle}</p>

              <form onSubmit={handleReportSubmit}>
                 {/* Modal içindeki başarı ve hata mesajları */}
                 {modalSuccess && <p style={{ color: 'green', marginBottom: '1rem' }}>{modalSuccess}</p>}
                 {modalError && <p style={{ color: 'red', marginBottom: '1rem' }}>{modalError}</p>}

                <label style={{display:'block', marginBottom:'0.5rem', fontWeight:'bold'}}>Açıklama (isteğe bağlı)</label>
                <textarea
                    className="modal-input" // Stil için class eklendi
                    rows="3"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={submitting}
                 />

                <label style={{display:'block', marginBottom:'0.5rem', fontWeight:'bold', marginTop:'1rem'}}>PDF Rapor Dosyası*</label>
                <input
                    type="file"
                    accept=".pdf"
                    className="modal-input" // Stil için class eklendi
                    onChange={handleFileSelect}
                    required // Yeni yükleme için zorunlu
                    disabled={submitting}
                />
                 {/* Seçilen dosya adı */}
                 {reportFile && <p style={{fontSize: '0.8em', marginTop: '0.25rem'}}>Seçilen: {reportFile.name}</p>}


                <label style={{display:'block', marginBottom:'0.5rem', fontWeight:'bold', marginTop:'1rem'}}>Karar*</label>
                <select
                    className="modal-input" // Stil için class eklendi
                    value={decision}
                    onChange={(e) => setDecision(e.target.value)}
                    required
                    disabled={submitting}
                 >
                  {/* Backend modelindeki choices ile eşleşmeli */}
                  <option value="OLUMLU">Olumlu</option>
                  <option value="OLUMSUZ">Olumsuz</option>
                  {/* <option value="Duzeltme">Düzeltme İstendi</option> */}
                </select>

                <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem'}}>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="button-secondary"
                    disabled={submitting}
                  >
                    İptal
                  </button>
                  <button type="submit" className="button-primary" disabled={submitting || !reportFile}>
                    {submitting ? 'Yükleniyor...' : 'Yükle/Güncelle'}
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

// CSS stilleri (önceki yanıttan alındı, modal için küçük eklemeler/düzeltmeler yapıldı)
const css = `
    .reports-container { padding: 24px; background-color: #f4f6f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 1400px; margin: 0 auto; }
    .reports-title { font-size: 2rem; font-weight: bold; margin-bottom: 24px; color: #333; }
    .overflow-x-auto { overflow-x: auto; } /* Küçük ekranlarda tablo taşarsa scroll çıkar */
    .reports-table { width: 100%; border-collapse: separate; border-spacing: 0; background-color: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05); }
    .reports-table th { background-color: #009944; color: #fff; text-align: left; padding: 12px 15px; font-weight: 600; }
    .reports-table td { padding: 12px 15px; color: #555; border-bottom: 1px solid #eee; vertical-align: middle; }
    .reports-table tbody tr:hover { background-color: #f8f9fa; }
    .reports-table tr:last-child td { border-bottom: none; }
    .reports-table td a { color: white; text-decoration: none; }
    .text-red-500 { color: #dc3545; font-style: italic; }
    .text-blue-600 { color: #007bff; } /* Link rengi */
    .button-primary, .button-secondary { padding: 6px 12px; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; transition: background-color 0.2s ease; margin-left: 5px; }
    .button-primary { background-color: #007c39; color: #fff; }
    .button-primary:hover { background-color: #005f2a; }
    .button-primary:disabled { background-color: #a3d4a3; cursor: not-allowed; }
    .button-secondary { background-color: #6c757d; color: #fff; }
    .button-secondary:hover { background-color: #5a6268; }
    .button-secondary:disabled { background-color: #adb5bd; cursor: not-allowed; }
    .mt-4 { margin-top: 1rem; } /* Basit margin */
    .modal-overlay { position: fixed; inset: 0; background-color: rgba(0, 0, 0, 0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
    .modal-content { background-color: #fff; border-radius: 8px; padding: 2rem; width: 100%; max-width: 600px; box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3); animation: fadeInModal 0.3s ease-out; }
    @keyframes fadeInModal { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; padding-bottom: 0.75rem; border-bottom: 1px solid #dee2e6; }
    .modal-header h2 { font-size: 1.4rem; font-weight: 600; color: #333; margin: 0; }
    .close-btn { background: none; border: none; font-size: 1.8rem; font-weight: bold; color: #6c757d; cursor: pointer; padding: 0 0.5rem; line-height: 1; }
    .close-btn:hover { color: #343a40; }
    .modal-content form { display: flex; flex-direction: column; gap: 1rem; }
    .modal-input { width: 100%; padding: 0.6rem; border: 1px solid #ced4da; border-radius: 4px; font-size: 0.95rem; }
    .modal-input:disabled { background-color: #e9ecef; }
    label { display: block; margin-bottom: 0.5rem; font-weight: 500; color: #495057; }
    /* Responsive Table */
    @media (max-width: 768px) {
      .reports-table thead { display: none; } /* Başlıkları gizle */
      .reports-table, .reports-table tbody, .reports-table tr, .reports-table td { display: block; width: 100%; }
      .reports-table tr { border: 1px solid #eee; border-radius: 8px; margin-bottom: 1rem; padding: 0.5rem; }
      .reports-table td { text-align: right; padding-left: 50%; position: relative; border-bottom: none; padding-top: 8px; padding-bottom: 8px; min-height: 30px; } /* Padding ayarlandı */
      .reports-table td::before {
        content: attr(data-label); /* data-label attribute'u eklenecek */
        position: absolute;
        left: 10px;
        width: calc(50% - 20px); /* Genişliği ayarla */
        padding-right: 10px;
        font-weight: 600;
        text-align: left;
        color: #009944;
      }
       .reports-table td:last-child { text-align: center; padding-left: 0; } /* İşlem butonu ortalansın */
       .reports-table td:last-child::before { display: none; } /* İşlem etiketi olmasın */
       .button-primary, .button-secondary { width: auto; display: inline-block; margin-top: 5px;} /* Butonlar yan yana */
    }
`;

export default Rapor;
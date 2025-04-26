import React, { useState, useEffect } from "react"; // useEffect eklendi
import AdminNavbar from "../../components/navbars/AdminNavbar.jsx";
// import { useAuth } from "../../context/AuthContext"; // Gerekirse

// Sabit veriyi kaldır
// const sampleApplications = [ ... ];

// Tarih formatlama fonksiyonu
const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
        return new Date(dateString).toLocaleDateString("tr-TR", { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch (e) { return dateString; }
};

// Belge listesini oluşturma (modal için) - API yanıtına göre güncellendi
const getApplicationDocuments = (basvuru) => {
    if (!basvuru) return [];
    const docs = [];
    if (basvuru.ozgecmis_dosyasi) docs.push({ name: "Özgeçmiş", url: basvuru.ozgecmis_dosyasi });
    if (basvuru.diploma_belgeleri) docs.push({ name: "Diploma Belgeleri", url: basvuru.diploma_belgeleri });
    if (basvuru.yabanci_dil_belgesi) docs.push({ name: "Yabancı Dil Belgesi", url: basvuru.yabanci_dil_belgesi });
    // Başvurunun AdayFaaliyetleri ile ilişkili belgeler de eklenebilir (daha karmaşık)
    return docs;
};

const Applications = () => {
  const [applicationsData, setApplicationsData] = useState([]); // API'den gelen başvurular
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null); // Modal için seçili başvuru
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Başvuruları çekme
  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch('http://localhost:8000/api/basvurular/', { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error(`Başvurular alınamadı (${res.status})`);
        return res.json();
      })
      .then(data => {
        console.log("Gelen Tüm Başvurular:", data);
        setApplicationsData(data.results || data); // Pagination varsa .results
      })
      .catch(err => {
        console.error("Başvuruları çekerken hata:", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []); // Sadece component mount olduğunda

  // Filtrelenmiş başvurular (Client-side)
  const filteredApps = applicationsData.filter((app) => {
    const searchLower = searchTerm.toLowerCase();
    const candidateName = `${app.aday?.first_name || ''} ${app.aday?.last_name || ''}`.toLowerCase();
    const candidateTC = app.aday?.TC_KIMLIK || ''; // Backend yanıtında TC_KIMLIK olmalı

    return (
      (!statusFilter || app.durum === statusFilter) && // Durum filtresi (backend durumu ile eşleşmeli)
      (candidateName.includes(searchLower) || candidateTC.includes(searchTerm)) // Ad veya TC ile arama
    );
  });

  // PDF butonuna tıklandığında (Örnek: Tablo5 PDF'ini açar)
  const handlePdfClick = (app) => {
      // API yanıtında tablo5 nested olarak gelmeli veya app.id ile fetch edilmeli
      const summaryPdfUrl = app.tablo5?.pdf_dosyasi; // tablo5 objesi ve içinde pdf_dosyasi URL'i varsayılıyor
      if (summaryPdfUrl) {
          window.open(summaryPdfUrl, '_blank');
      } else {
          alert("Bu başvuru için özet PDF (Tablo 5) bulunamadı.");
      }
  };

  // Yükleme ve Hata durumu gösterimi
  if (loading) return (<><AdminNavbar /><div className="applications-container"><p>Başvurular yükleniyor...</p></div><style>{css}</style></>);
  if (error) return (<><AdminNavbar /><div className="applications-container"><h2 className="title">Başvurular</h2><p style={{color:'red'}}>Hata: {error}</p></div><style>{css}</style></>);

  // Ana Render
  return (
    <>
      <AdminNavbar /> {/* Navbar bileşeni */}
      <div className="applications-container">
        <h2 className="title">Tüm Başvurular</h2> {/* Başlık güncellendi */}

        {/* Filtreleme Alanı */}
        <div className="filters">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Tüm Durumlar</option>
            {/* Backend'den gelen durumlarla eşleşmeli */}
            <option value="Beklemede">Beklemede</option>
            <option value="Onaylandı">Onaylandı</option>
            <option value="Reddedildi">Reddedildi</option>
            <option value="Değerlendirmede">Değerlendirmede</option>
             {/* ... diğer durumlar ... */}
          </select>
          <input
            type="text"
            placeholder="Aday Adı / TC Kimlik No Ara" // Placeholder güncellendi
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
              {filteredApps.length > 0 ? filteredApps.map((app) => (
                <tr key={app.id}>
                   {/* API'den gelen verileri kullan */}
                  <td>{app.id}</td>
                  <td>{`${app.aday?.first_name || ''} ${app.aday?.last_name || ''}`}</td>
                  <td>{app.aday?.TC_KIMLIK || '-'}</td>
                  <td>{formatDate(app.basvuru_tarihi)}</td>
                  {/* Duruma göre stil sınıfı (CSS'teki sınıflarla eşleşmeli) */}
                  <td className={
                      app.durum === "Onaylandı" ? "aktif" :
                      app.durum === "Beklemede" ? "beklemede" :
                      app.durum === "Reddedildi" ? "pasif" : ""
                  }>{app.durum || '-'}</td>
                  <td>
                    <div className="actions">
                      <button onClick={() => setSelectedApp(app)}>Detay</button>
                      <button onClick={() => handlePdfClick(app)} disabled={!app.tablo5?.pdf_dosyasi}>PDF</button>
                      <button className="yonlendir" title="İşlevsellik Eklenecek">Yönlendir</button>
                    </div>
                  </td>
                </tr>
              )) : (
                  <tr><td colSpan="6" style={{textAlign:'center'}}>Filtreye uygun başvuru bulunamadı.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobil Kartlar */}
        <div className="mobile-cards">
          {filteredApps.length > 0 ? filteredApps.map((app) => (
            <div className="application-card" key={app.id}>
              <div className="card-header">
                <h3>{`${app.aday?.first_name || ''} ${app.aday?.last_name || ''}`}</h3>
                 {/* Duruma göre stil sınıfı */}
                 <span className={`status-tag ${
                     app.durum === "Onaylandı" ? "aktif" :
                     app.durum === "Beklemede" ? "beklemede" :
                     app.durum === "Reddedildi" ? "pasif" : ""
                 }`}>{app.durum || '-'}</span>
              </div>
              <div className="card-body">
                <div><strong>Başvuru No:</strong> {app.id}</div>
                <div><strong>TC:</strong> {app.aday?.TC_KIMLIK || '-'}</div>
                <div><strong>Tarih:</strong> {formatDate(app.basvuru_tarihi)}</div>
              </div>
              <div className="actions">
                <button onClick={() => setSelectedApp(app)}>Detay</button>
                <button onClick={() => handlePdfClick(app)} disabled={!app.tablo5?.pdf_dosyasi}>PDF</button>
                <button className="yonlendir" title="İşlevsellik Eklenecek">Yönlendir</button>
              </div>
            </div>
          )) : (
               <p style={{textAlign:'center'}}>Filtreye uygun başvuru bulunamadı.</p>
           )}
        </div>

        {/* Detay Modal */}
        {selectedApp && (
          <div className="modal-overlay" onClick={() => setSelectedApp(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Başvuru Detayı - {`${selectedApp.aday?.first_name || ''} ${selectedApp.aday?.last_name || ''}`}</h3>
              <p><strong>Başvuru No:</strong> {selectedApp.id}</p>
              <p><strong>TC Kimlik No:</strong> {selectedApp.aday?.TC_KIMLIK || '-'}</p>
              <p><strong>Başvuru Tarihi:</strong> {formatDate(selectedApp.basvuru_tarihi)}</p>
              <p><strong>Durum:</strong> {selectedApp.durum}</p>

              <h4>Adayın Yüklediği Belgeler</h4>
              {(() => {
                  const documents = getApplicationDocuments(selectedApp);
                  return documents.length > 0 ? (
                      <ul>
                          {documents.map((doc, i) => (
                              <li key={i}>
                                  <a href={doc.url} target="_blank" rel="noopener noreferrer">{doc.name}</a>
                              </li>
                          ))}
                      </ul>
                  ) : <p>Yüklü belge bulunamadı.</p>;
              })()}


              <h4>Başvuru Özeti (Tablo 5)</h4>
               {selectedApp.tablo5?.pdf_dosyasi ? (
                    <p>
                       <a href={selectedApp.tablo5.pdf_dosyasi} target="_blank" rel="noopener noreferrer" className="indir" style={{textDecoration:'none'}}>
                           Özet PDF'i İndir/Görüntüle
                       </a>
                    </p>
               ) : <p>Başvuru özeti (Tablo 5) bulunamadı.</p>}


              <button className="geri" onClick={() => setSelectedApp(null)} style={{marginTop:'20px', float:'right'}}>Kapat</button>
            </div>
          </div>
        )}
      </div>

      {/* CSS Stilleri */}
      <style>{css}</style>
    </>
  );
};

// Stil tanımları (CSS Değişkeni)
const css = `
    .applications-container { padding: 20px; background: #f4f6f9; min-height: 100vh; font-family: 'Segoe UI', sans-serif; }
    .title { color: #009944; margin-bottom: 24px; font-size: 1.8rem; font-weight: 600; }
    .filters { display: flex; align-items: center; flex-wrap: wrap; gap: 15px; margin-bottom: 24px; }
    .filters select, .filters input { height: 40px; padding: 0 12px; border: 1px solid #ced4da; border-radius: 8px; flex: 1 1 220px; font-size: 0.95rem; }
    .filters input { min-width: 250px; } /* Arama kutusu biraz daha geniş olabilir */
    .desktop-table { overflow-x: auto; background: white; border-radius: 12px; box-shadow: 0 4px 8px rgba(0,0,0,0.06); }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 14px 16px; border-bottom: 1px solid #eee; text-align: left; font-size: 0.9rem; white-space: nowrap; }
    th { background: #009944; color: white; font-weight: 600; }
    tbody tr:hover { background-color: #f8f9fa; }
    td.aktif { color: #28a745; font-weight: 500; }
    td.pasif { color: #dc3545; font-weight: 500; }
    td.beklemede { color: #ffc107; font-weight: 500; }
    .actions { display: flex; flex-wrap: nowrap; gap: 8px; align-items: center; }
    .actions button { padding: 6px 10px; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; transition: opacity 0.2s; }
    .actions button:hover { opacity: 0.8; }
    .actions button:nth-child(1) { background: #17a2b8; color: white; } /* Detay */
    .actions button:nth-child(2) { background: #6c757d; color: white; } /* PDF */
    .actions button.yonlendir { background: #ffc107; color: #212529; } /* Yönlendir */
    .actions button:disabled { background-color: #adb5bd; cursor: not-allowed; opacity: 0.7; }
    .mobile-cards { display: none; }
    .application-card { background: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); padding: 16px; margin-bottom: 16px; }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid #eee; padding-bottom: 8px; }
    .card-header h3 { margin: 0; font-size: 1.1rem; color: #007c39; }
    .status-tag { padding: 4px 10px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }
    .status-tag.aktif { background-color: #d4edda; color: #155724; }
    .status-tag.pasif { background-color: #f8d7da; color: #721c24; }
    .status-tag.beklemede { background-color: #fff3cd; color: #856404; }
    .card-body { font-size: 0.9rem; color: #495057; }
    .card-body div { margin-bottom: 6px; }
    .modal-overlay { /* ... önceki gibi ... */ position: fixed; inset: 0; background-color: rgba(0, 0, 0, 0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
    .modal-content { /* ... önceki gibi ... */ background: white; padding: 24px; border-radius: 12px; width: 90%; max-width: 550px; max-height: 90vh; overflow-y: auto; }
    .modal-content h3 { margin-top: 0; color: #007c39; border-bottom: 1px solid #eee; padding-bottom: 0.5rem; margin-bottom: 1rem;}
    .modal-content h4 { font-size: 1rem; color: #343a40; margin-top: 1.5rem; margin-bottom: 0.5rem; }
    .modal-content ul { padding-left: 0; list-style: none; }
    .modal-content li { margin-bottom: 0.5rem; }
    .modal-content a { color: #0056b3; }
    .indir { background: #28a745; color: white; border: none; padding: 6px 10px; border-radius: 4px; text-decoration: none; display: inline-block; font-size: 0.9rem; }
    .geri { margin-top: 20px; background: #6c757d; color: white; border: none; padding: 8px 14px; border-radius: 6px; cursor: pointer; float: right; }
    @media (max-width: 992px) { /* Orta ekranlar için tabloyu gizle */
       .desktop-table { display: none; }
       .mobile-cards { display: block; }
    }
    @media (max-width: 768px) { /* Daha küçük ekranlar için filtreler alt alta */
       .filters { flex-direction: column; align-items: stretch; }
       .filters select, .filters input { min-width: unset; }
    }
`;


export default Applications; // Component adını export et
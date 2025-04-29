import React, { useState, useEffect } from "react"; // useEffect eklendi
import AdminNavbar from "../../components/navbars/AdminNavbar.jsx";
import { applicationService } from "../../services/adminService";
// import { useAuth } from "../../context/AuthContext"; // Gerekirse

// Sabit veriyi kaldır
// const sampleApplications = [ ... ];

// Tarih formatlama fonksiyonu
const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
        return new Date(dateString).toLocaleDateString("tr-TR", { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch { return dateString; }
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
  const [selectedApp, setSelectedApp] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });

  // Başvuruları çekme
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await applicationService.getAll();
        if (!data || data.length === 0) {
          setError('Henüz hiç başvuru bulunmamaktadır.');
        } else {
          setApplicationsData(data);
        }
      } catch (err) {
        console.error("Başvuruları çekerken hata:", err);
        setError(err.message || 'Başvurular yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  // Sıralama fonksiyonu
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Sıralanmış ve filtrelenmiş başvurular
  const sortedAndFilteredApps = React.useMemo(() => {
    let filtered = applicationsData.filter((app) => {
      const searchLower = searchTerm.toLowerCase();
      const candidateName = `${app.aday?.first_name || ''} ${app.aday?.last_name || ''}`.toLowerCase();
      const candidateTC = app.aday?.TC_KIMLIK || '';

      return (
        (!statusFilter || app.durum === statusFilter) &&
        (candidateName.includes(searchLower) || candidateTC.includes(searchTerm))
      );
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (sortConfig.key === 'ad') {
          const nameA = `${a.aday?.first_name || ''} ${a.aday?.last_name || ''}`;
          const nameB = `${b.aday?.first_name || ''} ${b.aday?.last_name || ''}`;
          return sortConfig.direction === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
        }
        if (sortConfig.key === 'tarih') {
          return sortConfig.direction === 'asc' 
            ? new Date(a.basvuru_tarihi) - new Date(b.basvuru_tarihi)
            : new Date(b.basvuru_tarihi) - new Date(a.basvuru_tarihi);
        }
        return sortConfig.direction === 'asc' 
          ? a[sortConfig.key] > b[sortConfig.key] ? 1 : -1
          : a[sortConfig.key] < b[sortConfig.key] ? 1 : -1;
      });
    }

    return filtered;
  }, [applicationsData, searchTerm, statusFilter, sortConfig]);

  // Sayfalama hesaplamaları
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedAndFilteredApps.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedAndFilteredApps.length / itemsPerPage);

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
  if (loading) {
    return (
      <>
        <AdminNavbar />
        <div className="applications-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Başvurular yükleniyor...</p>
          </div>
        </div>
        <style>{`
          ${css}
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 400px;
          }
          .loading-spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #009944;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </>
    );
  }

  if (error) {
    return (
      <>
        <AdminNavbar />
        <div className="applications-container">
          <h2 className="title">Tüm Başvurular</h2>
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button 
              className="retry-button"
              onClick={() => window.location.reload()}
            >
              Yeniden Dene
            </button>
          </div>
        </div>
        <style>{`
          ${css}
          .error-container {
            text-align: center;
            padding: 40px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.06);
          }
          .error-message {
            color: #dc3545;
            margin-bottom: 20px;
            font-size: 1.1rem;
          }
          .retry-button {
            padding: 10px 20px;
            background: #009944;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 1rem;
          }
          .retry-button:hover {
            opacity: 0.9;
          }
        `}</style>
      </>
    );
  }

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
                <th onClick={() => requestSort('id')} className="sortable">
                  Başvuru No {sortConfig.key === 'id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => requestSort('ad')} className="sortable">
                  Aday Adı {sortConfig.key === 'ad' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => requestSort('TC_KIMLIK')} className="sortable">
                  TC Kimlik No {sortConfig.key === 'TC_KIMLIK' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => requestSort('tarih')} className="sortable">
                  Başvuru Tarihi {sortConfig.key === 'tarih' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th>Durum</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? currentItems.map((app) => (
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

          {/* Sayfalama */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Önceki
              </button>
              <span>
                Sayfa {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Sonraki
              </button>
            </div>
          )}
        </div>

        {/* Mobil Kartlar */}
        <div className="mobile-cards">
          {currentItems.length > 0 ? currentItems.map((app) => (
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
              
              <div className="modal-grid">
                <div className="modal-section">
                  <h4>Kişisel Bilgiler</h4>
                  <p><strong>Başvuru No:</strong> {selectedApp.id}</p>
                  <p><strong>TC Kimlik No:</strong> {selectedApp.aday?.TC_KIMLIK || '-'}</p>
                  <p><strong>E-posta:</strong> {selectedApp.aday?.email || '-'}</p>
                  <p><strong>Telefon:</strong> {selectedApp.aday?.telefon || '-'}</p>
                </div>

                <div className="modal-section">
                  <h4>Başvuru Bilgileri</h4>
                  <p><strong>Başvuru Tarihi:</strong> {formatDate(selectedApp.basvuru_tarihi)}</p>
                  <p><strong>Durum:</strong> {selectedApp.durum}</p>
                  <p><strong>Son Güncelleme:</strong> {formatDate(selectedApp.guncelleme_tarihi)}</p>
                </div>

                <div className="modal-section">
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
                </div>

                <div className="modal-section">
                  <h4>Başvuru Özeti (Tablo 5)</h4>
                  {selectedApp.tablo5?.pdf_dosyasi ? (
                    <p>
                      <a href={selectedApp.tablo5.pdf_dosyasi} target="_blank" rel="noopener noreferrer" className="indir">
                        Özet PDF'i İndir/Görüntüle
                      </a>
                    </p>
                  ) : <p>Başvuru özeti (Tablo 5) bulunamadı.</p>}
                </div>
              </div>

              <button className="geri" onClick={() => setSelectedApp(null)}>Kapat</button>
            </div>
          </div>
        )}
      </div>

      {/* CSS Stilleri */}
      <style>{`
        ${css}
        .sortable { cursor: pointer; }
        .sortable:hover { background-color: #f8f9fa; }
        .pagination { 
          display: flex; 
          justify-content: center; 
          align-items: center; 
          gap: 10px; 
          margin-top: 20px; 
          padding: 10px;
        }
        .pagination button {
          padding: 8px 16px;
          border: 1px solid #ddd;
          background: white;
          cursor: pointer;
          border-radius: 4px;
        }
        .pagination button:disabled {
          background: #f5f5f5;
          cursor: not-allowed;
        }
        .modal-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }
        .modal-section {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
        }
        .modal-section h4 {
          margin-top: 0;
          color: #009944;
          border-bottom: 1px solid #ddd;
          padding-bottom: 8px;
        }
      `}</style>
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
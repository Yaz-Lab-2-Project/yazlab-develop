import React, { useState, useEffect, useRef } from "react"; // useRef eklendi (dropdown için)
import { useNavigate } from "react-router-dom"; // Navigate gerekirse (örn: detay sayfasına gitmek için)
import ManagerNavbar from "../../components/navbars/ManagerNavbar";

// CSRF token fonksiyonu (POST/PATCH vs. gerekirse lazım olabilir ama burada sadece GET var)
// function getCookie(name) { ... }

const Basvurular = () => {
  // Kullanılmıyor ama ileride lazım olabilir
  const _navigate = useNavigate();

  // State Tanımlamaları
  const [allIlanlar, setAllIlanlar] = useState([]); // API'den gelen tüm ilanlar
  const [applicationsData, setApplicationsData] = useState([]); // Seçili ilana ait başvurular
  const [selectedAdId, setSelectedAdId] = useState(null); // Seçili ilanın ID'si
  const [_selectedAdTitle, setSelectedAdTitle] = useState(""); // Input'ta gösterilecek başlık
  const [adSearch, setAdSearch] = useState(""); // Arama input değeri
  const [modalData, setModalData] = useState(null); // Modal'da gösterilecek başvuru verisi
  const [showDropdown, setShowDropdown] = useState(false);
  const [ilanLoading, setIlanLoading] = useState(false);
  const [ilanError, setIlanError] = useState(null);
  const [basvuruLoading, setBasvuruLoading] = useState(false);
  const [basvuruError, setBasvuruError] = useState(null);
  const dropdownRef = useRef(null); // Dropdown dışına tıklamayı algılamak için

  // 1. Tüm ilanları çekme
  useEffect(() => {
    setIlanLoading(true);
    setIlanError(null);
    fetch('http://localhost:8000/api/ilanlar/', { 
      credentials: 'include',
      headers: {
        'Authorization': `Token ${localStorage.getItem('authToken')}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error(`İlanlar alınamadı (${res.status})`);
        return res.json();
      })
      .then(data => {
        setAllIlanlar(data.results || data);
      })
      .catch(err => {
        console.error("İlanları çekerken hata:", err);
        setIlanError(err.message);
      })
      .finally(() => setIlanLoading(false));
  }, []);

  // 2. Seçili ilan değiştiğinde başvuruları çekme
  useEffect(() => {
    if (selectedAdId === null) {
      setApplicationsData([]); // İlan seçimi kalkarsa listeyi temizle
      return; // ID yoksa istek atma
    }

    setBasvuruLoading(true);
    setBasvuruError(null);
    setApplicationsData([]); // Yeni istek öncesi listeyi temizle
    // Seçili ilana ait başvuruları çek (?ilan_id=... backend'de tanımlı olmalı)
    fetch(`http://localhost:8000/api/basvurular/?ilan_id=${selectedAdId}`, { 
      credentials: 'include',
      headers: {
        'Authorization': `Token ${localStorage.getItem('authToken')}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error(`Başvurular alınamadı (${res.status})`);
        return res.json();
      })
      .then(data => {
         console.log(`İlan ${selectedAdId} için başvurular:`, data);
        setApplicationsData(data.results || data);
      })
      .catch(err => {
        console.error(`İlan ${selectedAdId} başvuruları çekilirken hata:`, err);
        setBasvuruError(err.message);
      })
      .finally(() => setBasvuruLoading(false));

  }, [selectedAdId]); // Sadece selectedAdId değiştiğinde çalışır


  // İlan arama/filtreleme (client-side)
  const filteredIlanlar = allIlanlar.filter((ilan) =>
    ilan.baslik?.toLowerCase().includes(adSearch.toLowerCase()) // Alan adı 'baslik' varsayıldı
  );

  // Dropdown dışına tıklamayı dinleme
  useEffect(() => {
    const handleClickOutside = (event) => {
       // useRef kullanarak daha doğru kontrol
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

   // Tarih formatlama
   const formatDate = (dateString) => {
     if (!dateString) return "-";
     try {
       return new Date(dateString).toLocaleDateString("tr-TR", { day: '2-digit', month: '2-digit', year: 'numeric' });
     } catch { return dateString; }
   };

  // Belge listesini oluşturma (modal için)
  const getApplicationDocuments = (basvuru) => {
      if (!basvuru) return [];
      const docs = [];
      if (basvuru.ozgecmis_dosyasi) docs.push({ name: "Özgeçmiş", url: basvuru.ozgecmis_dosyasi });
      if (basvuru.diploma_belgeleri) docs.push({ name: "Diploma Belgeleri", url: basvuru.diploma_belgeleri });
      if (basvuru.yabanci_dil_belgesi) docs.push({ name: "Yabancı Dil Belgesi", url: basvuru.yabanci_dil_belgesi });
      // Backend modelinizdeki diğer dosya alanlarını buraya ekleyin
      // if (basvuru.diger_belge_url) docs.push({ name: "Diğer Belge", url: basvuru.diger_belge_url });
      return docs;
  };

  // PDF Butonu Aksiyonu (Örnek: Özgeçmişi açar)
  const handlePdfClick = (basvuru) => {
      if (basvuru?.ozgecmis_dosyasi) {
          window.open(basvuru.ozgecmis_dosyasi, '_blank');
      } else {
          alert("Adayın özgeçmiş dosyası bulunamadı.");
      }
       // Veya Tablo5 PDF'i varsa o açılabilir:
       // if (basvuru.tablo5?.pdf_dosyasi) window.open(basvuru.tablo5.pdf_dosyasi, '_blank');
  };


  // Stil objesi (Değişiklik yok, olduğu gibi bırakıldı)
  const styles = {
    container: { padding: 24, backgroundColor: "#f4f6f9", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", minHeight:'calc(100vh - 70px)' },
    box: { backgroundColor: "#fff", padding: 24, borderRadius: 12, boxShadow: "0 4px 10px rgba(0,0,0,0.07)" },
    input: { width: "100%", padding: 12, borderRadius: 8, border: "1px solid #ccc", marginBottom: 12, fontSize:'1rem' },
    // select: { width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc", marginBottom: 24 }, // Select kaldırıldı
    table: { width: "100%", borderCollapse: "separate", borderSpacing: 0, marginTop: '1rem' },
    th: { textAlign: "left", padding: '12px 15px', backgroundColor: "#e9ecef", color: "#495057", borderBottom: '2px solid #dee2e6', fontWeight: 600 },
    td: { padding: '12px 15px', borderBottom: "1px solid #eee", verticalAlign: 'middle' },
    button: { padding: "6px 12px", borderRadius: 6, border: "none", cursor: "pointer", fontSize:'0.85rem', fontWeight: 500, transition: 'background-color 0.2s ease' },
    detay: { backgroundColor: "#17a2b8", color: "#fff" }, // Mavi tonu
    pdf: { backgroundColor: "#ffc107", color: "#212529", marginLeft: 8 }, // Sarı tonu
    info: { backgroundColor: "#fff3cd", padding: 15, borderRadius: 8, color: "#856404", border: '1px solid #ffeeba', textAlign:'center', marginTop:'1rem' },
    modalBackdrop: { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1050 },
    modal: { backgroundColor: "#fff", padding: 32, borderRadius: 12, width: 500, maxWidth: "95%", boxShadow: "0 5px 15px rgba(0,0,0,0.2)" },
    dropdownContainer: { position: "relative", width: "100%", marginBottom: "24px" },
    dropdown: { position: "absolute", top: "100%", left: 0, right: 0, backgroundColor: "#fff", border: "1px solid #ccc", borderRadius: "8px", boxShadow: "0 2px 6px rgba(0,0,0,0.1)", maxHeight: "200px", overflowY: "auto", zIndex: 1000, marginTop: '4px' },
    dropdownItem: { padding: "12px 15px", cursor: "pointer", borderBottom: '1px solid #eee' },
    // Dropdown hover stilini CSS :hover ile vermek daha iyi ama JS için basitçe
    dropdownItemHover: { backgroundColor: "#f8f9fa" },
  };


  return (
    <>
      {/* Navbar */}
      <ManagerNavbar />

      <div style={styles.container}>
        <h2 style={{ color: "#009944", marginBottom: 24, fontWeight: 600 }}>İlan İnceleme & Aday Başvuruları</h2>
        <div style={styles.box}>
          {/* İlan Arama ve Seçme */}
          <div className="dropdown-container" ref={dropdownRef} style={styles.dropdownContainer}>
             <label htmlFor="ilanSearchInput" style={{fontWeight: '500', marginBottom:'8px', display:'block'}}>İlan Seçiniz:</label>
            <input
              id="ilanSearchInput"
              style={styles.input}
              type="text"
              placeholder={ilanLoading ? "İlanlar Yükleniyor..." : "İlan Adına Göre Ara veya Seç..."}
              value={adSearch}
              onChange={(e) => {
                setAdSearch(e.target.value);
                setSelectedAdId(null); // Arama yaparken seçimi kaldır
                setShowDropdown(true); // Arama yaparken dropdown açılsın
              }}
              onFocus={() => setShowDropdown(true)} // Input'a tıklayınca dropdown açılsın
              disabled={ilanLoading}
            />
             {ilanError && <p style={{ color: 'red', fontSize: '0.9em' }}>İlanlar yüklenirken hata: {ilanError}</p>}

            {showDropdown && filteredIlanlar.length > 0 && (
              <div style={styles.dropdown}>
                {filteredIlanlar.map((ilan) => (
                  <div
                    key={ilan.id}
                    style={styles.dropdownItem}
                     // Hover efekti için basit event handler'lar
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = styles.dropdownItemHover.backgroundColor}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    onClick={() => {
                      setSelectedAdId(ilan.id); // ID'yi state'e ata
                      setSelectedAdTitle(ilan.baslik); // Başlığı state'e ata (input'ta göstermek için)
                      setAdSearch(ilan.baslik); // Arama inputunu da güncelle
                      setShowDropdown(false); // Dropdown'ı kapat
                    }}
                  >
                    {ilan.baslik} {/* Alan adı 'baslik' varsayıldı */}
                  </div>
                ))}
              </div>
            )}
             {/* Arama sonucu bulunamazsa */}
             {showDropdown && adSearch && filteredIlanlar.length === 0 && !ilanLoading && (
                 <div style={{...styles.dropdown, padding: '10px', color:'#777'}}>Aramayla eşleşen ilan bulunamadı.</div>
             )}
          </div>

          {/* Başvuru Tablosu */}
          {selectedAdId ? ( // Sadece bir ilan seçilmişse tabloyu göster
             basvuruLoading ? (
                 <div style={styles.info}>Başvurular yükleniyor...</div>
             ) : basvuruError ? (
                 <div style={{...styles.info, backgroundColor:'#f8d7da', color:'#721c24', border:'1px solid #f5c6cb'}}>Hata: {basvuruError}</div>
             ) : applicationsData.length === 0 ? (
                 <div style={styles.info}>Seçilen ilana ait başvuru bulunmamaktadır.</div>
             ) : (
                 <div style={{ overflowX: 'auto' }}> {/* Küçük ekranlar için scroll */}
                     <table style={styles.table}>
                         <thead>
                             <tr>
                                 <th style={styles.th}>Aday Adı</th>
                                 <th style={styles.th}>Başvuru Tarihi</th>
                                 <th style={styles.th}>Durum</th>
                                 <th style={styles.th}>İşlemler</th>
                             </tr>
                         </thead>
                         <tbody>
                             {applicationsData.map((basvuru) => (
                                 <tr key={basvuru.id}>
                                     <td style={styles.td}>{`${basvuru.aday?.first_name || ''} ${basvuru.aday?.last_name || 'Aday Bilgisi Yok'}`}</td>
                                     <td style={styles.td}>{formatDate(basvuru.basvuru_tarihi)}</td>
                                     <td style={styles.td}>{basvuru.durum || '-'}</td>
                                     <td style={styles.td}>
                                         <button
                                             style={{ ...styles.button, ...styles.detay }}
                                             onClick={() => setModalData(basvuru)} // Tüm başvuru objesini modala gönder
                                         >
                                             Detay
                                         </button>
                                         {/* PDF Butonu - Örnek: Özgeçmişi açar */}
                                         <button
                                             style={{ ...styles.button, ...styles.pdf }}
                                             onClick={() => handlePdfClick(basvuru)}
                                             disabled={!basvuru.ozgecmis_dosyasi} // Örnek: Özgeçmiş yoksa pasif
                                         >
                                             PDF
                                         </button>
                                         {/* Başka işlem butonları eklenebilir (örn: Jüriye Gönder) */}
                                     </td>
                                 </tr>
                             ))}
                         </tbody>
                     </table>
                 </div>
             )
          ) : (
            // Henüz ilan seçilmemişse gösterilecek mesaj
            <div style={styles.info}>Başvuruları görmek için lütfen yukarıdan bir ilan arayın veya seçin.</div>
          )}
        </div>

        {/* Detay Modal */}
        {modalData && (
          <div style={styles.modalBackdrop} onClick={() => setModalData(null)}> {/* Dışa tıklayınca kapat */}
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}> {/* Modala tıklayınca kapanmasın */}
               <h3 style={{ color: '#009944', borderBottom: '1px solid #eee', paddingBottom:'0.5rem', marginBottom: 16 }}>
                   Başvuru Detayları: {`${modalData.aday?.first_name || ''} ${modalData.aday?.last_name || ''}`}
               </h3>
               {/* Puan alanı kaldırıldı, API yanıtında yok varsayıldı */}
               {/* <p><strong>Puan:</strong> {modalData.puan}</p> */}
               <p><strong>Başvuru Tarihi:</strong> {formatDate(modalData.basvuru_tarihi)}</p>
               <p><strong>Durum:</strong> {modalData.durum}</p>
               <p style={{marginTop:'1rem'}}><strong>Yüklenen Belgeler:</strong></p>
              {(() => {
                  const documents = getApplicationDocuments(modalData);
                  return documents.length > 0 ? (
                      <ul style={{ listStyle: 'none', paddingLeft: 0, marginTop:'0.5rem' }}>
                          {documents.map((doc, i) => (
                              <li key={i} style={{marginBottom:'0.5rem'}}>
                                  <a href={doc.url} target="_blank" rel="noopener noreferrer" style={{color:'#007bff', textDecoration:'none'}}>
                                      - {doc.name}
                                  </a>
                              </li>
                          ))}
                      </ul>
                  ) : <p style={{fontStyle:'italic', color:'#6c757d'}}>Yüklü belge bulunamadı.</p>;
              })()}

              <div style={{ textAlign: "right", marginTop: 24 }}>
                <button onClick={() => setModalData(null)} style={{ ...styles.button, backgroundColor: "#6c757d", color: "#fff" }}>
                  Kapat
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Basvurular;
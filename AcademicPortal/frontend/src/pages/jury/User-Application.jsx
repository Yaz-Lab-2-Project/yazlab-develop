import React, { useState, useEffect } from "react"; // useEffect ve useState import edildi
import { useParams } from "react-router-dom";
import JuryNavbar from "../../components/navbars/JuryNavbar.jsx";
import { FaFileAlt } from "react-icons/fa"; // İkonu kullanacağız

// Sabit veriyi kaldır
// const application = { ... };

const statusColors = {
  Beklemede: "#ffc107",
  Onaylandı: "#28a745",
  Reddedildi: "#dc3545",
  // Backend'den gelebilecek diğer durumlar
  'Değerlendirmede': '#17a2b8', // Örnek
  Bilinmiyor: "#6c757d",
};

const UserApplication = () => {
  const { id: basvuruId } = useParams(); // URL'den başvuru ID'sini al, isim çakışmasın diye yeniden adlandır
  const [applicationData, setApplicationData] = useState(null); // API'den gelen başvuru verisi
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!basvuruId) {
       setError("Başvuru ID'si bulunamadı.");
       setLoading(false);
       return;
    }

    setLoading(true);
    setError(null);
    // Belirli bir başvurunun detayını çek
    fetch(`http://localhost:8000/api/basvurular/${basvuruId}/`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) {
           if(res.status === 404) throw new Error(`Başvuru bulunamadı (ID: ${basvuruId})`);
           throw new Error(`Başvuru detayı alınamadı (${res.status})`);
        }
        return res.json();
      })
      .then(data => {
        console.log("Gelen Başvuru Detayı:", data);
        setApplicationData(data);
      })
      .catch(err => {
        console.error("Başvuru detayı çekme hatası:", err);
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [basvuruId]); // basvuruId değiştiğinde tekrar çalışır

  // Tarih formatlama
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("tr-TR", { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch (e) { return dateString; }
  };

  // --- Yükleme ve Hata Durumları ---
  if (loading) {
    return ( <><JuryNavbar /><div className="application-container"><p>Başvuru bilgileri yükleniyor...</p></div><style>{css}</style></> );
  }
  if (error) {
    return ( <><JuryNavbar /><div className="application-container"><h1 className="application-name" style={{textAlign:'center', color:'red'}}>Hata</h1><p style={{textAlign:'center', color:'red'}}>{error}</p></div><style>{css}</style></> );
  }
  if (!applicationData) {
    return ( <><JuryNavbar /><div className="application-container"><p>Başvuru verisi bulunamadı.</p></div><style>{css}</style></> );
  }

  // --- Başvuru Detayı ---
  // API yanıtındaki nested yapıya göre erişim yapıyoruz (?. ile güvenli erişim)
  const aday = applicationData.aday;
  const ilan = applicationData.ilan;
  const kadro = ilan?.kadro_tipi; // İlanın içindeki kadro_tipi objesi varsayılıyor
  const statusColor = statusColors[applicationData.durum] || statusColors.Bilinmiyor;

  // Dosyaları listelemek için (Backend yanıtında dosya URL'leri olmalı)
  const documents = [
      { name: "Özgeçmiş", url: applicationData.ozgecmis_dosyasi },
      { name: "Diploma Belgeleri", url: applicationData.diploma_belgeleri },
      { name: "Yabancı Dil Belgesi", url: applicationData.yabanci_dil_belgesi },
      // Backend modelinizde başka başvuru dosyaları varsa buraya ekleyin
      // { name: "Diğer Belge 1", url: applicationData.diger_belge_1_url },
  ].filter(doc => doc.url); // Sadece URL'i olanları filtrele


  return (
    <>
      <style>{css}</style> {/* CSS stilleri */}
      <JuryNavbar />
      <div className="application-container">
        <div className="application-card">
          {/* Durum Rozeti */}
          <span
            className="status-badge"
            style={{ backgroundColor: statusColor }}
          >
            {applicationData.durum || 'Bilinmiyor'}
          </span>

          {/* Başlık */}
          <div className="application-header">
            <h1 className="application-name">{`${aday?.first_name || ''} ${aday?.last_name || 'Aday Bilgisi Yok'}`}</h1>
            <p className="application-title">{ilan?.baslik || 'İlan Bilgisi Yok'}</p>
          </div>

          {/* Detaylar */}
          <div className="application-details">
            <div className="detail-item">
              <strong>Başvurduğu Kadro</strong>
              <span>{kadro?.tip || 'Kadro Bilgisi Yok'}</span>
            </div>
            <div className="detail-item">
              <strong>Başvuru Tarihi</strong>
              <span>{formatDate(applicationData.basvuru_tarihi)}</span>
            </div>
            {/* İhtiyaç duyulan başka detaylar API yanıtından eklenebilir */}
             <div className="detail-item">
               <strong>Birim / Bölüm</strong>
               <span>{ilan?.birim?.ad || '-'}/{ilan?.bolum?.ad || '-'}</span>
             </div>
             <div className="detail-item">
               <strong>Anabilim Dalı</strong>
               <span>{ilan?.anabilim_dali?.ad || '-'}</span>
             </div>
          </div>

          {/* Belgeler */}
          <div className="documents-section" style={{ marginTop: "24px" }}>
            <h2>Aday Tarafından Yüklenen Belgeler</h2>
            {documents.length > 0 ? (
                <ul className="documents-list">
                {documents.map((doc, index) => (
                    <li key={index}>
                    {/* İkon için FaFileAlt kullanılabilir */}
                    <FaFileAlt className="download-icon" style={{ marginRight: "8px" }}/>
                    <a
                        href={doc.url} // API'den gelen dosya URL'i
                        target="_blank" // Yeni sekmede aç
                        rel="noopener noreferrer"
                        // download // Direkt indirme için, isteğe bağlı
                    >
                        {doc.name} {/* Belge adı */}
                    </a>
                    </li>
                ))}
                </ul>
            ) : (
                <p>Aday tarafından yüklenen belge bulunmuyor veya API yanıtında URL'ler eksik.</p>
            )}
          </div>

          {/* Jüri Değerlendirme Formu/Butonu Buraya Eklenebilir */}
          {/* Örneğin Raporlar sayfasındaki modalı açan bir buton */}
          {/* Veya doğrudan burada bir değerlendirme formu */}
           <div style={{marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '1rem', textAlign:'center'}}>
                <p>Bu başvuru için değerlendirmenizi Raporlar sayfasından yükleyebilirsiniz.</p>
                {/* <button className="button-primary">Değerlendirme Yap</button> */}
           </div>

        </div>
      </div>
    </>
  );
};

// CSS Stilleri (Önceki koddan alındı, küçük eklemelerle)
const css = `
    .application-container { min-height: 100vh; padding: 24px; background-color: #f4f6f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    .application-card { max-width: 900px; margin: 2rem auto; background-color: #fff; border-radius: 16px; box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1); padding: 32px; position: relative; }
    .application-header { text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #eee; }
    .application-name { font-size: 2rem; font-weight: bold; color: #333; margin-bottom: 0.25rem; }
    .application-title { font-size: 1.1rem; font-weight: 500; color: #555; margin-top: 0; }
    .status-badge { position: absolute; top: 16px; right: 16px; padding: 6px 14px; border-radius: 20px; font-size: 0.85rem; font-weight: 600; color: #fff; text-transform: capitalize; }
    .application-details { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-top: 24px; margin-bottom: 24px;}
    .detail-item { background-color: #f8f9fa; padding: 12px 16px; border-radius: 8px; /* box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); */ border: 1px solid #eee;}
    .detail-item strong { display: block; font-size: 0.85rem; color: #6c757d; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;}
    .detail-item span { font-size: 1rem; font-weight: 500; color: #343a40; }
    .documents-section h2 { font-size: 1.4rem; font-weight: 600; margin-bottom: 16px; color: #007c39; border-bottom: 2px solid #dee2e6; display: inline-block; padding-bottom: 4px; }
    .documents-list { list-style: none; padding: 0; margin: 0; }
    .documents-list li { margin-bottom: 10px; display: flex; align-items: center; gap: 8px; background-color: #f8f9fa; padding: 8px 12px; border-radius: 4px; border: 1px solid #eee;}
    .documents-list a { text-decoration: none; color: #0056b3; font-weight: 500; transition: color 0.2s ease; word-break: break-all; } /* Bağlantı rengi güncellendi */
    .documents-list a:hover { color: #003875; text-decoration: underline; }
    .download-icon { font-size: 1rem; color: #009944; /* Yeşil ikon */ flex-shrink: 0; }
    @media (max-width: 768px) { .application-details { grid-template-columns: 1fr; } .application-card { padding: 24px; } .application-name { font-size: 1.5rem; } }
    /* Buton stilleri (Rapor sayfasından alınabilir) */
    .button-primary { padding: 8px 16px; background-color: #007c39; color: #fff; border: none; border-radius: 8px; cursor: pointer; }
    .button-primary:hover { background-color: #005f2a; }
`;

export default UserApplication;
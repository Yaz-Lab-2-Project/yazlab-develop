import React, { useState, useEffect } from "react"; // useEffect ve useState import edildi
import { useParams } from "react-router-dom";
import JuryNavbar from "../../components/navbars/JuryNavbar.jsx";
import { FaFileAlt } from "react-icons/fa"; // İkonu kullanacağız
import api from '../../services/api';

// Sabit veriyi kaldır
// const application = { ... };

const statusColors = {
  BEKLEMEDE: "#ffc107",
  INCELEMEDE: "#17a2b8",
  ONAYLANDI: "#28a745",
  REDDEDILDI: "#dc3545",
  Bilinmiyor: "#6c757d",
};

const statusLabels = {
  BEKLEMEDE: "Beklemede",
  INCELEMEDE: "İncelemede",
  ONAYLANDI: "Onaylandı",
  REDDEDILDI: "Reddedildi",
  Bilinmiyor: "Bilinmiyor"
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

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/basvurular/${basvuruId}/`);
        console.log("API yanıtı:", response.data);
        if (!response.data) {
          throw new Error('Başvuru verisi bulunamadı');
        }
        setApplicationData(response.data);
      } catch (err) {
        console.error("Başvuru detayı çekme hatası:", err);
        setError(err.message || 'Veri çekilirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [basvuruId]); // basvuruId değiştiğinde tekrar çalışır

  // Tarih formatlama
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("tr-TR", { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch { return dateString; }
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
  const aday = applicationData?.aday || {};
  const ilan = applicationData?.ilan || {};
  const kadro = ilan?.kadro_tipi || {};
  const statusColor = statusColors[applicationData?.durum] || statusColors.Bilinmiyor;
  const statusLabel = statusLabels[applicationData?.durum] || statusLabels.Bilinmiyor;

  // Birim, Bölüm ve Anabilim Dalı bilgileri
  const birimAd = ilan?.birim_ad || ilan?.birim?.ad || '-';
  const bolumAd = ilan?.bolum_ad || ilan?.bolum?.ad || '-';
  const anabilimDaliAd = ilan?.anabilim_dali_ad || ilan?.anabilim_dali?.ad || '-';

  // Dosyaları listelemek için
  const documents = [
      { 
        name: "Özgeçmiş", 
        url: applicationData?.ozgecmis_dosyasi,
        extension: applicationData?.ozgecmis_dosyasi?.split('.').pop()?.toUpperCase() || 'PDF'
      },
      { 
        name: "Diploma Belgeleri", 
        url: applicationData?.diploma_belgeleri,
        extension: applicationData?.diploma_belgeleri?.split('.').pop()?.toUpperCase() || 'PDF'
      },
      { 
        name: "Yabancı Dil Belgesi", 
        url: applicationData?.yabanci_dil_belgesi,
        extension: applicationData?.yabanci_dil_belgesi?.split('.').pop()?.toUpperCase() || 'PDF'
      },
  ].filter(doc => doc.url);

  // Dosya indirme işlevi
  const handleDownload = async (url, filename) => {
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/pdf, application/octet-stream',
        },
        credentials: 'include' // CSRF token için
      });
      
      if (!response.ok) {
        throw new Error('Dosya indirilemedi');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Dosya indirme hatası:', error);
      alert('Dosya indirilirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  return (
    <>
      <style>{css}</style>
      <JuryNavbar />
      <div className="application-container">
        <div className="application-card">
          {/* Durum Rozeti */}
          <span
            className="status-badge"
            style={{ backgroundColor: statusColor }}
          >
            {statusLabel}
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
              <span>{formatDate(applicationData?.basvuru_tarihi)}</span>
            </div>
            <div className="detail-item">
              <strong>Son Güncelleme</strong>
              <span>{formatDate(applicationData?.guncelleme_tarihi)}</span>
            </div>
            <div className="detail-item">
              <strong>Birim</strong>
              <span>{birimAd}</span>
            </div>
            <div className="detail-item">
              <strong>Bölüm</strong>
              <span>{bolumAd}</span>
            </div>
            <div className="detail-item">
              <strong>Anabilim Dalı</strong>
              <span>{anabilimDaliAd}</span>
            </div>
          </div>

          {/* Belgeler */}
          <div className="documents-section" style={{ marginTop: "24px" }}>
            <h2>Aday Tarafından Yüklenen Belgeler</h2>
            {documents.length > 0 ? (
                <ul className="documents-list">
                {documents.map((doc, index) => (
                    <li key={index}>
                    <FaFileAlt className="download-icon" style={{ marginRight: "8px" }}/>
                    <button
                        onClick={() => handleDownload(doc.url, `${doc.name}.${doc.extension.toLowerCase()}`)}
                        className="document-link"
                    >
                        {doc.name} ({doc.extension})
                    </button>
                    </li>
                ))}
                </ul>
            ) : (
                <p>Aday tarafından yüklenen belge bulunmuyor.</p>
            )}
          </div>

          {/* Jüri Değerlendirme Bilgisi */}
           <div style={{marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '1rem', textAlign:'center'}}>
                <p>Bu başvuru için değerlendirmenizi Raporlar sayfasından yükleyebilirsiniz.</p>
           </div>
        </div>
      </div>
    </>
  );
};

// CSS Stilleri
const css = `
    .application-container { min-height: 100vh; padding: 24px; background-color: #f4f6f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    .application-card { max-width: 900px; margin: 2rem auto; background-color: #fff; border-radius: 16px; box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1); padding: 32px; position: relative; }
    .application-header { text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #eee; }
    .application-name { font-size: 2rem; font-weight: bold; color: #333; margin-bottom: 0.25rem; }
    .application-title { font-size: 1.1rem; font-weight: 500; color: #555; margin-top: 0; }
    .status-badge { position: absolute; top: 16px; right: 16px; padding: 6px 14px; border-radius: 20px; font-size: 0.85rem; font-weight: 600; color: #fff; text-transform: capitalize; }
    .application-details { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-top: 24px; margin-bottom: 24px;}
    .detail-item { background-color: #f8f9fa; padding: 12px 16px; border-radius: 8px; border: 1px solid #eee;}
    .detail-item strong { display: block; font-size: 0.85rem; color: #6c757d; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;}
    .detail-item span { font-size: 1rem; font-weight: 500; color: #343a40; }
    .documents-section h2 { font-size: 1.4rem; font-weight: 600; margin-bottom: 16px; color: #007c39; border-bottom: 2px solid #dee2e6; display: inline-block; padding-bottom: 4px; }
    .documents-list { list-style: none; padding: 0; margin: 0; }
    .documents-list li { margin-bottom: 10px; display: flex; align-items: center; gap: 8px; background-color: #f8f9fa; padding: 8px 12px; border-radius: 4px; border: 1px solid #eee;}
    .documents-list a { text-decoration: none; color: #0056b3; font-weight: 500; transition: color 0.2s ease; word-break: break-all; }
    .documents-list a:hover { color: #003875; text-decoration: underline; }
    .download-icon { font-size: 1rem; color: #009944; flex-shrink: 0; }
    .document-link {
        background: none;
        border: none;
        color: #0056b3;
        font-weight: 500;
        cursor: pointer;
        padding: 0;
        font-size: inherit;
        text-align: left;
        transition: color 0.2s ease;
    }
    .document-link:hover {
        color: #003875;
        text-decoration: underline;
    }
    @media (max-width: 768px) { .application-details { grid-template-columns: 1fr; } .application-card { padding: 24px; } .application-name { font-size: 1.5rem; } }
`;

export default UserApplication;
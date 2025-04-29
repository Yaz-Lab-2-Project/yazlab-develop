import React, { useState } from 'react';
import { FaTimes, FaFileAlt } from 'react-icons/fa';

const MyApplications = () => {
  const [selectedApplication, setSelectedApplication] = useState(null);

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
      {selectedApplication && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Başvuru Detayları</h2>
              <button onClick={() => setSelectedApplication(null)} className="close-button">
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="documents-section">
                <h3>Yüklenen Belgeler</h3>
                {selectedApplication.ozgecmis_dosyasi && (
                  <div className="document-item">
                    <FaFileAlt className="document-icon" />
                    <button
                      onClick={() => handleDownload(selectedApplication.ozgecmis_dosyasi, 'ozgecmis.pdf')}
                      className="document-link"
                    >
                      Özgeçmiş
                    </button>
                  </div>
                )}
                {selectedApplication.diploma_belgeleri && (
                  <div className="document-item">
                    <FaFileAlt className="document-icon" />
                    <button
                      onClick={() => handleDownload(selectedApplication.diploma_belgeleri, 'diploma_belgeleri.pdf')}
                      className="document-link"
                    >
                      Diploma Belgeleri
                    </button>
                  </div>
                )}
                {selectedApplication.yabanci_dil_belgesi && (
                  <div className="document-item">
                    <FaFileAlt className="document-icon" />
                    <button
                      onClick={() => handleDownload(selectedApplication.yabanci_dil_belgesi, 'yabanci_dil_belgesi.pdf')}
                      className="document-link"
                    >
                      Yabancı Dil Belgesi
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      <style>{css}</style>
    </>
  );
};

// CSS Stilleri
const css = `
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
`;

export default MyApplications; 
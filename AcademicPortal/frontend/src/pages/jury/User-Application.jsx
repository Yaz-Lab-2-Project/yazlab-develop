import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import JuryNavbar from "../../components/navbars/JuryNavbar.jsx";
import { FaFileAlt, FaUpload, FaTrash } from "react-icons/fa";
import api from '../../services/api';

const statusColors = {
  Beklemede: "#ffc107",
  Onaylandı: "#28a745",
  Reddedildi: "#dc3545",
  'Değerlendirmede': '#17a2b8',
  Bilinmiyor: "#6c757d",
};

const UserApplication = () => {
  const { id: basvuruId } = useParams();
  const navigate = useNavigate();
  const [applicationData, setApplicationData] = useState(null);
  const [academicActivities, setAcademicActivities] = useState({
    articles: [],
    projects: [],
    conferences: [],
    teaching: [],
    citations: [],
    patents: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [degerlendirmeBelgeleri, setDegerlendirmeBelgeleri] = useState([]);

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
        // Başvuru detaylarını al
        const response = await api.get(`/basvurular/${basvuruId}/`);

        if (!response.data) {
          throw new Error('Veri bulunamadı');
        }

        setApplicationData(response.data);

        // Akademik faaliyetleri al
        try {
          const academicResponse = await api.get(`/basvurular/${basvuruId}/academic_activities/`);
          if (academicResponse.data) {
            setAcademicActivities(academicResponse.data);
          }
        } catch (academicErr) {
          console.error("Akademik faaliyetler yüklenirken hata:", academicErr);
        }

        // Değerlendirme belgelerini al
        try {
          const belgelerResponse = await api.get(`/basvurular/${basvuruId}/degerlendirme_belgeleri/`);
          if (belgelerResponse.data) {
            setDegerlendirmeBelgeleri(belgelerResponse.data);
          }
        } catch (belgelerErr) {
          console.error("Değerlendirme belgeleri yüklenirken hata:", belgelerErr);
        }
      } catch (err) {
        console.error("Veri çekme hatası:", err);
        
        if (err.response) {
          if (err.response.status === 401) {
            setError('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
            navigate('/login');
            return;
          } else if (err.response.status === 403) {
            setError('Bu sayfaya erişim yetkiniz yok.');
          } else if (err.response.status === 404) {
            setError('Başvuru bulunamadı.');
          } else {
            setError(`Sunucu hatası: ${err.response.status} - ${err.response.data?.message || 'Bilinmeyen hata'}`);
          }
        } else if (err.request) {
          setError('Sunucuya bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin.');
        } else {
          setError(`Veri çekilirken hata oluştu: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [basvuruId, navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("tr-TR", { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch { return dateString; }
  };

  const calculateArticlePoints = () => {
    const a1a4 = academicActivities.articles.filter(a => ['SCI', 'SCI-E', 'SSCI', 'AHCI'].includes(a.index)).length;
    const a5a8 = academicActivities.articles.filter(a => !['SCI', 'SCI-E', 'SSCI', 'AHCI'].includes(a.index)).length;
    return (a1a4 * 40) + (a5a8 * 20);
  };

  const calculateProjectPoints = () => {
    return academicActivities.projects.length * 30;
  };

  const calculateConferencePoints = () => {
    return academicActivities.conferences.length * 10;
  };

  const calculateTeachingPoints = () => {
    return academicActivities.teaching.length * 5;
  };

  const calculateCitationPoints = () => {
    return academicActivities.citations.length * 3;
  };

  const calculatePatentPoints = () => {
    return academicActivities.patents.length * 50;
  };

  const calculateTotalPoints = () => {
    return calculateArticlePoints() + calculateProjectPoints() + 
           calculateConferencePoints() + calculateTeachingPoints() + 
           calculateCitationPoints() + calculatePatentPoints();
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('belge', file);
    formData.append('basvuru', basvuruId);

    try {
      const response = await api.post(`/basvurular/${basvuruId}/degerlendirme_belgesi_yukle/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data) {
        setDegerlendirmeBelgeleri(prev => [...prev, response.data]);
      }
    } catch (err) {
      console.error("Belge yükleme hatası:", err);
      setUploadError(err.response?.data?.message || 'Belge yüklenirken bir hata oluştu');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteBelge = async (belgeId) => {
    if (!window.confirm('Bu belgeyi silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await api.delete(`/basvurular/${basvuruId}/degerlendirme_belgesi/${belgeId}/`);
      setDegerlendirmeBelgeleri(prev => prev.filter(belge => belge.id !== belgeId));
    } catch (err) {
      console.error("Belge silme hatası:", err);
      setError(err.response?.data?.message || 'Belge silinirken bir hata oluştu');
    }
  };

  if (loading) {
    return ( <><JuryNavbar /><div className="application-container"><p>Başvuru bilgileri yükleniyor...</p></div><style>{css}</style></> );
  }
  if (error) {
    return ( <><JuryNavbar /><div className="application-container"><h1 className="application-name" style={{textAlign:'center', color:'red'}}>Hata</h1><p style={{textAlign:'center', color:'red'}}>{error}</p></div><style>{css}</style></> );
  }
  if (!applicationData) {
    return ( <><JuryNavbar /><div className="application-container"><p>Başvuru verisi bulunamadı.</p></div><style>{css}</style></> );
  }

  const aday = applicationData.aday || {};
  const ilan = applicationData.ilan || {};
  const kadro = ilan?.kadro_tipi || {};
  const statusColor = statusColors[applicationData.durum] || statusColors.Bilinmiyor;

  const documents = [
    { name: "Özgeçmiş", url: applicationData.ozgecmis_dosyasi },
    { name: "Diploma Belgeleri", url: applicationData.diploma_belgeleri },
    { name: "Yabancı Dil Belgesi", url: applicationData.yabanci_dil_belgesi },
  ].filter(doc => doc.url);

  return (
    <>
      <style>{css}</style>
      <JuryNavbar />
      <div className="application-container">
        <div className="application-card">
          <span className="status-badge" style={{ backgroundColor: statusColor }}>
            {applicationData.durum || 'Bilinmiyor'}
          </span>

          <div className="application-header">
            <h1 className="application-name">{`${aday?.first_name || ''} ${aday?.last_name || 'Aday Bilgisi Yok'}`}</h1>
            <p className="application-title">{ilan?.baslik || 'İlan Bilgisi Yok'}</p>
          </div>

          <div className="application-details">
            <div className="detail-item">
              <strong>Başvurduğu Kadro</strong>
              <span>{kadro?.tip || 'Kadro Bilgisi Yok'}</span>
            </div>
            <div className="detail-item">
              <strong>Başvuru Tarihi</strong>
              <span>{formatDate(applicationData.basvuru_tarihi)}</span>
            </div>
            <div className="detail-item">
              <strong>Birim / Bölüm</strong>
              <span>{ilan?.birim?.ad || '-'}/{ilan?.bolum?.ad || '-'}</span>
            </div>
            <div className="detail-item">
              <strong>Anabilim Dalı</strong>
              <span>{ilan?.anabilim_dali?.ad || '-'}</span>
            </div>
          </div>

          <div className="academic-evaluation-section">
            <h2>KOÜ Akademik Değerlendirme Puanı</h2>
            <p className="evaluation-description">
              Aşağıdaki puan değerlendirmesi başvurduğunuz kadro türüne göre Kocaeli Üniversitesi Öğretim Üyeliği Atama ve Yükseltme Yönergesi'ne göre otomatik olarak hesaplanmıştır.
            </p>

            <table className="evaluation-table">
              <thead>
                <tr>
                  <th>Faaliyet Türü</th>
                  <th>Sayı</th>
                  <th>Puanı</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Makaleler (A.1-A.4)</td>
                  <td>{academicActivities.articles.filter(a => ['SCI', 'SCI-E', 'SSCI', 'AHCI'].includes(a.index)).length}</td>
                  <td>{calculateArticlePoints()}</td>
                </tr>
                <tr>
                  <td>Projeler (H.1-H.12)</td>
                  <td>{academicActivities.projects.length}</td>
                  <td>{calculateProjectPoints()}</td>
                </tr>
                <tr>
                  <td>Bilimsel Toplantılar (B.1-B.12)</td>
                  <td>{academicActivities.conferences.length}</td>
                  <td>{calculateConferencePoints()}</td>
                </tr>
                <tr>
                  <td>Eğitim Faaliyetleri (E.1-E.4)</td>
                  <td>{academicActivities.teaching.length}</td>
                  <td>{calculateTeachingPoints()}</td>
                </tr>
                <tr>
                  <td>Atıflar (D.1-D.6)</td>
                  <td>{academicActivities.citations.length}</td>
                  <td>{calculateCitationPoints()}</td>
                </tr>
                <tr>
                  <td>Patent/Faydalı Model (G.1-G.8)</td>
                  <td>{academicActivities.patents.length}</td>
                  <td>{calculatePatentPoints()}</td>
                </tr>
                <tr className="total-row">
                  <td>Toplam Puan</td>
                  <td></td>
                  <td>{calculateTotalPoints()}</td>
                </tr>
              </tbody>
            </table>

            <p className="evaluation-note">
              Not: Bu puan hesaplaması tahmini bir değerlendirmedir. Başvurunuz Kocaeli Üniversitesi Atama Komisyonu ve jüri üyeleri tarafından değerlendirilerek nihai puanlaması yapılacaktır.
            </p>
          </div>

          <div className="documents-section" style={{ marginTop: "24px" }}>
            <h2>Aday Tarafından Yüklenen Belgeler</h2>
            {documents.length > 0 ? (
              <ul className="documents-list">
                {documents.map((doc, index) => (
                  <li key={index}>
                    <FaFileAlt className="download-icon" style={{ marginRight: "8px" }}/>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer">
                      {doc.name}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Aday tarafından yüklenen belge bulunmuyor veya API yanıtında URL'ler eksik.</p>
            )}
          </div>

          <div className="evaluation-documents-section">
            <h2>Değerlendirme Belgeleri</h2>
            
            <div className="upload-section">
              <label className="upload-button">
                <FaUpload className="upload-icon" />
                <span>Belge Yükle</span>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx"
                  style={{ display: 'none' }}
                />
              </label>
              {uploading && <p className="upload-status">Yükleniyor...</p>}
              {uploadError && <p className="error-message">{uploadError}</p>}
            </div>

            {degerlendirmeBelgeleri.length > 0 ? (
              <ul className="documents-list">
                {degerlendirmeBelgeleri.map((belge) => (
                  <li key={belge.id}>
                    <FaFileAlt className="download-icon" />
                    <a href={belge.belge_url} target="_blank" rel="noopener noreferrer">
                      {belge.belge_adi || 'Değerlendirme Belgesi'}
                    </a>
                    <span className="document-date">
                      {new Date(belge.yukleme_tarihi).toLocaleDateString('tr-TR')}
                    </span>
                    <button
                      className="delete-button"
                      onClick={() => handleDeleteBelge(belge.id)}
                      title="Belgeyi Sil"
                    >
                      <FaTrash />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-documents">Henüz değerlendirme belgesi yüklenmemiş.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

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
  @media (max-width: 768px) { .application-details { grid-template-columns: 1fr; } .application-card { padding: 24px; } .application-name { font-size: 1.5rem; } }
  .button-primary { padding: 8px 16px; background-color: #007c39; color: #fff; border: none; border-radius: 8px; cursor: pointer; }
  .button-primary:hover { background-color: #005f2a; }

  .academic-evaluation-section {
    margin-top: 2rem;
    padding: 1.5rem;
    background-color: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #eee;
  }
  .academic-evaluation-section h2 {
    font-size: 1.4rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: #007c39;
  }
  .evaluation-description {
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 1.5rem;
  }
  .evaluation-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1rem;
  }
  .evaluation-table th,
  .evaluation-table td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #dee2e6;
  }
  .evaluation-table th {
    background-color: #f1f8e9;
    color: #007c39;
    font-weight: 600;
  }
  .evaluation-table tr:hover {
    background-color: #f8f9fa;
  }
  .total-row {
    font-weight: bold;
    background-color: #e8f5e9;
  }
  .total-row td {
    color: #007c39;
  }
  .evaluation-note {
    font-size: 0.85rem;
    color: #666;
    font-style: italic;
    margin-top: 1rem;
  }

  @media (max-width: 768px) { 
    .application-details { grid-template-columns: 1fr; } 
    .application-card { padding: 24px; } 
    .application-name { font-size: 1.5rem; }
    .evaluation-table {
      display: block;
      overflow-x: auto;
    }
  }

  .evaluation-documents-section {
    margin-top: 2rem;
    padding: 1.5rem;
    background-color: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #eee;
  }

  .evaluation-documents-section h2 {
    font-size: 1.4rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: #007c39;
  }

  .upload-section {
    margin-bottom: 1.5rem;
    text-align: center;
  }

  .upload-button {
    display: inline-flex;
    align-items: center;
    padding: 10px 20px;
    background-color: #007c39;
    color: white;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .upload-button:hover {
    background-color: #005f2a;
  }

  .upload-icon {
    margin-right: 8px;
  }

  .upload-status {
    margin-top: 8px;
    color: #666;
  }

  .documents-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .documents-list li {
    display: flex;
    align-items: center;
    padding: 12px;
    background-color: white;
    border-radius: 6px;
    margin-bottom: 8px;
    border: 1px solid #eee;
  }

  .documents-list a {
    flex: 1;
    text-decoration: none;
    color: #0056b3;
  }

  .documents-list a:hover {
    text-decoration: underline;
  }

  .document-date {
    margin-left: 16px;
    color: #666;
    font-size: 0.9rem;
  }

  .delete-button {
    margin-left: 16px;
    padding: 6px;
    background: none;
    border: none;
    color: #dc3545;
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 0.2s;
  }

  .delete-button:hover {
    background-color: #f8d7da;
  }

  .no-documents {
    text-align: center;
    color: #666;
    font-style: italic;
  }

  .error-message {
    color: #dc3545;
    margin-top: 8px;
    text-align: center;
  }
`;

export default UserApplication;
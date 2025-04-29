import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import UserNavbar from "../../components/navbars/UserNavbar";
import api from '../../services/api';

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

const Apply = () => {
  const { ilanId } = useParams(); // URL'den ilanId'yi al
  const navigate = useNavigate(); // Yönlendirme için
  const [announcement, setAnnouncement] = useState(null); // İlan detayları
  const [requiredDocs, setRequiredDocs] = useState([]); // Backend'den gelen gerekli belgeler listesi
  const [applicationData, setApplicationData] = useState({}); // Yüklenecek dosyaları tutacak state {docKey: File}
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true); // İlan yükleme durumu
  const [error, setError] = useState(null); // Hata durumu
  const [submitting, setSubmitting] = useState(false); // Başvuru gönderme durumu

  // Tab yönetimi için state
  const [activeTab, setActiveTab] = useState('kisisel-bilgiler');

  // Akademik faaliyetler için state
  const [academicActivities, setAcademicActivities] = useState({
    articles: [],
    projects: [],
    conferences: [],
    teaching: [],
    citations: [],
    patents: []
  });

  // İlan detaylarını çekme
  useEffect(() => {
    if (!ilanId) return;
    setLoading(true);
    setError(null);
    api.get(`/ilanlar/${ilanId}/`)
      .then(res => {
        const data = res.data;
        setAnnouncement(data);
        // Backend'den Gelen Gerekli Belge Listesi
        const backendRequiredDocs = [
            { key: 'ozgecmis_dosyasi', label: 'Özgeçmiş Dosyası' },
            { key: 'diploma_belgeleri', label: 'Diploma Belgeleri' },
            { key: 'yabanci_dil_belgesi', label: 'Yabancı Dil Belgesi' },
        ];
        setRequiredDocs(backendRequiredDocs);
        const initialDocState = {};
        backendRequiredDocs.forEach(doc => {
            initialDocState[doc.key] = null;
        });
        setApplicationData(initialDocState);
      })
      .catch(err => {
        setError(err.message || "İlan bilgileri yüklenirken bir hata oluştu.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [ilanId]);

  // Dosya seçildiğinde state'i güncelle
  const handleFileChange = (e, docKey) => {
    const file = e.target.files[0] || null;
    setApplicationData(prevData => ({
      ...prevData,
      [docKey]: file,
    }));
  };

  // Tab'ları değiştirme işlevi
  const handleTabChange = (tab) => {
    // Temel validation kontrolleri
    if (tab === 'akademik-faaliyetler') {
      // Kişisel bilgiler tab'ından akademik faaliyetlere geçerken gerekli kontroller
      let isValid = true;
      requiredDocs.forEach(doc => {
        if (!applicationData[doc.key]) {
          isValid = false;
        }
      });

      if (!isValid) {
        setError("Lütfen gerekli tüm belgeleri yükleyin.");
        return;
      }
    }

    if (tab === 'onizleme') {
      // Akademik faaliyetlerden önizlemeye geçerken kontrol (isteğe bağlı)
      if (academicActivities.articles.length === 0 &&
          academicActivities.projects.length === 0 &&
          academicActivities.conferences.length === 0 &&
          academicActivities.teaching.length === 0) {
        if (!window.confirm("Henüz akademik faaliyet eklemediniz. Devam etmek istiyor musunuz?")) {
          return;
        }
      }
    }

    setActiveTab(tab);
    setError(null); // Tab değişiminde hata mesajlarını temizle
  };

  // Akademik faaliyet ekleme işlevleri
  const handleAddArticle = (article) => {
    setAcademicActivities(prev => ({
      ...prev,
      articles: [...prev.articles, article]
    }));
  };

  const handleAddProject = (project) => {
    setAcademicActivities(prev => ({
      ...prev,
      projects: [...prev.projects, project]
    }));
  };

  const handleAddConference = (conference) => {
    setAcademicActivities(prev => ({
      ...prev,
      conferences: [...prev.conferences, conference]
    }));
  };

  const handleAddTeaching = (teaching) => {
    setAcademicActivities(prev => ({
      ...prev,
      teaching: [...prev.teaching, teaching]
    }));
  };

  const handleAddCitation = (citation) => {
    setAcademicActivities(prev => ({
      ...prev,
      citations: [...prev.citations, citation]
    }));
  };

  const handleAddPatent = (patent) => {
    setAcademicActivities(prev => ({
      ...prev,
      patents: [...prev.patents, patent]
    }));
  };

  // Akademik faaliyet silme işlevleri
  const handleRemoveActivity = (type, index) => {
    setAcademicActivities(prev => {
      const newActivities = {...prev};
      newActivities[type] = prev[type].filter((_, i) => i !== index);
      return newActivities;
    });
  };

  // Formu gönderme
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    // ilanId kontrolü
    if (!ilanId || isNaN(Number(ilanId))) {
      setError("İlan bilgisi alınamadı. Lütfen sayfayı yenileyin veya tekrar deneyin.");
      setSubmitting(false);
      return;
    }

    const csrftoken = getCookie('csrftoken');
    if (!csrftoken) {
      setError("Güvenlik token'ı alınamadı.");
      setSubmitting(false);
      return;
    }

    // FormData oluştur
    const formData = new FormData();
    formData.append('ilan_id', parseInt(ilanId)); // integer olarak gönder

    let hasMissingFile = false;
    // State'teki dosyaları FormData'ya ekle
    requiredDocs.forEach(doc => {
      if (applicationData[doc.key] instanceof File) {
        formData.append(doc.key, applicationData[doc.key]);
      } else {
          console.error(`Eksik dosya: ${doc.label}`);
          hasMissingFile = true;
      }
    });

    if (hasMissingFile) {
        setError("Lütfen gerekli tüm belgeleri yükleyin.");
        setSubmitting(false);
        return;
    }

    // Akademik faaliyetleri ekle
    formData.append('academic_activities', JSON.stringify(academicActivities));

    // Debug için logla
    console.log("Gönderilecek ilanId:", ilanId);
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    try {
      await api.post('/basvurular/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSubmitted(true);

      // 3 saniye sonra başvurular sayfasına yönlendir
      setTimeout(() => {
        navigate('/basvurularim');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Başvuru gönderilirken bir ağ hatası oluştu. Lütfen tüm alanları ve dosyaları kontrol edin.");
    } finally {
      setSubmitting(false);
    }
  };

  // --- Yükleme ve Hata Durumları ---
  if (loading) {
    return (
      <div className="container">
        <UserNavbar />
        <div className="section">
          <div className="loadingIndicator">
            <div className="spinner"></div>
            <p>İlan bilgileri yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !announcement) {
     return (
       <div className="container">
         <UserNavbar />
         <div className="section">
           <h3 className="errorTitle">Hata</h3>
           <p className="errorMessage">{error}</p>
           <button
             className="backButton"
             onClick={() => navigate('/ilanlar')}
           >
             İlanlara Dön
           </button>
         </div>
       </div>
     );
   }

  if (!announcement) {
    return (
      <div className="container">
        <UserNavbar />
        <div className="section">
          <h3 className="errorTitle">İlan Bulunamadı</h3>
          <p className="errorMessage">İlan bulunamadı veya yüklenemedi.</p>
          <button
            className="backButton"
            onClick={() => navigate('/ilanlar')}
          >
            İlanlara Dön
          </button>
        </div>
      </div>
    );
  }

  // --- İlan ve Başvuru Formu ---
  return (
    <>
      <style>
        {`
          /* Genel Konteyner */
          .container {
              background-color: #f4f6f9;
              padding: 2rem;
              border-radius: 16px;
              max-width: 800px;
              margin: 2rem auto;
              font-family: sans-serif;
              color: #555;
          }

          .title {
              color: #333;
              font-size: 2rem;
              margin-bottom: 1rem;
              text-align: center;
          }

          .subtitle {
              color: #009944;
              font-size: 1.25rem;
              margin-bottom: 0.5rem;
          }

          .section {
              background-color: #fff;
              border: 1px solid #eee;
              padding: 1rem;
              border-radius: 12px;
              margin-bottom: 1.5rem;
              box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          }

          ul {
              padding-left: 1.2rem;
          }

          li {
              margin-bottom: 0.3rem;
              color: #666;
          }

          .form {
              display: flex;
              flex-direction: column;
              gap: 1rem;
          }

          label {
              display: flex;
              flex-direction: column;
              font-weight: bold;
              color: #555;
          }

          input[type="text"],
          input[type="email"],
          input[type="file"],
          input[type="number"],
          textarea,
          select {
              margin-top: 0.5rem;
              padding: 0.5rem;
              border-radius: 8px;
              border: 1px solid #ccc;
              font-size: 14px;
              transition: border-color 0.3s;
          }
          
          input[type="text"]:focus,
          input[type="email"]:focus,
          input[type="file"]:focus,
          input[type="number"]:focus,
          textarea:focus,
          select:focus {
              border-color: #009944;
              outline: none;
              box-shadow: 0 0 0 2px rgba(0, 153, 68, 0.2);
          }

          .submitButton {
              background-color: #009944;
              color: #fff;
              border: none;
              padding: 0.75rem 1rem;
              border-radius: 10px;
              cursor: pointer;
              transition: background-color 0.3s;
              font-size: 1rem;
              font-weight: bold;
          }

          .submitButton:hover {
              background-color: #007c39;
          }
          
          .submitButton:disabled {
              background-color: #aaa;
              cursor: not-allowed;
          }
          
          .tabContainer {
              display: flex;
              margin-bottom: 1rem;
              border-bottom: 1px solid #ccc;
          }
          
          .tabButton {
              padding: 0.75rem 1.5rem;
              background: none;
              border: none;
              border-bottom: 2px solid transparent;
              cursor: pointer;
              font-weight: bold;
              color: #555;
              transition: all 0.3s;
          }
          
          .tabButton.active {
              color: #009944;
              border-bottom-color: #009944;
          }
          
          .academicSection {
              border: 1px solid #eee;
              border-radius: 8px;
              padding: 1rem;
              margin-bottom: 1.5rem;
              background-color: #fafafa;
          }
          
          .academicSection h4 {
              color: #333;
              margin-top: 0;
              border-bottom: 1px solid #eee;
              padding-bottom: 0.5rem;
          }
          
          .academicItemCard {
              border: 1px solid #ddd;
              border-radius: 8px;
              padding: 1rem;
              margin-bottom: 1rem;
              position: relative;
              background-color: white;
              transition: box-shadow 0.3s;
          }
          
          .academicItemCard:hover {
              box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          }
          
          .removeButton {
              position: absolute;
              top: 0.5rem;
              right: 0.5rem;
              background: #f44336;
              color: white;
              border: none;
              border-radius: 50%;
              width: 24px;
              height: 24px;
              font-size: 12px;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
          }
          
          .addButton {
              background: #009944;
              color: white;
              border: none;
              border-radius: 8px;
              padding: 0.5rem 1rem;
              cursor: pointer;
              margin-top: 0.5rem;
              font-weight: bold;
              transition: background-color 0.3s;
          }
          
          .addButton:hover {
              background-color: #007c39;
          }
          
          .addForm {
              display: flex;
              flex-direction: column;
              gap: 0.5rem;
              margin-top: 1rem;
              padding: 1rem;
              border: 1px solid #eee;
              border-radius: 8px;
              background-color: white;
          }
          
          summary {
              cursor: pointer;
              font-weight: bold;
              color: #009944;
              padding: 0.5rem;
              border-radius: 5px;
              background-color: #f8f8f8;
              transition: background-color 0.3s;
          }
          
          summary:hover {
              background-color: #eafaef;
          }
          
          details {
              margin-top: 1rem;
          }
          
          .previewTable {
              width: 100%;
              border-collapse: collapse;
              margin-top: 1rem;
          }
          
          .previewTable th, .previewTable td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
          }
          
          .previewTable th {
              background-color: #f2f2f2;
              color: #333;
          }
          
          .previewTable tr:nth-child(even) {
              background-color: #f9f9f9;
          }
          
          .previewTable tr:hover {
              background-color: #eafaef;
          }
          
          .previewSection {
              margin-top: 1.5rem;
          }
          
          .previewSection h4 {
              color: #333;
              border-bottom: 1px solid #eee;
              padding-bottom: 0.5rem;
          }
          
          .previewSubsection {
              margin-top: 1rem;
          }
          
          .previewSubsection h5 {
              color: #444;
              margin-bottom: 0.5rem;
          }
          
          .navButtons {
              display: flex;
              justify-content: space-between;
              margin-top: 1.5rem;
          }
          
          .backButton {
              background-color: #f2f2f2;
              color: #555;
              border: 1px solid #ccc;
              padding: 0.75rem 1rem;
              border-radius: 10px;
              cursor: pointer;
              font-size: 1rem;
              transition: all 0.3s;
          }
          
          .backButton:hover {
              background-color: #e6e6e6;
          }
          
          .errorMessage {
              color: #f44336;
              background-color: #ffebee;
              padding: 10px;
              border-radius: 5px;
              margin: 10px 0;
              border-left: 4px solid #f44336;
          }
          
          .successMessage {
              color: #4caf50;
              background-color: #e8f5e9;
              padding: 10px;
              border-radius: 5px;
              margin: 10px 0;
              border-left: 4px solid #4caf50;
          }
          
          .loadingIndicator {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 2rem;
          }
          
          .spinner {
              border: 4px solid rgba(0, 0, 0, 0.1);
              width: 36px;
              height: 36px;
              border-radius: 50%;
              border-left-color: #009944;
              animation: spin 1s linear infinite;
          }
          
          @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
          }
          
          .noActivitiesMessage {
              color: #777;
              font-style: italic;
              text-align: center;
              padding: 1rem;
          }
          
          .errorTitle {
              color: #f44336;
              margin-top: 0;
          }
          
          .fileInputPreview {
              display: flex;
              align-items: center;
              margin-top: 0.5rem;
          }
          
          .fileInputPreview span {
              margin-left: 0.5rem;
              font-size: 0.9rem;
              color: #666;
          }
          
          /* Progress indicator */
          .progressContainer {
              display: flex;
              margin-bottom: 2rem;
              justify-content: center;
          }
          
          .progressStep {
              display: flex;
              flex-direction: column;
              align-items: center;
              flex: 1;
              position: relative;
              max-width: 120px;
          }
          
          .progressStep::before {
              content: '';
              position: absolute;
              top: 15px;
              left: -50%;
              width: 100%;
              height: 2px;
              background-color: #ddd;
              z-index: 0;
          }
          
          .progressStep:first-child::before {
              display: none;
          }
          
          .progressStep.active .stepNumber, 
          .progressStep.completed .stepNumber {
              background-color: #009944;
              color: white;
          }
          
          .progressStep.active::before, 
          .progressStep.completed::before {
              background-color: #009944;
          }
          
          .stepNumber {
              width: 30px;
              height: 30px;
              border-radius: 50%;
              background-color: #ddd;
              display: flex;
              justify-content: center;
              align-items: center;
              margin-bottom: 0.5rem;
              font-weight: bold;
              position: relative;
              z-index: 1;
          }
          
          .stepText {
              font-size: 0.8rem;
              text-align: center;
              color: #555;
          }
          
          .progressStep.active .stepText {
              color: #009944;
              font-weight: bold;
          }

          /* Scrollbar */
          ::-webkit-scrollbar {
              width: 10px;
          }

          ::-webkit-scrollbar-thumb {
              background-color: #ccc;
              border-radius: 5px;
          }

          ::-webkit-scrollbar-track {
              background: transparent;
          }
        `}
      </style>
      <UserNavbar />
      <div className="container">
        <div className="section">
          {/* İlan Detayları */}
          <h1 className="title">{announcement.baslik || 'İlan Başlığı Yok'}</h1>
          <p><strong>Fakülte/Birim:</strong> {announcement.birim_ad || announcement.birim || 'Belirtilmemiş'}</p>
          <p><strong>Bölüm:</strong> {announcement.bolum_ad || announcement.bolum || 'Belirtilmemiş'}</p>
          <p><strong>Anabilim Dalı:</strong> {announcement.anabilim_dali_ad || announcement.anabilim_dali || 'Belirtilmemiş'}</p>
          <p><strong>Kadro:</strong> {announcement.kadro_tipi_ad || announcement.kadro_tipi || 'Belirtilmemiş'}</p>
          <p>
            <strong>Başvuru Tarihleri:</strong>
            {new Date(announcement.baslangic_tarihi).toLocaleDateString('tr-TR')} -{' '}
            {new Date(announcement.bitis_tarihi).toLocaleDateString('tr-TR')}
          </p>
          <p><strong>Açıklama:</strong> {announcement.aciklama || 'Açıklama yok.'}</p>

          {/* Gerekli Belgeler */}
          <h3 className="subtitle">Gerekli Belgeler</h3>
          <ul>
            {requiredDocs.length > 0
                ? requiredDocs.map((doc) => <li key={doc.key}>{doc.label}</li>)
                : <li>Gerekli belge bilgisi bulunamadı.</li>
            }
          </ul>

          {!submitted ? (
            <div>
              {/* İlerleme Göstergesi */}
              <div className="progressContainer">
                <div className={`progressStep ${activeTab === 'kisisel-bilgiler' ? 'active' : ''} ${activeTab === 'akademik-faaliyetler' || activeTab === 'onizleme' ? 'completed' : ''}`}>
                  <div className="stepNumber">1</div>
                  <div className="stepText">Kişisel Bilgiler</div>
                </div>
                <div className={`progressStep ${activeTab === 'akademik-faaliyetler' ? 'active' : ''} ${activeTab === 'onizleme' ? 'completed' : ''}`}>
                  <div className="stepNumber">2</div>
                  <div className="stepText">Akademik Faaliyetler</div>
                </div>
                <div className={`progressStep ${activeTab === 'onizleme' ? 'active' : ''}`}>
                  <div className="stepNumber">3</div>
                  <div className="stepText">Önizleme ve Gönderim</div>
                </div>
              </div>

              {/* Tab Navigasyonu */}
              <div className="tabContainer">
                <button
                  className={`tabButton ${activeTab === 'kisisel-bilgiler' ? 'active' : ''}`}
                  onClick={() => handleTabChange('kisisel-bilgiler')}
                >
                  1. Kişisel Bilgiler
                </button>
                <button
                  className={`tabButton ${activeTab === 'akademik-faaliyetler' ? 'active' : ''}`}
                  onClick={() => handleTabChange('akademik-faaliyetler')}
                >
                  2. Akademik Faaliyetler
                </button>
                <button
                  className={`tabButton ${activeTab === 'onizleme' ? 'active' : ''}`}
                  onClick={() => handleTabChange('onizleme')}
                >
                  3. Önizleme ve Gönderim
                </button>
              </div>

              {/* Hata mesajı */}
              {error && (
                <div className="errorMessage">
                  <p><strong>Hata:</strong> {error}</p>
                </div>
              )}

              {/* Tab İçerikleri */}
              <form onSubmit={handleSubmit} className="form">

                {/* 1. Kişisel Bilgiler Tab */}
                {activeTab === 'kisisel-bilgiler' && (
                  <div>
                    <h3 className="subtitle">Kişisel Bilgiler ve Belgeler</h3>
                    <p>Bu bölümde, başvurunuz için gerekli belgeleri yüklemeniz gerekmektedir. Lütfen tüm belgelerin güncel ve okunaklı olduğundan emin olun.</p>

                    {requiredDocs.map((doc) => (
                      <label key={doc.key}>
                        {doc.label}:
                        <div className="fileInputPreview">
                          <input
                            type="file"
                            onChange={(e) => handleFileChange(e, doc.key)}
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            required
                            disabled={submitting}
                          />
                          {applicationData[doc.key] && (
                            <span>
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                              </svg>
                              {applicationData[doc.key].name}
                            </span>
                          )}
                        </div>
                      </label>
                    ))}

                    <div className="navButtons">
                      <button
                        type="button"
                        className="backButton"
                        onClick={() => navigate('/ilanlar')}
                      >
                        İlanlara Dön
                      </button>
                      <button
                        type="button"
                        className="submitButton"
                        onClick={() => handleTabChange('akademik-faaliyetler')}
                      >
                        Devam Et
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. Akademik Faaliyetler Tab */}
                {activeTab === 'akademik-faaliyetler' && (
                  <div>
                    <h3 className="subtitle">Akademik Faaliyetler</h3>
                    <p>Bu bölümde akademik faaliyetlerinizi ekleyebilirsiniz. Her kategori için yeni kayıt ekleyebilir ve mevcut kayıtları düzenleyebilirsiniz.</p>

                    {/* Makaleler Bölümü */}
                    <div className="academicSection">
                      <h4>Makaleler</h4>

                      {/* Makale Listesi */}
                      {academicActivities.articles.length > 0 ? (
                        academicActivities.articles.map((article, index) => (
                          <div key={index} className="academicItemCard">
                            <button
                              type="button"
                              className="removeButton"
                              onClick={() => handleRemoveActivity('articles', index)}
                            >
                              X
                            </button>
                            <p><strong>Başlık:</strong> {article.title}</p>
                            <p><strong>Dergi:</strong> {article.journal}</p>
                            <p><strong>Yıl:</strong> {article.year}</p>
                            <p><strong>İndeks:</strong> {article.index}</p>
                            <p><strong>Başlıca Yazar:</strong> {article.isMainAuthor ? 'Evet' : 'Hayır'}</p>
                          </div>
                        ))
                      ) : (
                        <p className="noActivitiesMessage">Henüz makale eklenmemiş.</p>
                      )}

                      {/* Yeni Makale Ekleme Formu */}
                        <details>
                          <summary>Yeni Makale Ekle</summary>
                          <div className="addForm">
                            <input
                              type="text"
                              id="articleTitle"
                              placeholder="Makale Başlığı"
                            />
                            <input
                              type="text"
                              id="articleJournal"
                              placeholder="Dergi Adı"
                            />
                            <input
                              type="number"
                              id="articleYear"
                              placeholder="Yayın Yılı"
                              min="1900"
                              max={new Date().getFullYear()}
                            />
                            <select id="articleIndex">
                              <option value="">İndeks Seçiniz</option>
                              <option value="SCI">SCI</option>
                              <option value="SCI-E">SCI-E</option>
                              <option value="SSCI">SSCI</option>
                              <option value="AHCI">AHCI</option>
                              <option value="ESCI">ESCI</option>
                              <option value="Scopus">Scopus</option>
                              <option value="TR Dizin">TR Dizin</option>
                              <option value="Diğer">Diğer</option>
                            </select>
                            <div style={{display: 'flex', alignItems: 'center', marginTop: '8px'}}>
                              <input
                                type="checkbox"
                                id="articleIsMainAuthor"
                                style={{marginRight: '8px', width: 'auto'}}
                              />
                              <label htmlFor="articleIsMainAuthor" style={{fontWeight: 'normal'}}>
                                Başlıca Yazar
                              </label>
                            </div>

                            {/* Kanıt Belgesi Yükleme Alanı */}
                            <div className="evidenceUpload" style={{marginTop: '0.75rem', border: '1px dashed #ccc', padding: '0.75rem', borderRadius: '4px'}}>
                              <label htmlFor="articleEvidence" style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'normal'}}>
                                <strong>Kanıt Belgesi Yükle:</strong> (Makale tam metni, indeks kanıtı, vb.)
                              </label>
                              <input
                                type="file"
                                id="articleEvidence"
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                              />
                              <p style={{fontSize: '0.8rem', color: '#666', marginTop: '0.5rem'}}>
                                Not: WoS/Scopus indeks sayfası, makale ilk sayfası veya tam metin PDF dosyası yükleyebilirsiniz.
                              </p>
                            </div>

                            <button
                              type="button"
                              className="addButton"
                              onClick={() => {
                                const title = document.getElementById('articleTitle').value;
                                const journal = document.getElementById('articleJournal').value;
                                const year = document.getElementById('articleYear').value;
                                const index = document.getElementById('articleIndex').value;
                                const isMainAuthor = document.getElementById('articleIsMainAuthor').checked;
                                const evidenceFile = document.getElementById('articleEvidence').files[0];

                                if (title && journal && year && index) {
                                  handleAddArticle({
                                    title,
                                    journal,
                                    year,
                                    index,
                                    isMainAuthor,
                                    evidence: evidenceFile // Kanıt dosyasını ekle
                                  });

                                  // Form alanlarını temizle
                                  document.getElementById('articleTitle').value = '';
                                  document.getElementById('articleJournal').value = '';
                                  document.getElementById('articleYear').value = '';
                                  document.getElementById('articleIndex').value = '';
                                  document.getElementById('articleIsMainAuthor').checked = false;
                                  document.getElementById('articleEvidence').value = '';
                                } else {
                                  alert("Lütfen tüm zorunlu alanları doldurun!");
                                }
                              }}
                            >
                              Ekle
                            </button>
                          </div>
                        </details>
                    </div>

                    {/* Projeler Bölümü */}
                    <div className="academicSection">
                      <h4>Projeler</h4>

                      {/* Proje Listesi */}
                      {academicActivities.projects.length > 0 ? (
                        academicActivities.projects.map((project, index) => (
                          <div key={index} className="academicItemCard">
                            <button
                              type="button"
                              className="removeButton"
                              onClick={() => handleRemoveActivity('projects', index)}
                            >
                              X
                            </button>
                            <p><strong>Başlık:</strong> {project.title}</p>
                            <p><strong>Kurum:</strong> {project.institution}</p>
                            <p><strong>Rol:</strong> {project.role}</p>
                            <p><strong>Tarih:</strong> {project.date}</p>
                            <p><strong>Durum:</strong> {project.status}</p>
                          </div>
                        ))
                      ) : (
                        <p className="noActivitiesMessage">Henüz proje eklenmemiş.</p>
                      )}

                      {/* Yeni Proje Ekleme Formu */}
                      <details>
                        <summary>Yeni Proje Ekle</summary>
                        <div className="addForm">
                          <input
                            type="text"
                            id="projectTitle"
                            placeholder="Proje Başlığı"
                          />
                          <input
                            type="text"
                            id="projectInstitution"
                            placeholder="Destekleyen Kurum"
                          />
                          <select id="projectRole">
                            <option value="">Rol Seçiniz</option>
                            <option value="Yürütücü">Yürütücü</option>
                            <option value="Araştırmacı">Araştırmacı</option>
                            <option value="Danışman">Danışman</option>
                            <option value="Bursiyer">Bursiyer</option>
                          </select>
                          <input
                            type="text"
                            id="projectDate"
                            placeholder="Tarih (2020-2023)"
                          />
                          <select id="projectStatus">
                            <option value="">Durum Seçiniz</option>
                            <option value="Devam Ediyor">Devam Ediyor</option>
                            <option value="Tamamlandı">Tamamlandı</option>
                          </select>
                          <button
                            type="button"
                            className="addButton"
                            onClick={() => {
                              const title = document.getElementById('projectTitle').value;
                              const institution = document.getElementById('projectInstitution').value;
                              const role = document.getElementById('projectRole').value;
                              const date = document.getElementById('projectDate').value;
                              const status = document.getElementById('projectStatus').value;

                              if (title && institution && role && date && status) {
                                handleAddProject({ title, institution, role, date, status });

                                // Form alanlarını temizle
                                document.getElementById('projectTitle').value = '';
                                document.getElementById('projectInstitution').value = '';
                                document.getElementById('projectRole').value = '';
                                document.getElementById('projectDate').value = '';
                                document.getElementById('projectStatus').value = '';
                              } else {
                                alert("Lütfen tüm alanları doldurun!");
                              }
                            }}
                          >
                            Ekle
                          </button>
                        </div>
                      </details>
                    </div>

                    {/* Konferanslar Bölümü */}
                    <div className="academicSection">
                      <h4>Konferans Yayınları</h4>

                      {/* Konferans Listesi */}
                      {academicActivities.conferences.length > 0 ? (
                        academicActivities.conferences.map((conference, index) => (
                          <div key={index} className="academicItemCard">
                            <button
                              type="button"
                              className="removeButton"
                              onClick={() => handleRemoveActivity('conferences', index)}
                            >
                              X
                            </button>
                            <p><strong>Başlık:</strong> {conference.title}</p>
                            <p><strong>Konferans:</strong> {conference.name}</p>
                            <p><strong>Tür:</strong> {conference.type}</p>
                            <p><strong>Yıl:</strong> {conference.year}</p>
                            <p><strong>Kapsam:</strong> {conference.scope}</p>
                          </div>
                        ))
                      ) : (
                        <p className="noActivitiesMessage">Henüz konferans yayını eklenmemiş.</p>
                      )}

                      {/* Yeni Konferans Ekleme Formu */}
                      <details>
                        <summary>Yeni Konferans Yayını Ekle</summary>
                        <div className="addForm">
                          <input
                            type="text"
                            id="confTitle"
                            placeholder="Bildiri Başlığı"
                          />
                          <input
                            type="text"
                            id="confName"
                            placeholder="Konferans Adı"
                          />
                          <select id="confType">
                            <option value="">Tür Seçiniz</option>
                            <option value="Sözlü Sunum (Tam Metin)">Sözlü Sunum (Tam Metin)</option>
                            <option value="Sözlü Sunum (Özet)">Sözlü Sunum (Özet)</option>
                            <option value="Poster">Poster</option>
                          </select>
                          <input
                            type="number"
                            id="confYear"
                            placeholder="Yıl"
                            min="1900"
                            max={new Date().getFullYear()}
                          />
                          <select id="confScope">
                            <option value="">Kapsam Seçiniz</option>
                            <option value="Uluslararası">Uluslararası</option>
                            <option value="Ulusal">Ulusal</option>
                          </select>
                          <button
                            type="button"
                            className="addButton"
                            onClick={() => {
                              const title = document.getElementById('confTitle').value;
                              const name = document.getElementById('confName').value;
                              const type = document.getElementById('confType').value;
                              const year = document.getElementById('confYear').value;
                              const scope = document.getElementById('confScope').value;

                              if (title && name && type && year && scope) {
                                handleAddConference({ title, name, type, year, scope });

                                // Form alanlarını temizle
                                document.getElementById('confTitle').value = '';
                                document.getElementById('confName').value = '';
                                document.getElementById('confType').value = '';
                                document.getElementById('confYear').value = '';
                                document.getElementById('confScope').value = '';
                              } else {
                                alert("Lütfen tüm alanları doldurun!");
                              }
                            }}
                          >
                            Ekle
                          </button>
                        </div>
                      </details>
                    </div>

                    {/* Eğitim Faaliyetleri Bölümü */}
                    <div className="academicSection">
                      <h4>Eğitim Faaliyetleri</h4>

                      {/* Eğitim Faaliyeti Listesi */}
                      {academicActivities.teaching.length > 0 ? (
                        academicActivities.teaching.map((teaching, index) => (
                          <div key={index} className="academicItemCard">
                            <button
                              type="button"
                              className="removeButton"
                              onClick={() => handleRemoveActivity('teaching', index)}
                            >
                              X
                            </button>
                            <p><strong>Ders Adı:</strong> {teaching.course}</p>
                            <p><strong>Kurum:</strong> {teaching.institution}</p>
                            <p><strong>Düzey:</strong> {teaching.level}</p>
                            <p><strong>Dönem:</strong> {teaching.term}</p>
                          </div>
                        ))
                      ) : (
                        <p className="noActivitiesMessage">Henüz eğitim faaliyeti eklenmemiş.</p>
                      )}

                      {/* Yeni Eğitim Faaliyeti Ekleme Formu */}
                      <details>
                        <summary>Yeni Eğitim Faaliyeti Ekle</summary>
                        <div className="addForm">
                          <input
                            type="text"
                            id="teachCourse"
                            placeholder="Ders Adı"
                          />
                          <input
                            type="text"
                            id="teachInstitution"
                            placeholder="Kurum"
                          />
                          <select id="teachLevel">
                            <option value="">Düzey Seçiniz</option>
                            <option value="Önlisans">Önlisans</option>
                            <option value="Lisans">Lisans</option>
                            <option value="Yüksek Lisans">Yüksek Lisans</option>
                            <option value="Doktora">Doktora</option>
                          </select>
                          <input
                            type="text"
                            id="teachTerm"
                            placeholder="Dönem (2023 Bahar)"
                          />
                          <button
                            type="button"
                            className="addButton"
                            onClick={() => {
                              const course = document.getElementById('teachCourse').value;
                              const institution = document.getElementById('teachInstitution').value;
                              const level = document.getElementById('teachLevel').value;
                              const term = document.getElementById('teachTerm').value;

                              if (course && institution && level && term) {
                                handleAddTeaching({ course, institution, level, term });

                                // Form alanlarını temizle
                                document.getElementById('teachCourse').value = '';
                                document.getElementById('teachInstitution').value = '';
                                document.getElementById('teachLevel').value = '';
                                document.getElementById('teachTerm').value = '';
                              } else {
                                alert("Lütfen tüm alanları doldurun!");
                              }
                            }}
                          >
                            Ekle
                          </button>
                        </div>
                      </details>
                    </div>

                    {/* Atıflar Bölümü */}
                    <div className="academicSection">
                      <h4>Atıflar</h4>

                      {/* Atıf Listesi */}
                      {academicActivities.citations.length > 0 ? (
                        academicActivities.citations.map((citation, index) => (
                          <div key={index} className="academicItemCard">
                            <button
                              type="button"
                              className="removeButton"
                              onClick={() => handleRemoveActivity('citations', index)}
                            >
                              X
                            </button>
                            <p><strong>Atıf Yapılan Eser:</strong> {citation.referencedWork}</p>
                            <p><strong>Atıf Yapan Eser:</strong> {citation.citingWork}</p>
                            <p><strong>Yıl:</strong> {citation.year}</p>
                            <p><strong>İndeks:</strong> {citation.index}</p>
                          </div>
                        ))
                      ) : (
                        <p className="noActivitiesMessage">Henüz atıf eklenmemiş.</p>
                      )}

                      {/* Yeni Atıf Ekleme Formu */}
                      <details>
                        <summary>Yeni Atıf Ekle</summary>
                        <div className="addForm">
                          <input
                            type="text"
                            id="citationReferencedWork"
                            placeholder="Atıf Yapılan Eseriniz"
                          />
                          <input
                            type="text"
                            id="citationCitingWork"
                            placeholder="Atıf Yapan Eser"
                          />
                          <input
                            type="number"
                            id="citationYear"
                            placeholder="Atıf Yılı"
                            min="1900"
                            max={new Date().getFullYear()}
                          />
                          <select id="citationIndex">
                            <option value="">İndeks Seçiniz</option>
                            <option value="SCI-E">SCI-E</option>
                            <option value="SSCI">SSCI</option>
                            <option value="AHCI">AHCI</option>
                            <option value="ESCI">ESCI</option>
                            <option value="Scopus">Scopus</option>
                            <option value="Diğer">Diğer</option>
                          </select>
                          <button
                            type="button"
                            className="addButton"
                            onClick={() => {
                              const referencedWork = document.getElementById('citationReferencedWork').value;
                              const citingWork = document.getElementById('citationCitingWork').value;
                              const year = document.getElementById('citationYear').value;
                              const index = document.getElementById('citationIndex').value;

                              if (referencedWork && citingWork && year && index) {
                                handleAddCitation({ referencedWork, citingWork, year, index });

                                // Form alanlarını temizle
                                document.getElementById('citationReferencedWork').value = '';
                                document.getElementById('citationCitingWork').value = '';
                                document.getElementById('citationYear').value = '';
                                document.getElementById('citationIndex').value = '';
                              } else {
                                alert("Lütfen tüm alanları doldurun!");
                              }
                            }}
                          >
                            Ekle
                          </button>
                        </div>
                      </details>
                    </div>

                    {/* Patent/Faydalı Model Bölümü */}
                    <div className="academicSection">
                      <h4>Patent / Faydalı Model</h4>

                      {/* Patent Listesi */}
                      {academicActivities.patents.length > 0 ? (
                        academicActivities.patents.map((patent, index) => (
                          <div key={index} className="academicItemCard">
                            <button
                              type="button"
                              className="removeButton"
                              onClick={() => handleRemoveActivity('patents', index)}
                            >
                              X
                            </button>
                            <p><strong>Başlık:</strong> {patent.title}</p>
                            <p><strong>Tür:</strong> {patent.type}</p>
                            <p><strong>Numarası:</strong> {patent.number}</p>
                            <p><strong>Tarih:</strong> {patent.date}</p>
                            <p><strong>Kapsam:</strong> {patent.scope}</p>
                          </div>
                        ))
                      ) : (
                        <p className="noActivitiesMessage">Henüz patent/faydalı model eklenmemiş.</p>
                      )}

                      {/* Yeni Patent Ekleme Formu */}
                      <details>
                        <summary>Yeni Patent / Faydalı Model Ekle</summary>
                        <div className="addForm">
                          <input
                            type="text"
                            id="patentTitle"
                            placeholder="Patent Başlığı"
                          />
                          <select id="patentType">
                            <option value="">Tür Seçiniz</option>
                            <option value="Patent">Patent</option>
                            <option value="Faydalı Model">Faydalı Model</option>
                            <option value="Tasarım Tescil">Tasarım Tescil</option>
                          </select>
                          <input
                            type="text"
                            id="patentNumber"
                            placeholder="Patent Numarası"
                          />
                          <input
                            type="text"
                            id="patentDate"
                            placeholder="Tarih (YY-AA-GG)"
                          />
                          <select id="patentScope">
                            <option value="">Kapsam Seçiniz</option>
                            <option value="Uluslararası">Uluslararası</option>
                            <option value="Ulusal">Ulusal</option>
                          </select>
                          <button
                            type="button"
                            className="addButton"
                            onClick={() => {
                              const title = document.getElementById('patentTitle').value;
                              const type = document.getElementById('patentType').value;
                              const number = document.getElementById('patentNumber').value;
                              const date = document.getElementById('patentDate').value;
                              const scope = document.getElementById('patentScope').value;

                              if (title && type && number && date && scope) {
                                handleAddPatent({ title, type, number, date, scope });

                                // Form alanlarını temizle
                                document.getElementById('patentTitle').value = '';
                                document.getElementById('patentType').value = '';
                                document.getElementById('patentNumber').value = '';
                                document.getElementById('patentDate').value = '';
                                document.getElementById('patentScope').value = '';
                              } else {
                                alert("Lütfen tüm alanları doldurun!");
                              }
                            }}
                          >
                            Ekle
                          </button>
                        </div>
                      </details>
                    </div>

                    <div className="navButtons">
                      <button
                        type="button"
                        className="backButton"
                        onClick={() => handleTabChange('kisisel-bilgiler')}
                      >
                        Geri
                      </button>
                      <button
                        type="button"
                        className="submitButton"
                        onClick={() => handleTabChange('onizleme')}
                      >
                        Devam Et
                      </button>
                    </div>
                  </div>
                )}{/* 3. Önizleme ve Gönderim Tab */}
{activeTab === 'onizleme' && (
  <div>
    <h3 className="subtitle">Başvuru Önizlemesi</h3>
    <p>Lütfen başvuru bilgilerinizi kontrol edin. Bilgilerinizin doğru ve eksiksiz olduğundan emin olduktan sonra başvurunuzu gönderebilirsiniz.</p>

    <div className="previewSection">
      <h4>Kişisel Bilgiler ve Yüklenen Belgeler</h4>
      <ul>
        {requiredDocs.map(doc => (
          <li key={doc.key}>
            <strong>{doc.label}:</strong> {applicationData[doc.key] ? applicationData[doc.key].name : 'Yüklenmedi'}
          </li>
        ))}
      </ul>
    </div>

    <div className="previewSection">
      <h4>Akademik Faaliyetler Özeti</h4>

      {/* Toplam sayılar */}
      <div className="summaryCounts" style={{marginBottom: '1rem', display: 'flex', flexWrap: 'wrap', gap: '1rem'}}>
        <div className="countBox" style={{padding: '0.75rem', border: '1px solid #eee', borderRadius: '8px', background: '#f9f9f9', textAlign: 'center', flex: '1'}}>
          <div style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#009944'}}>{academicActivities.articles.length}</div>
          <div>Makale</div>
        </div>
        <div className="countBox" style={{padding: '0.75rem', border: '1px solid #eee', borderRadius: '8px', background: '#f9f9f9', textAlign: 'center', flex: '1'}}>
          <div style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#009944'}}>{academicActivities.projects.length}</div>
          <div>Proje</div>
        </div>
        <div className="countBox" style={{padding: '0.75rem', border: '1px solid #eee', borderRadius: '8px', background: '#f9f9f9', textAlign: 'center', flex: '1'}}>
          <div style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#009944'}}>{academicActivities.conferences.length}</div>
          <div>Konferans</div>
        </div>
        <div className="countBox" style={{padding: '0.75rem', border: '1px solid #eee', borderRadius: '8px', background: '#f9f9f9', textAlign: 'center', flex: '1'}}>
          <div style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#009944'}}>{academicActivities.teaching.length}</div>
          <div>Eğitim</div>
        </div>
      </div>

      {/* Makaleler Önizleme */}
      {academicActivities.articles.length > 0 && (
        <div className="previewSubsection">
          <h5>Makaleler</h5>
          <table className="previewTable">
            <thead>
              <tr>
                <th>Başlık</th>
                <th>Dergi</th>
                <th>Yıl</th>
                <th>İndeks</th>
                <th>Başlıca Yazar</th>
              </tr>
            </thead>
            <tbody>
              {academicActivities.articles.map((article, index) => (
                <tr key={index}>
                  <td>{article.title}</td>
                  <td>{article.journal}</td>
                  <td>{article.year}</td>
                  <td>{article.index}</td>
                  <td>{article.isMainAuthor ? 'Evet' : 'Hayır'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Projeler Önizleme */}
      {academicActivities.projects.length > 0 && (
        <div className="previewSubsection">
          <h5>Projeler</h5>
          <table className="previewTable">
            <thead>
              <tr>
                <th>Başlık</th>
                <th>Kurum</th>
                <th>Rol</th>
                <th>Tarih</th>
                <th>Durum</th>
              </tr>
            </thead>
            <tbody>
              {academicActivities.projects.map((project, index) => (
                <tr key={index}>
                  <td>{project.title}</td>
                  <td>{project.institution}</td>
                  <td>{project.role}</td>
                  <td>{project.date}</td>
                  <td>{project.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Konferanslar Önizleme */}
      {academicActivities.conferences.length > 0 && (
        <div className="previewSubsection">
          <h5>Konferans Yayınları</h5>
          <table className="previewTable">
            <thead>
              <tr>
                <th>Başlık</th>
                <th>Konferans</th>
                <th>Tür</th>
                <th>Yıl</th>
                <th>Kapsam</th>
              </tr>
            </thead>
            <tbody>
              {academicActivities.conferences.map((conference, index) => (
                <tr key={index}>
                  <td>{conference.title}</td>
                  <td>{conference.name}</td>
                  <td>{conference.type}</td>
                  <td>{conference.year}</td>
                  <td>{conference.scope}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Eğitim Faaliyetleri Önizleme */}
      {academicActivities.teaching.length > 0 && (
        <div className="previewSubsection">
          <h5>Eğitim Faaliyetleri</h5>
          <table className="previewTable">
            <thead>
              <tr>
                <th>Ders Adı</th>
                <th>Kurum</th>
                <th>Düzey</th>
                <th>Dönem</th>
              </tr>
            </thead>
            <tbody>
              {academicActivities.teaching.map((teaching, index) => (
                <tr key={index}>
                  <td>{teaching.course}</td>
                  <td>{teaching.institution}</td>
                  <td>{teaching.level}</td>
                  <td>{teaching.term}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Atıflar Önizleme */}
      {academicActivities.citations.length > 0 && (
        <div className="previewSubsection">
          <h5>Atıflar</h5>
          <table className="previewTable">
            <thead>
              <tr>
                <th>Atıf Yapılan Eser</th>
                <th>Atıf Yapan Eser</th>
                <th>Yıl</th>
                <th>İndeks</th>
              </tr>
            </thead>
            <tbody>
              {academicActivities.citations.map((citation, index) => (
                <tr key={index}>
                  <td>{citation.referencedWork}</td>
                  <td>{citation.citingWork}</td>
                  <td>{citation.year}</td>
                  <td>{citation.index}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Patent/Faydalı Model Önizleme */}
      {academicActivities.patents.length > 0 && (
        <div className="previewSubsection">
          <h5>Patent / Faydalı Model</h5>
          <table className="previewTable">
            <thead>
              <tr>
                <th>Başlık</th>
                <th>Tür</th>
                <th>Numarası</th>
                <th>Tarih</th>
                <th>Kapsam</th>
              </tr>
            </thead>
            <tbody>
              {academicActivities.patents.map((patent, index) => (
                <tr key={index}>
                  <td>{patent.title}</td>
                  <td>{patent.type}</td>
                  <td>{patent.number}</td>
                  <td>{patent.date}</td>
                  <td>{patent.scope}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Eğer hiç akademik faaliyet eklenmemişse */}
      {academicActivities.articles.length === 0 &&
       academicActivities.projects.length === 0 &&
       academicActivities.conferences.length === 0 &&
       academicActivities.teaching.length === 0 &&
       academicActivities.citations.length === 0 &&
       academicActivities.patents.length === 0 && (
        <p className="noActivitiesMessage">Henüz akademik faaliyet eklenmemiş.</p>
      )}
    </div>

    {/* Otomatik Oluşturulan Tablolar ve Puanlar - Tablo 5 */}
    <div className="previewSection">
      <h4>KOÜ Akademik Değerlendirme Puanı</h4>
      <p>Aşağıdaki puan değerlendirmesi başvurduğunuz kadro türüne göre Kocaeli Üniversitesi Öğretim Üyeliği Atama ve Yükseltme Yönergesi'ne göre otomatik olarak hesaplanmıştır.</p>

      {/* Örnek Puan Tablosu */}
      <table className="previewTable">
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
            <td>{academicActivities.articles.filter(a => ['SCI', 'SCI-E', 'SSCI', 'AHCI'].includes(a.index)).length * 40}</td>
          </tr>
          <tr>
            <td>Makaleler (A.5-A.8)</td>
            <td>{academicActivities.articles.filter(a => !['SCI', 'SCI-E', 'SSCI', 'AHCI'].includes(a.index)).length}</td>
            <td>{academicActivities.articles.filter(a => !['SCI', 'SCI-E', 'SSCI', 'AHCI'].includes(a.index)).length * 20}</td>
          </tr>
          <tr>
            <td>Projeler (H.1-H.12)</td>
            <td>{academicActivities.projects.length}</td>
            <td>{academicActivities.projects.length * 30}</td>
          </tr>
          <tr>
            <td>Bilimsel Toplantılar (B.1-B.12)</td>
            <td>{academicActivities.conferences.length}</td>
            <td>{academicActivities.conferences.length * 10}</td>
          </tr>
          <tr>
            <td>Eğitim Faaliyetleri (E.1-E.4)</td>
            <td>{academicActivities.teaching.length}</td>
            <td>{academicActivities.teaching.length * 5}</td>
          </tr>
          <tr>
            <td>Atıflar (D.1-D.6)</td>
            <td>{academicActivities.citations.length}</td>
            <td>{academicActivities.citations.length * 3}</td>
          </tr>
          <tr>
            <td>Patent/Faydalı Model (G.1-G.8)</td>
            <td>{academicActivities.patents.length}</td>
            <td>{academicActivities.patents.length * 50}</td>
          </tr>
          <tr style={{fontWeight: 'bold', backgroundColor: '#e8f5e9'}}>
            <td>Toplam Puan</td>
            <td></td>
            <td>
              {academicActivities.articles.filter(a => ['SCI', 'SCI-E', 'SSCI', 'AHCI'].includes(a.index)).length * 40 +
               academicActivities.articles.filter(a => !['SCI', 'SCI-E', 'SSCI', 'AHCI'].includes(a.index)).length * 20 +
               academicActivities.projects.length * 30 +
               academicActivities.conferences.length * 10 +
               academicActivities.teaching.length * 5 +
               academicActivities.citations.length * 3 +
               academicActivities.patents.length * 50}
            </td>
          </tr>
        </tbody>
      </table>

      <div style={{marginTop: '1rem'}}>
        <p style={{fontStyle: 'italic', fontSize: '0.9rem', color: '#666'}}>
          Not: Bu puan hesaplaması tahmini bir değerlendirmedir. Başvurunuz Kocaeli Üniversitesi Atama Komisyonu ve jüri üyeleri tarafından değerlendirilerek nihai puanlaması yapılacaktır.
        </p>
      </div>
    </div>

    {/* Onay kutusu */}
    <div className="confirmationSection" style={{marginTop: '1.5rem', padding: '1rem', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#f9f9f9'}}>
      <div style={{display: 'flex', alignItems: 'flex-start', marginBottom: '1rem'}}>
        <input
          type="checkbox"
          id="confirmAccuracy"
          style={{marginRight: '10px', marginTop: '4px'}}
          required
        />
        <label htmlFor="confirmAccuracy" style={{fontSize: '0.9rem'}}>
          Yukarıda belirtilen bilgilerin doğru ve eksiksiz olduğunu, herhangi bir yanlış beyan durumunda başvurumun reddedilebileceğini kabul ve beyan ederim.
        </label>
      </div>
    </div>

    {/* Hata mesajı */}
    {error && (
      <div className="errorMessage">
        <p><strong>Hata:</strong> {error}</p>
      </div>
    )}

    <div className="navButtons">
      <button
        type="button"
        className="backButton"
        onClick={() => handleTabChange('akademik-faaliyetler')}
      >
        Geri
      </button>
      <button
        type="submit"
        className="submitButton"
        disabled={submitting}
      >
        {submitting ? 'Gönderiliyor...' : 'Başvuruyu Gönder'}
      </button>
    </div>
  </div>
)}</form>
</div>
) : (
<div className="section" style={{borderColor: 'green', color: 'green', textAlign: 'center', padding: '2rem'}}>
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{margin: '0 auto 1rem'}}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
  <h3 style={{marginBottom: '1rem'}}>Başvurunuz Başarıyla Alınmıştır</h3>
  <p>Teşekkür ederiz! Başvurunuz sistemimize kaydedilmiştir.</p>
  <p>Başvurunuzun durumunu <a href="/basvurularim" style={{color: '#009944', textDecoration: 'underline'}}>Başvurularım</a> sayfasından takip edebilirsiniz.</p>
  <p style={{fontSize: '0.9rem', marginTop: '1rem', color: '#666'}}>3 saniye içinde yönlendirileceksiniz...</p>
</div>
)}
</div>
</div>
</>
);
};

export default Apply;
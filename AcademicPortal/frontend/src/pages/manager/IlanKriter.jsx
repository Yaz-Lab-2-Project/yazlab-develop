import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ManagerNavbar from "../../components/navbars/ManagerNavbar";

function getAuthToken() {
    const token = localStorage.getItem("authToken");
    // console.log("Retrieved Token:", token); // Debug
    return token;
}

// CSRF token fonksiyonu (AnnouncementsPage'den alındı)
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

async function fetchWithAuth(url, options = {}) {
  const token = getAuthToken();
  const csrfToken = getCookie('csrftoken');

  if (!token && !options.allowUnauthenticated) { // Allow specific calls without token if needed
      console.error("Authentication Token not found.");
      const error = new Error("Giriş bilgileri bulunamadı (Token eksik). Lütfen tekrar giriş yapın.");
      error.status = 401;
      throw error;
  }

  const headers = { ...options.headers };

  if (token) {
      headers['Authorization'] = `Token ${token}`; // Or `Bearer ${token}`
  }

  if (options.body && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
  }

  if (csrfToken && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method?.toUpperCase())) {
      headers['X-CSRFToken'] = csrfToken;
  }

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
      let errorData;
      let errorMessage = `Request failed with status ${response.status}`;
      try {
          errorData = await response.json();
          errorMessage = errorData.detail || (typeof errorData === 'string' ? errorData : JSON.stringify(errorData)) || errorMessage;
      } catch (e) {
          errorMessage = response.statusText || errorMessage;
      }

      if (response.status === 401) {
          errorMessage = "Kimlik doğrulaması başarısız (401). Token geçersiz veya eksik.";
      } else if (response.status === 403) {
          errorMessage = "Bu kaynağa erişim yetkiniz yok (403 Forbidden).";
      } else if (response.status === 404) {
          errorMessage = "Kaynak bulunamadı (404 Not Found).";
      }


      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = errorData;
      console.error(`API Error (${response.status}) for ${url}:`, errorMessage, errorData);
      throw error;
  }

  if (response.status === 204) return null;
  try {
      return await response.json();
  } catch (e) {
      console.error("Failed to parse JSON response for", url, e);
      const error = new Error("Sunucudan gelen yanıt işlenemedi (JSON parse hatası).");
      error.status = response.status;
      throw error;
  }
}

const IlanKriter = () => {
  const { id: ilanId } = useParams(); // URL'den ilan ID'sini al
  const navigate = useNavigate();

  // İlkin component’in en üstünde
const [searchTC, setSearchTC] = useState('');
const [juriResults, setJuriResults] = useState([]);
const [assignedJuries, setAssignedJuries] = useState([]);

const [loadingSearch, setLoadingSearch] = useState(false);
const [loadingAssign, setLoadingAssign] = useState(false);
const [errorJuri, setErrorJuri] = useState(null);

  // State'ler
  const [IlanKriter, setIlanKriter] = useState(null); // Seçili ilanın detayları
  const [loadingIlan, setLoadingIlan] = useState(true);
  const [errorIlan, setErrorIlan] = useState(null);

  // Kriter yönetimi için state'ler (AnnouncementsPage'den alındı ve uyarlandı)
  const [kadroTipiOptions, setKadroTipiOptions] = useState([]);
  const [temelAlanOptions, setTemelAlanOptions] = useState([]);
  const [selectedKadroTipiId, setSelectedKadroTipiId] = useState('');
  const [selectedTemelAlanId, setSelectedTemelAlanId] = useState('');
  const [criteriaId, setCriteriaId] = useState(null); // Mevcut kriterin ID'si (varsa)
  const [minToplamPuan, setMinToplamPuan] = useState(0);
  const [minMakaleSayisi, setMinMakaleSayisi] = useState(0);
  const [minBaslicaYazar, setMinBaslicaYazar] = useState(0);
  const [minA1A2Makale, setMinA1A2Makale] = useState(0);
  const [minA1A4Makale, setMinA1A4Makale] = useState(0);
  const [minA1A5Makale, setMinA1A5Makale] = useState(0);
  const [minA1A6Makale, setMinA1A6Makale] = useState(0);
  const [minA1A8Makale, setMinA1A8Makale] = useState(0);
  const [minKisiselEtkinlik, setMinKisiselEtkinlik] = useState(0);
  const [minKarmaEtkinlik, setMinKarmaEtkinlik] = useState(0);
  const [minTezDanismanligi, setMinTezDanismanligi] = useState(0);
  const [customCriteria, setCustomCriteria] = useState([]);
  const [newCriterionName, setNewCriterionName] = useState("");
  const [newCriterionValue, setNewCriterionValue] = useState(0);

  // Durum state'leri
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingCriteria, setLoadingCriteria] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorCriteria, setErrorCriteria] = useState(null); // Kriter işlemleri için hata
  const [successMessage, setSuccessMessage] = useState('');

  // 1. İlan Detaylarını Çekme
  useEffect(() => {
    setLoadingIlan(true);
    setErrorIlan(null);
    fetch(`http://localhost:8000/api/ilanlar/${ilanId}/`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) {
          throw new Error(`İlan detayları alınamadı (${res.status})`);
        }
        return res.json();
      })
      .then(data => {
        setIlanKriter(data);
        // İlanın kadro tipi ve temel alanını state'e ata (varsa)
        // NOT: Backend'den gelen 'data' objesinin yapısına göre bu ID'leri almalısınız.
        // Örnek: data.kadro_tipi_id, data.temel_alan_id
        // Eğer ID yerine isim geliyorsa, options yüklendikten sonra ID'yi bulmanız gerekebilir.
        // Şimdilik ID'lerin geldiğini varsayalım:
        if (data.kadro_tipi) setSelectedKadroTipiId(data.kadro_tipi.toString()); // veya data.kadro_tipi_id
        if (data.temel_alan) setSelectedTemelAlanId(data.temel_alan.toString()); // veya data.temel_alan_id
        setErrorIlan(null);
      })
      .catch(err => {
        setErrorIlan(err.message);
        setIlanKriter(null);
      })
      .finally(() => setLoadingIlan(false));
  }, [ilanId]);

  // 2. Kadro Tipi ve Temel Alan Seçeneklerini Çekme
  useEffect(() => {
    setLoadingOptions(true);
    // Gerçek API çağrıları
    const fetchKadroTipi = fetch('http://localhost:8000/api/kadro-tipi/', { credentials: 'include' })
        .then(res => res.ok ? res.json() : Promise.reject('Kadro tipleri alınamadı'));
    const fetchTemelAlan = fetch('http://localhost:8000/api/temel-alan/', { credentials: 'include' })
        .then(res => res.ok ? res.json() : Promise.reject('Temel alanlar alınamadı'));

    Promise.all([fetchKadroTipi, fetchTemelAlan])
      .then(([kadroTipiData, temelAlanData]) => {
        // Backend'den gelen veriye göre ayarlayın (örnek: { id: 1, tip: 'Profesör' })
        setKadroTipiOptions(kadroTipiData.results || kadroTipiData || []);
        setTemelAlanOptions(temelAlanData.results || temelAlanData || []);
        setLoadingOptions(false);
      })
      .catch(err => {
        setErrorCriteria(`Seçenekler yüklenirken hata: ${err}`);
        setLoadingOptions(false);
      });
  }, []);



  useEffect(() => {
    const fetchAssigned = async () => {
      try {
        const data = await fetchWithAuth(
          `/api/juri-atamalar/?ilan=${ilanId}`,
          { method: 'GET', allowUnauthenticated: true }
        );
        setAssignedJuries(data);
      } catch (e) {
        console.error("Atamaları çekerken hata:", e);
      }
    };
    fetchAssigned();
  }, [ilanId]);


  // 3. Seçili Kadro Tipi ve Temel Alan için Kriterleri Çekme/Sıfırlama
  useEffect(() => {
    if (selectedKadroTipiId && selectedTemelAlanId) {
      setLoadingCriteria(true);
      setErrorCriteria(null);
      setSuccessMessage('');
      setCriteriaId(null); // Önce sıfırla

      // Form alanlarını sıfırla
      setMinToplamPuan(0);
      setMinMakaleSayisi(0);
      setMinBaslicaYazar(0);
      setMinA1A2Makale(0);
      setMinA1A4Makale(0);
      setMinA1A5Makale(0);
      setMinA1A6Makale(0);
      setMinA1A8Makale(0);
      setMinKisiselEtkinlik(0);
      setMinKarmaEtkinlik(0);
      setMinTezDanismanligi(0);
      setCustomCriteria([]);

      // Gerçek API çağrısı - Backend'e kadro_tipi_id ve temel_alan_id göndererek kriterleri sorgula
      // Örnek endpoint: /api/kriterler/?kadro_tipi=${selectedKadroTipiId}&temel_alan=${selectedTemelAlanId}
      fetch(
    `http://localhost:8000/api/atama-kriterleri/?kadro_tipi=${selectedKadroTipiId}&temel_alan=${selectedTemelAlanId}`,
    { credentials: "include" }
  )
        .then(res => {
          if (res.status === 404) return null; // Kriter bulunamadı durumu
          if (!res.ok) throw new Error('Kriterler alınamadı');
          return res.json();
        })
        .then(data => {
          if (data && data.length > 0) {
            // Genelde bu filtrelemeyle tek bir kriter seti dönmeli, ilkini alalım
            const kriter = data[0];
            setCriteriaId(kriter.id);
            setMinToplamPuan(kriter.min_toplam_puan || 0);
            setMinMakaleSayisi(kriter.min_makale_sayisi || 0);
            setMinBaslicaYazar(kriter.min_baslica_yazar || 0);
            setMinA1A2Makale(kriter.min_a1_a2_makale || 0);
            setMinA1A4Makale(kriter.min_a1_a4_makale || 0);
            setMinA1A5Makale(kriter.min_a1_a5_makale || 0);
            setMinA1A6Makale(kriter.min_a1_a6_makale || 0);
            setMinA1A8Makale(kriter.min_a1_a8_makale || 0);
            setMinKisiselEtkinlik(kriter.min_kisisel_etkinlik || 0);
            setMinKarmaEtkinlik(kriter.min_karma_etkinlik || 0);
            setMinTezDanismanligi(kriter.min_tez_danismanligi || 0);
            // Özel kriterler backend'den nasıl geliyorsa ona göre parse edilmeli
            // Örnek: kriter.custom_criteria bir JSON string ise parse edilebilir veya doğrudan array ise atanabilir
             try {
                 // Backend'den gelen yapıya göre burayı ayarlayın
                 // Varsayım: custom_criteria ilişkili bir modelden dizi olarak geliyor
                 setCustomCriteria(kriter.ozel_kriterler || []); // Backend model field adına göre değiştirin
             } catch (e) {
                 console.error("Özel kriter parse hatası:", e);
                 setCustomCriteria([]);
             }

          } else {
            // Kriter bulunamadı, form boş kalacak (zaten sıfırlanmıştı)
            setCriteriaId(null); // ID'nin null olduğundan emin ol
          }
          setLoadingCriteria(false);
        })
        .catch(err => {
          setErrorCriteria(`Kriterler yüklenirken hata: ${err.message}`);
          setLoadingCriteria(false);
        });
    } else {
      // Seçimler tamamlanmadıysa kriter ID'sini sıfırla
      setCriteriaId(null);
      // İsteğe bağlı olarak form alanlarını burada da sıfırlayabilirsiniz
    }
  }, [selectedKadroTipiId, selectedTemelAlanId]);

  // Kriter Kaydetme/Güncelleme Fonksiyonu
  const handleSaveCriteria = async () => {
    if (!selectedKadroTipiId || !selectedTemelAlanId) {
      setErrorCriteria("Lütfen Kadro Türü ve Temel Alan seçin.");
      return;
    }

    setErrorCriteria(null);
    setSuccessMessage('');
    setSaving(true);

    const csrftoken = getCookie('csrftoken'); // CSRF token'ını al

    // API'ye gönderilecek payload
    const payload = {
      kadro_tipi: parseInt(selectedKadroTipiId, 10),
      temel_alan: parseInt(selectedTemelAlanId, 10),
      min_toplam_puan: minToplamPuan,
      min_makale_sayisi: minMakaleSayisi,
      min_baslica_yazar: minBaslicaYazar,
      min_a1_a2_makale: minA1A2Makale,
      min_a1_a4_makale: minA1A4Makale,
      min_a1_a5_makale: minA1A5Makale,
      min_a1_a6_makale: minA1A6Makale,
      min_a1_a8_makale: minA1A8Makale,
      min_kisisel_etkinlik: minKisiselEtkinlik,
      min_karma_etkinlik: minKarmaEtkinlik,
      min_tez_danismanligi: minTezDanismanligi,
      // Özel kriterler backend'e nasıl gönderilecekse ona göre formatlanmalı
      // Örnek: [{ ad: '...', deger: ... }, ...] veya ID listesi vb.
       ozel_kriterler: customCriteria.map(c => ({ ad: c.name, deger: c.value })) // Backend modeline göre ayarlayın (name->ad, value->deger)
    };

    // API endpoint ve metot (POST veya PUT)
    const url = criteriaId
    ? `http://localhost:8000/api/atama-kriterleri/${criteriaId}/`
    : `http://localhost:8000/api/atama-kriterleri/`;
const method = criteriaId ? 'PUT' : 'POST';

    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrftoken, // CSRF token'ını header'a ekle
         'Accept': 'application/json',
      },
       credentials: 'include', // Cookie'leri göndermek için
      body: JSON.stringify(payload),
    })
    .then(res => {
      if (!res.ok) {
          // Hata detayını almak için response body'sini okumaya çalış
          return res.json().then(errData => {
              // Backend'den gelen hata mesajını formatla
              const errorMsg = Object.entries(errData)
                  .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
                  .join('; ');
              throw new Error(errorMsg || `Kriterler kaydedilemedi (${res.status})`);
          }).catch(() => {
              // JSON parse edilemezse genel hata
              throw new Error(`Kriterler kaydedilemedi (${res.status})`);
          });
      }
      return res.json();
    })
    .then(data => {
      setSuccessMessage("Kriterler başarıyla kaydedildi!");
      setCriteriaId(data.id); // Yeni veya güncellenen kriterin ID'sini al
      // Özel kriterler backend'den ID ile dönüyorsa güncellenmeli
      if (data.ozel_kriterler) {
          setCustomCriteria(data.ozel_kriterler); // Backend'den gelen güncel özel kriter listesi
      }
      setSaving(false);
    })
    .catch(err => {
      setErrorCriteria(`Kaydetme hatası: ${err.message}`);
      setSaving(false);
    });
  };


  // ────────────── BURAYA EKLEYİN ──────────────
const handleSearchJuri = async () => {
  setLoadingSearch(true);
  setErrorJuri(null);
  try {
    const data = await fetchWithAuth(
      `/api/users/?TC_KIMLIK=${searchTC}`,
      { method: 'GET', allowUnauthenticated: true }
    );
    setJuriResults(data);
  } catch (e) {
    setErrorJuri(e.message);
  } finally {
    setLoadingSearch(false);
  }
};
// ─────────────────────────────────────────────

// ────────────── BURAYA EKLEYİN ──────────────
const handleAssignJuri = async (userId) => {
  setLoadingAssign(true);
  setErrorJuri(null);
  try {
    await fetchWithAuth(
      '/api/juri-atamalar/',
      {
        method: 'POST',
        body: JSON.stringify({ ilan: Number(ilanId), juri_uyesi: userId })
      }
    );
    const updated = await fetchWithAuth(
      `/api/juri-atamalar/?ilan=${ilanId}`,
      { method: 'GET', allowUnauthenticated: true }
    );
    setAssignedJuries(updated);
  } catch (e) {
    setErrorJuri(e.message);
  } finally {
    setLoadingAssign(false);
  }
};
// ─────────────────────────────────────────────


  // Özel Kriter Ekleme
  const handleAddCustomCriterion = () => {
    if (!newCriterionName.trim()) {
      setErrorCriteria("Özel kriter adı boş olamaz.");
      return;
    }
     if (newCriterionValue === null || isNaN(newCriterionValue)) {
         setErrorCriteria("Özel kriter değeri geçerli bir sayı olmalıdır.");
         return;
     }

    setErrorCriteria(null); // Hata mesajını temizle

    // Yeni kriteri ekle (geçici ID ile)
    setCustomCriteria([
      ...customCriteria,
      // Backend ID atayana kadar geçici bir ID kullanabiliriz veya ID'siz ekleyip kayıtta gönderebiliriz
      // Backend'den ID geliyorsa kaydetme sonrası güncellenecek
      { id: `temp-${Date.now()}`, name: newCriterionName, value: newCriterionValue }
    ]);

    setNewCriterionName("");
    setNewCriterionValue(0);
  };

  // Özel Kriter Silme
  const handleRemoveCustomCriterion = (idToRemove) => {
      // Not: Eğer kriter backend'de kayıtlıysa (ID'si temp değilse),
      // sadece frontend'den silmek yerine backend'e silme isteği de gönderilebilir.
      // Şimdilik sadece frontend listesinden çıkarıyoruz. Kaydetme işlemi backend'i güncelleyecektir.
    setCustomCriteria(customCriteria.filter(criterion => criterion.id !== idToRemove));
  };

  // Geri Dönme Fonksiyonu
  const handleGoBack = () => {
    navigate('/manager-ilan'); // Veya navigate(-1) ile bir önceki sayfaya dön
  };

  // --- Render ---

  if (loadingIlan) {
    return (
      <>
        <ManagerNavbar />
        <div className="container loading">Yükleniyor...</div>
        <style>{componentStyles}</style>
      </>
    );
  }

  if (errorIlan) {
    return (
      <>
        <ManagerNavbar />
        <div className="container error-message">Hata: {errorIlan}</div>
        <button className="back-button" onClick={handleGoBack}>İlan Listesine Dön</button>
        <style>{componentStyles}</style>
      </>
    );
  }

  if (!IlanKriter) {
      return (
          <>
              <ManagerNavbar />
              <div className="container error-message">İlan bulunamadı.</div>
              <button className="back-button" onClick={handleGoBack}>İlan Listesine Dön</button>
              <style>{componentStyles}</style>
          </>
      );
  }

  return (
    <>
      <ManagerNavbar />
      <div className="container">
        {/* Sayfa Başlığı */}
        <h1 className="page-title">İlan Detayları ve Kriter Yönetimi</h1>

        {/* İlan Bilgileri Paneli */}
        <div className="selected-announcement-panel">
          <h2>{IlanKriter.baslik}</h2> {/* Backend'den gelen alana göre düzeltin */}
          <div className="announcement-details">
            {/* Backend'den gelen diğer ilan detaylarını buraya ekleyin */}
             <p><strong>Departman:</strong> {IlanKriter.departman?.ad || 'Belirtilmemiş'}</p>
             <p><strong>Kadro Tipi:</strong> {kadroTipiOptions.find(k => k.id === parseInt(IlanKriter.kadro_tipi))?.tip || 'Belirtilmemiş'}</p>
             <p><strong>Temel Alan:</strong> {temelAlanOptions.find(t => t.id === parseInt(IlanKriter.temel_alan))?.ad || 'Belirtilmemiş'}</p>
             <p><strong>Başlangıç:</strong> {IlanKriter.baslangic_tarihi || 'Belirtilmemiş'}</p>
             <p><strong>Bitiş:</strong> {IlanKriter.bitis_tarihi || 'Belirtilmemiş'}</p>
             <p><strong>Açıklama:</strong> {IlanKriter.aciklama || 'Yok'}</p>
          </div>
           <button className="back-button top-back-button" onClick={handleGoBack}>
             İlan Listesine Dön
           </button>
        </div>

        {/* Durum Mesajları */}
        {successMessage &&
          <div className="success-message">{successMessage}</div>
        }
        {errorCriteria && !successMessage && // Sadece kriter hatası varsa göster
          <div className="error-message">{errorCriteria}</div>
        }

        {/* Kriter Yönetimi Bölümü */}
        <div className="card">
          <h2 className="section-title">İlan Kriterleri</h2>

          {loadingOptions ? (
              <div className="loading-message">Seçenekler yükleniyor...</div>
          ) : (
            <div className="criteria-selection">
              <div className="form-group">
                <label htmlFor="kadroTipiSelect">Kadro Türü</label>
                <select
                  id="kadroTipiSelect"
                  className="select-input"
                  value={selectedKadroTipiId || ''}
                  onChange={(e) => setSelectedKadroTipiId(e.target.value)}
                  disabled={loadingCriteria || saving} // Seçenekler yüklendikten sonra aktif
                >
                  <option value="" disabled>-- Seçiniz --</option>
                  {kadroTipiOptions.map(option => (
                    // Backend ID'leri string ise 'option.id.toString()' kullanın
                    <option key={option.id} value={option.id}>{option.tip}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="temelAlanSelect">Temel Alan</label>
                <select
                  id="temelAlanSelect"
                  className="select-input"
                  value={selectedTemelAlanId || ''}
                  onChange={(e) => setSelectedTemelAlanId(e.target.value)}
                  disabled={loadingCriteria || saving} // Seçenekler yüklendikten sonra aktif
                >
                  <option value="" disabled>-- Seçiniz --</option>
                  {temelAlanOptions.map(option => (
                    // Backend ID'leri string ise 'option.id.toString()' kullanın
                    <option key={option.id} value={option.id}>{option.ad}</option>
                  ))}
                </select>
              </div>
            </div>
           )}

          {loadingCriteria && (
            <div className="loading-message">Kriterler yükleniyor...</div>
          )}

          {!loadingCriteria && selectedKadroTipiId && selectedTemelAlanId && (
            <>
              <h3 className="subsection-title">Minimum Kriterler</h3>
              <div className="criteria-grid">
                {/* Inputlar (AnnouncementsPage'den kopyalandı) */}
                 <div className="form-group">
                     <label>Toplam Puan</label>
                     <input type="number" className="number-input" value={minToplamPuan} onChange={(e) => setMinToplamPuan(Number(e.target.value) || 0)} disabled={saving}/>
                 </div>
                 <div className="form-group">
                     <label>Makale Sayısı</label>
                     <input type="number" className="number-input" value={minMakaleSayisi} onChange={(e) => setMinMakaleSayisi(Number(e.target.value) || 0)} disabled={saving}/>
                 </div>
                 <div className="form-group">
                     <label>Başlıca Yazar</label>
                     <input type="number" className="number-input" value={minBaslicaYazar} onChange={(e) => setMinBaslicaYazar(Number(e.target.value) || 0)} disabled={saving}/>
                 </div>
                 <div className="form-group">
                     <label>A1-A2 Makale</label>
                     <input type="number" className="number-input" value={minA1A2Makale} onChange={(e) => setMinA1A2Makale(Number(e.target.value) || 0)} disabled={saving}/>
                 </div>
                 <div className="form-group">
                     <label>A1-A4 Makale</label>
                     <input type="number" className="number-input" value={minA1A4Makale} onChange={(e) => setMinA1A4Makale(Number(e.target.value) || 0)} disabled={saving}/>
                 </div>
                 <div className="form-group">
                     <label>A1-A5 Makale</label>
                     <input type="number" className="number-input" value={minA1A5Makale} onChange={(e) => setMinA1A5Makale(Number(e.target.value) || 0)} disabled={saving}/>
                 </div>
                 <div className="form-group">
                     <label>A1-A6 Makale</label>
                     <input type="number" className="number-input" value={minA1A6Makale} onChange={(e) => setMinA1A6Makale(Number(e.target.value) || 0)} disabled={saving}/>
                 </div>
                 <div className="form-group">
                     <label>A1-A8 Makale</label>
                     <input type="number" className="number-input" value={minA1A8Makale} onChange={(e) => setMinA1A8Makale(Number(e.target.value) || 0)} disabled={saving}/>
                 </div>
                 <div className="form-group">
                     <label>Kişisel Etkinlik</label>
                     <input type="number" className="number-input" value={minKisiselEtkinlik} onChange={(e) => setMinKisiselEtkinlik(Number(e.target.value) || 0)} disabled={saving}/>
                 </div>
                 <div className="form-group">
                     <label>Karma Etkinlik</label>
                     <input type="number" className="number-input" value={minKarmaEtkinlik} onChange={(e) => setMinKarmaEtkinlik(Number(e.target.value) || 0)} disabled={saving}/>
                 </div>
                 <div className="form-group">
                     <label>Tez Danışmanlığı</label>
                     <input type="number" className="number-input" value={minTezDanismanligi} onChange={(e) => setMinTezDanismanligi(Number(e.target.value) || 0)} disabled={saving}/>
                 </div>
              </div>

              <h3 className="subsection-title">Özel Kriterler</h3>
              <div className="custom-criteria-section">
                {customCriteria.length > 0 ? (
                  <div className="custom-criteria-list">
                    {customCriteria.map((criterion) => (
                      // Backend'den gelen ID'yi kullanın (criterion.id)
                      // Backend'den ad/deger alan isimleri farklıysa düzeltin (criterion.ad, criterion.deger)
                      <div key={criterion.id || `criterion-${criterion.name}`} className="custom-criterion-item">
                        <span className="criterion-name">{criterion.name || criterion.ad}</span>
                        <span className="criterion-value">{criterion.value ?? criterion.deger}</span>
                        <button
                          className="remove-button"
                          onClick={() => handleRemoveCustomCriterion(criterion.id)}
                          disabled={saving}
                        >
                          Sil
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-criteria-message">Henüz özel kriter eklenmemiş.</p>
                )}

                <div className="add-criterion-form">
                  <input
                    type="text"
                    placeholder="Özel Kriter Adı"
                    className="text-input"
                    value={newCriterionName}
                    onChange={(e) => setNewCriterionName(e.target.value)}
                     disabled={saving}
                  />
                  <input
                    type="number"
                    placeholder="Minimum Değer"
                    className="number-input"
                    value={newCriterionValue}
                    onChange={(e) => setNewCriterionValue(Number(e.target.value) || 0)}
                     disabled={saving}
                  />
                  <button
                    className="add-button"
                    onClick={handleAddCustomCriterion}
                     disabled={saving}
                  >
                    Ekle
                  </button>
                </div>
              </div>

              <div className="form-actions">
                <button
                  className="primary-button"
                  onClick={handleSaveCriteria}
                  disabled={saving || loadingCriteria} // Kaydederken veya kriter yüklenirken deaktif
                >
                  {saving ? 'Kaydediliyor...' : (criteriaId ? 'Kriterleri Güncelle' : 'Kriterleri Kaydet')}
                </button>
              </div>

{/* --- JÜRİ ATAMA BÖLÜMÜ --- */}
<div className="card">
  <h2 className="section-title">Jüri Atama</h2>

  {/* TC Kimlik Arama */}
  <div className="form-group" style={{ display: 'flex', gap: 8 }}>
    <input
      type="text"
      placeholder="TC Kimlik No"
      value={searchTC}
      onChange={e => setSearchTC(e.target.value)}
      className="text-input"
      disabled={loadingSearch || loadingAssign}
    />
    <button
      onClick={handleSearchJuri}
      disabled={!searchTC || loadingSearch || loadingAssign}
      className="primary-button"
    >
      {loadingSearch ? 'Aranıyor…' : 'Ara'}
    </button>
  </div>
  {errorJuri && <div className="error-message">{errorJuri}</div>}

  {/* Arama Sonuçları */}
  {juriResults.length > 0 && (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {juriResults.map(user => (
        <li key={user.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span>
            {user.first_name} {user.last_name} — {user.TC_KIMLIK}
          </span>
          <button
            onClick={() => handleAssignJuri(user.id)}
            disabled={loadingAssign}
            className="add-button"
          >
            {loadingAssign ? 'Atanıyor…' : 'Ata'}
          </button>
        </li>
      ))}
    </ul>
  )}

  {/* Mevcut Atamalar */}
  <h3 className="subsection-title">Mevcut Atamalar</h3>
  {assignedJuries.length > 0 ? (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {assignedJuries.map(a => (
        <li key={a.id} style={{ marginBottom: 4 }}>
          Jüri Üyesi ID: {a.juri_uyesi} — Atama:{" "}
          {new Date(a.atama_tarihi).toLocaleString("tr-TR", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" })}
        </li>
      ))}
    </ul>
  ) : (
    <p className="info-message">Henüz atama yapılmamış.</p>
  )}
</div>
{/* --- JÜRİ ATAMA SONU --- */}


            </>
          )}

            {/* Kadro Tipi veya Temel Alan seçilmediyse mesaj */}
             {!loadingCriteria && (!selectedKadroTipiId || !selectedTemelAlanId) && (
                 <p className="info-message">Kriterleri görmek veya düzenlemek için lütfen Kadro Türü ve Temel Alan seçin.</p>
             )}
        </div>
      </div>

      {/* Stil (AnnouncementsPage'den ilgili kısımlar alındı) */}
      <style>{componentStyles}</style>
    </>
  );
};

// Stil tanımlamaları (AnnouncementsPage'deki stillerden ilgili olanlar)
const componentStyles = `
  .container {
    max-width: 900px; /* Biraz daha daraltılabilir */
    margin: 2rem auto;
    padding: 0 1rem;
    font-family: 'Roboto', sans-serif;
  }

  .page-title {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
    color: #333;
    border-bottom: 2px solid #f0f0f0;
    padding-bottom: 0.75rem;
  }

  .card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .section-title {
    font-size: 1.5rem;
    margin-bottom: 1.25rem;
    color: #333;
  }

  .subsection-title {
    font-size: 1.2rem;
    margin: 1.5rem 0 1rem;
    color: #444;
  }

  .selected-announcement-panel {
    background: #f9f9f9;
    border-radius: 8px;
    padding: 1.25rem;
    margin-bottom: 1.5rem;
    border-left: 4px solid #3498db;
    position: relative; /* Geri dön butonu için */
  }

  .selected-announcement-panel h2 {
    margin: 0 0 1rem;
    color: #333;
  }

  .announcement-details {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); /* Daha geniş alan */
    gap: 0.75rem 1.5rem; /* Yatay boşluk artırıldı */
    margin-bottom: 1rem;
  }

  .announcement-details p {
    margin: 0;
    font-size: 0.95rem;
    line-height: 1.5;
  }
  .announcement-details p strong {
      margin-right: 5px;
      color: #555;
  }

  .back-button {
      padding: 0.6rem 1.25rem;
      background: transparent;
      color: #666;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;
      text-decoration: none; /* Link gibi görünmemesi için */
      display: inline-block; /* Düzgün hizalama için */
    }
 .top-back-button {
     position: absolute;
     top: 1.25rem;
     right: 1.25rem;
 }

  .back-button:hover {
    background: #f0f0f0;
  }

  .success-message {
    background: #d4edda;
    color: #155724;
    padding: 0.75rem 1rem;
    border-radius: 4px;
    margin-bottom: 1rem;
    border: 1px solid #c3e6cb;
  }

  .error-message {
    background: #f8d7da;
    color: #721c24;
    padding: 0.75rem 1rem;
    border-radius: 4px;
    margin-bottom: 1rem;
     border: 1px solid #f5c6cb;
  }
  .info-message {
      background: #e2e3e5;
      color: #383d41;
      padding: 0.75rem 1rem;
      border-radius: 4px;
      margin-top: 1rem;
      border: 1px solid #d6d8db;
      text-align: center;
  }

  .loading-message {
    padding: 1rem;
    text-align: center;
    color: #666;
    font-style: italic;
  }

  .criteria-selection {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem; /* Boşluk artırıldı */
    margin-bottom: 1.5rem;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #555;
    font-size: 0.9rem;
  }

  .select-input, .text-input, .number-input {
    width: 100%;
    padding: 0.75rem; /* Padding artırıldı */
    border: 1px solid #ccc; /* Biraz daha belirgin sınır */
    border-radius: 4px;
    font-size: 1rem;
    box-sizing: border-box; /* Padding'in genişliği etkilememesi için */
    transition: border-color 0.2s;
  }
   .select-input:focus, .text-input:focus, .number-input:focus {
       border-color: #3498db;
       outline: none;
   }
    .select-input:disabled, .text-input:disabled, .number-input:disabled {
        background-color: #f8f9fa;
        cursor: not-allowed;
    }


  .criteria-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); /* Minimum genişlik ayarlandı */
    gap: 1rem 1.5rem; /* Sütunlar arası boşluk artırıldı */
  }

  .custom-criteria-section {
    margin: 1.5rem 0; /* Boşluklar ayarlandı */
    border-top: 1px solid #eee;
    padding-top: 1.5rem;
  }

  .custom-criteria-list {
    margin-bottom: 1.5rem; /* Boşluk artırıldı */
    display: flex;
    flex-direction: column;
    gap: 0.75rem; /* Öğeler arası boşluk */
  }

  .custom-criterion-item {
    display: flex;
    align-items: center;
    padding: 0.75rem 1rem; /* Padding artırıldı */
    background: #f9f9f9;
    border-radius: 4px;
    border: 1px solid #eee;
  }

  .criterion-name {
    flex: 1;
    font-weight: 500;
    margin-right: 1rem;
  }

  .criterion-value {
    margin: 0 1rem;
    font-weight: bold; /* Değer daha belirgin */
    color: #333;
     min-width: 40px; /* Sayıların hizalı durması için */
     text-align: right;
  }

  .add-criterion-form {
    display: flex;
    gap: 0.75rem; /* Boşluk ayarlandı */
    margin-top: 1rem;
    align-items: flex-end; /* Butonla inputları hizala */
  }

  .add-criterion-form .text-input {
    flex: 3; /* İsim alanı daha geniş */
  }

  .add-criterion-form .number-input {
    flex: 1;
  }
 .add-button, .remove-button {
     padding: 0.75rem 1rem; /* Buton padding'i inputlarla aynı */
     border: none;
     border-radius: 4px;
     font-size: 0.9rem;
     font-weight: 500;
     cursor: pointer;
     white-space: nowrap;
     transition: background-color 0.2s;
     height: fit-content; /* Inputlarla hizalamak için */
 }
  .add-button {
    background: #2ecc71;
    color: white;
  }

  .remove-button {
    background: #e74c3c;
    color: white;
    margin-left: 0.5rem; /* Değerden biraz ayır */
     padding: 0.4rem 0.8rem; /* Sil butonu biraz daha küçük */
  }

  .add-button:hover {
    background: #27ae60;
  }

  .remove-button:hover {
    background: #c0392b;
  }
   .add-button:disabled, .remove-button:disabled {
       background-color: #bdc3c7;
       cursor: not-allowed;
   }

  .no-criteria-message {
    color: #666;
    padding: 1rem;
    text-align: center;
    background: #f9f9f9;
    border-radius: 4px;
    font-style: italic;
    margin-top: 1rem;
  }

  .form-actions {
    margin-top: 2rem; /* Kaydet butonu için daha fazla boşluk */
    text-align: right;
    border-top: 1px solid #eee;
    padding-top: 1.5rem;
  }

  .primary-button {
    padding: 0.8rem 2rem; /* Daha büyük kaydet butonu */
    background: #3498db;
    color: white;
    border: none;
    border-radius: 4px;
    font-weight: 500;
    font-size: 1rem; /* Font boyutu artırıldı */
    cursor: pointer;
    transition: all 0.2s;
  }

  .primary-button:hover {
    background: #2980b9;
  }

  .primary-button:disabled {
    background: #95a5a6;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    .container {
        margin: 1rem auto;
        padding: 0 0.5rem;
    }
    .page-title {
        font-size: 1.5rem;
    }
    .selected-announcement-panel {
        padding: 1rem;
    }
    .announcement-details {
        grid-template-columns: 1fr; /* Tek sütun */
        gap: 0.5rem;
    }
    .top-back-button {
        position: static; /* Butonu akışa dahil et */
        display: block; /* Tam genişlik kaplasın */
        width: 100%;
        margin-top: 1rem;
        text-align: center;
    }
    .criteria-selection {
      grid-template-columns: 1fr; /* Tek sütun */
      gap: 1rem;
    }
    .criteria-grid {
      grid-template-columns: 1fr; /* Tek sütun */
       gap: 1rem;
    }
    .add-criterion-form {
        flex-direction: column;
        align-items: stretch; /* Öğeler tam genişlik kaplasın */
    }
     .add-criterion-form .text-input,
     .add-criterion-form .number-input,
     .add-criterion-form .add-button {
         width: 100%; /* Mobil için tam genişlik */
     }
      .form-actions {
          text-align: center; /* Kaydet butonu ortada */
      }
       .primary-button {
           width: 100%; /* Mobil için tam genişlik */
       }

  }
`;

export default IlanKriter;
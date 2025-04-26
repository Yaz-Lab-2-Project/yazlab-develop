import React, { useState, useEffect } from "react";
import ManagerNavbar from "../../components/navbars/ManagerNavbar";

// CSRF token fonksiyonu
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


const CriteriaPage = () => {
  // Dropdown seçenekleri için state'ler
  const [kadroTipiOptions, setKadroTipiOptions] = useState([]);
  const [temelAlanOptions, setTemelAlanOptions] = useState([]);

  // Seçili ID'ler için state'ler
  const [selectedKadroTipiId, setSelectedKadroTipiId] = useState('');
  const [selectedTemelAlanId, setSelectedTemelAlanId] = useState('');

  // Mevcut/Yeni kriter verisi için state'ler (backend modeline göre)
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
  // Diğer min_... alanları için de state ekleyebilirsiniz.

  // Durum state'leri
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingCriteria, setLoadingCriteria] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // 1. Dropdown seçeneklerini çekme
  useEffect(() => {
    setLoadingOptions(true);
    Promise.all([
      fetch('http://localhost:8000/api/kadro-tipi/', { credentials: 'include' }).then(res => res.ok ? res.json() : Promise.reject('Kadro tipleri alınamadı')),
      fetch('http://localhost:8000/api/temel-alan/', { credentials: 'include' }).then(res => res.ok ? res.json() : Promise.reject('Temel alanlar alınamadı'))
    ])
    .then(([kadroTipleri, temelAlanlar]) => {
      setKadroTipiOptions(kadroTipleri.results || kadroTipleri);
      setTemelAlanOptions(temelAlanlar.results || temelAlanlar);
      // Varsayılan seçimleri ayarla (isteğe bağlı)
      // if (kadroTipleri.length > 0) setSelectedKadroTipiId(kadroTipleri[0].id);
      // if (temelAlanlar.length > 0) setSelectedTemelAlanId(temelAlanlar[0].id);
    })
    .catch(err => {
      console.error("Dropdown seçenekleri çekilirken hata:", err);
      setError(typeof err === 'string' ? err : "Seçenekler yüklenirken hata oluştu.");
    })
    .finally(() => setLoadingOptions(false));
  }, []);

  // 2. Seçili Kadro & Alan değiştiğinde mevcut kriterleri çekme
  useEffect(() => {
    // Sadece her iki seçim de yapıldığında çalış
    if (selectedKadroTipiId && selectedTemelAlanId) {
      setLoadingCriteria(true);
      setError(null); // Önceki hatayı temizle
      setSuccessMessage(''); // Önceki başarı mesajını temizle
      setCriteriaId(null); // Önceki ID'yi temizle
       // Reset form fields to default/zero before fetching new criteria
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

      // Backend'in bu filtreleri desteklediğinden emin olun
      fetch(`http://localhost:8000/api/atama-kriterleri/?kadro_tipi_id=${selectedKadroTipiId}&temel_alan_id=${selectedTemelAlanId}`, { credentials: 'include' })
        .then(res => {
          if (!res.ok) throw new Error(`Kriterler alınamadı (${res.status})`);
          return res.json();
        })
        .then(data => {
          const results = data.results || data;
          if (results.length > 0) {
            // Kayıt bulundu, formu doldur
            const existingCriteria = results[0];
            console.log("Mevcut kriter bulundu:", existingCriteria);
            setCriteriaId(existingCriteria.id);
            setMinToplamPuan(existingCriteria.min_toplam_puan || 0);
            setMinMakaleSayisi(existingCriteria.min_makale_sayisi || 0);
            setMinBaslicaYazar(existingCriteria.min_baslica_yazar || 0);
            setMinA1A2Makale(existingCriteria.min_a1_a2_makale || 0);
            setMinA1A4Makale(existingCriteria.min_a1_a4_makale || 0);
            setMinA1A5Makale(existingCriteria.min_a1_a5_makale || 0);
            setMinA1A6Makale(existingCriteria.min_a1_a6_makale || 0);
            setMinA1A8Makale(existingCriteria.min_a1_a8_makale || 0);
            setMinKisiselEtkinlik(existingCriteria.min_kisisel_etkinlik || 0);
            setMinKarmaEtkinlik(existingCriteria.min_karma_etkinlik || 0);
            setMinTezDanismanligi(existingCriteria.min_tez_danismanligi || 0);
            // Diğer alanları da doldurun...
          } else {
            // Kayıt bulunamadı, ID'yi null yap (yeni kayıt olacak)
            console.log("Mevcut kriter bulunamadı, yeni kayıt oluşturulacak.");
            setCriteriaId(null);
            // Form zaten resetlenmişti
          }
        })
        .catch(err => {
          console.error("Kriterleri çekerken hata:", err);
          setError(err.message);
           setCriteriaId(null); // Hata durumunda da ID'yi null yap
        })
        .finally(() => setLoadingCriteria(false));
    } else {
         setCriteriaId(null); // Seçimlerden biri boşsa ID'yi temizle
         // İsteğe bağlı olarak formu da temizleyebilir/resetleyebilirsiniz.
    }
  }, [selectedKadroTipiId, selectedTemelAlanId]); // Seçimler değiştiğinde çalışır


  // Formu Kaydetme / Güncelleme
  const handleSave = async () => {
    if (!selectedKadroTipiId || !selectedTemelAlanId) {
      setError("Lütfen Kadro Türü ve Alan Türü seçin.");
      return;
    }

    setError(null);
    setSuccessMessage('');
    setSaving(true);

    const csrftoken = getCookie('csrftoken');
    if (!csrftoken) {
      setError("Güvenlik token'ı alınamadı.");
      setSaving(false);
      return;
    }

    // Backend'e gönderilecek veri (serializer alan adlarıyla eşleşmeli)
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
      // Diğer min_... alanları
    };

    // Mevcut kriter varsa PATCH, yoksa POST
    const method = criteriaId ? 'PATCH' : 'POST';
    const url = criteriaId
      ? `http://localhost:8000/api/atama-kriterleri/${criteriaId}/`
      : 'http://localhost:8000/api/atama-kriterleri/';

    console.log(`Kaydetme isteği: ${method} ${url}`, payload);

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const responseData = await response.json();

      if (response.ok) {
        setSuccessMessage(`Kriterler başarıyla ${criteriaId ? 'güncellendi' : 'kaydedildi'}!`);
        console.log("Kaydedilen/Güncellenen Kriter:", responseData);
        // Yeni kayıt yapıldıysa ID'yi state'e alalım
        if (!criteriaId && responseData.id) {
          setCriteriaId(responseData.id);
        }
         // Başarı durumunda formu sıfırlamak yerine mevcut değerleri tutmak daha mantıklı olabilir.
      } else {
        console.error("Kaydetme/Güncelleme hatası:", responseData);
        let errorMsg = `Hata (${response.status}): Kaydedilemedi. `;
         for (const key in responseData) { errorMsg += `${key}: ${Array.isArray(responseData[key]) ? responseData[key].join(', ') : responseData[key]} `; }
        setError(errorMsg.trim());
      }
    } catch (err) {
      console.error("Kaydetme/Güncelleme isteği sırasında hata:", err);
      setError("Kriterler kaydedilirken bir ağ hatası oluştu.");
    } finally {
      setSaving(false);
    }
  };

   // --- Stil Objeleri --- (Önceki koddan alındı)
   const styles = { /* ... önceki tüm stil tanımlarınız ... */ };


  // --- Render ---
  return (
    <>
      <ManagerNavbar />
      <div style={styles.container}>
        <h1 style={styles.title}>Kadro Atama Kriterleri Yönetimi</h1>

        <div style={styles.card}>
           {/* Hata veya Başarı Mesajları */}
           {successMessage && <div style={{ color: 'green', marginBottom: '1rem', textAlign: 'center', border:'1px solid green', padding:'0.5rem', borderRadius:'8px' }}>{successMessage}</div>}
           {error && !successMessage && <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center', border:'1px solid red', padding:'0.5rem', borderRadius:'8px' }}>{error}</div>}


          {/* Seçim Alanları */}
          <div style={styles.gridColumns}>
            <div>
              <label style={styles.label} htmlFor="kadroTipiSelect">Kadro Türü</label>
              <select
                id="kadroTipiSelect"
                value={selectedKadroTipiId || ''}
                onChange={(e) => setSelectedKadroTipiId(e.target.value)}
                style={styles.select}
                disabled={loadingOptions || loadingCriteria || saving}
              >
                 <option value="" disabled>-- Seçiniz --</option>
                 {kadroTipiOptions.map(option => (
                     <option key={option.id} value={option.id}>{option.tip}</option> // Alan adı 'tip' varsayıldı
                 ))}
              </select>
            </div>
            <div>
              <label style={styles.label} htmlFor="temelAlanSelect">Temel Alan</label>
              <select
                id="temelAlanSelect"
                value={selectedTemelAlanId || ''}
                onChange={(e) => setSelectedTemelAlanId(e.target.value)}
                style={styles.select}
                disabled={loadingOptions || loadingCriteria || saving}
              >
                 <option value="" disabled>-- Seçiniz --</option>
                  {temelAlanOptions.map(option => (
                     <option key={option.id} value={option.id}>{option.ad}</option> // Alan adı 'ad' varsayıldı
                 ))}
              </select>
            </div>
          </div>

          {/* Kriterler Yükleniyor Mesajı */}
          {loadingCriteria && <div style={styles.info}>Seçili kriteler yükleniyor...</div>}


          {/* Kriter Form Alanları (Seçim yapıldıktan sonra gösterilebilir) */}
          {(selectedKadroTipiId && selectedTemelAlanId && !loadingCriteria) && (
              <>
                <h2 style={{...styles.sectionTitle, marginTop:'2rem'}}>Minimum Kriterler</h2>
                 {/* Burası backend modelindeki tüm min_* alanları için genişletilmeli */}
                 <div style={{...styles.gridColumns, gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))'}}> {/* Daha fazla alan için grid */}
                    <div>
                         <label style={styles.label}>Toplam Puan</label>
                         <input type="number" style={styles.input} value={minToplamPuan} onChange={(e) => setMinToplamPuan(Number(e.target.value) || 0)} disabled={saving}/>
                    </div>
                     <div>
                         <label style={styles.label}>Makale Sayısı</label>
                         <input type="number" style={styles.input} value={minMakaleSayisi} onChange={(e) => setMinMakaleSayisi(Number(e.target.value) || 0)} disabled={saving}/>
                    </div>
                     <div>
                         <label style={styles.label}>Başlıca Yazar</label>
                         <input type="number" style={styles.input} value={minBaslicaYazar} onChange={(e) => setMinBaslicaYazar(Number(e.target.value) || 0)} disabled={saving}/>
                    </div>
                     <div>
                         <label style={styles.label}>A1-A2 Makale</label>
                         <input type="number" style={styles.input} value={minA1A2Makale} onChange={(e) => setMinA1A2Makale(Number(e.target.value) || 0)} disabled={saving}/>
                    </div>
                     <div>
                         <label style={styles.label}>A1-A4 Makale</label>
                         <input type="number" style={styles.input} value={minA1A4Makale} onChange={(e) => setMinA1A4Makale(Number(e.target.value) || 0)} disabled={saving}/>
                    </div>
                     <div>
                         <label style={styles.label}>A1-A5 Makale</label>
                         <input type="number" style={styles.input} value={minA1A5Makale} onChange={(e) => setMinA1A5Makale(Number(e.target.value) || 0)} disabled={saving}/>
                    </div>
                     <div>
                         <label style={styles.label}>A1-A6 Makale</label>
                         <input type="number" style={styles.input} value={minA1A6Makale} onChange={(e) => setMinA1A6Makale(Number(e.target.value) || 0)} disabled={saving}/>
                    </div>
                     <div>
                         <label style={styles.label}>A1-A8 Makale</label>
                         <input type="number" style={styles.input} value={minA1A8Makale} onChange={(e) => setMinA1A8Makale(Number(e.target.value) || 0)} disabled={saving}/>
                    </div>
                     <div>
                         <label style={styles.label}>Kişisel Etkinlik</label>
                         <input type="number" style={styles.input} value={minKisiselEtkinlik} onChange={(e) => setMinKisiselEtkinlik(Number(e.target.value) || 0)} disabled={saving}/>
                    </div>
                     <div>
                         <label style={styles.label}>Karma Etkinlik</label>
                         <input type="number" style={styles.input} value={minKarmaEtkinlik} onChange={(e) => setMinKarmaEtkinlik(Number(e.target.value) || 0)} disabled={saving}/>
                    </div>
                     <div>
                         <label style={styles.label}>Tez Danışmanlığı</label>
                         <input type="number" style={styles.input} value={minTezDanismanligi} onChange={(e) => setMinTezDanismanligi(Number(e.target.value) || 0)} disabled={saving}/>
                    </div>
                    {/* Diğer min_* alanları için inputları buraya ekleyin */}
                </div>

                {/* Kaydet Butonu */}
                <div style={{ textAlign: "right", marginTop:'2rem' }}>
                  <button onClick={handleSave} style={styles.saveButton} disabled={saving}>
                    {saving ? 'Kaydediliyor...' : (criteriaId ? 'Kriterleri Güncelle' : 'Yeni Kriter Kaydet')}
                  </button>
                </div>
              </>
          )}

           {/* Dinamik yayın kategorileri bölümü kaldırıldı */}
           {/* Önizleme bölümü kaldırıldı */}

        </div>
      </div>
    </>
  );
};

export default CriteriaPage;
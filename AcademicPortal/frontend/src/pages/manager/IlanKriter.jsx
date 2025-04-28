import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ManagerNavbar from "../../components/navbars/ManagerNavbar";
import api from '../../services/api';

const IlanKriter = () => {
  const { id: ilanId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('criteria');
  const [searchTC, setSearchTC] = useState('');
  const [juriResults, setJuriResults] = useState([]);
  const [assignedJuries, setAssignedJuries] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingAssign, setLoadingAssign] = useState(false);
  const [errorJuri, setErrorJuri] = useState(null);
  const [IlanKriter, setIlanKriter] = useState(null);
  const [loadingIlan, setLoadingIlan] = useState(true);
  const [errorIlan, setErrorIlan] = useState(null);
  const [kadroTipiOptions, setKadroTipiOptions] = useState([]);
  const [temelAlanOptions, setTemelAlanOptions] = useState([]);
  const [departmanOptions, setDepartmanOptions] = useState([]);
  const [selectedKadroTipiId, setSelectedKadroTipiId] = useState('');
  const [selectedTemelAlanId, setSelectedTemelAlanId] = useState('');
  const [criteriaId, setCriteriaId] = useState(null);
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
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingCriteria, setLoadingCriteria] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorCriteria, setErrorCriteria] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    setLoadingIlan(true);
    setErrorIlan(null);
    api.get(`/ilanlar/${ilanId}/`)
      .then(res => {
        setIlanKriter(res.data);
        if (res.data.kadro_tipi) setSelectedKadroTipiId(res.data.kadro_tipi.toString());
        if (res.data.temel_alan) setSelectedTemelAlanId(res.data.temel_alan.toString());
      })
      .catch(err => setErrorIlan(err.message))
      .finally(() => setLoadingIlan(false));
  }, [ilanId]);

  useEffect(() => {
    setLoadingOptions(true);
    Promise.all([
      api.get('/kadro-tipi/'),
      api.get('/temel-alan/'),
      api.get('/departmanlar/')
    ])
      .then(([kadroTipiRes, temelAlanRes, departmanRes]) => {
        setKadroTipiOptions(Array.isArray(kadroTipiRes.data.results) ? kadroTipiRes.data.results : 
                           Array.isArray(kadroTipiRes.data) ? kadroTipiRes.data : []);
        setTemelAlanOptions(Array.isArray(temelAlanRes.data.results) ? temelAlanRes.data.results : 
                           Array.isArray(temelAlanRes.data) ? temelAlanRes.data : []);
        setDepartmanOptions(Array.isArray(departmanRes.data.results) ? departmanRes.data.results : 
                           Array.isArray(departmanRes.data) ? departmanRes.data : []);
      })
      .catch(err => setErrorCriteria(err.message))
      .finally(() => setLoadingOptions(false));
  }, []);

  useEffect(() => {
    if (ilanId) {
      api.get(`/juri-atamalar/?ilan=${ilanId}`)
        .then(async (res) => {
          const ilanJurileri = res.data.filter(juri => juri.ilan === parseInt(ilanId));
          // Her bir jüri için detaylı bilgileri al
          const juriPromises = ilanJurileri.map(juri => 
            api.get(`/users/${juri.juri_uyesi}/`).then(userRes => ({
              ...juri,
              juri_uyesi: userRes.data
            }))
          );
          const detayliJuriler = await Promise.all(juriPromises);
          setAssignedJuries(detayliJuriler);
        })
        .catch(e => setErrorJuri(e.message));
    }
  }, [ilanId]);

  useEffect(() => {
    if (selectedKadroTipiId && selectedTemelAlanId) {
      setLoadingCriteria(true);
      setErrorCriteria(null);
      setSuccessMessage('');
      setCriteriaId(null);
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
      api.get(`/atama-kriterleri/?kadro_tipi=${selectedKadroTipiId}&temel_alan=${selectedTemelAlanId}`)
        .then(res => {
          const data = res.data;
          if (data && data.length > 0) {
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
          } else {
            setCriteriaId(null);
          }
        })
        .catch(err => setErrorCriteria(err.message))
        .finally(() => setLoadingCriteria(false));
    } else {
      setCriteriaId(null);
    }
  }, [selectedKadroTipiId, selectedTemelAlanId]);

  const handleSaveCriteria = async () => {
    setSaving(true);
    setErrorCriteria(null);
    setSuccessMessage('');
    const criteriaData = {
      temel_alan: selectedTemelAlanId,
      kadro_tipi: selectedKadroTipiId,
      min_toplam_puan: minToplamPuan,
      min_makale_sayisi: minMakaleSayisi,
      min_baslica_yazar: minBaslicaYazar,
      min_a1a2_makale: minA1A2Makale,
      min_a1a4_makale: minA1A4Makale,
      min_a1a5_makale: minA1A5Makale,
      min_a1a6_makale: minA1A6Makale,
      min_a1a8_makale: minA1A8Makale,
      min_kisisel_etkinlik: minKisiselEtkinlik,
      min_karma_etkinlik: minKarmaEtkinlik,
      min_tez_danismanligi: minTezDanismanligi,
    };
    try {
      const resCheck = await api.get(`/atama-kriterleri/?kadro_tipi=${selectedKadroTipiId}&temel_alan=${selectedTemelAlanId}`);
      const existing = resCheck.data && resCheck.data.length > 0 ? resCheck.data[0] : null;
      if (existing && (!criteriaId || existing.id !== criteriaId)) {
        setErrorCriteria('Bu temel alan ve kadro tipi kombinasyonu için zaten bir kriter mevcut.');
        setSaving(false);
        return;
      }
      if (criteriaId) {
        await api.put(`/atama-kriterleri/${criteriaId}/`, criteriaData);
        setSuccessMessage('Kriterler başarıyla güncellendi');
      } else {
        const res = await api.post('/atama-kriterleri/', criteriaData);
        setSuccessMessage('Kriterler başarıyla kaydedildi');
        setCriteriaId(res.data.id);
      }
    } catch (error) {
      setErrorCriteria(error.response?.data?.non_field_errors?.join(' ') || error.message || 'Kriterler kaydedilirken bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleSearchJuri = async () => {
    setLoadingSearch(true);
    setErrorJuri(null);
    try {
      const res = await api.get(`/users/?TC_KIMLIK=${searchTC}`);
      setJuriResults(res.data.results || res.data);
    } catch (e) {
      setErrorJuri(e.message);
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleAssignJuri = async (userId) => {
    setLoadingAssign(true);
    setErrorJuri(null);
    try {
      await api.post('/juri-atamalar/', { ilan: Number(ilanId), juri_uyesi: userId });
      const updated = await api.get(`/juri-atamalar/?ilan=${ilanId}`);
      const ilanJurileri = updated.data.filter(juri => juri.ilan === parseInt(ilanId));
      // Her bir jüri için detaylı bilgileri al
      const juriPromises = ilanJurileri.map(juri => 
        api.get(`/users/${juri.juri_uyesi}/`).then(userRes => ({
          ...juri,
          juri_uyesi: userRes.data
        }))
      );
      const detayliJuriler = await Promise.all(juriPromises);
      setAssignedJuries(detayliJuriler);
    } catch (e) {
      setErrorJuri(e.message);
    } finally {
      setLoadingAssign(false);
    }
  };

  const handleRemoveJuri = async (atamaId) => {
    setLoadingAssign(true);
    setErrorJuri(null);
    try {
      await api.delete(`/juri-atamalar/${atamaId}/`);
      const updated = await api.get(`/juri-atamalar/?ilan=${ilanId}`);
      const ilanJurileri = updated.data.filter(juri => juri.ilan === parseInt(ilanId));
      // Her bir jüri için detaylı bilgileri al
      const juriPromises = ilanJurileri.map(juri => 
        api.get(`/users/${juri.juri_uyesi}/`).then(userRes => ({
          ...juri,
          juri_uyesi: userRes.data
        }))
      );
      const detayliJuriler = await Promise.all(juriPromises);
      setAssignedJuries(detayliJuriler);
    } catch (e) {
      setErrorJuri(e.message);
    } finally {
      setLoadingAssign(false);
    }
  };

  const handleGoBack = () => {
    navigate('/manager-ilan');
  };

  if (loadingIlan) {
    return (
      <>
        <ManagerNavbar />
        <div className="container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Yükleniyor...</p>
          </div>
        </div>
        <style>{componentStyles}</style>
      </>
    );
  }

  if (errorIlan) {
    return (
      <>
        <ManagerNavbar />
        <div className="container">
          <div className="error-container">
            <p className="error-message">Hata: {errorIlan}</p>
            <button className="back-button" onClick={handleGoBack}>İlan Listesine Dön</button>
          </div>
        </div>
        <style>{componentStyles}</style>
      </>
    );
  }

  if (!IlanKriter) {
    return (
      <>
        <ManagerNavbar />
        <div className="container">
          <div className="error-container">
            <p className="error-message">İlan bulunamadı.</p>
            <button className="back-button" onClick={handleGoBack}>İlan Listesine Dön</button>
          </div>
        </div>
        <style>{componentStyles}</style>
      </>
    );
  }

  return (
    <>
      <ManagerNavbar />
      <div className="container">
        <h1 className="page-title">İlan Detayları ve Kriter Yönetimi</h1>

        <div className="selected-announcement-panel">
          <h2>{IlanKriter?.baslik}</h2>
          <div className="announcement-details">
            <p><strong>Departman:</strong> {Array.isArray(departmanOptions) && departmanOptions.find(d => d.id === parseInt(IlanKriter?.departman))?.ad || 'Belirtilmemiş'}</p>
            <p><strong>Kadro Tipi:</strong> {Array.isArray(kadroTipiOptions) && kadroTipiOptions.find(k => k.id === parseInt(IlanKriter?.kadro_tipi))?.tip || 'Belirtilmemiş'}</p>
            <p><strong>Temel Alan:</strong> {Array.isArray(temelAlanOptions) && temelAlanOptions.find(t => t.id === parseInt(IlanKriter?.temel_alan))?.ad || 'Belirtilmemiş'}</p>
            <p><strong>Başlangıç:</strong> {IlanKriter?.baslangic_tarihi || 'Belirtilmemiş'}</p>
            <p><strong>Bitiş:</strong> {IlanKriter?.bitis_tarihi || 'Belirtilmemiş'}</p>
            <p><strong>Açıklama:</strong> {IlanKriter?.aciklama || 'Yok'}</p>
          </div>
          <button className="back-button top-back-button" onClick={handleGoBack}>
            İlan Listesine Dön
          </button>
        </div>

        <div className="tab-navigation">
          <button 
            className={`tab-button ${activeTab === 'criteria' ? 'active' : ''}`}
            onClick={() => setActiveTab('criteria')}
          >
            İlan Kriter Düzenlemesi
          </button>
          <button 
            className={`tab-button ${activeTab === 'jury' ? 'active' : ''}`}
            onClick={() => setActiveTab('jury')}
          >
            Jüri Atama
          </button>
        </div>

        {successMessage &&
          <div className="success-message">{successMessage}</div>
        }
        {errorCriteria && !successMessage &&
          <div className="error-message">{errorCriteria}</div>
        }

        {activeTab === 'criteria' && (
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
                    disabled={loadingCriteria || saving}
                  >
                    <option value="" disabled>-- Seçiniz --</option>
                    {kadroTipiOptions.map(option => (
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
                    disabled={loadingCriteria || saving}
                  >
                    <option value="" disabled>-- Seçiniz --</option>
                    {temelAlanOptions.map(option => (
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

                <div className="form-actions">
                  <button
                    className="primary-button"
                    onClick={handleSaveCriteria}
                    disabled={saving || loadingCriteria}
                  >
                    {saving ? 'Kaydediliyor...' : (criteriaId ? 'Kriterleri Güncelle' : 'Kriterleri Kaydet')}
                  </button>
                </div>
              </>
            )}

            {!loadingCriteria && (!selectedKadroTipiId || !selectedTemelAlanId) && (
                 <p className="info-message">Kriterleri görmek veya düzenlemek için lütfen Kadro Türü ve Temel Alan seçin.</p>
             )}
          </div>
        )}

        {activeTab === 'jury' && (
          <div className="card jury-card">
            <h2 className="section-title">Jüri Atama</h2>
            <div className="jury-section">
              <div className="jury-search-bar">
                <input
                  type="text"
                  placeholder="TC Kimlik No ile jüri ara..."
                  value={searchTC}
                  onChange={e => setSearchTC(e.target.value)}
                  className="jury-search-input"
                  disabled={loadingSearch || loadingAssign}
                />
                <button
                  onClick={handleSearchJuri}
                  disabled={!searchTC || loadingSearch || loadingAssign}
                  className="jury-search-btn"
                >
                  {loadingSearch ? <span className="spinner"></span> : "Ara"}
                </button>
              </div>

              {errorJuri && <div className="jury-error">{errorJuri}</div>}
              
              {juriResults.length > 0 && (
                <div className="jury-results">
                  {juriResults.map(user => (
                    <div key={user.id} className="jury-card-result">
                      <div className="jury-info">
                        <div className="jury-name">{user.first_name} {user.last_name}</div>
                        <div className="jury-tc">TC: {user.TC_KIMLIK}</div>
                      </div>
                      <button
                        onClick={() => handleAssignJuri(user.id)}
                        disabled={loadingAssign || assignedJuries.some(j => j.juri_uyesi?.id === user.id)}
                        className="jury-assign-btn"
                      >
                        {assignedJuries.some(j => j.juri_uyesi?.id === user.id) ? 'Atanmış' : 'Ata'}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <h3 className="assigned-title">Atanan Jüri Üyeleri</h3>
              <div className="jury-assigned-list">
                {assignedJuries.length > 0 ? assignedJuries.map(a => (
                  <div key={a.id} className="jury-card assigned">
                    <div className="assigned-info">
                      <div className="jury-name">{a.juri_uyesi?.first_name} {a.juri_uyesi?.last_name}</div>
                      <div className="jury-tc">TC: {a.juri_uyesi?.TC_KIMLIK}</div>
                      <div className="assignment-date">
                        Atama Tarihi: {new Date(a.atama_tarihi).toLocaleDateString('tr-TR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    <button
                      className="jury-remove-btn"
                      onClick={() => handleRemoveJuri(a.id)}
                      disabled={loadingAssign}
                    >
                      Kaldır
                    </button>
                  </div>
                )) : <div className="no-assignments">Henüz jüri ataması yapılmamış.</div>}
              </div>
            </div>
            <style>{`
              .jury-section { 
                margin-bottom: 2rem; 
              }
              .jury-search-bar { 
                display: flex; 
                gap: 0.5rem; 
                margin-bottom: 1.5rem;
                max-width: 600px;
                margin: 0 auto 2rem auto;
              }
              .jury-search-input { 
                flex: 1; 
                padding: 0.75rem 1rem; 
                border-radius: 8px; 
                border: 1px solid #e0e0e0; 
                font-size: 1rem;
                transition: all 0.2s;
              }
              .jury-search-input:focus {
                border-color: #3498db;
                box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.1);
                outline: none;
              }
              .jury-search-btn { 
                background: #3498db; 
                color: #fff; 
                border: none; 
                border-radius: 8px; 
                padding: 0.75rem 1.25rem; 
                font-weight: 500; 
                cursor: pointer; 
                transition: all 0.2s;
                font-size: 0.9rem;
                white-space: nowrap;
              }
              .jury-search-btn:hover:not(:disabled) { 
                background: #2980b9; 
                transform: translateY(-1px);
              }
              .jury-search-btn:disabled { 
                background: #bdc3c7; 
                cursor: not-allowed; 
              }
              .jury-error { 
                color: #dc3545; 
                background: #f8d7da; 
                padding: 0.75rem; 
                border-radius: 8px; 
                margin-bottom: 1rem;
                border: 1px solid #f5c6cb;
                text-align: center;
                max-width: 600px;
                margin: 0 auto 1rem auto;
              }
              .jury-results { 
                display: grid; 
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); 
                gap: 1rem; 
                margin-bottom: 2rem;
                max-width: 1000px;
                margin: 0 auto 2rem auto;
              }
              .jury-card-result { 
                background: #fff; 
                border-radius: 12px; 
                padding: 1.25rem; 
                box-shadow: 0 2px 8px rgba(0,0,0,0.08); 
                display: flex; 
                align-items: center; 
                justify-content: space-between;
                border: 1px solid #e9ecef;
                transition: all 0.2s;
              }
              .jury-card-result:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.12);
              }
              .jury-info {
                display: flex;
                flex-direction: column;
                gap: 0.25rem;
              }
              .jury-name {
                font-weight: 600;
                color: #2c3e50;
                font-size: 1.1rem;
              }
              .jury-tc {
                color: #7f8c8d;
                font-size: 0.9rem;
              }
              .jury-assign-btn { 
                background: #2ecc71; 
                color: #fff; 
                border: none; 
                border-radius: 6px; 
                padding: 0.5rem 1rem; 
                font-weight: 500; 
                cursor: pointer; 
                transition: all 0.2s;
                font-size: 0.9rem;
              }
              .jury-assign-btn:hover:not(:disabled) { 
                background: #27ae60; 
                transform: translateY(-1px);
              }
              .jury-assign-btn:disabled { 
                background: #bdc3c7; 
                cursor: not-allowed; 
              }
              .assigned-title {
                color: #2c3e50;
                margin: 2rem 0 1rem;
                font-size: 1.3rem;
                font-weight: 600;
                text-align: center;
              }
              .jury-assigned-list { 
                display: grid; 
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); 
                gap: 1rem;
                max-width: 1000px;
                margin: 0 auto;
              }
              .jury-card.assigned { 
                background: #fff; 
                border-radius: 12px; 
                padding: 1.25rem; 
                box-shadow: 0 2px 8px rgba(0,0,0,0.08); 
                display: flex; 
                align-items: center; 
                justify-content: space-between;
                border: 1px solid #e9ecef;
                transition: all 0.2s;
              }
              .jury-card.assigned:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.12);
              }
              .assigned-info {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
              }
              .assignment-date {
                color: #7f8c8d;
                font-size: 0.85rem;
                font-style: italic;
              }
              .jury-remove-btn { 
                background: #e74c3c; 
                color: #fff; 
                border: none; 
                border-radius: 6px; 
                padding: 0.5rem 1rem; 
                font-weight: 500; 
                cursor: pointer; 
                transition: all 0.2s;
                font-size: 0.9rem;
              }
              .jury-remove-btn:hover:not(:disabled) { 
                background: #c0392b; 
                transform: translateY(-1px);
              }
              .jury-remove-btn:disabled { 
                background: #bdc3c7; 
                cursor: not-allowed; 
              }
              .no-assignments {
                grid-column: 1 / -1;
                text-align: center;
                padding: 2rem;
                background: #f8f9fa;
                border-radius: 8px;
                color: #6c757d;
                font-style: italic;
                border: 1px dashed #dee2e6;
              }
              @media (max-width: 768px) {
                .jury-results, .jury-assigned-list {
                  grid-template-columns: 1fr;
                }
                .jury-search-bar {
                  flex-direction: column;
                  padding: 0 1rem;
                }
                .jury-search-btn {
                  width: 100%;
                }
              }
            `}</style>
          </div>
        )}
      </div>

      <style>{`
        ${componentStyles}
        
        .tab-navigation {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
          border-bottom: 2px solid #eee;
          padding-bottom: 0.5rem;
        }

        .tab-button {
          padding: 0.75rem 1.5rem;
          border: none;
          background: none;
          color: #666;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border-radius: 4px;
        }

        .tab-button:hover {
          background: #f0f0f0;
        }

        .tab-button.active {
          background: #3498db;
          color: white;
        }

        @media (max-width: 768px) {
          .tab-navigation {
            flex-direction: column;
            gap: 0.5rem;
          }

          .tab-button {
            width: 100%;
            text-align: center;
          }
        }

        .jury-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          padding: 2rem;
          margin-bottom: 2rem;
        }
        
        .jury-search-container {
          margin-bottom: 2rem;
        }
        
        .search-box {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        
        .search-input {
          flex: 1;
          padding: 0.875rem 1.25rem;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.2s;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
        }
        
        .search-input:focus {
          border-color: #3498db;
          box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
          outline: none;
        }
        
        .search-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.875rem 1.5rem;
          background: #3498db;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          min-width: 120px;
        }
        
        .search-button:hover:not(:disabled) {
          background: #2980b9;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        .search-button:disabled {
          background: #bdc3c7;
          cursor: not-allowed;
        }
        
        .search-icon {
          font-size: 1.1rem;
        }
        
        .loading-spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s ease-in-out infinite;
        }
        
        .loading-spinner.small {
          width: 12px;
          height: 12px;
          border-width: 1.5px;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .search-results {
          margin-bottom: 2rem;
        }
        
        .results-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .result-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.25rem;
          background: #f8f9fa;
          border-radius: 8px;
          border: 1px solid #e9ecef;
          transition: all 0.2s;
        }
        
        .result-item:hover {
          background: #f1f3f5;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
        }
        
        .user-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        
        .user-name {
          font-weight: 500;
          color: #333;
        }
        
        .user-tc {
          font-size: 0.85rem;
          color: #666;
        }
        
        .assign-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.6rem 1.25rem;
          background: #2ecc71;
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .assign-button:hover:not(:disabled) {
          background: #27ae60;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        .assign-button:disabled {
          background: #bdc3c7;
          cursor: not-allowed;
        }
        
        .assign-icon {
          font-size: 1rem;
        }
        
        .assigned-juries {
          margin-top: 2rem;
        }
        
        .assigned-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .assigned-item {
          padding: 1rem 1.25rem;
          background: #f8f9fa;
          border-radius: 8px;
          border: 1px solid #e9ecef;
          transition: all 0.2s;
        }
        
        .assigned-item:hover {
          background: #f1f3f5;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
        }
        
        .assigned-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        
        .assigned-id {
          font-weight: 500;
          color: #333;
        }
        
        .assigned-date {
          font-size: 0.85rem;
          color: #666;
        }
        
        .no-assignments {
          padding: 2rem;
          text-align: center;
          background: #f8f9fa;
          border-radius: 8px;
          border: 1px dashed #dee2e6;
          color: #6c757d;
          font-style: italic;
        }
        
        @media (max-width: 768px) {
          .jury-card {
            padding: 1.5rem;
          }
          
          .search-box {
            flex-direction: column;
          }
          
          .search-button {
            width: 100%;
          }
          
          .result-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          
          .assign-button {
            width: 100%;
          }
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          gap: 1rem;
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #3498db;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          gap: 1.5rem;
        }

        .error-message {
          font-size: 1.2rem;
          color: #721c24;
          text-align: center;
        }
      `}</style>
    </>
  );
};

const componentStyles = `
  .container {
    max-width: 1200px;
    margin: 2rem auto;
    padding: 0 1rem;
    font-family: 'Roboto', sans-serif;
  }

  .page-title {
    font-size: 2rem;
    margin-bottom: 2rem;
    color: #2c3e50;
    border-bottom: 2px solid #f0f0f0;
    padding-bottom: 1rem;
  }

  .card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    padding: 2rem;
    margin-bottom: 2rem;
  }

  .section-title {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
    color: #2c3e50;
  }

  .subsection-title {
    font-size: 1.2rem;
    margin: 1.5rem 0 1rem;
    color: #34495e;
  }

  .selected-announcement-panel {
    background: #f8f9fa;
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    border-left: 4px solid #3498db;
    position: relative;
  }

  .selected-announcement-panel h2 {
    margin: 0 0 1rem;
    color: #333;
  }

  .announcement-details {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem 2rem;
    margin-bottom: 1.5rem;
  }

  .announcement-details p {
    margin: 0;
    font-size: 1rem;
    line-height: 1.6;
  }

  .announcement-details p strong {
    margin-right: 8px;
    color: #2c3e50;
  }

  .back-button {
    padding: 0.75rem 1.5rem;
    background: transparent;
    color: #666;
    border: 1px solid #ddd;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s;
    text-decoration: none;
    display: inline-block;
  }

  .top-back-button {
    position: absolute;
    top: 1.5rem;
    right: 1.5rem;
  }

  .back-button:hover {
    background: #f0f0f0;
    transform: translateY(-1px);
  }

  .success-message {
    background: #d4edda;
    color: #155724;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
    border: 1px solid #c3e6cb;
  }

  .error-message {
    background: #f8d7da;
    color: #721c24;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
    border: 1px solid #f5c6cb;
  }

  .info-message {
    background: #e2e3e5;
    color: #383d41;
    padding: 1rem;
    border-radius: 8px;
    margin-top: 1.5rem;
    border: 1px solid #d6d8db;
    text-align: center;
  }

  .loading-message {
    padding: 1.5rem;
    text-align: center;
    color: #666;
    font-style: italic;
  }

  .criteria-selection {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-bottom: 2rem;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  .form-group label {
    display: block;
    margin-bottom: 0.75rem;
    font-weight: 500;
    color: #2c3e50;
    font-size: 1rem;
  }

  .select-input, .text-input, .number-input {
    width: 100%;
    padding: 0.875rem 1rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
    box-sizing: border-box;
    transition: all 0.2s;
  }

  .select-input:focus, .text-input:focus, .number-input:focus {
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
    outline: none;
  }

  .select-input:disabled, .text-input:disabled, .number-input:disabled {
    background-color: #f8f9fa;
    cursor: not-allowed;
  }

  .criteria-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem 2rem;
  }

  .form-actions {
    margin-top: 2.5rem;
    text-align: right;
    border-top: 1px solid #eee;
    padding-top: 2rem;
  }

  .primary-button {
    padding: 1rem 2.5rem;
    background: #3498db;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    font-size: 1.1rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .primary-button:hover {
    background: #2980b9;
    transform: translateY(-1px);
  }

  .primary-button:disabled {
    background: #95a5a6;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    .container {
      margin: 1rem auto;
      padding: 0 1rem;
    }

    .page-title {
      font-size: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .card {
      padding: 1.5rem;
    }

    .selected-announcement-panel {
      padding: 1.25rem;
    }

    .announcement-details {
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .top-back-button {
      position: static;
      display: block;
      width: 100%;
      margin-top: 1rem;
      text-align: center;
    }

    .criteria-selection {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }

    .criteria-grid {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }

    .form-actions {
      text-align: center;
    }

    .primary-button {
      width: 100%;
    }
  }
`;

export default IlanKriter;
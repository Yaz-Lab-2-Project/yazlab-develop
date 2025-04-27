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
  const [customCriteria, setCustomCriteria] = useState([]);
  const [newCriterionName, setNewCriterionName] = useState("");
  const [newCriterionValue, setNewCriterionValue] = useState(0);
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
      api.get('/temel-alan/')
    ])
      .then(([kadroTipiRes, temelAlanRes]) => {
        setKadroTipiOptions(kadroTipiRes.data.results || kadroTipiRes.data);
        setTemelAlanOptions(temelAlanRes.data.results || temelAlanRes.data);
      })
      .catch(err => setErrorCriteria(err.message))
      .finally(() => setLoadingOptions(false));
  }, []);

  useEffect(() => {
    api.get(`/juri-atamalar/?ilan=${ilanId}`)
      .then(res => setAssignedJuries(res.data))
      .catch(e => setErrorJuri(e.message));
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
      setCustomCriteria([]);
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
            try {
              setCustomCriteria(kriter.ozel_kriterler || []);
            } catch {
              setCustomCriteria([]);
            }
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
      ozel_kriterler: customCriteria
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
      setAssignedJuries(updated.data);
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
      setAssignedJuries(updated.data);
    } catch (e) {
      setErrorJuri(e.message);
    } finally {
      setLoadingAssign(false);
    }
  };

  const handleAddCustomCriterion = () => {
    if (!newCriterionName.trim()) {
      setErrorCriteria("Özel kriter adı boş olamaz.");
      return;
    }
    if (newCriterionValue === null || isNaN(newCriterionValue)) {
      setErrorCriteria("Özel kriter değeri geçerli bir sayı olmalıdır.");
      return;
    }
    setErrorCriteria(null);
    setCustomCriteria([
      ...customCriteria,
      { id: `temp-${Date.now()}`, name: newCriterionName, value: newCriterionValue }
    ]);
    setNewCriterionName("");
    setNewCriterionValue(0);
  };

  const handleRemoveCustomCriterion = (idToRemove) => {
    setCustomCriteria(customCriteria.filter(criterion => criterion.id !== idToRemove));
  };

  const handleGoBack = () => {
    navigate('/manager-ilan');
  };

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
        <h1 className="page-title">İlan Detayları ve Kriter Yönetimi</h1>

        <div className="selected-announcement-panel">
          <h2>{IlanKriter.baslik}</h2>
          <div className="announcement-details">
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

                <h3 className="subsection-title">Özel Kriterler</h3>
                <div className="custom-criteria-section">
                  {customCriteria.length > 0 ? (
                    <div className="custom-criteria-list">
                      {customCriteria.map((criterion) => (
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
                      <div>
                        <strong>{user.first_name} {user.last_name}</strong>
                        <div>TC: {user.TC_KIMLIK}</div>
                      </div>
                      <button
                        onClick={() => handleAssignJuri(user.id)}
                        disabled={loadingAssign}
                        className="jury-assign-btn"
                      >
                        Ata
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <h3>Atanan Jüri Üyeleri</h3>
              <div className="jury-assigned-list">
                {assignedJuries.length > 0 ? assignedJuries.map(a => (
                  <div key={a.id} className="jury-card assigned">
                    <div>
                      <strong>ID: {a.juri_uyesi}</strong>
                      <div>Atama: {new Date(a.atama_tarihi).toLocaleString("tr-TR")}</div>
                    </div>
                    <button
                      className="jury-remove-btn"
                      onClick={() => handleRemoveJuri(a.id)}
                      disabled={loadingAssign}
                    >
                      Kaldır
                    </button>
                  </div>
                )) : <div>Henüz jüri ataması yapılmamış.</div>}
              </div>
            </div>
            <style>{`
              .jury-section { margin-bottom: 2rem; }
              .jury-search-bar { display: flex; gap: 1rem; margin-bottom: 1rem; }
              .jury-search-input { flex: 1; padding: 0.75rem; border-radius: 8px; border: 1px solid #ccc; font-size: 1rem; }
              .jury-search-btn { background: #3498db; color: #fff; border: none; border-radius: 8px; padding: 0.75rem 1.5rem; font-weight: 500; cursor: pointer; transition: background 0.2s; }
              .jury-search-btn:disabled { background: #bdc3c7; cursor: not-allowed; }
              .jury-error { color: #dc3545; margin-bottom: 1rem; }
              .jury-results { display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem; }
              .jury-card-result { background: #f8f9fa; border-radius: 8px; padding: 1rem 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.07); display: flex; align-items: center; justify-content: space-between; min-width: 250px; }
              .jury-assign-btn { background: #2ecc71; color: #fff; border: none; border-radius: 6px; padding: 0.6rem 1.25rem; font-weight: 500; cursor: pointer; transition: background 0.2s; }
              .jury-assign-btn:disabled { background: #bdc3c7; cursor: not-allowed; }
              .jury-assigned-list { display: flex; flex-wrap: wrap; gap: 1rem; margin-top: 1rem; }
              .jury-card.assigned { background: #eafaf1; border: 1px solid #b2f0c0; border-radius: 8px; padding: 1rem 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.05); display: flex; align-items: center; justify-content: space-between; min-width: 250px; }
              .jury-remove-btn { background: #e74c3c; color: #fff; border: none; border-radius: 6px; padding: 0.6rem 1.25rem; font-weight: 500; cursor: pointer; transition: background 0.2s; }
              .jury-remove-btn:disabled { background: #bdc3c7; cursor: not-allowed; }
              @media (max-width: 768px) { .jury-results, .jury-assigned-list { flex-direction: column; gap: 0.75rem; } .jury-card-result, .jury-card.assigned { min-width: 0; width: 100%; } }
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
      `}</style>
    </>
  );
};

const componentStyles = `
  .container {
    max-width: 900px;
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
    position: relative;
  }

  .selected-announcement-panel h2 {
    margin: 0 0 1rem;
    color: #333;
  }

  .announcement-details {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 0.75rem 1.5rem;
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
      text-decoration: none;
      display: inline-block;
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
    gap: 1.5rem;
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
    padding: 0.75rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
    box-sizing: border-box;
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
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1rem 1.5rem;
  }

  .custom-criteria-section {
    margin: 1.5rem 0;
    border-top: 1px solid #eee;
    padding-top: 1.5rem;
  }

  .custom-criteria-list {
    margin-bottom: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .custom-criterion-item {
    display: flex;
    align-items: center;
    padding: 0.75rem 1rem;
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
    font-weight: bold;
    color: #333;
     min-width: 40px;
     text-align: right;
  }

  .add-criterion-form {
    display: flex;
    gap: 0.75rem;
    margin-top: 1rem;
    align-items: flex-end;
  }

  .add-criterion-form .text-input {
    flex: 3;
  }

  .add-criterion-form .number-input {
    flex: 1;
  }
 .add-button, .remove-button {
     padding: 0.75rem 1rem;
     border: none;
     border-radius: 4px;
     font-size: 0.9rem;
     font-weight: 500;
     cursor: pointer;
     white-space: nowrap;
     transition: background-color 0.2s;
     height: fit-content;
 }
  .add-button {
    background: #2ecc71;
    color: white;
  }

  .remove-button {
    background: #e74c3c;
    color: white;
    margin-left: 0.5rem;
     padding: 0.4rem 0.8rem;
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
    margin-top: 2rem;
    text-align: right;
    border-top: 1px solid #eee;
    padding-top: 1.5rem;
  }

  .primary-button {
    padding: 0.8rem 2rem;
    background: #3498db;
    color: white;
    border: none;
    border-radius: 4px;
    font-weight: 500;
    font-size: 1rem;
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
        grid-template-columns: 1fr;
        gap: 0.5rem;
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
      gap: 1rem;
    }
    .criteria-grid {
      grid-template-columns: 1fr;
       gap: 1rem;
    }
    .add-criterion-form {
        flex-direction: column;
        align-items: stretch;
    }
     .add-criterion-form .text-input,
     .add-criterion-form .number-input,
     .add-criterion-form .add-button {
         width: 100%;
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
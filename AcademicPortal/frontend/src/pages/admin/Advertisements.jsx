// src/pages/admin/Advertisements.jsx (Veya dosya adınız neyse)

import React, { useState, useEffect } from "react";
import AdminNavbar from "../../components/navbars/AdminNavbar.jsx";
import { FaEye, FaEdit, FaTrashAlt, FaPlus, FaTimes } from "react-icons/fa";

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

// Tarih formatlama (YYYY-MM-DD) - Input için
const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    try {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        if(isNaN(year) || isNaN(month) || isNaN(day)) return "";
        return `${year}-${month}-${day}`;
    } catch (e) { return ""; }
};
// Tarih formatlama (Gösterim için - dd.mm.yyyy)
const formatDate = (dateString) => {
    if (!dateString) return "-";
    try { return new Date(dateString).toLocaleDateString("tr-TR"); }
    catch (e) { return dateString; }
};
// DateTime formatlama (Gösterim için - dd.mm.yyyy HH:MM)
const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "-";
    try { return new Date(dateTimeString).toLocaleString("tr-TR", { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
    catch (e) { return dateTimeString; }
};


const Advertisements = () => {
  // === State Tanımlamaları ===
  const [ilanlar, setIlanlar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: 'olusturulma_tarihi', direction: "desc" });
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalIlan, setDetailModalIlan] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [kadroTipiOptions, setKadroTipiOptions] = useState([]);
  const [birimOptions, setBirimOptions] = useState([]);
  const [bolumOptions, setBolumOptions] = useState([]);
  const [anabilimDaliOptions, setAnabilimDaliOptions] = useState([]);
  const initialFormState = { id: null, baslik: "", aciklama: "", kadro_tipi: "", birim: "", bolum: "", anabilim_dali: "", baslangic_tarihi: "", bitis_tarihi: "", aktif: true };
  const [form, setForm] = useState(initialFormState);

  // --- Veri Çekme Effect'leri ---
  useEffect(() => {
    fetchIlanlar();
    fetchOptions();
  }, []);

  const fetchIlanlar = () => {
    setLoading(true); setError(null);
    fetch('http://localhost:8000/api/ilanlar/', { credentials: 'include' })
      .then(res => { if (!res.ok) throw new Error(`İlanlar alınamadı (${res.status})`); return res.json(); })
      .then(data => { setIlanlar(data.results || data); setError(null); })
      .catch(err => { setError(err.message); setIlanlar([]); })
      .finally(() => setLoading(false));
  };

  const fetchOptions = async () => {
    const fetchOption = async (url) => {
      try {
          const res = await fetch(url, { credentials: 'include' });
          if (!res.ok) { console.error(`Option fetch failed for ${url}: ${res.status}`); return []; }
          const data = await res.json();
          return data.results || data;
      } catch (err) {
          console.error(`Error fetching options from ${url}:`, err);
          return []; // Hata durumunda boş dizi döndür
      }
  };
      try {
        const [kadroData, birimData, bolumData, anabilimData] = await Promise.all([
            fetchOption('http://localhost:8000/api/kadro-tipi/'), fetchOption('http://localhost:8000/api/birim/'),
            fetchOption('http://localhost:8000/api/bolum/'), fetchOption('http://localhost:8000/api/anabilim-dali/') ]);
        setKadroTipiOptions(kadroData); setBirimOptions(birimData); setBolumOptions(bolumData); setAnabilimDaliOptions(anabilimData);
      } catch (error) { console.error("Dropdown seçenekleri çekilirken hata:", error); }
  };

  // --- Filtreleme ve Sıralama ---
   const handleSearch = (e) => setSearchTerm(e.target.value);
   const handleSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
        setSortConfig({ key, direction });
   };
   const sortedIlanlar = [...ilanlar].sort((a, b) => {
    if (!sortConfig.key) return 0;
    let key = sortConfig.key;
    let valA = a[key]; let valB = b[key];

    // İlişkili alanlar için özel sıralama (API yanıtındaki yapıya göre güncelleyin)
    if (key === 'kadro_tipi') { valA = a.kadro_tipi?.tip?.toLowerCase() || ''; valB = b.kadro_tipi?.tip?.toLowerCase() || ''; }
    else if (key === 'birim') { valA = a.birim?.ad?.toLowerCase() || ''; valB = b.birim?.ad?.toLowerCase() || ''; }
    else if (key === 'bolum') { valA = a.bolum?.ad?.toLowerCase() || ''; valB = b.bolum?.ad?.toLowerCase() || ''; }
    // Tarih alanları
    else if (['baslangic_tarihi', 'bitis_tarihi', 'olusturulma_tarihi'].includes(key)) { valA = a[key] ? new Date(a[key]) : null; valB = b[key] ? new Date(b[key]) : null; if (valA === null && valB === null) return 0; if (valA === null) return sortConfig.direction === 'asc' ? 1 : -1; if (valB === null) return sortConfig.direction === 'asc' ? -1 : 1; }
    // Diğer string alanlar
    else if (typeof valA === 'string' && typeof valB === 'string') { valA = valA.toLowerCase(); valB = valB.toLowerCase(); }
    // Boolean (aktif)
    else if (key === 'aktif') { valA = a.aktif; valB = b.aktif; }


    if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
    if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
});

const filteredIlanlar = sortedIlanlar.filter((ilan) => {
  if (!searchTerm) return true; // Arama terimi yoksa hepsini göster
  const searchLower = searchTerm.toLowerCase();
  // Alanları kontrol et (API yanıtınızdaki ilişkili adları kullandığınızdan emin olun)
  return (
      (ilan.baslik?.toLowerCase().includes(searchLower)) ||
      (ilan.kadro_tipi?.tip?.toLowerCase().includes(searchLower)) ||
      (ilan.birim?.ad?.toLowerCase().includes(searchLower)) ||
      (ilan.bolum?.ad?.toLowerCase().includes(searchLower))
  );
});


const handleDelete = async (id) => {
  if (!window.confirm(`ID ${id} olan ilanı silmek istediğinizden emin misiniz?`)) return;
  const csrftoken = getCookie('csrftoken');
  if (!csrftoken) { alert("Güvenlik token'ı alınamadı."); return; }
  // Belirli bir satır için loading gösterilebilir veya genel state
  setError(null);
  try {
      const response = await fetch(`http://localhost:8000/api/ilanlar/${id}/`, {
          method: 'DELETE', headers: { 'X-CSRFToken': csrftoken }, credentials: 'include'
      });
      if (!response.ok && response.status !== 204) {
          const errorData = await response.text(); throw new Error(`İlan silinemedi (${response.status}): ${errorData}`);
      }
      setIlanlar(prev => prev.filter(i => i.id !== id));
      alert("İlan başarıyla silindi.");
  } catch (err) { console.error("İlan silme hatası:", err); setError(err.message); alert(`İlan silinirken hata: ${err.message}`); }
  // finally { setLoading(false); } // Genel loading varsa
};

const openForm = (ilan = null) => {
  setFormError('');
  if (ilan) { // Düzenleme Modu
    setForm({
        id: ilan.id, baslik: ilan.baslik || "", aciklama: ilan.aciklama || "",
        kadro_tipi: ilan.kadro_tipi?.id ?? ilan.kadro_tipi ?? "", // ID al
        birim: ilan.birim?.id ?? ilan.birim ?? "",             // ID al
        bolum: ilan.bolum?.id ?? ilan.bolum ?? "",             // ID al
        anabilim_dali: ilan.anabilim_dali?.id ?? ilan.anabilim_dali ?? "", // ID al
        baslangic_tarihi: formatDateForInput(ilan.baslangic_tarihi) || "",
        bitis_tarihi: formatDateForInput(ilan.bitis_tarihi) || "",
        aktif: ilan.aktif === undefined ? true : ilan.aktif
    });
    setEditMode(true);
  } else { // Ekleme Modu
    setForm(initialFormState); setEditMode(false);
  }
  setModalOpen(true);
};

const closeModal = () => { setModalOpen(false); setEditMode(false); setForm(initialFormState); setFormError(''); };

const handleChange = (e) => {
  const { name, value, type, checked } = e.target;
  setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  // Cascading dropdown: Birim değişince Bölüm ve Anabilim Dalını sıfırla
  if (name === 'birim') setForm(prev => ({ ...prev, bolum: '', anabilim_dali: '' }));
  if (name === 'bolum') setForm(prev => ({ ...prev, anabilim_dali: '' }));
};

const handleSave = async (e) => {
  e.preventDefault(); setFormError(''); setSubmitting(true);
  const csrftoken = getCookie('csrftoken');
  if (!csrftoken) { setFormError("Güvenlik token'ı alınamadı."); setSubmitting(false); return; }

  const payload = {
      baslik: form.baslik, aciklama: form.aciklama, aktif: form.aktif,
      kadro_tipi: form.kadro_tipi ? parseInt(form.kadro_tipi, 10) : null,
      birim: form.birim ? parseInt(form.birim, 10) : null,
      bolum: form.bolum ? parseInt(form.bolum, 10) : null,
      anabilim_dali: form.anabilim_dali ? parseInt(form.anabilim_dali, 10) : null,
      baslangic_tarihi: form.baslangic_tarihi || null, // Boşsa null gönder
      bitis_tarihi: form.bitis_tarihi || null,     // Boşsa null gönder
      // olusturan_id backend'de request.user'dan alınmalı
  };
  // Tarihleri backend'in beklediği tam datetime formatına çevirmek gerekebilir
  // if (payload.baslangic_tarihi) payload.baslangic_tarihi = new Date(payload.baslangic_tarihi).toISOString();
  // if (payload.bitis_tarihi) payload.bitis_tarihi = new Date(payload.bitis_tarihi).toISOString();


  const method = editMode ? 'PATCH' : 'POST';
  const url = editMode ? `http://localhost:8000/api/ilanlar/${form.id}/` : 'http://localhost:8000/api/ilanlar/';

  try {
      const response = await fetch(url, {
          method: method, headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrftoken },
          credentials: 'include', body: JSON.stringify(payload)
      });
      // Başarısızsa ve JSON değilse text olarak oku
      if (!response.ok) {
           let errorData; try { errorData = await response.json(); } catch { errorData = await response.text(); }
           throw { status: response.status, data: errorData }; // Hata objesi fırlat
      }
       // Başarılıysa
       const responseData = await response.json(); // Yeni veya güncellenmiş ilanı al
       alert(`İlan başarıyla ${editMode ? 'güncellendi' : 'oluşturuldu'}!`);
       closeModal(); fetchUsers(); // Listeyi yenile

  } catch(err) {
       console.error(`İlan ${editMode ? 'güncelleme' : 'kaydetme'} hatası:`, err);
       let errorMsg = `Hata (${err.status || 'Network Error'}): ${editMode ? 'Güncellenemedi' : 'Oluşturulamadı'}. `;
       if (err.data) { // Django'dan gelen validation hataları olabilir
           for (const key in err.data) { errorMsg += `${key}: ${Array.isArray(err.data[key]) ? err.data[key].join(', ') : err.data[key]} `; }
       } else if (err.message) {
           errorMsg = err.message; // Genel hata mesajı
       }
       setFormError(errorMsg.trim());
   }
  finally { setSubmitting(false); }
};

  // --- Render ---
   if (loading) return (<><AdminNavbar /><div className="admin-ads-container is-loading"><p>İlanlar yükleniyor...</p></div><style>{css}</style></>);
   if (error && ilanlar.length === 0) return (<><AdminNavbar /><div className="admin-ads-container has-error"><h2 className="page-title">İlan Yönetimi</h2><p className="error-message">Hata: {error}</p></div><style>{css}</style></>);


  return (
    <>
      <AdminNavbar />
      <div className="admin-ads-container">
         {/* Başlık ve Ekle Butonu */}
         <div className="page-header">
             <h2 className="page-title">İlan Yönetimi</h2>
             <button onClick={() => openForm()} className="button primary add-ilan-button">
                 <FaPlus /> Yeni İlan Ekle
             </button>
         </div>

        {/* Arama */}
        <input type="text" placeholder="Başlık, Kadro, Birim, Bölüm ara..." value={searchTerm} onChange={handleSearch} className="search-input card"/>

        {/* Genel Hata Mesajı */}
        {error && <p className="error-message">{error}</p>}

        {/* Tablo ve Mobil Kartlar Container */}
        <div className="table-container card">
          {/* Masaüstü Tablo */}
          <div className="desktop-table">
            <table>
              <thead>
                 <tr>
                     <th onClick={() => handleSort("baslik")}>Başlık {sortConfig.key === "baslik" ? (sortConfig.direction === "asc" ? "▲" : "▼") : "↕"}</th>
                     <th onClick={() => handleSort("kadro_tipi")}>Kadro {sortConfig.key === "kadro_tipi" ? (sortConfig.direction === "asc" ? "▲" : "▼") : "↕"}</th>
                     <th onClick={() => handleSort("birim")}>Birim {sortConfig.key === "birim" ? (sortConfig.direction === "asc" ? "▲" : "▼") : "↕"}</th>
                     <th onClick={() => handleSort("bolum")}>Bölüm {sortConfig.key === "bolum" ? (sortConfig.direction === "asc" ? "▲" : "▼") : "↕"}</th>
                     <th>Tarihler</th>
                     <th onClick={() => handleSort("aktif")}>Durum {sortConfig.key === "aktif" ? (sortConfig.direction === "asc" ? "▲" : "▼") : "↕"}</th>
                     <th>İşlemler</th>
                 </tr>
              </thead>
              <tbody>
                {filteredIlanlar.length > 0 ? filteredIlanlar.map((ilan) => (
                  <tr key={ilan.id}>
                    <td>{ilan.baslik}</td>
                    <td>{ilan.kadro_tipi?.tip || ilan.kadro_tipi || '-'}</td>
                    <td>{ilan.birim?.ad || ilan.birim || '-'}</td>
                    <td>{ilan.bolum?.ad || ilan.bolum || '-'}</td>
                    <td>{formatDate(ilan.baslangic_tarihi)} - {formatDate(ilan.bitis_tarihi)}</td>
                    <td><span className={`status-tag ${ilan.aktif ? "aktif" : "pasif"}`}>{ilan.aktif ? "Aktif" : "Pasif"}</span></td>
                    <td>
                      <div className="actions">
                           <button onClick={() => setDetailModalIlan(ilan)} title="Detayları Gör" className="action-btn view"><FaEye /></button>
                           <button onClick={() => openForm(ilan)} title="İlanı Düzenle" className="action-btn edit"><FaEdit /></button>
                           <button onClick={() => handleDelete(ilan.id)} title="İlanı Sil" className="action-btn delete"><FaTrashAlt /></button>
                      </div>
                    </td>
                  </tr>
                )) : (<tr><td colSpan="7" className="no-results">Gösterilecek ilan bulunamadı.</td></tr>)}
              </tbody>
            </table>
          </div>

          {/* ====> MOBİL KARTLAR BÖLÜMÜ <==== */}
          <div className="mobile-cards">
               {filteredIlanlar.length > 0 ? filteredIlanlar.map((ilan) => (
                   <div key={ilan.id} className="ilan-card card"> 
                       <div className="card-header">
                           <h3>{ilan.baslik}</h3>
                           <span className={`status-tag ${ilan.aktif ? "aktif" : "pasif"}`}>{ilan.aktif ? "Aktif" : "Pasif"}</span>
                       </div>
                       <div className="card-body">
                           <p><strong>Kadro:</strong> {ilan.kadro_tipi?.tip || ilan.kadro_tipi || '-'}</p>
                           <p><strong>Birim:</strong> {ilan.birim?.ad || ilan.birim || '-'}</p>
                           <p><strong>Bölüm:</strong> {ilan.bolum?.ad || ilan.bolum || '-'}</p>
                           <p><strong>Tarihler:</strong> {formatDate(ilan.baslangic_tarihi)} - {formatDate(ilan.bitis_tarihi)}</p>
                       </div>
                       <div className="actions">
                            {/* Mobil butonlar */}
                           <button className="button button-sm info" onClick={() => setDetailModalIlan(ilan)}><FaEye /> Detay</button>
                           <button className="button button-sm warning" onClick={() => openForm(ilan)}><FaEdit /> Düzenle</button>
                           <button className="button button-sm danger" onClick={() => handleDelete(ilan.id)}><FaTrashAlt /> Sil</button>
                       </div>
                   </div>
               )) : (
                   <p className="no-results">Gösterilecek ilan bulunamadı.</p>
               )}
          </div>
        </div>


        {/* Detay Modalı */}
        {detailModalIlan && (
           <div className="modal-overlay" onClick={() => setDetailModalIlan(null)}>
             <div className="modal-content view-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>İlan Detayı</h3>
                    <button className="close-btn" onClick={() => setDetailModalIlan(null)}><FaTimes /></button>
                </div>
                 <div className="modal-body">
                    <p><strong>ID:</strong> {detailModalIlan.id}</p>
                    <p><strong>Başlık:</strong> {detailModalIlan.baslik}</p>
                    <p><strong>Açıklama:</strong> {detailModalIlan.aciklama || '-'}</p>
                    <p><strong>Kadro Tipi:</strong> {detailModalIlan.kadro_tipi?.tip || detailModalIlan.kadro_tipi || '-'}</p>
                    <p><strong>Birim:</strong> {detailModalIlan.birim?.ad || detailModalIlan.birim || '-'}</p>
                    <p><strong>Bölüm:</strong> {detailModalIlan.bolum?.ad || detailModalIlan.bolum || '-'}</p>
                    <p><strong>Anabilim Dalı:</strong> {detailModalIlan.anabilim_dali?.ad || detailModalIlan.anabilim_dali || '-'}</p>
                    <p><strong>Başlangıç Tarihi:</strong> {formatDate(detailModalIlan.baslangic_tarihi)}</p>
                    <p><strong>Bitiş Tarihi:</strong> {formatDate(detailModalIlan.bitis_tarihi)}</p>
                    <p><strong>Oluşturulma Tarihi:</strong> {formatDateTime(detailModalIlan.olusturulma_tarihi)}</p>
                    <p><strong>Durum:</strong> {detailModalIlan.aktif ? "Aktif" : "Pasif"}</p>
                 </div>
                 <div className="modal-actions">
                     <button className="button secondary" onClick={() => setDetailModalIlan(null)}>Kapat</button>
                 </div>
             </div>
           </div>
        )}

        {/* Ekle/Düzenle Modalı */}
        {modalOpen && (
           <div className="modal-overlay" onClick={closeModal}>
             <div className="modal-content edit-modal" onClick={(e) => e.stopPropagation()}>
                 <div className="modal-header">
                     <h3>{editMode ? "İlan Düzenle" : "Yeni İlan Ekle"}</h3>
                     <button className="close-btn" onClick={closeModal}><FaTimes /></button>
                 </div>
                  <form onSubmit={handleSave} className="modal-body">
                       {formError && <p className="form-error">{formError}</p>}
                      <div className="form-grid two-columns">
                           <label className="full-width">Başlık*<input type="text" name="baslik" value={form.baslik} onChange={handleChange} required disabled={submitting} /></label>
                           <label className="full-width">Açıklama<textarea name="aciklama" rows="4" value={form.aciklama} onChange={handleChange} disabled={submitting}></textarea></label>
                           <label>Kadro Türü*
                               <select name="kadro_tipi" value={form.kadro_tipi || ''} onChange={handleChange} required disabled={submitting}>
                                   <option value="" disabled>-- Seçiniz --</option>
                                   {kadroTipiOptions.map(opt => (<option key={opt.id} value={opt.id}>{opt.tip}</option>))}
                               </select>
                           </label>
                           <label>Birim*
                                <select name="birim" value={form.birim || ''} onChange={handleChange} required disabled={submitting}>
                                   <option value="" disabled>-- Seçiniz --</option>
                                   {birimOptions.map(opt => (<option key={opt.id} value={opt.id}>{opt.ad}</option>))}
                               </select>
                           </label>
                            <label>Bölüm*
                                <select name="bolum" value={form.bolum || ''} onChange={handleChange} required disabled={submitting || !form.birim}>
                                   <option value="" disabled>-- Önce Birim Seçin --</option>
                                    {bolumOptions.filter(opt => String(opt.birim) === String(form.birim)).map(opt => ( <option key={opt.id} value={opt.id}>{opt.ad}</option> ))}
                               </select>
                           </label>
                           <label>Anabilim Dalı*
                                <select name="anabilim_dali" value={form.anabilim_dali || ''} onChange={handleChange} required disabled={submitting || !form.bolum}>
                                   <option value="" disabled>-- Önce Bölüm Seçin --</option>
                                    {anabilimDaliOptions.filter(opt => String(opt.bolum) === String(form.bolum)).map(opt => ( <option key={opt.id} value={opt.id}>{opt.ad}</option> ))}
                               </select>
                           </label>
                           <label>Başlangıç Tarihi*<input type="date" name="baslangic_tarihi" value={form.baslangic_tarihi} onChange={handleChange} required disabled={submitting} /></label>
                           <label>Bitiş Tarihi*<input type="date" name="bitis_tarihi" value={form.bitis_tarihi} onChange={handleChange} required disabled={submitting} /></label>
                           <div className="checkbox-group full-width" style={{justifyContent:'flex-start', border:'none', padding:'0'}}>
                                <label style={{flexDirection:'row', alignItems:'center', gap:'0.5rem', fontWeight:'normal'}}>
                                    <input type="checkbox" name="aktif" checked={form.aktif} onChange={handleChange} disabled={submitting}/> Aktif İlan
                                </label>
                           </div>
                      </div>
                       <div className="modal-actions">
                           <button type="button" className="button secondary" onClick={closeModal} disabled={submitting}> İptal </button>
                           <button type="submit" className="button primary" disabled={submitting}>
                               {submitting ? 'Kaydediliyor...' : (editMode ? 'Değişiklikleri Kaydet' : 'İlanı Oluştur')}
                           </button>
                       </div>
                  </form>
               </div>
             </div>
        )}

      </div>
      <style>{css}</style>
    </>
  );
};


// --- CSS Stilleri ---
const css = `
:root {
    --primary-color: #009944; --primary-dark: #007c39; --secondary-color: #6c757d; --secondary-dark: #5a6268;
    --light-gray: #f8f9fa; --medium-gray: #dee2e6; --dark-gray: #495057; --text-color: #343a40;
    --white-color: #fff; --danger-color: #dc3545; --danger-dark: #bd2130; --warning-color: #ffc107;
    --warning-dark: #e0a800; --success-color: #28a745; --success-dark: #1e7e34; --info-color: #17a2b8; --info-dark: #117a8b;
    --border-radius-sm: 4px; --border-radius-md: 8px; --border-radius-lg: 12px;
    --box-shadow-light: 0 2px 5px rgba(0,0,0,0.06); --box-shadow-medium: 0 4px 12px rgba(0,0,0,0.1);
}

/* Container adını bu component için değiştirelim */
.admin-ads-container { padding: 1.5rem; background-color: #f4f6f9; min-height: calc(100vh - 60px); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
.admin-ads-container.is-loading, .admin-ads-container.has-error { display: flex; justify-content: center; align-items: center; text-align: center; font-size: 1.2rem; color: var(--secondary-color); }
.admin-ads-container.has-error p { color: var(--danger-color); background-color: #f8d7da; border: 1px solid #f5c6cb; padding: 1rem; border-radius: var(--border-radius-md); }

.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
.page-title { color: var(--primary-dark); margin: 0; font-size: 1.8rem; font-weight: 600; }

.card { background-color: var(--white-color); border-radius: var(--border-radius-lg); padding: 1.5rem; box-shadow: var(--box-shadow-medium); margin-bottom: 1.5rem; }
.table-container.card { padding: 0; overflow: hidden;} /* Tablo kartının iç padding'ini sıfırla */

.button { padding: 0.6rem 1rem; border-radius: var(--border-radius-md); border: none; cursor: pointer; font-weight: 500; font-size: 0.9rem; transition: all 0.2s ease; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; line-height: 1.3; text-decoration: none; }
.button:disabled { opacity: 0.6; cursor: not-allowed; }
.button.primary { background-color: var(--primary-color); color: var(--white-color); }
.button.primary:hover:not(:disabled) { background-color: var(--primary-dark); }
.button.secondary { background-color: var(--secondary-color); color: var(--white-color); }
.button.secondary:hover:not(:disabled) { background-color: var(--secondary-dark); }
.button.success { background-color: var(--success-color); color: var(--white-color); }
.button.success:hover:not(:disabled) { background-color: var(--success-dark); }
.button.danger { background-color: var(--danger-color); color: var(--white-color); }
.button.danger:hover:not(:disabled) { background-color: var(--danger-dark); }
.button.warning { background-color: var(--warning-color); color: var(--text-color); }
.button.warning:hover:not(:disabled) { background-color: var(--warning-dark); }
.button.info { background-color: var(--info-color); color: var(--white-color); }
.button.info:hover:not(:disabled) { background-color: var(--info-dark); }
.button.button-sm { padding: 0.4rem 0.8rem; font-size: 0.8rem; gap: 0.3rem; } /* Mobil kart butonları */
.add-ilan-button { /* .button.primary stilini kullanır */ }

.search-input { width: 100%; padding: 0.75rem; border: 1px solid #ced4da; border-radius: var(--border-radius-md); box-sizing: border-box; font-size: 1rem; margin-bottom: 1.5rem;}
.search-input:focus { border-color: var(--primary-color); outline: none; box-shadow: 0 0 0 2px rgba(0, 153, 68, 0.2); }

.form-card { border: 1px solid var(--medium-gray); background-color: #fdfdfd; animation: slideDown 0.3s ease-out; }
@keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
.form-card h3 { margin-top: 0; color: var(--primary-color); border-bottom: 1px solid var(--medium-gray); padding-bottom: 0.75rem; margin-bottom: 1.5rem; font-size: 1.25rem; }
.form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem 1.5rem; margin-bottom: 1.5rem; }
.form-grid label, .modal-content label { display: block; font-size: 0.9rem; margin-bottom: 0.3rem; color: #555; font-weight: 500; }
.form-grid input[type="text"], .form-grid input[type="date"], .form-grid select, .form-grid textarea,
.modal-content input[type="text"], .modal-content input[type="date"], .modal-content select, .modal-content textarea { width: 100%; padding: 0.6rem 0.75rem; border: 1px solid #ced4da; border-radius: var(--border-radius-md); box-sizing: border-box; font-size: 0.95rem; transition: border-color 0.2s ease, box-shadow 0.2s ease; }
.form-grid input:focus, .form-grid select:focus, .form-grid textarea:focus,
.modal-content input:focus, .modal-content select:focus, .modal-content textarea:focus { border-color: var(--primary-color); outline: none; box-shadow: 0 0 0 2px rgba(0, 153, 68, 0.2); }
.form-grid textarea { resize: vertical; min-height: 80px; }
.form-grid .full-width { grid-column: 1 / -1; }
.form-actions { text-align: right; margin-top: 1rem; }
.form-error { color: var(--danger-color); font-size: 0.9em; margin-top: 1rem; background-color: #f8d7da; border: 1px solid #f5c6cb; padding: 0.75rem; border-radius: var(--border-radius-md); }
.error-message { color: var(--danger-color); font-size: 0.9em; margin-top: 1rem; text-align: center;}

.table-container { overflow-x: auto; }
table { width: 100%; border-collapse: separate; border-spacing: 0; }
th, td { padding: 0.8rem 1rem; border-bottom: 1px solid #dee2e6; text-align: left; font-size: 0.9rem; white-space: nowrap; vertical-align: middle;}
th { background-color: var(--primary-color); color: var(--white-color); cursor: pointer; font-weight: 600; position: sticky; top: 0; z-index: 1;}
th:first-child { border-top-left-radius: var(--border-radius-lg); }
th:last-child { border-top-right-radius: var(--border-radius-lg); }
th:hover { background-color: var(--primary-dark); }
tbody tr:hover { background-color: var(--light-gray); }
tbody tr:last-child td { border-bottom: none; }
tbody tr:last-child td:first-child { border-bottom-left-radius: var(--border-radius-lg); }
tbody tr:last-child td:last-child { border-bottom-right-radius: var(--border-radius-lg); }
.status-tag { padding: 0.25em 0.7em; font-size: 0.85em; font-weight: 600; border-radius: 15px; display: inline-block; }
.status-tag.aktif { background-color: #d1e7dd; color: var(--success-dark); border: 1px solid #a3cfbb;}
.status-tag.pasif { background-color: #f8d7da; color: var(--danger-dark); border: 1px solid #f1b0b7;}
.no-results { text-align: center; padding: 1.5rem; color: var(--secondary-color); font-style: italic; } /* Hem tablo hem kart için */

.actions { display: flex; flex-wrap: nowrap; gap: 0.5rem; align-items: center; }
.actions .action-btn { background: none; border: none; padding: 5px; margin: 0; border-radius: 50%; cursor: pointer; font-size: 1rem; color: var(--secondary-color); transition: all 0.2s ease; width: 32px; height: 32px; display: inline-flex; align-items: center; justify-content: center; }
.actions .action-btn:hover:not(:disabled) { background-color: var(--light-gray); color: var(--text-color); }
.actions .action-btn.view:hover:not(:disabled) { color: var(--info-color); }
.actions .action-btn.edit:hover:not(:disabled) { color: var(--warning-color); }
.actions .action-btn.delete:hover:not(:disabled) { color: var(--danger-color); }
.actions .action-btn:disabled { color: #bbb; cursor: not-allowed; background-color: transparent !important; }

/* Mobil Kartlar */
.mobile-cards { display: none; } /* Varsayılan gizli */
.ilan-card { /* Mobil ilan kartı için temel stil */ background: white; border-radius: var(--border-radius-lg); padding: 1rem; box-shadow: var(--box-shadow-light); margin-bottom: 1rem; }
.ilan-card .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--medium-gray); }
.ilan-card .card-header h3 { margin: 0; font-size: 1.1rem; color: var(--primary-dark); line-height: 1.3; }
.ilan-card .card-body p { margin: 0.3rem 0; font-size: 0.9rem; color: var(--dark-gray); }
.ilan-card .card-body p strong { font-weight: 600; color: var(--text-color); margin-right: 5px; }
.ilan-card .actions { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--medium-gray); display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; } /* Mobil butonları yan yana */
.ilan-card .actions button { width: 100%; justify-content: center; }


/* Modal Stilleri */
.modal-overlay { position: fixed; inset: 0; background-color: rgba(0, 0, 0, 0.7); /* Biraz daha koyu */ display: flex; align-items: center; justify-content: center; z-index: 1050; padding: 1rem; animation: fadeInOverlay 0.3s ease; }
@keyframes fadeInOverlay { from { opacity: 0; } to { opacity: 1; } }
.modal-content { background-color: var(--white-color); border-radius: var(--border-radius-lg); padding: 1.5rem 2rem; width: 100%; max-width: 700px; box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2); animation: slideInModal 0.3s ease-out; max-height: 90vh; overflow-y: auto; display: flex; flex-direction: column; }
@keyframes slideInModal { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 1rem; border-bottom: 1px solid var(--medium-gray); margin-bottom: 1.5rem; flex-shrink: 0;}
.modal-header h3 { font-size: 1.5rem; font-weight: 600; color: var(--primary-dark); margin: 0; }
.close-btn { background: none; border: none; font-size: 1.8rem; color: var(--secondary-color); cursor: pointer; padding: 0; line-height: 1; transition: color 0.2s ease; }
.close-btn:hover { color: var(--text-color); }
.modal-body { flex-grow: 1; overflow-y: auto; padding-right: 5px; /* İç scrollbar için */ }
.modal-body p { margin: 0.75rem 0; color: var(--text-color); line-height: 1.5; }
.modal-body p strong { color: var(--dark-gray); margin-right: 8px; font-weight: 600; }
.modal-actions { display: flex; justify-content: flex-end; margin-top: 1.5rem; gap: 0.75rem; border-top: 1px solid var(--medium-gray); padding-top: 1.5rem; flex-shrink: 0;}
.edit-modal .form-grid { margin-bottom: 0; }
.edit-modal .checkbox-group { grid-column: 1 / -1; display: flex; flex-wrap: wrap; gap: 1.5rem; align-items: center; margin-top: 0.5rem; padding: 1rem 0; }
.edit-modal .checkbox-group label { flex-direction: row; align-items: center; margin-bottom: 0; font-weight: normal;}
.edit-modal .checkbox-group input[type="checkbox"] { width: auto; margin-right: 0.5rem; height: 1rem; width: 1rem; cursor: pointer; }

/* Responsive stiller */
@media (max-width: 1200px) { th, td { white-space: normal; } }
@media (max-width: 992px) { .desktop-table { display: none; } .mobile-cards { display: block; } }
@media (max-width: 768px) {
    .admin-ads-container { padding: 1rem; }
    .card { padding: 1rem; }
    .filters { flex-direction: column; align-items: stretch; }
    .page-header { flex-direction: column; align-items: stretch; }
    .add-ilan-button { width: 100%; justify-content: center;}
}
@media (max-width: 576px) {
    .edit-form-grid { grid-template-columns: 1fr; }
    .modal-content { padding: 1rem 1.5rem; }
    .modal-header h3 { font-size: 1.25rem; }
    .ilan-card .actions { grid-template-columns: 1fr; } /* Mobil kart butonları alt alta */
}
`;

export default Advertisements;
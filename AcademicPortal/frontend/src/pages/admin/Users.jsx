// src/pages/admin/Users.jsx (Veya AdminApplications.jsx / dosya adınız neyse)

import React, { useState, useEffect } from "react";
import AdminNavbar from "../../components/navbars/AdminNavbar.jsx";
import { FaEye, FaEdit, FaToggleOn, FaToggleOff, FaTrashAlt, FaPlus, FaTimes } from "react-icons/fa";

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

// Tarih formatlama
const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "-";
    try { return new Date(dateTimeString).toLocaleString("tr-TR", { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
    catch (e) { return dateTimeString; }
};


const Users = () => {
    // State Tanımlamaları
    const [usersData, setUsersData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewModalUser, setViewModalUser] = useState(null);
    const [editModalUser, setEditModalUser] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const [academicTitles, setAcademicTitles] = useState([]);
    const [filterRole, setFilterRole] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [sortKey, setSortKey] = useState('date_joined');
    const [sortOrder, setSortOrder] = useState("desc");
    const [isAddFormVisible, setIsAddFormVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false); // Ekleme/Güncelleme için genel
    const [isDeletingUser, setIsDeletingUser] = useState(null);
    const [formError, setFormError] = useState(''); // Ekleme/Düzenleme için genel hata


    const [newUserData, setNewUserData] = useState({
        username: '', password: '', first_name: '', last_name: '',
        email: '', TC_KIMLIK: '', user_type: 'ADAY', telefon: '', adres: '', akademik_unvan: null
    });

    // --- API Çağrıları ---

    // Kullanıcıları ve Unvanları Çekme
    useEffect(() => {
        fetchUsers();
        fetchAcademicTitles();
    }, []);

    const fetchUsers = () => {
        setLoading(true); setError(null);
        fetch('http://localhost:8000/api/users/', { credentials: 'include' })
            .then(res => {
                if (!res.ok) {
                    if (res.status === 404) throw new Error(`Kullanıcı listeleme API endpoint'i (/api/users/) bulunamadı (${res.status}). Backend'i kontrol edin.`);
                    throw new Error(`Kullanıcılar alınamadı (${res.status})`);
                }
                return res.json();
            })
            .then(data => {
                console.log("Gelen Kullanıcılar:", data);
                const userDataList = data.results || data;
                if (Array.isArray(userDataList)) {
                    setUsersData(userDataList); setError(null);
                } else {
                    console.error("API'den beklenen kullanıcı listesi formatı gelmedi:", data);
                    throw new Error("API'den geçersiz veri formatı alındı (liste bekleniyordu).");
                }
            })
            .catch(err => { console.error("Kullanıcıları çekerken hata:", err); setError(err.message); setUsersData([]); })
            .finally(() => setLoading(false));
    };

    const fetchAcademicTitles = () => {
        fetch('http://localhost:8000/api/kadro-tipi/', { credentials: 'include' })
            .then(res => res.ok ? res.json() : Promise.reject('Unvanlar alınamadı'))
            .then(data => setAcademicTitles(data.results || data))
            .catch(err => console.error("Akademik unvanları çekerken hata:", err));
    };

    // --- Filtreleme ve Sıralama ---

    // Sıralama Mantığı
    const sortedUsers = [...usersData].sort((a, b) => {
        if (!sortKey) return 0;
        let valA = a[sortKey]; let valB = b[sortKey];
        if (sortKey === 'first_name') { valA = `${a.first_name || ''} ${a.last_name || ''}`.trim().toLowerCase(); valB = `${b.first_name || ''} ${b.last_name || ''}`.trim().toLowerCase(); }
        else if (sortKey === 'last_login' || sortKey === 'date_joined') { valA = a[sortKey] ? new Date(a[sortKey]) : null; valB = b[sortKey] ? new Date(b[sortKey]) : null; if (valA === null && valB === null) return 0; if (valA === null) return sortOrder === 'asc' ? 1 : -1; if (valB === null) return sortOrder === 'asc' ? -1 : 1; if (valA < valB) return sortOrder === "asc" ? -1 : 1; if (valA > valB) return sortOrder === "asc" ? 1 : -1; return 0; }
        else if (typeof valA === 'string' && typeof valB === 'string') { valA = valA.toLowerCase(); valB = valB.toLowerCase(); }
        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
    });

    // Filtreleme Mantığı
    const filteredUsers = sortedUsers.filter((user) => {
        const searchLower = searchTerm.toLowerCase();
        const nameLower = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
        const emailLower = user.email?.toLowerCase() || '';
        const tcLower = user.TC_KIMLIK || '';
        const roleMatch = !filterRole || user.user_type === filterRole;
        const statusMatch = !filterStatus || String(user.is_active) === filterStatus;
        const searchMatch = nameLower.includes(searchLower) || emailLower.includes(searchLower) || tcLower.includes(searchTerm);
        return roleMatch && statusMatch && searchMatch;
    });

    // Sıralama Handler'ı
    const handleSort = (key) => {
        const backendKeyMap = { name: 'first_name', email: 'email', tc: 'TC_KIMLIK', role: 'user_type', lastLogin: 'last_login', status: 'is_active' };
        const backendKey = backendKeyMap[key] || key;
        if (sortKey === backendKey) { setSortOrder(sortOrder === "asc" ? "desc" : "asc"); }
        else { setSortKey(backendKey); setSortOrder("asc"); }
    };

    // --- CRUD İşlemleri ---

    // Yeni Kullanıcı Ekleme Form Değişiklik Handler'ı
    const handleNewUserChange = (e) => {
        const { name, value, type, checked } = e.target; // Checkbox için type ve checked eklendi
        setNewUserData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    // Yeni Kullanıcı Ekleme API Çağrısı
    const handleAddNewUser = async (e) => {
        e.preventDefault(); setFormError(''); setIsSubmitting(true);
        const csrftoken = getCookie('csrftoken');
        if (!csrftoken) { setFormError("Güvenlik token'ı alınamadı."); setIsSubmitting(false); return; }

        // akademik_unvan'ın null veya integer olduğundan emin ol
        const payload = {
            ...newUserData,
            akademik_unvan: newUserData.akademik_unvan ? parseInt(newUserData.akademik_unvan, 10) : null
        };
        console.log("Yeni Kullanıcı Gönderiliyor:", payload);

        try {
            const response = await fetch('http://localhost:8000/api/users/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrftoken },
                credentials: 'include',
                body: JSON.stringify(payload) // payload'ı gönder
            });
            const responseData = await response.json();
            if (response.ok || response.status === 201) {
                alert('Kullanıcı başarıyla eklendi!'); setIsAddFormVisible(false);
                setNewUserData({ username: '', password: '', first_name: '', last_name: '', email: '', TC_KIMLIK: '', user_type: 'ADAY', telefon: '', adres: '', akademik_unvan: null });
                fetchUsers(); // Listeyi yenile
            } else {
                let errorMsg = `Hata (${response.status}): Kullanıcı eklenemedi. `;
                for (const key in responseData) { errorMsg += `${key}: ${Array.isArray(responseData[key]) ? responseData[key].join(', ') : responseData[key]} `; }
                setFormError(errorMsg.trim());
            }
        } catch (err) { console.error("Kullanıcı ekleme isteği sırasında hata:", err); setFormError("Kullanıcı eklenirken bir ağ hatası oluştu."); }
        finally { setIsSubmitting(false); }
    };

    // Kullanıcı Durumunu Değiştirme (Aktif/Pasif)
    const toggleStatus = async (userId, currentStatus) => {
        const actionText = currentStatus ? 'pasif' : 'aktif';
        if (!window.confirm(`Kullanıcıyı ${actionText} yapmak istediğinize emin misiniz?`)) return;
        const csrftoken = getCookie('csrftoken');
        if (!csrftoken) { alert("Güvenlik token'ı alınamadı."); return; }
        // Butonun loading state'i için isDeletingUser kullanılabilir veya yeni bir state eklenebilir
        setIsDeletingUser(userId); // Geçici olarak silme state'ini kullanalım
        setError(null);
        try {
            const response = await fetch(`http://localhost:8000/api/users/${userId}/`, {
                method: 'PATCH', headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrftoken },
                credentials: 'include', body: JSON.stringify({ is_active: !currentStatus })
            });
            if (!response.ok) { const err = await response.json(); throw new Error(JSON.stringify(err)); }
            const updatedUser = await response.json(); // Güncellenmiş kullanıcı verisini al
            setUsersData(prev => prev.map(u => u.id === userId ? updatedUser : u)); // State'i güncelle
            alert(`Kullanıcı başarıyla ${actionText} hale getirildi.`);
        } catch (err) { console.error("Durum güncelleme hatası:", err); setError(`Durum güncellenirken hata: ${err.message}`); alert(`Durum güncellenirken hata: ${err.message}`); }
        finally { setIsDeletingUser(null); } // Loading state'ini kaldır
    };

    // Kullanıcı Silme
    const handleDeleteUser = async (userId, userName) => {
        if (!window.confirm(`${userName} isimli kullanıcıyı silmek istediğinize emin misiniz? Bu işlem geri alınamaz!`)) return;
        const csrftoken = getCookie('csrftoken');
        if (!csrftoken) { alert("Güvenlik token'ı alınamadı."); return; }
        setIsDeletingUser(userId); setError(null);
        try {
            const response = await fetch(`http://localhost:8000/api/users/${userId}/`, {
                method: 'DELETE', headers: { 'X-CSRFToken': csrftoken }, credentials: 'include'
            });
            if (!response.ok && response.status !== 204) { // 204 No Content de başarılıdır
                const errorData = await response.text(); throw new Error(`Kullanıcı silinemedi (${response.status}): ${errorData}`);
            }
            setUsersData(prevUsers => prevUsers.filter(u => u.id !== userId));
            alert('Kullanıcı başarıyla silindi.');
        } catch (err) { console.error("Kullanıcı silme hatası:", err); setError(`Kullanıcı silinirken hata: ${err.message}`); alert(`Kullanıcı silinirken hata: ${err.message}`); }
        finally { setIsDeletingUser(null); }
    };

    // Kullanıcı Düzenleme Modalını Açma
    const openEditModal = (user) => {
        setEditModalUser(user);
        setEditFormData({ // Formu mevcut kullanıcı verileriyle doldur
            first_name: user.first_name || "", last_name: user.last_name || "",
            email: user.email || "", telefon: user.telefon || "", adres: user.adres || "",
            user_type: user.user_type || "ADAY",
            // akademik_unvan ID'sini al (eğer obje geliyorsa .id, direkt ID ise kendisi)
            akademik_unvan: user.akademik_unvan?.id ?? user.akademik_unvan ?? null,
            is_staff: user.is_staff || false,
            is_superuser: user.is_superuser || false,
            is_active: user.is_active === undefined ? true : user.is_active // is_active'i de ekle
        });
        setFormError(''); // Hataları temizle
    };
    const closeEditModal = () => setEditModalUser(null);

    // Düzenleme Formu Değişiklik Handler'ı
    const handleEditFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    // Kullanıcı Güncelleme (PATCH)
    const handleUpdateUser = async (e) => {
        e.preventDefault(); if (!editModalUser) return;
        setFormError(''); setIsSubmitting(true);
        const csrftoken = getCookie('csrftoken');
        if (!csrftoken) { setFormError("Güvenlik token'ı alınamadı."); setIsSubmitting(false); return; }

        // Backend'e sadece değiştirilebilir alanları gönder
        const payload = {
            first_name: editFormData.first_name, last_name: editFormData.last_name,
            email: editFormData.email, telefon: editFormData.telefon, adres: editFormData.adres,
            user_type: editFormData.user_type,
            akademik_unvan: editFormData.akademik_unvan ? parseInt(editFormData.akademik_unvan, 10) : null,
            is_staff: editFormData.is_staff, is_superuser: editFormData.is_superuser,
            is_active: editFormData.is_active, // Aktiflik durumunu da gönder
        };
        console.log("Güncelleme Payload:", payload);
        try {
            const response = await fetch(`http://localhost:8000/api/users/${editModalUser.id}/`, {
                method: 'PATCH', headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrftoken },
                credentials: 'include', body: JSON.stringify(payload)
            });
            const responseData = await response.json();
            if (response.ok) {
                alert("Kullanıcı başarıyla güncellendi!"); closeEditModal();
                // Listeyi güncelle (güncellenen kullanıcıyla)
                setUsersData(prev => prev.map(u => u.id === editModalUser.id ? responseData : u));
            } else {
                console.error("Kullanıcı güncelleme hatası:", responseData);
                let errorMsg = `Hata (${response.status}): Güncelleme yapılamadı. `;
                for (const key in responseData) { errorMsg += `${key}: ${Array.isArray(responseData[key]) ? responseData[key].join(', ') : responseData[key]} `; }
                setFormError(errorMsg.trim()); // Modal içindeki hata state'ini kullan
            }
        } catch (err) { setFormError("Kullanıcı güncellenirken bir ağ hatası oluştu."); }
        finally { setIsSubmitting(false); }
    };


    // --- Render ---
    if (loading) return (<><AdminNavbar /><div className="admin-users-container is-loading"><p>Kullanıcılar yükleniyor...</p></div><style>{css}</style></>);
    if (error && usersData.length === 0) return (<><AdminNavbar /><div className="admin-users-container has-error"><h2 className="page-title">Kullanıcı Yönetimi</h2><p className="error-message">Hata: {error}</p></div><style>{css}</style></>);

    return (
        <>
            <AdminNavbar />
            <div className="admin-users-container">
                {/* Başlık ve Ekle Butonu */}
                <div className="page-header">
                    <h2 className="page-title">Kullanıcı Yönetimi</h2>
                    <button className="button primary add-user-button" onClick={() => setIsAddFormVisible(!isAddFormVisible)}>
                        <FaPlus /> {isAddFormVisible ? 'Formu Gizle' : 'Yeni Kullanıcı Ekle'}
                    </button>
                </div>

                {/* Yeni Kullanıcı Ekleme Formu */}
                {isAddFormVisible && (
                    <div className="form-card add-user-form">
                        <h3>Yeni Kullanıcı Oluştur</h3>
                        {formError && <p className="form-error">{formError}</p>}
                        <form onSubmit={handleAddNewUser}>
                            <div className="form-grid two-columns"> {/* Grid düzeni */}
                                <label>Kullanıcı Adı*<input type="text" name="username" value={newUserData.username} onChange={handleNewUserChange} required disabled={isSubmitting} /></label>
                                <label>Şifre*<input type="password" name="password" placeholder="Yeni şifre girin" value={newUserData.password} onChange={handleNewUserChange} required disabled={isSubmitting} /></label>
                                <label>Ad*<input type="text" name="first_name" value={newUserData.first_name} onChange={handleNewUserChange} required disabled={isSubmitting} /></label>
                                <label>Soyad*<input type="text" name="last_name" value={newUserData.last_name} onChange={handleNewUserChange} required disabled={isSubmitting} /></label>
                                <label>E-posta*<input type="email" name="email" value={newUserData.email} onChange={handleNewUserChange} required disabled={isSubmitting} /></label>
                                <label>TC Kimlik No*<input type="text" name="TC_KIMLIK" value={newUserData.TC_KIMLIK} onChange={handleNewUserChange} required maxLength={11} pattern="\d{11}" title="11 haneli TC Kimlik No girin" disabled={isSubmitting} /></label>
                                <label>Telefon<input type="tel" name="telefon" placeholder="örn: 5xxxxxxxxx" value={newUserData.telefon} onChange={handleNewUserChange} disabled={isSubmitting} /></label>
                                <label>Rol*
                                    <select name="user_type" value={newUserData.user_type} onChange={handleNewUserChange} required disabled={isSubmitting}>
                                        <option value="ADAY">Aday</option> <option value="JURI">Jüri</option> <option value="YONETICI">Yönetici</option> <option value="ADMIN">Admin</option>
                                    </select>
                                </label>
                                <label className="full-width">Adres<textarea name="adres" rows="2" value={newUserData.adres} onChange={handleNewUserChange} disabled={isSubmitting}></textarea></label>
                                <label>Akademik Unvan
                                    <select name="akademik_unvan" value={newUserData.akademik_unvan || ''} onChange={handleNewUserChange} disabled={isSubmitting}>
                                        <option value="">-- Yok --</option>
                                        {academicTitles.map(title => (<option key={title.id} value={title.id}>{title.tip}</option>))}
                                    </select>
                                </label>
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="button success" disabled={isSubmitting}>
                                    {isSubmitting ? 'Ekleniyor...' : 'Kullanıcı Ekle'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Filtreleme Alanı */}
                <div className="filters card">
                    <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                        <option value="">Tüm Roller</option><option value="ADAY">Aday</option><option value="JURI">Jüri</option><option value="YONETICI">Yönetici</option><option value="ADMIN">Admin</option>
                    </select>
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="">Tüm Durumlar</option><option value="true">Aktif</option><option value="false">Pasif</option>
                    </select>
                    <input type="text"  placeholder="İsim / TC / E-posta Ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>

                {/* Genel Hata Mesajı */}
                {error && !loading && usersData.length === 0 && <p className="error-message">{error}</p>}

                {/* Kullanıcı Tablosu */}
                <div className="table-container card">
                    <div className="desktop-table">
                        <table>
                            <thead>
                                <tr>
                                    {/* Başlıklar ve sıralama */}
                                    {[{ key: 'name', label: 'Adı Soyadı' }, { key: 'email', label: 'E-posta' }, { key: 'tc', label: 'TC Kimlik No' }, { key: 'role', label: 'Rol' }, { key: 'lastLogin', label: 'Son Giriş' }, { key: 'status', label: 'Durum' }].map((col) => (
                                        <th key={col.key} onClick={() => handleSort(col.key)} style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                            {col.label} {sortKey === (col.key === 'name' ? 'first_name' : col.key === 'tc' ? 'TC_KIMLIK' : col.key === 'role' ? 'user_type' : col.key === 'lastLogin' ? 'last_login' : 'is_active') ? (sortOrder === "asc" ? " ▲" : " ▼") : " ↕"}
                                        </th>))}
                                    <th>İşlemler</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td>{`${user.first_name || ''} ${user.last_name || ''}`}</td>
                                        <td>{user.email || '-'}</td>
                                        <td>{user.TC_KIMLIK || '-'}</td>
                                        <td><span className={`role-badge role-${user.user_type?.toLowerCase()}`}>{user.user_type || '-'}</span></td>
                                        <td>{formatDateTime(user.last_login)}</td>
                                        <td><span className={user.is_active ? "status-tag aktif" : "status-tag pasif"}>{user.is_active ? "Aktif" : "Pasif"}</span></td>
                                        <td>
                                            <div className="actions">
                                                {/* Butonlara title eklendi, ikonlar kullanıldı */}
                                                <button onClick={() => setViewModalUser(user)} title="Detayları Gör" className="action-btn view">
                                                    <FaEye />
                                                </button>
                                                <button onClick={() => openEditModal(user)} title="Kullanıcıyı Düzenle" className="action-btn edit">
                                                    <FaEdit />
                                                </button>
                                                <button onClick={() => toggleStatus(user.id, user.is_active)} title={user.is_active ? "Pasif Et" : "Aktif Et"} disabled={isDeletingUser === user.id} className={`action-btn toggle ${user.is_active ? 'active' : 'inactive'}`}>
                                                    {user.is_active ? <FaToggleOn /> : <FaToggleOff />}
                                                </button>
                                                <button className="action-btn delete" onClick={() => handleDeleteUser(user.id, user.username)} disabled={isDeletingUser === user.id} title="Kullanıcıyı Sil">
                                                    {isDeletingUser === user.id ? '...' : <FaTrashAlt />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (<tr><td colSpan="7" className="no-results">Filtreye uygun kullanıcı bulunamadı veya hiç kullanıcı yok.</td></tr>)}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobil Kartlar */}
        <div className="mobile-cards">
             {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                <div className="user-card" key={user.id}>
                  {/* Kart Başlığı - İsim Soyisim */}
                  <h3>{`${user.first_name || ''} ${user.last_name || ''}`}</h3>
                  {/* Diğer Bilgiler */}
                  <p><strong>E-posta:</strong> {user.email || '-'}</p>
                  <p><strong>TC Kimlik No:</strong> {user.TC_KIMLIK || '-'}</p>
                  <p>
                      <strong>Rol:</strong>{' '}
                      <span className={`role-badge role-${user.user_type?.toLowerCase()}`}>
                          {user.user_type || '-'}
                      </span>
                  </p>
                  <p>
                      <strong>Durum:</strong>{' '}
                      <span className={`status-tag ${user.is_active ? "aktif" : "pasif"}`}>
                          {user.is_active ? "Aktif" : "Pasif"}
                      </span>
                  </p>
                  <p><strong>Son Giriş:</strong> {formatDateTime(user.last_login)}</p>
                  {/* İşlem Butonları */}
                  <div className="actions">
                     {/* Butonlara daha önce tanımladığımız fonksiyonları bağlıyoruz */}
                     {/* CSS'te .button ve .button-sm sınıfları tanımlanmıştı */}
                     <button className="button button-sm info" onClick={() => setViewModalUser(user)}><FaEye /> Detay</button>
                     <button className="button button-sm warning" onClick={() => openEditModal(user)}><FaEdit /> Düzenle</button>
                     <button className="button button-sm secondary" onClick={() => toggleStatus(user.id, user.is_active)}>
                           {user.is_active ? <FaToggleOff/> : <FaToggleOn/>} {user.is_active ? "Pasif Et" : "Aktif Et"}
                     </button>
                     <button className="button button-sm danger" onClick={() => handleDeleteUser(user.id, user.username)} disabled={isDeletingUser === user.id}>
                           {isDeletingUser === user.id ? '...' : <FaTrashAlt/>} Sil
                     </button>
                  </div>
                </div>
             )) : (
                 // Filtreye uygun kullanıcı yoksa veya hiç kullanıcı yoksa gösterilecek mesaj
                 <p className="no-results" style={{textAlign:'center', padding:'1rem', color:'var(--secondary-color)'}}>
                    Filtreye uygun kullanıcı bulunamadı veya hiç kullanıcı yok.
                 </p>
             )}
        </div>
                </div>

                {/* Kullanıcı Detay Modal */}
                {viewModalUser && (
                    <div className="modal-overlay" onClick={() => setViewModalUser(null)}>
                        <div className="modal-content view-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>Kullanıcı Detayı</h3>
                                <button className="close-btn" onClick={() => setViewModalUser(null)} aria-label="Close"><FaTimes /></button>
                            </div>
                            <div className="modal-body">
                                <p><strong>Ad Soyad:</strong> {`${viewModalUser.first_name || ''} ${viewModalUser.last_name || ''}`}</p>
                                <p><strong>Kullanıcı Adı:</strong> {viewModalUser.username}</p>
                                <p><strong>E-posta:</strong> {viewModalUser.email}</p>
                                <p><strong>TC Kimlik No:</strong> {viewModalUser.TC_KIMLIK}</p>
                                <p><strong>Telefon:</strong> {viewModalUser.telefon || "-"}</p>
                                <p><strong>Rol:</strong> {viewModalUser.user_type}</p>
                                <p><strong>Akademik Unvan:</strong> {academicTitles.find(t => t.id === viewModalUser.akademik_unvan)?.tip || "-"}</p>
                                <p><strong>Adres:</strong> {viewModalUser.adres || "-"}</p>
                                <p><strong>Kayıt Tarihi:</strong> {formatDateTime(viewModalUser.date_joined)}</p>
                                <p><strong>Son Giriş:</strong> {formatDateTime(viewModalUser.last_login)}</p>
                                <p><strong>Durum:</strong> {viewModalUser.is_active ? "Aktif" : "Pasif"}</p>
                                <p><strong>Yetkiler:</strong> Staff={String(viewModalUser.is_staff)}, Superuser={String(viewModalUser.is_superuser)}</p>
                                {/* Başvurular buraya eklenebilir */}
                            </div>
                        </div>
                    </div>
                )}

                {/* Kullanıcı Düzenleme Modal */}
                {editModalUser && (
                    <div className="modal-overlay" onClick={closeEditModal}>
                        <div className="modal-content edit-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>Kullanıcı Düzenle</h3>
                                <button className="close-btn" onClick={closeEditModal} aria-label="Close"><FaTimes /></button>
                            </div>
                            <form onSubmit={handleUpdateUser} className="modal-body">
                                {formError && <p className="form-error">{formError}</p>}
                                <div className="form-grid two-columns">
                                    <label>Ad*<input type="text" name="first_name" value={editFormData.first_name || ''} onChange={handleEditFormChange} required disabled={isSubmitting} /></label>
                                    <label>Soyad*<input type="text" name="last_name" value={editFormData.last_name || ''} onChange={handleEditFormChange} required disabled={isSubmitting} /></label>
                                    <label>E-posta*<input type="email" name="email" value={editFormData.email || ''} onChange={handleEditFormChange} required disabled={isSubmitting} /></label>
                                    <label>Telefon<input type="tel" name="telefon" value={editFormData.telefon || ''} onChange={handleEditFormChange} disabled={isSubmitting} /></label>
                                    <label>TC Kimlik No (Değiştirilemez)<input type="text" value={editModalUser.TC_KIMLIK || ''} readOnly disabled /></label>
                                    <label>Kullanıcı Adı (Değiştirilemez)<input type="text" value={editModalUser.username || ''} readOnly disabled /></label>
                                    <label className="full-width">Adres<textarea name="adres" rows="2" value={editFormData.adres || ''} onChange={handleEditFormChange} disabled={isSubmitting}></textarea></label>
                                    <label>Rol*
                                        <select name="user_type" value={editFormData.user_type || 'ADAY'} onChange={handleEditFormChange} required disabled={isSubmitting}>
                                            <option value="ADAY">Aday</option> <option value="JURI">Jüri</option> <option value="YONETICI">Yönetici</option> <option value="ADMIN">Admin</option>
                                        </select>
                                    </label>
                                    <label>Akademik Unvan
                                        <select name="akademik_unvan" value={editFormData.akademik_unvan || ''} onChange={handleEditFormChange} disabled={isSubmitting}>
                                            <option value="">-- Yok --</option>
                                            {academicTitles.map(title => (<option key={title.id} value={title.id}>{title.tip}</option>))}
                                        </select>
                                    </label>
                                    <div className="checkbox-group full-width">
                                        <label><input type="checkbox" name="is_active" checked={editFormData.is_active || false} onChange={handleEditFormChange} disabled={isSubmitting} /> Aktif</label>
                                        <label><input type="checkbox" name="is_staff" checked={editFormData.is_staff || false} onChange={handleEditFormChange} disabled={isSubmitting} /> Staff</label>
                                        <label><input type="checkbox" name="is_superuser" checked={editFormData.is_superuser || false} onChange={handleEditFormChange} disabled={isSubmitting} /> Superuser</label>
                                    </div>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="button secondary" onClick={closeEditModal} disabled={isSubmitting}> İptal </button>
                                    <button type="submit" className="button primary" disabled={isSubmitting}>
                                        {isSubmitting ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </div>
            {/* Stil tanımları */}
            <style>{css}</style>
        </>
    );
};


// --- CSS Stilleri (Daha Modern ve Responsive) ---
// Stil tanımları (CSS Değişkeni) - Users.jsx içine eklenecek veya Users.css'e taşınacak
const css = `
:root {
    --primary-color: #009944;
    --primary-dark: #007c39;
    --secondary-color: #6c757d;
    --secondary-dark: #5a6268;
    --light-gray: #f8f9fa;
    --medium-gray: #dee2e6;
    --dark-gray: #495057;
    --text-color: #343a40;
    --white-color: #fff;
    --danger-color: #dc3545;
    --danger-dark: #bd2130;
    --warning-color: #ffc107;
    --warning-dark: #e0a800;
    --success-color: #28a745;
    --success-dark: #1e7e34;
    --info-color: #17a2b8;
    --info-dark: #117a8b;
    --border-radius-sm: 4px;
    --border-radius-md: 8px;
    --border-radius-lg: 12px;
    --box-shadow-light: 0 2px 5px rgba(0,0,0,0.06);
    --box-shadow-medium: 0 4px 12px rgba(0,0,0,0.1);
}

.admin-users-container {
    padding: 1.5rem;
    background-color: var(--light-gray);
    min-height: calc(100vh - 60px); /* Navbar yüksekliğine göre ayarlayın */
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
.admin-users-container.is-loading,
.admin-users-container.has-error {
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    font-size: 1.2rem;
    color: var(--secondary-color);
}
.admin-users-container.has-error p {
    color: var(--danger-color);
    background-color: #f8d7da;
    border: 1px solid #f5c6cb;
    padding: 1rem;
    border-radius: var(--border-radius-md);
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
}
.page-title {
    color: var(--primary-dark);
    margin: 0;
    font-size: 1.8rem;
    font-weight: 600;
}

/* Genel Kart Stili */
.card {
    background-color: var(--white-color);
    border-radius: var(--border-radius-lg);
    padding: 1.5rem;
    box-shadow: var(--box-shadow-medium);
    margin-bottom: 1.5rem;
}

/* Genel Buton Stili */
.button {
    padding: 0.6rem 1rem;
    border-radius: var(--border-radius-md);
    border: none;
    cursor: pointer;
    font-weight: 500;
    font-size: 0.9rem;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    line-height: 1.3;
    text-decoration: none; /* Link gibi kullanılan butonlar için */
}
.button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
.button.primary { background-color: var(--primary-color); color: var(--white-color); }
.button.primary:hover:not(:disabled) { background-color: var(--primary-dark); }
.button.secondary { background-color: var(--secondary-color); color: var(--white-color); border: 1px solid var(--secondary-color); }
.button.secondary:hover:not(:disabled) { background-color: var(--secondary-dark); border-color: var(--secondary-dark); }
.button.success { background-color: var(--success-color); color: var(--white-color); }
.button.success:hover:not(:disabled) { background-color: var(--success-dark); }
.button.danger { background-color: var(--danger-color); color: var(--white-color); }
.button.danger:hover:not(:disabled) { background-color: var(--danger-dark); }
.button.warning { background-color: var(--warning-color); color: var(--text-color); }
.button.warning:hover:not(:disabled) { background-color: var(--warning-dark); }
.button.ghost { background: none; border: 1px solid var(--medium-gray); color: var(--text-color); }
.button.ghost:hover:not(:disabled) { background-color: var(--light-gray); border-color: #adb5bd; }
.button.icon-button { padding: 0.4rem; background: none; color: var(--secondary-color); font-size: 1.1rem; border: none; }
.button.icon-button:hover:not(:disabled) { color: var(--text-color); background-color: var(--light-gray); }

.add-user-button {
    background-color: var(--success-color);
    color: var(--white-color);
    border: none;
    padding: 10px 15px;
    border-radius: 8px; /* Eski koddan gelen border-radius */
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.2s ease;
    display: flex; /* Eski koddan gelen display flex */
    align-items: center; /* Eski koddan gelen align-items */
    gap: 5px; /* Eski koddan gelen gap */
}
.add-user-button:hover:not(:disabled) { background-color: var(--success-dark); }


/* Form Stilleri */
.form-card { border: 1px solid var(--medium-gray); background-color: #fdfdfd; animation: slideDown 0.3s ease-out; padding: 20px; margin-bottom: 1.5rem; border-radius: var(--border-radius-lg); box-shadow: var(--box-shadow-light); }
@keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
.form-card h3 { margin-top: 0; color: var(--primary-color); border-bottom: 1px solid var(--medium-gray); padding-bottom: 0.75rem; margin-bottom: 1.5rem; font-size: 1.25rem; }
.form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem 1.5rem; margin-bottom: 1.5rem; }
.form-grid label, .modal-content label { display: block; font-size: 0.9rem; margin-bottom: 0.3rem; color: #555; font-weight: 500; }
.form-grid input[type="text"],
.form-grid input[type="password"],
.form-grid input[type="email"],
.form-grid input[type="tel"],
.form-grid select,
.form-grid textarea,
.modal-content input[type="text"],
.modal-content input[type="password"],
.modal-content input[type="email"],
.modal-content input[type="tel"],
.modal-content select,
.modal-content textarea {
    width: 100%; padding: 0.6rem 0.75rem; border: 1px solid #ced4da; border-radius: var(--border-radius-md); box-sizing: border-box; font-size: 0.95rem; transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.form-grid input:focus, .form-grid select:focus, .form-grid textarea:focus,
.modal-content input:focus, .modal-content select:focus, .modal-content textarea:focus {
    border-color: var(--primary-color); outline: none; box-shadow: 0 0 0 2px rgba(0, 153, 68, 0.2);
}
.form-grid textarea { resize: vertical; min-height: 60px; }
.form-grid .full-width { grid-column: 1 / -1; }
.form-actions { text-align: right; margin-top: 1rem; }
.form-error, .error-message { color: var(--danger-color); font-size: 0.9em; margin-top: 1rem; background-color: #f8d7da; border: 1px solid #f5c6cb; padding: 0.75rem; border-radius: var(--border-radius-md); }

/* Filtre Stilleri */
.filters { display: flex; align-items:center; flex-wrap: wrap; gap: 1rem; }
.filters select, .filters input {
    padding: 10px 12px; /* Padding ayarlandı (eski koddan) */
    height: 42px;
    border: 1px solid #ced4da;
    border-radius: var(--border-radius-md);
    flex: 1 1 200px; /* Büyüyüp küçülebilir, temel 200px (eski koddan) */
    font-size: 0.95rem;
    box-sizing: border-box; /* Padding ve border dahil (eski koddan) */
}
.filters input { min-width: 250px; } /* Arama kutusu için minimum genişlik (eski koddan) */

/* Tablo Stilleri */
.table-container { overflow-x: auto; }
table { width: 100%; border-collapse: separate; border-spacing: 0; }
/* .desktop-table classını tabloyu içeren div'e ekleyin */
.desktop-table { display: block; } /* Başlangıçta görünür */
th, td { padding: 0.8rem 1rem; border-bottom: 1px solid #dee2e6; text-align: left; font-size: 0.9rem; white-space: nowrap; vertical-align: middle;}
th { background-color: var(--primary-color); color: var(--white-color); cursor: pointer; font-weight: 600; position: sticky; top: 0; z-index: 1;}
th:first-child { border-top-left-radius: var(--border-radius-md); }
th:last-child { border-top-right-radius: var(--border-radius-md); }
th:hover { background-color: var(--primary-dark); }
tbody tr:hover { background-color: var(--light-gray); }
tbody tr:last-child td:first-child { border-bottom-left-radius: var(--border-radius-md); }
tbody tr:last-child td:last-child { border-bottom-right-radius: var(--border-radius-md); }
td.aktif { font-weight: 500; } /* Renk status-tag'den gelecek */
td.pasif { font-weight: 500; } /* Renk status-tag'den gelecek */
.no-results td { text-align: center; padding: 1.5rem; color: var(--secondary-color); font-style: italic; }


/* İşlem Butonları (Tablo İçi) */
.actions { display: flex; flex-wrap: nowrap; gap: 0.5rem; align-items: center; }
.actions .action-btn {
    background: none;
    border: none;
    padding: 5px;
    margin: 0;
    border-radius: 50%;
    cursor: pointer;
    font-size: 1rem; /* İkon boyutu */
    color: var(--secondary-color);
    transition: all 0.2s ease;
    width: 32px; /* Sabit boyut */
    height: 32px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}
.actions .action-btn:hover:not(:disabled) {
    background-color: var(--light-gray);
    color: var(--text-color); /* Genel hover rengi */
}
.actions .action-btn.view:hover:not(:disabled) { color: var(--info-color); }
.actions .action-btn.edit:hover:not(:disabled) { color: var(--warning-color); }
.actions .action-btn.toggle.active > svg { color: var(--success-color); }
.actions .action-btn.toggle.inactive > svg { color: var(--secondary-color); }
.actions .action-btn.toggle:hover:not(:disabled) > svg { opacity: 0.7; }
.actions .action-btn.delete:hover:not(:disabled) { color: var(--danger-color); }
.actions .action-btn:disabled {
    color: #bbb;
    cursor: not-allowed;
    background-color: transparent !important; /* Disabled hover efektini kaldır */
}


/* Rol Rozetleri */
.role-badge { padding: 0.2em 0.6em; font-size: 0.8em; font-weight: 600; border-radius: var(--border-radius-sm); text-transform: uppercase; display: inline-block; }
.role-aday { background-color: #cfe2ff; color: #084298; }
.role-juri { background-color: #fff3cd; color: #664d03; }
.role-yonetici { background-color: #e2e3e5; color: #41464b; }
.role-admin { background-color: #f8d7da; color: #58151c; }

/* Durum Etiketleri */
.status-tag { padding: 0.25em 0.7em; font-size: 0.85em; font-weight: 600; border-radius: 15px; /* Daha yuvarlak */ display: inline-block; }
.status-tag.aktif { background-color: #d1e7dd; color: var(--success-dark); border: 1px solid #a3cfbb;}
.status-tag.pasif { background-color: #f8d7da; color: var(--danger-dark); border: 1px solid #f1b0b7;}


/* Mobil Kartlar */
.mobile-cards { display: none; } /* Başlangıçta gizli (eski koddan) */
.user-card { background: white; border-radius: var(--border-radius-lg); padding: 1rem; box-shadow: var(--box-shadow-light); margin-bottom: 1rem; }
.user-card h3 { margin-top: 0; margin-bottom: 10px; color: var(--primary-dark); font-size: 1.1rem; /* eski koddan gelen değerler */}
.user-card p { margin: 4px 0; font-size: 0.9rem; color: var(--dark-gray); /* eski koddan gelen değerler */}
.user-card p strong { font-weight: 600; color: var(--text-color); margin-right: 5px; }
.user-card .actions {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--medium-gray);
    display: grid; /* Eski koddan gelen grid layout */
    grid-template-columns: 1fr 1fr; /* Butonları 2x2 grid yapalım (eski koddan) */
    gap: 0.75rem; /* Eski koddan gelen gap */
}
.user-card .actions button {
    width: 100%; /* Butonlar grid alanını doldursun (eski koddan) */
    justify-content: center; /* Buton içeriğini ortala (eski koddan) */
}
.user-card .actions .button { /* Genel buton stilini uygula */ }
.user-card .actions .button.delete { background-color: var(--danger-color); color: var(--white-color);} /* Sil butonu rengi (eski koddan) */
.user-card .actions .button.delete:hover:not(:disabled) { background-color: var(--danger-dark); }


/* Modal Stilleri */
.modal-overlay { position: fixed; inset: 0; background-color: rgba(0, 0, 0, 0.6); display: flex; align-items: center; justify-content: center; z-index: 1050; padding: 1rem; animation: fadeInOverlay 0.3s ease; }
@keyframes fadeInOverlay { from { opacity: 0; } to { opacity: 1; } }
.modal-content { background-color: var(--white-color); border-radius: var(--border-radius-lg); padding: 1.5rem 2rem; width: 100%; max-width: 700px; box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2); animation: slideInModal 0.3s ease-out; max-height: 90vh; overflow-y: auto; }
@keyframes slideInModal { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 1rem; border-bottom: 1px solid var(--medium-gray); margin-bottom: 1.5rem; }
.modal-header h3 { font-size: 1.5rem; font-weight: 600; color: var(--primary-dark); margin: 0; }
.close-btn { background: none; border: none; font-size: 1.8rem; color: var(--secondary-color); cursor: pointer; padding: 0; line-height: 1; transition: color 0.2s ease; }
.close-btn:hover { color: var(--text-color); }
.modal-body p { margin: 0.75rem 0; color: var(--text-color); line-height: 1.5; }
.modal-body p strong { color: var(--dark-gray); margin-right: 8px; font-weight: 600; }
.modal-body ul { padding-left: 0; list-style: none; margin-top: 0.5rem; }
.modal-body li { margin-bottom: 0.5rem; }
.modal-body a { color: #0d6efd; }
.modal-body a:hover { text-decoration: underline; }
.modal-actions { display: flex; justify-content: flex-end; margin-top: 1.5rem; gap: 0.75rem; border-top: 1px solid var(--medium-gray); padding-top: 1.5rem; }
.edit-modal .form-grid { margin-bottom: 0; }
.edit-modal .checkbox-group { grid-column: 1 / -1; display: flex; flex-wrap: wrap; gap: 1.5rem; align-items: center; margin-top: 0.5rem; padding: 1rem; border: 1px solid #eee; border-radius: var(--border-radius-md); }
.edit-modal .checkbox-group label { flex-direction: row; align-items: center; margin-bottom: 0; font-weight: normal;}
.edit-modal .checkbox-group input[type="checkbox"] { width: auto; margin-right: 0.5rem; height: 1rem; width: 1rem; cursor: pointer; }


/* ====> RESPONSIVE DÜZENLEMELER <==== */

/* Daha geniş ekranlarda tablo hücre içeriğinin sığmazsa alt satıra inmesi */
@media (max-width: 1200px) { th, td { white-space: normal; } }

/* Tablet ve altı (992px) - Tabloyu gizle, kartları göster */
@media (max-width: 992px) {
    .desktop-table { display: none; } /* Tabloyu gizle */
    .mobile-cards { display: block; } /* Kartları görünür yap */
}

/* Daha küçük tablet ve telefonlar (768px) - Filtreleri alt alta getir */
@media (max-width: 768px) {
    .filters {
        flex-direction: column; /* Alt alta */
        align-items: stretch; /* Tam genişliğe yay */
    }
    /* Filtre elemanlarının mobil boyutunu ayarla (eski koddan) */
    .filters select, .filters input {
        flex-basis: auto; /* Flex-basis'i sıfırla */
        width: 100%; /* Tam genişlik */
        min-width: unset; /* Minimum genişliği kaldır */
        font-size: 0.9rem; /* Biraz daha küçük font */
        padding: 8px 10px; /* Daha küçük padding */
        height: auto; /* Yüksekliği içeriğe göre ayarla */
    }
    .page-header { flex-direction: column; align-items: stretch; }
    .add-user-button { width: 100%; justify-content: center;}
    /* th, td { white-space: normal; } /* Tablo zaten gizli olduğu için bu gereksiz olabilir */
}

/* Çok küçük ekranlar (576px) - Form gridini tek sütuna indir */
@media (max-width: 576px) {
    .form-grid { grid-template-columns: 1fr; } /* Ekleme/Düzenleme formları tek sütun (eski koddan) */
    .edit-form-grid { grid-template-columns: 1fr; } /* Zaten vardı */
    .edit-form-grid > div[style*="gridColumn"] { grid-column: span 1; flex-direction: column; align-items: flex-start; gap: 0.5rem;}
    .modal-content { padding: 1.5rem; }
    .modal-header h3 { font-size: 1.25rem; }
    .card { padding: 1rem; } /* Genel kart padding'i (eski koddan) */
    .page-title { font-size: 1.5rem; } /* (eski koddan) */
}`;

export default Users;  
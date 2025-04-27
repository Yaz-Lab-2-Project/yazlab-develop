// src/pages/manager/Profile.jsx (Dosya adını ManagerProfile.jsx yapmanız önerilir)

import React, { useState, useEffect } from "react";
import ManagerNavbar from "../../components/navbars/ManagerNavbar";
import { useAuth } from "../../context/AuthContext"; // AuthContext import
import { FaUserCircle, FaLock, FaSave, FaSpinner } from "react-icons/fa"; // İkonlar

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

// API Fetch Helper (opsiyonel ama kullanışlı)
const apiFetch = async (url, options = {}) => {
    const defaultHeaders = { 'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken') || "", ...(options.headers || {}), };
    const response = await fetch(url, { credentials: 'include', ...options, headers: defaultHeaders, });
    if (!response.ok) {
        let errorData; try { errorData = await response.json(); } catch { errorData = await response.text(); }
        console.error(`API Error (${response.status}) on ${url}:`, errorData);
        throw { status: response.status, data: errorData, message: `API isteği başarısız (${response.status})`};
    }
    if (response.status === 204) return null;
    try { return await response.json(); } catch { return null; }
};


const ManagerProfile = () => {
  const { user, isLoading: authLoading } = useAuth(); // Context'ten kullanıcıyı al

  // Şifre Değiştirme State'leri
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword1, setNewPassword1] = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // Şifre Değiştirme Handler'ı
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!oldPassword || !newPassword1 || !newPassword2) {
      setPasswordError("Lütfen tüm şifre alanlarını doldurun.");
      return;
    }
    if (newPassword1 !== newPassword2) {
      setPasswordError("Yeni şifreler eşleşmiyor.");
      return;
    }
    if (newPassword1.length < 8) { // Backend kuralıyla aynı olmalı
       setPasswordError("Yeni şifre en az 8 karakter olmalıdır.");
       return;
    }

    setIsSubmittingPassword(true);

    const payload = {
      old_password: oldPassword,
      new_password1: newPassword1,
      new_password2: newPassword2,
    };

    try {
      await apiFetch('http://localhost:8000/api/auth/password/change/', {
          method: 'POST',
          body: JSON.stringify(payload)
      });
      setPasswordSuccess("Şifreniz başarıyla güncellendi!");
      // Formu temizle
      setOldPassword("");
      setNewPassword1("");
      setNewPassword2("");
      // Başarı mesajını bir süre sonra kaldır
      setTimeout(() => setPasswordSuccess(""), 3000);
    } catch (err) {
        console.error("Şifre değiştirme hatası:", err);
        let errorMsg = `Hata (${err.status || 'Network Error'}): Şifre değiştirilemedi. `;
        if (err.data) {
            for (const key in err.data) { errorMsg += `${key}: ${Array.isArray(err.data[key]) ? err.data[key].join(', ') : err.data[key]} `; }
            // dj-rest-auth'un spesifik hata mesajlarını yakala
            if (err.data.old_password) errorMsg = "Mevcut şifreniz yanlış.";
            if (err.data.new_password2) errorMsg = "Yeni şifreler eşleşmiyor veya yeterince karmaşık değil.";
        } else if (err.message) { errorMsg = err.message; }
        setPasswordError(errorMsg.trim());
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  // --- Render ---

  if (authLoading) {
    return (<><ManagerNavbar /><div className="profile-container is-loading"><p>Kullanıcı bilgileri yükleniyor...</p></div><style>{css}</style></>);
  }

  if (!user) {
       return (<><ManagerNavbar /><div className="profile-container has-error"><h2 className="page-title">Profil ve Ayarlar</h2><p className="error-message">Kullanıcı bilgileri yüklenemedi. Lütfen tekrar giriş yapın.</p></div><style>{css}</style></>);
  }

  return (
    <>
      <ManagerNavbar />
      <div className="profile-container">
        <div className="profile-content">
          <h2 className="page-title">👤 Profil ve Ayarlar</h2>

          {/* Kişisel Bilgiler */}
          <div className="card profile-info-card">
            <h3>📌 Kişisel Bilgiler</h3>
            <div className="info-grid">
                <div className="info-item">
                    <label>Ad Soyad</label>
                    <span>{`${user.first_name || ''} ${user.last_name || ''}`}</span>
                </div>
                 <div className="info-item">
                    <label>Kullanıcı Adı</label>
                    <span>{user.username}</span>
                </div>
                <div className="info-item">
                    <label>TC Kimlik No</label>
                    <span>{user.TC_KIMLIK || '-'}</span>
                </div>
                <div className="info-item">
                    <label>E-posta</label>
                    <span>{user.email || '-'}</span>
                </div>
                <div className="info-item">
                    <label>Telefon</label>
                    <span>{user.telefon || '-'}</span>
                </div>
                 <div className="info-item">
                    <label>Rol</label>
                    <span>{user.user_type || '-'}</span>
                </div>
                 {/* İsteğe bağlı: Düzenleme butonu eklenebilir -> /manager-profile gibi ayrı bir sayfaya yönlendirebilir */}
                 {/* <button className="button primary edit-profile-button">Bilgileri Düzenle</button> */}
            </div>
          </div>

          {/* Şifre Değiştirme */}
          <div className="card password-change-card">
            <h3>🔐 Şifre Değiştir</h3>
             {passwordSuccess && <p className="success-message">{passwordSuccess}</p>}
             {passwordError && <p className="error-message">{passwordError}</p>}
            <form onSubmit={handlePasswordChange}>
                <div className="form-group">
                    <label htmlFor="oldPassword">Mevcut Şifre*</label>
                    <input id="oldPassword" type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required disabled={isSubmittingPassword}/>
                </div>
                 <div className="form-group">
                    <label htmlFor="newPassword1">Yeni Şifre*</label>
                    <input id="newPassword1" type="password" value={newPassword1} onChange={(e) => setNewPassword1(e.target.value)} required disabled={isSubmittingPassword}/>
                 </div>
                 <div className="form-group">
                    <label htmlFor="newPassword2">Yeni Şifre (Tekrar)*</label>
                    <input id="newPassword2" type="password" value={newPassword2} onChange={(e) => setNewPassword2(e.target.value)} required disabled={isSubmittingPassword}/>
                 </div>
                 <div className="form-actions">
                    <button type="submit" className="button primary" disabled={isSubmittingPassword}>
                        {isSubmittingPassword ? <><FaSpinner className="spin"/> Güncelleniyor...</> : <><FaSave/> Şifreyi Güncelle</>}
                    </button>
                 </div>
            </form>
          </div>

          {/* Oturum Geçmişi Bölümü Kaldırıldı */}
          {/*
          <div className="card history-card">
            <h3>🕒 Oturum Geçmişi</h3>
            <p><i>Bu özellik için backend desteği gereklidir.</i></p>
            {/* API'den veri çekildiğinde burası doldurulacak *}
          </div>
          */}
        </div>
      </div>
      <style>{css}</style>
    </>
  );
};

// --- CSS Stilleri ---
const css = `
:root {
    --primary-color: #009944; --primary-dark: #007c39; --primary-light: #e6f0e6;
    --secondary-color: #6c757d; --secondary-dark: #5a6268;
    --light-gray: #f8f9fa; --medium-gray: #dee2e6; --dark-gray: #495057; --text-color: #343a40;
    --white-color: #fff; --danger-color: #dc3545; --danger-dark: #bd2130; --danger-light: #f8d7da;
    --warning-color: #ffc107; --warning-dark: #e0a800; --warning-light: #fff3cd;
    --success-color: #28a745; --success-dark: #1e7e34; --success-light: #d1e7dd;
    --info-color: #0dcaf0; --info-dark: #0baccc; --info-light: #cff4fc;
    --border-radius-sm: 0.25rem; --border-radius-md: 0.375rem; --border-radius-lg: 0.5rem;
    --box-shadow-light: 0 1px 3px rgba(0,0,0,0.05); --box-shadow-medium: 0 4px 6px rgba(0,0,0,0.1);
    --font-family-sans-serif: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.profile-container {
    padding: 2rem;
    background-color: var(--light-gray);
    font-family: var(--font-family-sans-serif);
    display: flex;
    justify-content: center;
    min-height: calc(100vh - 60px); /* Navbar yüksekliğine göre */
}
.profile-container.is-loading, .profile-container.has-error { /* Loading/Error için stiller */
    align-items: center; text-align: center; font-size: 1.1rem; color: var(--secondary-color);
}
.profile-container.has-error .error-message { background: none; border: none; padding: 0; margin-top: 0; font-size: 1.1rem;}

.profile-content {
    width: 100%;
    max-width: 700px;
}

.page-title {
    color: var(--primary-dark);
    font-size: 1.75rem;
    font-weight: 600;
    margin-bottom: 2rem;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
}

.card {
    background-color: var(--white-color);
    padding: 1.5rem 2rem;
    border-radius: var(--border-radius-lg);
    box-shadow: var(--box-shadow-medium);
    margin-bottom: 2rem;
    border: 1px solid var(--medium-gray);
}
.card h3 {
    color: var(--primary-color);
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 1.5rem 0;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid var(--medium-gray);
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.profile-info-card .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem 1.5rem;
}
.profile-info-card .info-item label {
    font-weight: 600;
    font-size: 0.85rem;
    color: var(--secondary-dark);
    display: block;
    margin-bottom: 0.25rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}
.profile-info-card .info-item span {
    font-size: 1rem;
    color: var(--text-color);
    word-break: break-word;
}
.edit-profile-button { /* Bilgileri Düzenle butonu için stil */
    margin-top: 1.5rem;
    float: right;
}

.password-change-card .form-group {
    margin-bottom: 1.25rem;
}
.password-change-card label {
    font-weight: 500;
    margin-bottom: 0.4rem;
    display: block;
    font-size: 0.95rem;
    color: var(--dark-gray);
}
.password-change-card input {
    width: 100%;
    padding: 0.7rem 0.8rem;
    border: 1px solid #ced4da;
    border-radius: var(--border-radius-md);
    font-size: 1rem;
    box-sizing: border-box;
}
.password-change-card input:focus {
    border-color: var(--primary-color);
    outline: none;
    box-shadow: 0 0 0 2px rgba(0, 153, 68, 0.2);
}
.password-change-card .form-actions {
    text-align: right;
    margin-top: 1.5rem;
}
.success-message, .error-message { /* Ortak stil */
    padding: 0.8rem 1rem;
    border-radius: var(--border-radius-md);
    margin: 0 0 1rem 0; /* Form içinde üste */
    font-weight: 500;
    font-size: 0.9rem;
    border: 1px solid transparent;
}
.success-message { background: var(--success-light); color: var(--success-dark); border-color: #a3cfbb; }
.error-message { background: var(--danger-light); color: var(--danger-dark); border-color: #f1b0b7;}

/* Butonlar */
.button { padding: 0.6rem 1.2rem; border-radius: var(--border-radius-md); border: none; cursor: pointer; font-weight: 500; font-size: 0.95rem; transition: all 0.2s ease; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; line-height: 1.4; }
.button.primary { background-color: var(--primary-color); color: var(--white-color); }
.button.primary:hover:not(:disabled) { background-color: var(--primary-dark); }
.button.secondary { background-color: var(--secondary-color); color: var(--white-color); }
.button.secondary:hover:not(:disabled) { background-color: var(--secondary-dark); }
.button:disabled { opacity: 0.65; cursor: not-allowed; }

/* Spinner */
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
.spin { animation: spin 1s linear infinite; display: inline-block; line-height: 0; vertical-align: middle;}


/* Responsive */
@media (max-width: 768px) {
    .profile-container { padding: 1rem; }
    .profile-content { max-width: 100%; }
    .card { padding: 1rem 1.25rem; }
    .page-title { font-size: 1.5rem; }
    .card h3 { font-size: 1.1rem; }
    .profile-info-card .info-grid { grid-template-columns: 1fr; }
}

`;

// --- Component Export ---
export default ManagerProfile; // Bileşen adını değiştirdik
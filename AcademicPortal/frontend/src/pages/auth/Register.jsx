import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./Register.css";

// Aynı CSRF token fonksiyonunu ekleyelim
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

// Users.jsx ile aynı user service yapısını oluşturalım
const userService = {
    create: async (userData) => {
        const csrftoken = getCookie('csrftoken');
        const response = await axios.post('/api/users/', userData, {
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            }
        });
        return response.data;
    }
};

const Register = () => {
    const [formData, setFormData] = useState({
        username: "",
        firstName: "",
        lastName: "",
        identityNumber: "",
        email: "",
        phoneNumber: "",
        password: "",
        confirmPassword: "",
        address: "",
        academicTitle: "",
    });

    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const navigate = useNavigate();

    // TC ID validation algorithm
    const validateTCKN = (tckn) => {
        if (!tckn) return false;
        if (tckn.length !== 11) return false;
        if (!/^\d+$/.test(tckn)) return false;

        const digits = tckn.split('').map(Number);
        if (digits[0] === 0) return false;

        const evenSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
        const oddSum = digits[1] + digits[3] + digits[5] + digits[7];
        const digit10 = (evenSum * 7 - oddSum) % 10;

        const sumFirst10 = digits.slice(0, 10).reduce((sum, digit) => sum + digit, 0);
        const digit11 = sumFirst10 % 10;

        return digits[9] === digit10 && digits[10] === digit11;
    };

    // Password strength calculation
    const calculatePasswordStrength = (password) => {
        let score = 0;
        if (!password) return 0;

        if (password.length >= 8) score += 1;
        if (password.length >= 12) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[a-z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^A-Za-z0-9]/.test(password)) score += 1;

        return Math.min(score, 5);
    };

    useEffect(() => {
        setPasswordStrength(calculatePasswordStrength(formData.password));
    }, [formData.password]);

    const getStrengthText = () => {
        const strengthTexts = ["Çok Zayıf", "Zayıf", "Orta", "İyi", "Güçlü", "Çok Güçlü"];
        return strengthTexts[passwordStrength] || "";
    };

    const getStrengthColor = () => {
        const colors = ["#ff4d4d", "#ff9966", "#ffcc00", "#99cc33", "#66cc66", "#009933"];
        return colors[passwordStrength] || "#e6e6e6";
    };

    // Phone number formatting
    const formatPhoneNumber = (value) => {
        if (!value) return value;

        const phoneNumber = value.replace(/[^\d]/g, '');

        if (phoneNumber.length < 4) return phoneNumber;
        if (phoneNumber.length < 7) {
            return `0(${phoneNumber.slice(1, 4)}) ${phoneNumber.slice(4)}`;
        }
        return `0(${phoneNumber.slice(1, 4)}) ${phoneNumber.slice(4, 7)}-${phoneNumber.slice(7, 11)}`;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "phoneNumber") {
            const formattedValue = formatPhoneNumber(value);
            setFormData({ ...formData, [name]: formattedValue });
        } else if (name === "identityNumber") {
            if (/^\d*$/.test(value) && value.length <= 11) {
                setFormData({ ...formData, [name]: value });

                if (value.length === 11) {
                    if (!validateTCKN(value)) {
                        setErrors({...errors, identityNumber: "Geçersiz TC Kimlik Numarası"});
                    } else {
                        const newErrors = {...errors};
                        delete newErrors.identityNumber;
                        setErrors(newErrors);
                    }
                } else {
                    const newErrors = {...errors};
                    delete newErrors.identityNumber;
                    setErrors(newErrors);
                }
            }
        } else if (name === "username") {
            if (/^[a-zA-Z0-9_]*$/.test(value)) {
                setFormData({ ...formData, [name]: value });
                if (value.length >= 3 && /^[a-zA-Z0-9_]+$/.test(value)) {
                    const newErrors = {...errors};
                    delete newErrors.username;
                    setErrors(newErrors);
                }
            }
        } else {
            setFormData({ ...formData, [name]: value });
        }

        if (name === "confirmPassword" || (name === "password" && formData.confirmPassword)) {
            const passwordToCheck = (name === "password") ? value : formData.password;
            const confirmPasswordToCheck = (name === "confirmPassword") ? value : formData.confirmPassword;

            if (passwordToCheck && confirmPasswordToCheck && passwordToCheck !== confirmPasswordToCheck) {
                setErrors({...errors, confirmPassword: "Şifreler eşleşmiyor"});
            } else {
                const newErrors = {...errors};
                delete newErrors.confirmPassword;
                setErrors(newErrors);
            }
        }
    };

    const validateForm = () => {
        const newErrors = {};
        const requiredFields = {
            username: "Kullanıcı adı gereklidir",
            firstName: "Ad gereklidir",
            lastName: "Soyad gereklidir",
            identityNumber: "TC Kimlik No gereklidir",
            email: "E-posta gereklidir",
            phoneNumber: "Telefon numarası gereklidir",
            password: "Şifre gereklidir",
            confirmPassword: "Şifre tekrarı gereklidir",
            academicTitle: "Akademik ünvan seçilmelidir"
        };

        Object.entries(requiredFields).forEach(([field, message]) => {
            if (!formData[field]) newErrors[field] = message;
        });

        if (formData.username) {
            if (formData.username.length < 3) {
                newErrors.username = "Kullanıcı adı en az 3 karakter olmalıdır";
            } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
                newErrors.username = "Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir";
            }
        }

        if (formData.identityNumber && !validateTCKN(formData.identityNumber)) {
            newErrors.identityNumber = "Geçersiz TC Kimlik Numarası";
        }

        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Geçersiz e-posta formatı";
        }

        if (formData.phoneNumber && formData.phoneNumber.replace(/[^\d]/g, '').length !== 11) {
            newErrors.phoneNumber = "Geçersiz telefon numarası (11 hane olmalı)";
        }

        if (formData.password && formData.password.length < 8) {
            newErrors.password = "Şifre en az 8 karakter olmalıdır";
        }

        if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Şifreler eşleşmiyor";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);
        setErrors({});
        setSuccess("");

        try {
            // Prepare payload like in Users.jsx
            const payload = {
                username: formData.username,
                first_name: formData.firstName,
                last_name: formData.lastName,
                TC_KIMLIK: formData.identityNumber,
                email: formData.email,
                telefon: formData.phoneNumber.replace(/[^\d]/g, ''),
                password: formData.password,
                adres: formData.address,
                // Eğer akademik_unvan bir ID olarak gönderiliyorsa, integer'a çevir
                akademik_unvan: formData.academicTitle ? formData.academicTitle : null,
                user_type: "ADAY"
            };

            console.log("Sending registration data...");
            
            // Call the userService create method like in Users.jsx
            await userService.create(payload);
            
            setSuccess("Kayıt başarılı! Giriş yapabilirsiniz.");
            setTimeout(() => navigate("/login"), 3000);
        } catch (err) {
            console.error("Kayıt hatası:", err);
            let errorMsg = "Kayıt başarısız oldu. Lütfen daha sonra tekrar deneyin.";

            if (err.response) {
                console.error("Backend response data:", err.response.data);
                console.error("Backend response status:", err.response.status);
                if (typeof err.response.data === 'object' && err.response.data !== null) {
                    // Try to extract specific field errors
                    const backendErrors = Object.entries(err.response.data)
                        .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
                        .join('; ');
                    if (backendErrors) {
                        errorMsg = `Kayıt hatası: ${backendErrors}`;
                    } else if (err.response.data.detail) {
                        errorMsg = err.response.data.detail;
                    }
                } else if (typeof err.response.data === 'string') {
                    errorMsg = err.response.data;
                }
            } else if (err.request) {
                // The request was made but no response was received
                console.error("No response received:", err.request);
                errorMsg = "Sunucuya ulaşılamadı. Ağ bağlantınızı kontrol edin.";
            } else {
                // Something happened in setting up the request that triggered an Error
                console.error('Error setting up request:', err.message);
                errorMsg = `Bir hata oluştu: ${err.message}`;
            }

            setErrors({ general: errorMsg });
            setIsSubmitting(false);
        }
    };

    return (
        <div className="register-container">
            <div className="register-box">
                <div className="register-header">
                    <img
                        src="/src/assets/kou_logo.png"
                        alt="Kocaeli Üniversitesi Logo"
                        className="register-logo"
                    />
                    <h2>Kocaeli Üniversitesi</h2>
                    <h3>Akademik Personel Başvuru Sistemi</h3>
                </div>

                {success ? (
                    <div className="success-container">
                        <div className="success-icon">✓</div>
                        <h3>{success}</h3>
                        <div className="redirect-message">
                            <span>Giriş sayfasına yönlendiriliyorsunuz</span>
                            <div className="loading-dots">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleRegister} noValidate className="register-form">
                        <div className="form-title">
                            <h4>Yeni Kayıt</h4>
                        </div>

                        {errors.general && (
                            <div className="error-box">
                                <span>{errors.general}</span>
                            </div>
                        )}

                        <div className="form-section">
                            <h5 className="section-title">Hesap Bilgileri</h5>

                            <div className="form-group">
                                <label htmlFor="username">Kullanıcı Adı</label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className={errors.username ? "error" : ""}
                                    placeholder="Kullanıcı adınızı belirleyin"
                                    maxLength={150}
                                />
                                {errors.username && <span className="error-message">{errors.username}</span>}
                                <small className="field-hint">Sadece harf, rakam ve alt çizgi (_) kullanabilirsiniz</small>
                            </div>
                        </div>

                        <div className="form-section">
                            <h5 className="section-title">Kişisel Bilgiler</h5>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="firstName">Ad</label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className={errors.firstName ? "error" : ""}
                                        placeholder="Adınızı giriniz"
                                    />
                                    {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="lastName">Soyad</label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className={errors.lastName ? "error" : ""}
                                        placeholder="Soyadınızı giriniz"
                                    />
                                    {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="identityNumber">TC Kimlik Numarası</label>
                                    <input
                                        type="text"
                                        id="identityNumber"
                                        name="identityNumber"
                                        value={formData.identityNumber}
                                        onChange={handleChange}
                                        className={errors.identityNumber ? "error" : ""}
                                        placeholder="11 haneli TC Kimlik numaranız"
                                        maxLength={11}
                                    />
                                    {errors.identityNumber && <span className="error-message">{errors.identityNumber}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="academicTitle">Akademik Ünvan</label>
                                    <select
                                        id="academicTitle"
                                        name="academicTitle"
                                        value={formData.academicTitle}
                                        onChange={handleChange}
                                        className={errors.academicTitle ? "error" : ""}
                                    >
                                        <option value="">Akademik ünvanınızı seçiniz</option>
                                        <option value="PROFESOR">Profesör</option>
                                        <option value="DOCENT">Doçent</option>
                                        <option value="DR_OGRETIM_UYESI">Dr. Öğretim Üyesi</option>
                                        <option value="OGRETIM_GOREVLISI">Öğretim Görevlisi</option>
                                        <option value="ARASTIRMA_GOREVLISI">Araştırma Görevlisi</option>
                                    </select>
                                    {errors.academicTitle && <span className="error-message">{errors.academicTitle}</span>}
                                </div>
                            </div>
                        </div>

                        <div className="form-section">
                            <h5 className="section-title">İletişim Bilgileri</h5>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="email">E-posta</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={errors.email ? "error" : ""}
                                        placeholder="ornek@kou.edu.tr"
                                    />
                                    {errors.email && <span className="error-message">{errors.email}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="phoneNumber">Telefon Numarası</label>
                                    <input
                                        type="tel"
                                        id="phoneNumber"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        placeholder="0(XXX) XXX-XXXX"
                                        className={errors.phoneNumber ? "error" : ""}
                                        maxLength={15}
                                    />
                                    {errors.phoneNumber && <span className="error-message">{errors.phoneNumber}</span>}
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="address">Adres</label>
                                <textarea
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    rows="3"
                                    className={errors.address ? "error" : ""}
                                    placeholder="Tam adresinizi giriniz"
                                ></textarea>
                                {errors.address && <span className="error-message">{errors.address}</span>}
                            </div>
                        </div>

                        <div className="form-section">
                            <h5 className="section-title">Güvenlik</h5>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="password">Şifre</label>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={errors.password ? "error" : ""}
                                        placeholder="En az 8 karakter"
                                    />
                                    {errors.password && <span className="error-message">{errors.password}</span>}

                                    {formData.password && (
                                        <div className="password-strength">
                                            <div className="strength-bar">
                                                <div
                                                    className="strength-fill"
                                                    style={{
                                                        width: `${(passwordStrength / 5) * 100}%`,
                                                        backgroundColor: getStrengthColor()
                                                    }}
                                                ></div>
                                            </div>
                                            <span className="strength-text" style={{ color: getStrengthColor() }}>
                                                {getStrengthText()}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="confirmPassword">Şifre Tekrarı</label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className={errors.confirmPassword ? "error" : ""}
                                        placeholder="Şifrenizi tekrar giriniz"
                                    />
                                    {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                                </div>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button
                                type="submit"
                                className={isSubmitting ? "btn-register submitting" : "btn-register"}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="spinner"></span>
                                        İşleniyor...
                                    </>
                                ) : "KAYIT OL"}
                            </button>
                        </div>

                        <div className="form-footer">
                            <p>Zaten hesabınız var mı? <Link to="/login">Giriş Yap</Link></p>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Register;
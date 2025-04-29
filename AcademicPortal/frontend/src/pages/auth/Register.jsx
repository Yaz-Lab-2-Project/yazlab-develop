import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./Register.css";

const Register = () => {
    const [formData, setFormData] = useState({
        username: "", // Username alanı eklendi
        fullName: "",
        identityNumber: "",
        email: "",
        phoneNumber: "",
        password: "",
        confirmPassword: "",
        birthDate: "",
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
                }
            }
        } else if (name === "username") {
            // Username validasyonu ekle (sadece alfanümerik karakterler)
            if (/^[a-zA-Z0-9_]*$/.test(value)) {
                setFormData({ ...formData, [name]: value });
            }
        } else {
            setFormData({ ...formData, [name]: value });
        }

        // Password match check
        if (name === "confirmPassword" || (name === "password" && formData.confirmPassword)) {
            if (name === "confirmPassword" && formData.password !== value) {
                setErrors({...errors, confirmPassword: "Şifreler eşleşmiyor"});
            } else if (name === "password" && formData.confirmPassword && formData.confirmPassword !== value) {
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
            username: "Kullanıcı adı gereklidir", // Username hata mesajı eklendi
            fullName: "Ad Soyad gereklidir",
            identityNumber: "TC Kimlik No gereklidir",
            email: "E-posta gereklidir",
            phoneNumber: "Telefon numarası gereklidir",
            password: "Şifre gereklidir",
            confirmPassword: "Şifre tekrarı gereklidir",
            birthDate: "Doğum tarihi gereklidir",
            academicTitle: "Akademik ünvan seçilmelidir"
        };

        // Check all required fields
        Object.entries(requiredFields).forEach(([field, message]) => {
            if (!formData[field]) newErrors[field] = message;
        });

        // Username validation
        if (formData.username) {
            if (formData.username.length < 3) {
                newErrors.username = "Kullanıcı adı en az 3 karakter olmalıdır";
            } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
                newErrors.username = "Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir";
            }
        }

        // Format validations
        if (formData.identityNumber && !validateTCKN(formData.identityNumber)) {
            newErrors.identityNumber = "Geçersiz TC Kimlik Numarası";
        }

        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Geçersiz e-posta formatı";
        }

        if (formData.phoneNumber && formData.phoneNumber.replace(/[^\d]/g, '').length !== 11) {
            newErrors.phoneNumber = "Geçersiz telefon numarası";
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

        try {
            await axios.post("http://127.0.0.1:8000/api/users/", {
                username: formData.username, // Username alanını gönder
                fullName: formData.fullName,
                identityNumber: formData.identityNumber,
                email: formData.email,
                phoneNumber: formData.phoneNumber.replace(/[^\d]/g, ''),
                password: formData.password,
                birthDate: formData.birthDate,
                address: formData.address,
                academicTitle: formData.academicTitle,
                user_type: "ADAY" // Tüm kullanıcıları ADAY olarak ayarla
            });

            setSuccess("Kayıt başarılı! E-posta adresinize doğrulama bağlantısı gönderildi.");
            setTimeout(() => navigate("/login"), 3000);
        } catch (err) {
            console.error("Kayıt hatası:", err);

            if (err.response?.data?.message) {
                setErrors({general: err.response.data.message});
            } else {
                setErrors({general: "Kayıt başarısız oldu. Lütfen daha sonra tekrar deneyin."});
            }

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
                        <p>E-posta adresinize gönderilen doğrulama bağlantısına tıklayarak hesabınızı aktifleştirebilirsiniz.</p>
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

                            {/* Username alanı eklendi */}
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
                                />
                                {errors.username && <span className="error-message">{errors.username}</span>}
                                <small className="field-hint">Sadece harf, rakam ve alt çizgi (_) kullanabilirsiniz</small>
                            </div>
                        </div>

                        <div className="form-section">
                            <h5 className="section-title">Kişisel Bilgiler</h5>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="fullName">Ad Soyad</label>
                                    <input
                                        type="text"
                                        id="fullName"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        className={errors.fullName ? "error" : ""}
                                        placeholder="Adınızı ve soyadınızı giriniz"
                                    />
                                    {errors.fullName && <span className="error-message">{errors.fullName}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="birthDate">Doğum Tarihi</label>
                                    <input
                                        type="date"
                                        id="birthDate"
                                        name="birthDate"
                                        value={formData.birthDate}
                                        onChange={handleChange}
                                        className={errors.birthDate ? "error" : ""}
                                    />
                                    {errors.birthDate && <span className="error-message">{errors.birthDate}</span>}
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
                                        <option value="professor">Profesör</option>
                                        <option value="associate">Doçent</option>
                                        <option value="assistant">Dr. Öğretim Üyesi</option>
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
                                        placeholder="örnek@domain.com"
                                    />
                                    {errors.email && <span className="error-message">{errors.email}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="phoneNumber">Telefon Numarası</label>
                                    <input
                                        type="text"
                                        id="phoneNumber"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        placeholder="0(5XX) XXX-XXXX"
                                        className={errors.phoneNumber ? "error" : ""}
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
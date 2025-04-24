import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Register.css";

const Register = () => {
    const [formData, setFormData] = useState({
        fullName: "",
        identityNumber: "",
        email: "",
        phoneNumber: "",
        password: "",
        birthDate: "",
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            await axios.post("http://localhost:3000/api/auth/register", formData);
            setSuccess("Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...");
            setTimeout(() => navigate("/login"), 2000);
        } catch (err) {
            setError("Kayıt başarısız. Lütfen bilgilerinizi kontrol edin.");
        }
    };

    return (
        <div className="register-container">
            <div className="register-box">
                <img
                    src="/logo.png"
                    alt="Kocaeli Üniversitesi Logo"
                    className="register-logo"
                />
                <h2>Kocaeli Üniversitesi Aday Akademik Personel Kayıt</h2>
                <form onSubmit={handleRegister}>
                    <input
                        type="text"
                        name="fullName"
                        placeholder="Ad Soyad"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="text"
                        name="identityNumber"
                        placeholder="11 Haneli Kimlik Numarası"
                        value={formData.identityNumber}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="E-Posta"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="text"
                        name="phoneNumber"
                        placeholder="Telefon Numarası"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Şifre"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="date"
                        name="birthDate"
                        placeholder="Doğum Tarihi"
                        value={formData.birthDate}
                        onChange={handleChange}
                        required
                    />
                    {error && <p className="error-message">{error}</p>}
                    {success && <p className="success-message">{success}</p>}
                    <button type="submit">KAYIT OL</button>
                </form>
            </div>
        </div>
    );
};

export default Register;

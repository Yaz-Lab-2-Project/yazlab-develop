// src/pages/auth/Login.jsx

import React, { useState, useEffect } from "react";
// useNavigate artık burada doğrudan kullanılmayacak (AuthHandler yapacak)
// import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // AuthContext hook'unu import et
import "./Login.css";
import Logo from "../../assets/kou_logo.png";

// CSRF token'ı çerezden okumak için yardımcı fonksiyon
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


const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    // const navigate = useNavigate(); // Kaldırıldı
    const { login } = useAuth(); // Context'ten login fonksiyonunu al

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // 1. CSRF token'ı al
            await fetch('/api/set-csrf/', {
                method: 'GET',
                credentials: 'include'
            });

            // 2. Login isteği
            const loginResponse = await fetch('/api/auth/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                credentials: 'include',
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });

            const data = await loginResponse.json();

            if (!loginResponse.ok) {
                throw new Error(data.detail || data.non_field_errors?.[0] || 'Giriş başarısız');
            }

            // 3. Kullanıcı bilgilerini al
            const userResponse = await fetch('/api/auth/user/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${data.key}`
                },
                credentials: 'include'
            });

            if (!userResponse.ok) {
                throw new Error('Kullanıcı bilgileri alınamadı');
            }

            const userData = await userResponse.json();
            // Token'ı da login fonksiyonuna gönder
            login(userData, data.key);

        } catch (error) {
            console.error('Login error:', error);
            setError(error.message || 'Giriş yapılırken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    // CSRF token'ı sayfa yüklendiğinde al
    useEffect(() => {
        fetch('/api/set-csrf/', {
            method: 'GET',
            credentials: 'include'
        }).catch(err => {
            console.error("CSRF token alma hatası:", err);
        });
    }, []);

    return (
        <div className="login-container">
            <div className="login-box">
                <img src={Logo} alt="Kocaeli Üniversitesi Logo" className="login-logo" />
                <h2>Kocaeli Üniversitesi Aday Akademik Personel Girişi</h2>
                <form onSubmit={handleLogin}>
                    <input
                        type="text"
                        placeholder="Kullanıcı Adı"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        disabled={loading}
                    />
                    <input
                        type="password"
                        placeholder="Şifre"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                    />
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" disabled={loading}>
                        {loading ? 'GİRİŞ YAPILIYOR...' : 'GİRİŞ YAP'}
                    </button>
                </form>
                <div className="login-links">
                    <a href="/register">Sisteme kayıt ol</a>
                    <a href="/forgot-password">Parolanı mı unuttun?</a>
                </div>
            </div>
        </div>
    );
};

export default Login;
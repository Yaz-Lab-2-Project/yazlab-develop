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

        const csrftoken = getCookie('csrftoken');

        if (!csrftoken) {
            setError('Güvenlik token\'ı alınamadı. Sayfayı yenileyip tekrar deneyin.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/api/auth/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken
                },
                credentials: 'include',
                body: JSON.stringify({ username: username, password: password })
            });

            if (response.ok) {
                // Giriş API'si başarılı, şimdi kullanıcı detaylarını alalım
                try {
                    const userResponse = await fetch('http://localhost:8000/api/auth/user/', {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include'
                    });
                    if (userResponse.ok) {
                        const userData = await userResponse.json();
                        // ====> SADECE CONTEXT'i GÜNCELLE <====
                        login(userData);
                        console.log("Login successful, context updated. AuthHandler should redirect.");
                        // Yönlendirme burada yapılmayacak, AuthHandler yapacak.
                    } else {
                        setError("Giriş başarılı ancak kullanıcı bilgileri alınamadı. Sayfayı yenileyin.");
                        // Başarılı login sonrası user fetch edilemiyorsa context'i null yapmak mantıklı olabilir
                        // login(null); // Veya context'te ayrı bir error state tutulabilir
                    }
                } catch (userError) {
                     setError("Giriş başarılı ancak kullanıcı bilgileri alınırken bir hata oluştu.");
                     console.error("Kullanıcı bilgisi alma hatası:", userError);
                     // login(null);
                }
            } else {
                // Giriş başarısız
                let errorMsg = `Hata (${response.status}): `;
                try {
                     const errorData = await response.json();
                     console.error('Giriş hatası:', errorData);
                     if (errorData.non_field_errors) {
                         errorMsg += errorData.non_field_errors.join(' ');
                     } else if (errorData.detail) {
                         errorMsg += errorData.detail;
                     } else {
                         errorMsg += "Kullanıcı adı veya şifre hatalı/geçersiz.";
                     }
                } catch(jsonError) {
                     // JSON parse edilemezse veya başka bir hata
                     errorMsg += "Sunucudan geçersiz yanıt veya ağ hatası."
                }
                setError(errorMsg);
            }
        } catch (error) {
            console.error('İstek sırasında bir hata oluştu:', error);
            setError('Giriş yapılırken bir ağ hatası veya sunucu hatası oluştu.');
        } finally {
             setLoading(false);
        }
    };

    // CSRF Çerezini almak için ilk istek
    useEffect(() => {
      fetch('http://localhost:8000/api/set-csrf/', {
        method: 'GET',
        credentials: 'include'
      }).then(response => {
          console.log('Set CSRF request completed, status:', response.status);
      }).catch(err => {
         console.log("İlk istek (set-csrf) sırasında hata:", err);
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
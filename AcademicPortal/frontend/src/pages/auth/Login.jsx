import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import Logo from "../../assets/kou_logo.png";

const predefinedUsers = [
    {
      id: "1a2b3c4d-1111-aaaa-bbbb-000000000001",
      tc_kimlik_no: "11111111111",
      ad: "Ali",
      soyad: "Yılmaz",
      email: "ali.yilmaz@example.com",
      sifre: "123",
      rol: "user"
    },
    {
      id: "1a2b3c4d-2222-bbbb-cccc-000000000002",
      tc_kimlik_no: "22222222222",
      ad: "Zeynep",
      soyad: "Kara",
      email: "zeynep.kara@example.com",
      sifre: "123",
      rol: "user"
    },
    {
      id: "1a2b3c4d-3333-cccc-dddd-000000000003",
      tc_kimlik_no: "33333333333",
      ad: "Ahmet",
      soyad: "Demir",
      email: "ahmet.demir@example.com",
      sifre: "123",
      rol: "jury"
    },
    {
      id: "1a2b3c4d-4444-dddd-eeee-000000000004",
      tc_kimlik_no: "44444444444",
      ad: "Elif",
      soyad: "Çelik",
      email: "elif.celik@example.com",
      sifre: "123",
      rol: "jury"
    },
    {
      id: "1a2b3c4d-5555-eeee-ffff-000000000005",
      tc_kimlik_no: "55555555555",
      ad: "Mehmet",
      soyad: "Koç",
      email: "mehmet.koc@example.com",
      sifre: "123",
      rol: "jury"
    },
    {
      id: "1a2b3c4d-6666-ffff-gggg-000000000006",
      tc_kimlik_no: "66666666666",
      ad: "Ayşe",
      soyad: "Şahin",
      email: "ayse.sahin@example.com",
      sifre: "123",
      rol: "admin"
    },
    {
      id: "1a2b3c4d-7777-gggg-hhhh-000000000007",
      tc_kimlik_no: "77777777777",
      ad: "Burak",
      soyad: "Güneş",
      email: "burak.gunes@example.com",
      sifre: "123",
      rol: "admin"
    },
    {
      id: "1a2b3c4d-8888-hhhh-iiii-000000000008",
      tc_kimlik_no: "88888888888",
      ad: "Fatma",
      soyad: "Aydın",
      email: "fatma.aydin@example.com",
      sifre: "123",
      rol: "manager"
    },
    {
      id: "1a2b3c4d-9999-iiii-jjjj-000000000009",
      tc_kimlik_no: "99999999999",
      ad: "Emre",
      soyad: "Taş",
      email: "emre.tas@example.com",
      sifre: "123",
      rol: "manager"
    },
    {
      id: "1a2b3c4d-aaaa-jjjj-kkkk-000000000010",
      tc_kimlik_no: "12345678901",
      ad: "Merve",
      soyad: "Yıldız",
      email: "merve.yildiz@example.com",
      sifre: "123",
      rol: "user"
    }
  ];
  
const Login = () => {
    const [identityNumber, setIdentityNumber] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    // Sayfa yüklendiğinde oturumu sonlandır
    useEffect(() => {
        localStorage.setItem("role", null);
    }, []);

    const handleLogin = (e) => {
        e.preventDefault();
        setError("");

        // Kimlik numarasına göre kullanıcıyı bul
        const user = predefinedUsers.find((u) => u.tc_kimlik_no === identityNumber);
        if (user && user.sifre === password) {
            localStorage.setItem("role", user.rol);

            // Minik bir gecikme ile route değiştir
            setTimeout(() => {
                if (user.rol === "admin") navigate("/admin");
                else if (user.rol === "user") navigate("/user");
                else if (user.rol === "manager") navigate("/manager");
                else if (user.rol === "jury") navigate("/jury");
            }, 100);

        } else {
            setError("Giriş başarısız. Lütfen kimlik numaranızı ve şifrenizi kontrol edin.");
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <img src={Logo} alt="Kocaeli Üniversitesi Logo" className="login-logo" />
                <h2>Kocaeli Üniversitesi Aday Akademik Personel Girişi</h2>
                <form onSubmit={handleLogin}>
                    <input
                        type="text"
                        placeholder="Kimlik Numarası (admin, user, manager, juri)"
                        value={identityNumber}
                        onChange={(e) => setIdentityNumber(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Şifre (123)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit">GİRİŞ YAP</button>
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

import React, { useState } from "react";
import ManagerNavbar from "../../components/navbars/ManagerNavbar";

const Profile = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [history] = useState([
    "2025-03-30 10:12 - Chrome - İstanbul",
    "2025-03-29 21:05 - Mobile - Kocaeli",
    "2025-03-28 14:42 - Firefox - İstanbul",
  ]);

  const handlePasswordChange = () => {
    if (!password || !confirmPassword) return alert("Lütfen tüm alanları doldurun.");
    if (password !== confirmPassword) return alert("Şifreler eşleşmiyor.");
    alert("Şifreniz başarıyla güncellendi. (Simülasyon)");
    setPassword("");
    setConfirmPassword("");
  };

  const styles = {
    container: {
      padding: 32,
      backgroundColor: "#f4f6f9",
      fontFamily: "Segoe UI, sans-serif",
      display: "flex",
      justifyContent: "center",
    },
    content: {
      width: "100%",
      maxWidth: 700,
    },
    box: {
      backgroundColor: "#fff",
      padding: 24,
      borderRadius: 16,
      boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
      marginBottom: 32,
    },
    heading: {
      color: "#007c39",
      fontSize: 24,
      fontWeight: 600,
      marginBottom: 24,
    },
    label: {
      fontWeight: 500,
      marginBottom: 8,
      display: "block",
    },
    input: {
      width: "100%",
      padding: 10,
      marginBottom: 16,
      borderRadius: 8,
      border: "1px solid #ccc",
      fontSize: 14,
    },
    button: {
      backgroundColor: "#009944",
      color: "#fff",
      padding: "10px 20px",
      borderRadius: 10,
      border: "none",
      cursor: "pointer",
      fontWeight: 600,
      fontSize: 15,
    },
    historyItem: {
      padding: 10,
      borderBottom: "1px solid #eee",
      fontSize: 14,
      color: "#555",
    },
  };

  return (
    <>
      <ManagerNavbar />
      <div style={styles.container}>
        <div style={styles.content}>
          <h2 style={styles.heading}>👤 Profil ve Ayarlar</h2>

          <div style={styles.box}>
            <h3 style={{ marginBottom: 16 }}>📌 Kişisel Bilgiler</h3>
            <label style={styles.label}>Ad Soyad</label>
            <input style={styles.input} type="text" value="Ali Yıldız" readOnly />
            <label style={styles.label}>TC Kimlik No</label>
            <input style={styles.input} type="text" value="12345678900" readOnly />
            <label style={styles.label}>E-posta</label>
            <input style={styles.input} type="email" value="ali@example.com" readOnly />
          </div>

          <div style={styles.box}>
            <h3 style={{ marginBottom: 16 }}>🔐 Şifre Değiştir</h3>
            <label style={styles.label}>Yeni Şifre</label>
            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label style={styles.label}>Yeni Şifre (Tekrar)</label>
            <input
              style={styles.input}
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button style={styles.button} onClick={handlePasswordChange}>Şifreyi Güncelle</button>
          </div>

          <div style={styles.box}>
            <h3 style={{ marginBottom: 16 }}>🕒 Oturum Geçmişi</h3>
            {history.map((item, index) => (
              <div key={index} style={styles.historyItem}>{item}</div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
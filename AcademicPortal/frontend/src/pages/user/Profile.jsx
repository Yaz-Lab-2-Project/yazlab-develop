import React, { useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import UserNavbar from "../../components/navbars/UserNavbar";

export default function UserProfile() {
  const [form, setForm] = useState({
    fullName: "Ali Veli",
    email: "ali.veli@example.com",
    phone: "05001112233",
    password: "",
    tckn: "12345678901",
    institution: "Kocaeli Üniversitesi",
    department: "Bilgisayar Mühendisliği",
    academicTitle: "Dr. Öğr. Üyesi"
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Bilgiler güncellendi!");
  };

  return (
    <>
      {/* Navbar */}
      <UserNavbar />

      {/* Profil Sayfası */}
      <div className="profile-wrapper">
        <div className="profile-card">
          <div className="profile-header">
            <FaUserCircle size={48} color="#009944" />
            <h2 className="profile-title">Profil Bilgilerim</h2>
          </div>

          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-section">
              <h3 className="section-title">Kişisel Bilgiler</h3>
              <label>Ad Soyad
                <input type="text" name="fullName" value={form.fullName} onChange={handleChange} required />
              </label>
              <label>T.C. Kimlik No
                <input type="text" name="tckn" value={form.tckn} onChange={handleChange} required maxLength={11} />
              </label>
              <label>E-posta
                <input type="email" name="email" value={form.email} onChange={handleChange} required />
              </label>
              <label>Telefon Numarası
                <input type="tel" name="phone" value={form.phone} onChange={handleChange} required />
              </label>
              <label>Yeni Şifre
                <input type="password" name="password" value={form.password} onChange={handleChange} />
              </label>
            </div>

            <div className="form-section">
              <h3 className="section-title">Akademik Bilgiler</h3>
              <label>Kurum
                <input type="text" name="institution" value={form.institution} onChange={handleChange} required />
              </label>
              <label>Bölüm
                <input type="text" name="department" value={form.department} onChange={handleChange} required />
              </label>
              <label>Akademik Unvan
                <select name="academicTitle" value={form.academicTitle} onChange={handleChange} required>
                  <option value="Arş. Gör.">Arş. Gör.</option>
                  <option value="Dr. Öğr. Üyesi">Dr. Öğr. Üyesi</option>
                  <option value="Doçent">Doçent</option>
                  <option value="Profesör">Profesör</option>
                </select>
              </label>
            </div>

            <button type="submit" className="profile-btn">Bilgileri Güncelle</button>
          </form>
        </div>
      </div>

      <style>{`
        /* Navbar ve Profil Wrapper Ayırma */
        .profile-wrapper {
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding: 2rem;
          background-color: #f4f6f9;
          min-height: calc(100vh - 70px); /* Navbar yüksekliği çıkarıldı */
          margin-top: 70px; /* Navbarın altında yer alır */
        }

        .profile-card {
          background-color: #fff;
          border-radius: 1rem;
          padding: 2rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          max-width: 700px;
          width: 100%;
        }

        .profile-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .profile-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #333;
        }

        .profile-form {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .form-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .section-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #007c39;
          margin-bottom: 0.5rem;
        }

        label {
          color: #555;
          font-size: 0.95rem;
          display: flex;
          flex-direction: column;
        }

        input, select {
          margin-top: 0.25rem;
          padding: 0.5rem;
          border: 1px solid #ccc;
          border-radius: 0.5rem;
          font-size: 1rem;
        }

        .profile-btn {
          background-color: #009944;
          color: white;
          padding: 0.75rem;
          border: none;
          border-radius: 0.5rem;
          font-weight: bold;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        .profile-btn:hover {
          background-color: #007c39;
        }

        /* Responsive Tasarım */
        @media (max-width: 768px) {
          .profile-wrapper {
            padding: 1rem;
          }

          .profile-card {
            padding: 1.5rem;
          }

          .profile-header {
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
          }

          .profile-title {
            font-size: 1.25rem;
            text-align: center;
          }

          .form-section {
            gap: 0.75rem;
          }

          input, select {
            font-size: 0.9rem;
            padding: 0.5rem;
          }

          .profile-btn {
            font-size: 0.9rem;
            padding: 0.5rem;
          }
        }

        @media (max-width: 480px) {
          .profile-card {
            padding: 1rem;
          }

          .profile-title {
            font-size: 1.1rem;
          }

          .section-title {
            font-size: 1rem;
          }

          input, select {
            font-size: 0.85rem;
            padding: 0.4rem;
          }

          .profile-btn {
            font-size: 0.85rem;
            padding: 0.4rem;
          }
        }
      `}</style>
    </>
  );
}
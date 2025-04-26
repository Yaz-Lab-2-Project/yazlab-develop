// src/components/navbars/AdminNavbar.jsx

import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../../assets/kou_logo.png";
import { useAuth } from "../../context/AuthContext"; // AuthContext hook'unu import edin

// SVG Icon bileşeni
const Icon = ({ name, width = 18, height = 18 }) => (
  <svg width={width} height={height} className="icon" aria-hidden="true">
    <use href={`/sprite.svg#${name}`} />
  </svg>
);

export default function AdminNavbar() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth(); // Context'ten user ve logout fonksiyonunu alın
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 850);

  // ===> DÜZELTİLMİŞ handleLogout Fonksiyonu <===
  const handleLogout = async () => {
    console.log("Admin Logout button clicked");
    try {
        await logout(); // Context'teki async logout fonksiyonunu çağır ve bitmesini bekle
        console.log("Context logout finished, navigating to /login");
        navigate('/login'); // Context işlemi bitince login'e yönlendir
    } catch (error) {
        console.error("Error during logout process:", error);
        navigate('/login'); // Hata olsa bile login'e yönlendir
    }
    closeMenu(); // Mobil menüyü kapat
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  // Mobil görünüm için useEffect
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 850);
      if (window.innerWidth > 850) setMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {/* CSS Kodları */}
      <style>{`
        .navbar {
          font-family: 'Segoe UI', sans-serif;
          background-color: #ffffff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          padding: 10px 20px;
          position: relative; /* Mobil menü için */
          z-index: 100; /* Diğer içeriklerin üzerinde kalması için */
        }
        .navbar_top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 1400px; /* İçeriği sınırlama */
          margin: 0 auto; /* Ortala */
        }
        .logo { height: 50px; width: 50px; object-fit: contain; }
        .hamburger-button { background: none; border: none; cursor: pointer; display: none; /* Başlangıçta gizle */}
        .navbar_links { list-style: none; padding: 0; margin: 0; display: flex; gap: 5px; /* Linkler arası boşluk */}
        .navbar_links.desktop { /* Bu sınıf artık doğrudan ul'de kullanılmıyor */ }
        .navbar_links a, .logout-button {
          display: flex; align-items: center; gap: 8px; padding: 10px 14px; /* Padding ayarlandı */
          text-decoration: none; color: #343a40; /* Koyu gri */ background-color: transparent;
          font-weight: 500; border-radius: 8px; /* Daha yumuşak köşe */ transition: all 0.2s ease;
          border: none; font-size: 0.95rem; /* Font boyutu ayarlandı */ cursor: pointer;
        }
        .navbar_links a:hover, .logout-button:hover {
          background-color: #e9f5e9; /* Daha soft yeşil */ color: #007c39; /* Koyu yeşil */
        }
        .logout-button { color: var(--danger-color, #dc3545); } /* Kırmızı çıkış butonu */
        .logout-button:hover { background-color: #f8d7da; color: #721c24; } /* Kırmızı hover */
        .navbar_links a.active {
          background-color: var(--primary-color, #009944); color: white;
          box-shadow: 0 2px 5px rgba(0, 153, 68, 0.2);
        }
        .navbar_links.mobile { /* Mobil menü stilleri */
          display: ${menuOpen ? "flex" : "none"}; flex-direction: column; gap: 5px; /* Daha az boşluk */
          background-color: #ffffff; padding: 15px; position: absolute;
          top: 100%; /* Navbar'ın hemen altı */ left: 0; right: 0;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1); border-top: 1px solid #eaeaea; z-index: 99;
        }
        .navbar_links.mobile a, .navbar_links.mobile .logout-button { width: 100%; justify-content: flex-start; padding: 12px 15px; font-size: 1rem;}
        .icon { margin-right: 6px; /* İkon ve yazı arası boşluk */ }

        @media(max-width: 850px) { /* Kırılım noktası */
           .navbar_links { display: none; } /* Masaüstü linklerini gizle */
           .hamburger-button { display: block; } /* Hamburgeri göster */
           /* .navbar_links.mobile { display: ${menuOpen ? "flex" : "none"}; } // JS kontrol ediyor */
        }
      `}</style>

      <nav className="navbar">
        <div className="navbar_top">
           {/* Logo (Admin login ise /admin'e yönlendirir) */}
          <NavLink to={isAuthenticated ? "/admin" : "/"} onClick={closeMenu}>
            <img src={logo} alt="KOU Logo" className="logo" />
          </NavLink>

           {/* Hamburger Butonu (sadece mobilde ve login olmuşsa görünür) */}
           {isAuthenticated && (
               <button className="hamburger-button" onClick={toggleMenu}>
                 <Icon name={menuOpen ? "close" : "hamburger"} width={24} height={24} />
               </button>
           )}

           {/* Navigasyon Linkleri (Masaüstü veya Mobil) */}
           {/* isAuthenticated kontrolü mobil için de geçerli olacak */}
           {isAuthenticated && (
            <ul className={`navbar_links ${isMobile ? "mobile" : ""}`}> {/* 'desktop' class'ı kaldırıldı */}
              <li>
                <NavLink to="/admin" onClick={closeMenu} className={({ isActive }) => (isActive ? "active" : "")} end> {/* 'end' prop'u eklendi */}
                  <Icon name="home" /> Ana Sayfa
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin-advertisements" onClick={closeMenu} className={({ isActive }) => (isActive ? "active" : "")}>
                  <Icon name="list" /> İlan Listesi
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin-applications" onClick={closeMenu} className={({ isActive }) => (isActive ? "active" : "")}>
                  <Icon name="agreement" /> Başvurular
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin-users" onClick={closeMenu} className={({ isActive }) => (isActive ? "active" : "")}>
                  <Icon name="users" /> Kullanıcılar
                </NavLink>
              </li>
              {/* Diğer Admin linkleri buraya eklenebilir */}
              <li>
                 {/* Düzeltilmiş Logout Butonu */}
                <button onClick={handleLogout} className="logout-button">
                  <Icon name="log-out" /> Çıkış Yap {user?.username ? `(${user.username})` : ''}
                </button>
              </li>
            </ul>
           )}
           {/* Eğer login değilse masaüstünde hiçbir link göstermemek için */}
           {!isAuthenticated && !isMobile && <div style={{height: '50px'}}></div>}
        </div>
      </nav>
    </>
  );
}
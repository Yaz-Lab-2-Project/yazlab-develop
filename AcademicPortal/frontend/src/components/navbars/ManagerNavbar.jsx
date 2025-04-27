// src/components/navbars/ManagerNavbar.jsx (Dosya adı varsayılan)

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

export default function YoneticiNavbar() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth(); // Context'ten user ve logout fonksiyonunu alın
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 850);

  // ===> DÜZELTİLMİŞ handleLogout Fonksiyonu <===
  const handleLogout = async () => {
    console.log("Manager Logout button clicked");
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
      {/* CSS Kodları (Diğer navbar'larla aynı varsayıldı) */}
      <style>{`
         /* Diğer navbarlarda kullanılan aynı veya benzer CSS kurallarını buraya ekleyin */
         /* Örnek: */
        .navbar { font-family: 'Segoe UI', sans-serif; background-color: #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.05); padding: 10px 20px; position: relative; z-index: 100; }
        .navbar_top { display: flex; align-items: center; justify-content: space-between; max-width: 1400px; margin: 0 auto; }
        .logo { height: 50px; width: 50px; object-fit: contain; }
        .hamburger-button { background: none; border: none; cursor: pointer; display: none; }
        .navbar_links { list-style: none; padding: 0; margin: 0; display: flex; gap: 5px; }
        .navbar_links a, .logout-button { display: flex; align-items: center; gap: 8px; padding: 10px 14px; text-decoration: none; color: #343a40; background-color: transparent; font-weight: 500; border-radius: 8px; transition: all 0.2s ease; border: none; font-size: 0.95rem; cursor: pointer; }
        .navbar_links a:hover, .logout-button:hover { background-color: #e9f5e9; color: #007c39; }
        .logout-button { color: var(--danger-color, #dc3545); }
        .logout-button:hover { background-color: #f8d7da; color: #721c24; }
        .navbar_links a.active { background-color: var(--primary-color, #009944); color: white; box-shadow: 0 2px 5px rgba(0, 153, 68, 0.2); }
        .navbar_links.mobile { display: ${menuOpen ? "flex" : "none"}; flex-direction: column; gap: 5px; background-color: #ffffff; padding: 15px; position: absolute; top: 100%; left: 0; right: 0; box-shadow: 0 4px 10px rgba(0,0,0,0.1); border-top: 1px solid #eaeaea; z-index: 99; }
        .navbar_links.mobile a, .navbar_links.mobile .logout-button { width: 100%; justify-content: flex-start; padding: 12px 15px; font-size: 1rem; }
        .icon { margin-right: 6px; }
        @media(max-width: 850px) { .navbar_links { display: none; } .hamburger-button { display: block; } }
      `}</style>

      <nav className="navbar">
        <div className="navbar_top">
          <NavLink to={isAuthenticated ? "/manager" : "/"} onClick={closeMenu}>
            <img src={logo} alt="KOU Logo" className="logo" />
          </NavLink>

          {isAuthenticated && (
               <button className="hamburger-button" onClick={toggleMenu}>
                 <Icon name={menuOpen ? "close" : "hamburger"} width={24} height={24} />
               </button>
           )}

           {isAuthenticated && (
            <ul className={`navbar_links ${isMobile ? "mobile" : ""}`}>
              <li>
                <NavLink to="/manager" onClick={closeMenu} className={({ isActive }) => (isActive ? "active" : "")} end>
                  <Icon name="home" /> Dashboard
                </NavLink>
              </li>
              {/* <li>
                <NavLink to="/manager-criteriapage" onClick={closeMenu} className={({ isActive }) => (isActive ? "active" : "")}>
                  <Icon name="settings" /> Kadro Kriterleri
                </NavLink>
              </li> */}
              {/* <li>
                <NavLink to="/manager-juri-atama" onClick={closeMenu} className={({ isActive }) => (isActive ? "active" : "")}>
                  <Icon name="users" /> Jüri Atama
                </NavLink>
              </li> */}
              <li>
                <NavLink to="/manager-basvurular" onClick={closeMenu} className={({ isActive }) => (isActive ? "active" : "")}>
                  <Icon name="inbox" /> Başvurular
                </NavLink>
              </li>
              <li>
                <NavLink to="/manager-ilan" onClick={closeMenu} className={({ isActive }) => (isActive ? "active" : "")}>
                  <Icon name="list" /> İlana Kriter Ekle {/* İkon değiştirildi */}
                </NavLink>
              </li>
              <li>
                <NavLink to="/manager-profile" onClick={closeMenu} className={({ isActive }) => (isActive ? "active" : "")}>
                  <Icon name="profile" /> Profil {/* İkon değiştirildi */}
                </NavLink>
              </li>
              <li>
                <button onClick={handleLogout} className="logout-button">
                  <Icon name="log-out" /> Çıkış Yap {user?.username ? `(${user.username})` : ''}
                </button>
              </li>
            </ul>
           )}
           {!isAuthenticated && !isMobile && <div style={{height: '50px'}}></div>}
        </div>
      </nav>
    </>
  );
}
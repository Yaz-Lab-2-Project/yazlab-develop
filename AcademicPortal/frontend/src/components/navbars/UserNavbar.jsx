// src/components/navbars/UserNavbar.jsx

import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../../assets/kou_logo.png";
import { useAuth } from "../../context/AuthContext"; // AuthContext hook'unu import edin

// SVG Icon bileşeni (Mevcut kodunuzdaki gibi)
const Icon = ({ name, width = 18, height = 18 }) => (
  <svg width={width} height={height} className="icon" aria-hidden="true">
    <use href={`/sprite.svg#${name}`} />
  </svg>
);

export default function UserNavbar() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth(); // Context'ten user ve logout fonksiyonunu alın
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 850);

  // ===> DÜZELTİLMİŞ handleLogout Fonksiyonu <===
  const handleLogout = async () => {
    console.log("Logout button clicked");
    try {
        await logout(); // Context'teki async logout fonksiyonunu çağır ve bitmesini bekle
        console.log("Context logout finished, navigating to /login");
        navigate('/login'); // Context işlemi bitince login'e yönlendir
    } catch (error) {
        console.error("Error during logout process:", error);
        // Kullanıcıya hata mesajı gösterilebilir
        // Hata olsa bile login'e yönlendirmek genellikle mantıklıdır
        navigate('/login');
    }
    closeMenu(); // Mobil menüyü kapat (eğer açıksa)
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  // Mobil görünüm için useEffect (Mevcut kodunuzdaki gibi)
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 850);
      if (window.innerWidth > 850) setMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);


  // Eğer kullanıcı giriş yapmamışsa (örneğin context yüklenirken)
  // veya kullanıcı bilgisi henüz gelmemişse Navbar'ı gösterme veya farklı göster
  // Bu kontrol AuthContext'in isLoading state'ine göre daha iyi yapılabilir
  // if (!isAuthenticated) {
  //    return null; // veya sadece login linki olan basit bir navbar
  // }

  return (
    <>
      <style>{`
        .navbar {
          font-family: 'Segoe UI', sans-serif;
          background-color: #ffffff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          padding: 10px 20px;
          position: relative;
        }

        .navbar_top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .logo {
          height: 50px;
          width: 50px;
          object-fit: contain;
        }

        .hamburger-button {
          background: none;
          border: none;
          cursor: pointer;
        }

        .navbar_links {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .navbar_links.desktop {
          display: flex;
          gap: 20px;
          align-items: center;
        }

        .navbar_links.desktop a,
        .logout-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          text-decoration: none;
          color: #2c3e50;
          background-color: transparent;
          font-weight: 500;
          border-radius: 12px;
          transition: all 0.3s ease;
          border: none;
          font-size: 15px;
        }

        .navbar_links.desktop a:hover,
        .logout-button:hover {
          background-color: #f0fdf4;
          color: #009944;
        }

        .navbar_links.desktop a.active {
          background-color: #009944;
          color: white;
          box-shadow: 0 3px 8px rgba(0, 153, 68, 0.2);
        }

        /* Mobil menü */
        .navbar_links.mobile {
          display: ${menuOpen ? "flex" : "none"};
          flex-direction: column;
          gap: 12px;
          background-color: #ffffff;
          padding: 20px;
          position: absolute;
          top: 70px;
          left: 0;
          right: 0;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
          border-top: 1px solid #eaeaea;
          z-index: 1000;
        }

        .navbar_links.mobile a,
        .logout-button {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          text-decoration: none;
          color: #2c3e50;
          background-color: transparent;
          font-size: 16px;
          font-weight: 500;
          border-radius: 10px;
          transition: all 0.3s ease;
          border: none;
        }

        .navbar_links.mobile a:hover,
        .logout-button:hover {
          background-color: #f0fdf4;
          color: #009944;
        }

        .navbar_links.mobile a.active {
          background-color: #009944;
          color: white;
        }

        .icon {
          margin-right: 4px;
        }

        @media(min-width: 851px) {
          .hamburger-button {
            display: none;
          }
        }
      `}</style>

      <nav className="navbar">
        <div className="navbar_top">
          {/* Logo linki (user login ise /user'a, değilse /'a gidebilir) */}
          <NavLink to={isAuthenticated ? "/user" : "/"} onClick={closeMenu}>
            <img src={logo} alt="KOU Logo" className="logo" />
          </NavLink>

          {/* Hamburger Butonu (sadece mobilde görünür) */}
          {isAuthenticated && ( // Sadece giriş yapılmışsa hamburgeri göster
               <button className="hamburger-button" onClick={toggleMenu} style={{ display: isMobile ? 'block' : 'none' }}>
                 <Icon name={menuOpen ? "close" : "hamburger"} width={24} height={24} />
               </button>
          )}


          {/* Navigasyon Linkleri (isAuthenticated kontrolü eklendi) */}
          {isAuthenticated && (
              <ul className={`navbar_links ${isMobile ? "mobile" : "desktop"}`}>
                <li>
                  <NavLink to="/user" onClick={closeMenu} className={({ isActive }) => (isActive ? "active" : "")}>
                    <Icon name="home" /> Ana Sayfa {/* Home -> Ana Sayfa */}
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/listing" onClick={closeMenu} className={({ isActive }) => (isActive ? "active" : "")}>
                    <Icon name="post" /> İlanlar
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/basvurularim" onClick={closeMenu} className={({ isActive }) => (isActive ? "active" : "")}>
                    <Icon name="agreement" /> Başvurularım
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/profile" onClick={closeMenu} className={({ isActive }) => (isActive ? "active" : "")}>
                    <Icon name="profile" /> Profil {/* Kişisel Bilgiler -> Profil */}
                  </NavLink>
                </li>
                <li>
                   {/* ====> DÜZELTİLMİŞ Buton <==== */}
                   {/* Artık handleLogout fonksiyonunu çağırıyor */}
                  <button onClick={handleLogout} className="logout-button">
                    <Icon name="log-out" /> Çıkış Yap {user?.username ? `(${user.username})` : ''}
                  </button>
                </li>
              </ul>
          )}
        </div>
      </nav>
    </>
  );
}
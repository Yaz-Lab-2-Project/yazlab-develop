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

export default function JuryNavbar() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth(); // Context'ten user ve logout fonksiyonunu alın
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 850);

  // ===> DÜZELTİLMİŞ handleLogout Fonksiyonu <===
  const handleLogout = async () => {
    console.log("Jury Logout button clicked");
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
      {/* CSS Kodları (Değişiklik Yok) */}
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
        .logout-button { /* Logout butonu stilleri linklerle aynı */
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
          cursor: pointer; /* Buton için eklendi */
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
        .logout-button { /* Logout butonuna özel ek stiller (isteğe bağlı) */
           color: #DC3545; /* Kırmızı renk */
        }
        .logout-button:hover {
           background-color: #f8d7da; /* Hafif kırmızı arka plan */
           color: #721c24; /* Daha koyu kırmızı */
        }
        /* Mobil menü stilleri */
        .navbar_links.mobile {
          display: ${menuOpen ? "flex" : "none"};
          flex-direction: column;
          gap: 12px;
          background-color: #ffffff;
          padding: 20px;
          position: absolute;
          top: 70px; /* Adjust based on your navbar height */
          left: 0;
          right: 0;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
          border-top: 1px solid #eaeaea;
          z-index: 1000;
        }
        .navbar_links.mobile a,
        .navbar_links.mobile .logout-button {
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
          border: none; /* Buton için */
          width: 100%; /* Mobil düzgün görünüm için */
          text-align: left; /* Mobil düzgün görünüm için */
          cursor: pointer; /* Buton için */
        }
        .navbar_links.mobile a:hover,
        .navbar_links.mobile .logout-button:hover {
          background-color: #f0fdf4;
          color: #009944;
        }
         .navbar_links.mobile .logout-button {
            color: #DC3545;
         }
          .navbar_links.mobile .logout-button:hover {
             background-color: #f8d7da;
             color: #721c24;
         }
        .navbar_links.mobile a.active {
          background-color: #009944;
          color: white;
        }
        .icon { margin-right: 4px; }
        @media(min-width: 851px) { .hamburger-button { display: none; } }
      `}</style>

      <nav className="navbar">
        <div className="navbar_top">
           {/* Logo linki (jury login ise /jury'e, değilse /'a gidebilir) */}
          <NavLink to={isAuthenticated ? "/jury" : "/"} onClick={closeMenu}>
            <img src={logo} alt="KOU Logo" className="logo" />
          </NavLink>

           {/* Hamburger Butonu (sadece mobilde ve login olmuşsa görünür) */}
           {isAuthenticated && (
               <button className="hamburger-button" onClick={toggleMenu} style={{ display: isMobile ? 'block' : 'none' }}>
                 <Icon name={menuOpen ? "close" : "hamburger"} width={24} height={24} />
               </button>
           )}


           {/* Navigasyon Linkleri (sadece login olmuşsa görünür) */}
          {isAuthenticated && (
            <ul className={`navbar_links ${isMobile ? "mobile" : "desktop"}`}>
              <li>
                <NavLink to="/jury" onClick={closeMenu} className={({ isActive }) => (isActive ? "active" : "")}>
                  <Icon name="home" /> Anasayfa
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/jury-applications"
                  onClick={closeMenu}
                  className={({ location }) => {
                    const path = location?.pathname || window.location.pathname;
                    return (path.startsWith('/jury-applications') || path.startsWith('/jury-userapplication')) ? "active" : "";
                  }}
                >
                  <Icon name="agreement" /> Başvurular
                </NavLink>
              </li>
              <li>
                <NavLink to="/jury-rapor" onClick={closeMenu} className={({ isActive }) => (isActive ? "active" : "")}>
                  <Icon name="files" /> Raporlar
                </NavLink>
              </li>
              <li>
                 {/* ====> DÜZELTİLMİŞ Buton <==== */}
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
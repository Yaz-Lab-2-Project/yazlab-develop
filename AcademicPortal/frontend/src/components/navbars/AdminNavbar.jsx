import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../../assets/kou_logo.png";

const Icon = ({ name, width = 18, height = 18 }) => (
  <svg width={width} height={height} className="icon" aria-hidden="true">
    <use href={`/sprite.svg#${name}`} />
  </svg>
);

export default function AdminNavbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 850);

  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

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
          border: none;
        }

        .navbar_links.mobile a:hover,
        .navbar_links.mobile .logout-button:hover {
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
          <NavLink to="/admin" onClick={closeMenu}>
            <img src={logo} alt="KOU Logo" className="logo" />
          </NavLink>

          <button className="hamburger-button" onClick={toggleMenu}>
            <Icon name={menuOpen ? "close" : "hamburger"} width={24} height={24} />
          </button>

          <ul className={`navbar_links ${isMobile ? "mobile" : "desktop"}`}>
            <li>
              <NavLink to="/admin" onClick={closeMenu} className={({ isActive }) => (isActive ? "active" : "")}>
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
            <li>
              <button onClick={() => { handleLogout(); closeMenu(); }} className="logout-button">
                <Icon name="log-out" /> Çıkış Yap
              </button>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}

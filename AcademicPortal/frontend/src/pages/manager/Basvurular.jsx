import React, { useState, useEffect } from "react";
import ManagerNavbar from "../../components/navbars/ManagerNavbar";

const Basvurular = () => {
  const [selectedAd, setSelectedAd] = useState("");
  const [adSearch, setAdSearch] = useState("");
  const [modalData, setModalData] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const ilanlar = [
    { id: 1, title: "Bilgisayar Mühendisliği" },
    { id: 2, title: "Makine Mühendisliği" },
  ];

  const adaylar = selectedAd
    ? [
        {
          id: 1,
          name: "Ali Yıldız",
          date: "2025-03-25",
          status: "Beklemede",
          documents: ["transkript.pdf", "cv.pdf"],
          puan: 78,
        },
        {
          id: 2,
          name: "Zeynep Kaya",
          date: "2025-03-26",
          status: "Tamamlandı",
          documents: ["ozgecmis.pdf", "diploma.pdf"],
          puan: 85,
        },
      ]
    : [];

  const filteredIlanlar = ilanlar.filter((ad) =>
    ad.title.toLowerCase().includes(adSearch.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-container")) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const styles = {
    container: { padding: 24, backgroundColor: "#f4f6f9", fontFamily: "Arial, sans-serif" },
    box: { backgroundColor: "#fff", padding: 24, borderRadius: 12, boxShadow: "0 2px 6px rgba(0,0,0,0.05)" },
    input: { width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc", marginBottom: 12 },
    select: { width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc", marginBottom: 24 },
    table: { width: "100%", borderCollapse: "collapse" },
    th: { textAlign: "left", padding: 10, backgroundColor: "#e6f0e6", color: "#333" },
    td: { padding: 10, borderBottom: "1px solid #eee" },
    button: { padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer" },
    detay: { backgroundColor: "#007c39", color: "#fff" },
    pdf: { backgroundColor: "#ffc107", color: "#000", marginLeft: 8 },
    info: { backgroundColor: "#fff3cd", padding: 12, borderRadius: 8, color: "#856404" },
    modalBackdrop: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    modal: { backgroundColor: "#fff", padding: 24, borderRadius: 12, width: 400, maxWidth: "90%" },
    dropdownContainer: {
      position: "relative",
      width: "100%",
      marginBottom: "24px",
    },
    dropdown: {
      position: "absolute",
      top: "100%",
      left: 0,
      right: 0,
      backgroundColor: "#fff",
      border: "1px solid #ccc",
      borderRadius: "8px",
      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
      maxHeight: "200px",
      overflowY: "auto",
      zIndex: 1000,
    },
    dropdownItem: {
      padding: "10px 12px",
      cursor: "pointer",
      transition: "background-color 0.2s",
      "&:hover": {
        backgroundColor: "#f8f9fa",
      },
    },
  };

  return (
    <>
      <ManagerNavbar />
      <div style={styles.container}>
        <h2 style={{ color: "#009944", marginBottom: 16 }}>İlan İnceleme & Aday Başvuruları</h2>
        <div style={styles.box}>
          <div className="dropdown-container" style={styles.dropdownContainer}>
            <input
              style={styles.input}
              type="text"
              placeholder="İlan Ara..."
              value={adSearch}
              onChange={(e) => setAdSearch(e.target.value)}
              onFocus={() => setShowDropdown(true)}
            />
            {showDropdown && filteredIlanlar.length > 0 && (
              <div style={styles.dropdown}>
                {filteredIlanlar.map((ilan) => (
                  <div
                    key={ilan.id}
                    style={styles.dropdownItem}
                    onClick={() => {
                      setSelectedAd(ilan.id);
                      setAdSearch(ilan.title);
                      setShowDropdown(false);
                    }}
                  >
                    {ilan.title}
                  </div>
                ))}
              </div>
            )}
          </div>

          {adaylar.length === 0 ? (
            <div style={styles.info}>Lütfen bir ilan seçiniz.</div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Aday Adı</th>
                  <th style={styles.th}>Tarih</th>
                  <th style={styles.th}>Durum</th>
                  <th style={styles.th}>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {adaylar.map((a) => (
                  <tr key={a.id}>
                    <td style={styles.td}>{a.name}</td>
                    <td style={styles.td}>{a.date}</td>
                    <td style={styles.td}>{a.status}</td>
                    <td style={styles.td}>
                      <button
                        style={{ ...styles.button, ...styles.detay }}
                        onClick={() => setModalData(a)}
                      >
                        Detay
                      </button>
                      <button style={{ ...styles.button, ...styles.pdf }}>PDF</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {modalData && (
          <div style={styles.modalBackdrop}>
            <div style={styles.modal}>
              <h3 style={{ marginBottom: 12 }}>{modalData.name}</h3>
              <p><strong>Puan:</strong> {modalData.puan}</p>
              <p><strong>Belgeler:</strong></p>
              <ul>
                {modalData.documents.map((doc, i) => (
                  <li key={i}>{doc}</li>
                ))}
              </ul>
              <div style={{ textAlign: "right", marginTop: 16 }}>
                <button onClick={() => setModalData(null)} style={{ ...styles.button, backgroundColor: "#dc3545", color: "#fff" }}>
                  Kapat
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Basvurular;
import React, { useState } from "react";
import ManagerNavbar from "../../components/navbars/ManagerNavbar";

const styles = {
  container: {
    padding: "16px",
    backgroundColor: "#f4f6f9",
    fontFamily: "Arial, sans-serif",
    minHeight: "100vh",
    boxSizing: "border-box",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "24px",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
    margin: "0 auto",
    maxWidth: "1100px",
  },
  label: {
    display: "block",
    fontSize: "14px",
    marginBottom: "6px",
    color: "#555",
  },
  input: {
    width: "100%",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    fontSize: "14px",
    height: "40px",
    boxSizing: "border-box",
  },
  select: {
    width: "100%",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    fontSize: "14px",
    height: "40px", 
    boxSizing: "border-box",
  },
  gridColumns: {
    display: "grid",
    alignItems: "center",
    justifyContent: "space-between",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#009944",
    marginBottom: "12px",
  },
  subtext: {
    fontSize: "13px",
    color: "#666",
    marginBottom: "16px",
  },
  rowHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
  },
  gridRow: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 2fr 1fr", // Daha dengeli kolon oranları
    gap: "12px",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "12px",
  },
  checkboxGroup: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: "8px 16px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    fontSize: "14px",
    color: "#333",
    gap: "16px",
    height: "40px",
    boxSizing: "border-box",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#555",
    height: "20px",
  },
  checkboxInput: {
    width: "16px",
    height: "16px",
    cursor: "pointer",
  },
  button: {
    padding: "10px 16px",
    borderRadius: "8px",
    backgroundColor: "#28a745",
    color: "#fff",
    fontSize: "14px",
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  dangerButton: {
    fontSize: "14px",
    color: "#dc3545",
    background: "none",
    border: "none",
    cursor: "pointer",
    height: "40px", // Yükseklik tutarlılığı için eklendi
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
    padding: "8px 16px",
    borderRadius: "8px",
  },
  previewBox: {
    backgroundColor: "#e6f0e6",
    padding: "16px",
    borderRadius: "8px",
    overflowX: "auto",
    fontSize: "13px",
    border: "1px solid #ccc",
  },
  saveButton: {
    padding: "12px 20px",
    backgroundColor: "#009944",
    color: "# fff",
    borderRadius: "12px",
    border: "none",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.3s",
    marginTop: "24px",
  },
};

const CriteriaPage = () => {
  const [position, setPosition] = useState("Doçent");
  const [field, setField] = useState("Mühendislik");
  const [minScore, setMinScore] = useState(0);
  const [publications, setPublications] = useState([
    { id: 1, type: "A1", count: 1, required: true, primaryAuthor: true },
  ]);

  const addPublication = () => {
    setPublications([
      ...publications,
      {
        id: Date.now(),
        type: "A2",
        count: 1,
        required: false,
        primaryAuthor: false,
      },
    ]);
  };

  const removePublication = (id) => {
    setPublications(publications.filter((pub) => pub.id !== id));
  };

  const updatePublication = (id, key, value) => {
    setPublications(
      publications.map((pub) =>
        pub.id === id ? { ...pub, [key]: value } : pub
      )
    );
  };

  const handleSave = () => {
    alert("Kriterler kaydedildi! (Simülasyon)");
  };

  const previewData = {
    position,
    field,
    minScore,
    publications: publications.map(({ id, ...rest }) => rest),
  };

  return (
    <>
      <ManagerNavbar />
      <div style={styles.container}>
        <h1 style={styles.title}>Kadro Kriterleri</h1>

        <div style={styles.card}>
          <div style={styles.gridColumns}>
            <div>
              <label style={styles.label}>Kadro Türü</label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                style={styles.select}
              >
                <option>Dr. Öğr. Üyesi</option>
                <option>Doçent</option>
                <option>Profesör</option>
              </select>
            </div>
            <div>
              <label style={styles.label}>Alan Türü</label>
              <select
                value={field}
                onChange={(e) => setField(e.target.value)}
                style={styles.select}
              >
                <option>Mühendislik</option>
                <option>Sağlık Bilimleri</option>
                <option>Fen Bilimleri</option>
                <option>Sosyal Bilimler</option>
              </select>
            </div>
            <div>
              <label style={styles.label}>Minimum Puan</label>
              <input
                type="number"
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                style={styles.input}
              />
            </div>
          </div>

          <div>
            <div style={styles.rowHeader}>
              <h2 style={styles.sectionTitle}>Yayın Kategorileri</h2>
              <button onClick={addPublication} style={styles.button}>
                Yayın Ekle
              </button>
            </div>
            <p style={styles.subtext}>
              Her yayın türü için kategori adı (A1-A5), minimum sayı, zorunluluk
              ve başlıca yazarlık şartlarını belirtin.
            </p>

            {publications.map((pub) => (
              <div key={pub.id} style={styles.gridRow}>
                <input
                  type="text"
                  value={pub.type}
                  onChange={(e) =>
                    updatePublication(pub.id, "type", e.target.value)
                  }
                  placeholder="Yayın Türü (A1)"
                  style={styles.input}
                />
                <input
                  type="number"
                  value={pub.count}
                  onChange={(e) =>
                    updatePublication(pub.id, "count", Number(e.target.value))
                  }
                  placeholder="Adet"
                  style={styles.input}
                />
                <div style={styles.checkboxGroup}>
                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={pub.required}
                      onChange={(e) =>
                        updatePublication(pub.id, "required", e.target.checked)
                      }
                      style={styles.checkboxInput}
                    />
                    Zorunlu
                  </label>
                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={pub.primaryAuthor}
                      onChange={(e) =>
                        updatePublication(
                          pub.id,
                          "primaryAuthor",
                          e.target.checked
                        )
                      }
                      style={styles.checkboxInput}
                    />
                    Başlıca Yazar
                  </label>
                </div>
                <button
                  onClick={() => removePublication(pub.id)}
                  style={styles.dangerButton}
                >
                  Kaldır
                </button>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "32px" }}>
            <h2 style={styles.sectionTitle}>Önizleme (JSON)</h2>
            <div style={styles.previewBox}>
              <pre>{JSON.stringify(previewData, null, 2)}</pre>
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <button onClick={handleSave} style={styles.saveButton}>
              Kaydet / Güncelle
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CriteriaPage;

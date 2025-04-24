import React, { useState } from "react";
import AdminNavbar from "../../components/navbars/AdminNavbar.jsx"; // AdminNavbar bileşenini import ettik

const initialIlanlar = [
  {
    id: 1,
    title: "Bilgisayar Mühendisliği Bölümü - Dr. Öğr. Üyesi Kadrosu",
    position: "Dr. Öğr. Üyesi",
    faculty: "Mühendislik Fakültesi",
    department: "Bilgisayar Mühendisliği",
    startDate: "2025-04-01",
    endDate: "2025-04-20",
    status: "Aktif"
  },
  {
    id: 2,
    title: "İktisat Bölümü - Doçent Kadrosu",
    position: "Doçent",
    faculty: "İktisadi ve İdari Bilimler Fakültesi",
    department: "İktisat",
    startDate: "2025-04-05",
    endDate: "2025-04-25",
    status: "Aktif"
  },
  {
    id: 3,
    title: "Elektrik-Elektronik Mühendisliği - Profesör Kadrosu",
    position: "Profesör",
    faculty: "Mühendislik Fakültesi",
    department: "Elektrik-Elektronik Mühendisliği",
    startDate: "2025-03-30",
    endDate: "2025-04-20",
    status: "Pasif"
  }
];

const Advertisements = () => {
  const [ilanlar, setIlanlar] = useState(initialIlanlar);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    id: null,
    title: "",
    position: "",
    faculty: "",
    department: "",
    startDate: "",
    endDate: "",
    status: "Aktif"
  });

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const filteredIlanlar = ilanlar.filter((ilan) =>
    ["title", "position", "faculty", "department"]
      .some((key) => ilan[key].toLowerCase().includes(searchTerm))
  );

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    const sortedIlanlar = [...ilanlar].sort((a, b) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });
    setIlanlar(sortedIlanlar);
  };

  const handleDelete = (id) => {
    if (window.confirm("Bu ilanı silmek istediğinizden emin misiniz?")) {
      setIlanlar((prev) => prev.filter((i) => i.id !== id));
    }
  };

  const openForm = (ilan = null) => {
    if (ilan) {
      setForm(ilan);
      setEditMode(true);
    } else {
      setForm({
        id: null,
        title: "",
        position: "",
        faculty: "",
        department: "",
        startDate: "",
        endDate: "",
        status: "Aktif"
      });
      setEditMode(false);
    }
    setModalOpen(true);
  };

  const openDetail = (ilan) => {
    setSelected(ilan);
    setDetailOpen(true);
  };

  const closeDetail = () => setDetailOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (editMode) {
      setIlanlar((prev) => prev.map((i) => (i.id === form.id ? form : i)));
    } else {
      setIlanlar((prev) => [...prev, { ...form, id: Date.now() }]);
    }
    setModalOpen(false);
  };

  return (
    <>
      <AdminNavbar /> {/* Navbar bileşeni */}
      <div style={{ padding: "2rem", backgroundColor: "#f4f6f9" }}>
        <h2 style={{ color: "#009944", marginBottom: "1rem" }}>İlan Listesi</h2>

        {/* Arama Çubuğu */}
        <input
          type="text"
          placeholder="Başlık, Kadro, Fakülte veya Bölüm ara..."
          value={searchTerm}
          onChange={handleSearch}
          style={{
            width: "100%",
            padding: "0.5rem",
            marginBottom: "1rem",
            border: "1px solid #ccc",
            borderRadius: "6px"
          }}
        />

        <button
          onClick={() => openForm()}
          style={{
            marginBottom: "1rem",
            backgroundColor: "#009944",
            color: "white",
            padding: "0.5rem 1rem",
            border: "none",
            borderRadius: "6px"
          }}
        >
          + Yeni İlan
        </button>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            backgroundColor: "#fff",
            borderRadius: "12px",
            overflow: "hidden"
          }}
        >
          <thead style={{ backgroundColor: "#009944", color: "#fff" }}>
            <tr>
              <th
                style={{ padding: "0.75rem", textAlign: "left", cursor: "pointer" }}
                onClick={() => handleSort("title")}
              >
                Başlık {sortConfig.key === "title" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
              </th>
              <th
                style={{ padding: "0.75rem", textAlign: "left", cursor: "pointer" }}
                onClick={() => handleSort("position")}
              >
                Kadro {sortConfig.key === "position" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
              </th>
              <th
                style={{ padding: "0.75rem", textAlign: "left", cursor: "pointer" }}
                onClick={() => handleSort("faculty")}
              >
                Fakülte {sortConfig.key === "faculty" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
              </th>
              <th
                style={{ padding: "0.75rem", textAlign: "left", cursor: "pointer" }}
                onClick={() => handleSort("department")}
              >
                Bölüm {sortConfig.key === "department" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
              </th>
              <th style={{ padding: "0.75rem", textAlign: "left" }}>Tarih</th>
              <th style={{ padding: "0.75rem", textAlign: "left" }}>Durum</th>
              <th style={{ padding: "0.75rem", textAlign: "left" }}>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {filteredIlanlar.map((ilan) => (
              <tr key={ilan.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "0.75rem" }}>{ilan.title}</td>
                <td style={{ padding: "0.75rem" }}>{ilan.position}</td>
                <td style={{ padding: "0.75rem" }}>{ilan.faculty}</td>
                <td style={{ padding: "0.75rem" }}>{ilan.department}</td>
                <td style={{ padding: "0.75rem" }}>
                  {ilan.startDate} - {ilan.endDate}
                </td>
                <td
                  style={{
                    padding: "0.75rem",
                    color: ilan.status === "Aktif" ? "#28a745" : "#dc3545"
                  }}
                >
                  {ilan.status}
                </td>
                <td style={{ padding: "0.75rem" }}>
                  <button
                    onClick={() => openDetail(ilan)}
                    style={{
                      marginRight: "6px",
                      backgroundColor: "#007c39",
                      color: "#fff",
                      border: "none",
                      padding: "6px 10px",
                      borderRadius: "8px"
                    }}
                  >
                    Detay
                  </button>
                  <button
                    onClick={() => openForm(ilan)}
                    style={{
                      marginRight: "6px",
                      backgroundColor: "#ffc107",
                      color: "#333",
                      border: "none",
                      padding: "6px 10px",
                      borderRadius: "8px"
                    }}
                  >
                    Düzenle
                  </button>
                  <button
                    onClick={() => handleDelete(ilan.id)}
                    style={{
                      backgroundColor: "#dc3545",
                      color: "#fff",
                      border: "none",
                      padding: "6px 10px",
                      borderRadius: "8px"
                    }}
                  >
                    Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {detailOpen && selected && (
          <div
            onClick={closeDetail}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: "#fff",
                padding: "2rem",
                borderRadius: "12px",
                maxWidth: "600px",
                width: "90%"
              }}
            >
              <h3>{selected.title}</h3>
              <p><strong>Fakülte:</strong> {selected.faculty}</p>
              <p><strong>Bölüm:</strong> {selected.department}</p>
              <p><strong>Kadro:</strong> {selected.position}</p>
              <p><strong>Tarih:</strong> {selected.startDate} - {selected.endDate}</p>
              <p><strong>Durum:</strong> {selected.status}</p>
              <div style={{ textAlign: "right" }}>
                <button
                  onClick={closeDetail}
                  style={{
                    padding: "8px 12px",
                    backgroundColor: "#ccc",
                    border: "none",
                    borderRadius: "8px"
                  }}
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        )}

        {modalOpen && (
          <div
            onClick={() => setModalOpen(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: "#fff",
                padding: "2rem",
                borderRadius: "12px",
                width: "90%",
                maxWidth: "600px"
              }}
            >
              <h3>{editMode ? "İlan Düzenle" : "Yeni İlan Ekle"}</h3>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Başlık"
                style={{ width: "100%", padding: 8, marginBottom: 8 }}
              />
              <input
                name="position"
                value={form.position}
                onChange={handleChange}
                placeholder="Kadro Türü"
                style={{ width: "100%", padding: 8, marginBottom: 8 }}
              />
              <input
                name="faculty"
                value={form.faculty}
                onChange={handleChange}
                placeholder="Fakülte"
                style={{ width: "100%", padding: 8, marginBottom: 8 }}
              />
              <input
                name="department"
                value={form.department}
                onChange={handleChange}
                placeholder="Bölüm"
                style={{ width: "100%", padding: 8, marginBottom: 8 }}
              />
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                style={{ width: "100%", padding: 8, marginBottom: 8 }}
              />
              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                style={{ width: "100%", padding: 8, marginBottom: 8 }}
              />
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                style={{ width: "100%", padding: 8, marginBottom: 8 }}
              >
                <option value="Aktif">Aktif</option>
                <option value="Pasif">Pasif</option>
              </select>
              <div style={{ textAlign: "right", marginTop: "1rem" }}>
                <button
                  onClick={() => setModalOpen(false)}
                  style={{
                    marginRight: 10,
                    backgroundColor: "#ccc",
                    padding: "8px 12px",
                    border: "none",
                    borderRadius: 4
                  }}
                >
                  İptal
                </button>
                <button
                  onClick={handleSave}
                  style={{
                    backgroundColor: "#009944",
                    color: "white",
                    padding: "8px 12px",
                    border: "none",
                    borderRadius: 4
                  }}
                >
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Advertisements;
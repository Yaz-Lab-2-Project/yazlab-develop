import React, { useState } from "react";
import ManagerNavbar from "../../components/navbars/ManagerNavbar";

const JuriAtama = () => {
  const [selectedAnnouncement, setSelectedAnnouncement] = useState("");
  const [announcementSearch, setAnnouncementSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [juryList, setJuryList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newJury, setNewJury] = useState({ tc: "", name: "", role: "" });
  const [showAnnouncementSelect, setShowAnnouncementSelect] = useState(false);

  const [availableUsers, setAvailableUsers] = useState([
    { id: 1, tc: "12345678901", name: "Ahmet Yılmaz", role: "Profesör" },
    { id: 2, tc: "23456789012", name: "Ayşe Demir", role: "Doçent" },
    { id: 3, tc: "34567890123", name: "Mehmet Kaya", role: "Dr. Öğr. Üyesi" },
    { id: 4, tc: "45678901234", name: "Zeynep Çetin", role: "Profesör" },
    { id: 5, tc: "56789012345", name: "Ali Güneş", role: "Doçent" },
  ]);

  const announcements = [
    { id: 1, title: "Bilgisayar Mühendisliği Kadrosu" },
    { id: 2, title: "Elektrik-Elektronik Mühendisliği Kadrosu" },
  ];

  const toggleSelectUser = (user) => {
    if (juryList.find((u) => u.id === user.id)) {
      setJuryList(juryList.filter((u) => u.id !== user.id));
    } else {
      setJuryList([...juryList, user]);
    }
  };

  const handleCompleteAssignment = () => {
    if (juryList.length < 3) {
      alert("En az 3 jüri üyesi seçmelisiniz.");
      return;
    }
    alert("Atama başarıyla tamamlandı! (Simülasyon)");
  };

  const handleAddNewJury = () => {
    if (!newJury.tc || !newJury.name || !newJury.role) {
      alert("Lütfen tüm alanları doldurun.");
      return;
    }
    const newUser = { ...newJury, id: Date.now() };
    setAvailableUsers([...availableUsers, newUser]);
    setNewJury({ tc: "", name: "", role: "" });
    setShowModal(false);
  };

  const filteredUsers = availableUsers.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAnnouncements = announcements.filter((a) =>
    a.title.toLowerCase().includes(announcementSearch.toLowerCase())
  );

  return (
    <>
      <ManagerNavbar />
      <div style={styles.container}>
        <h1 style={{ fontSize: 24, fontWeight: "bold", color: "#333", marginBottom: 20 }}>
          Jüri Atama Sayfası
        </h1>

        <div style={{ backgroundColor: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <div style={styles.dropdownContainer}>
            <label style={{ fontSize: 14, color: "#555" }}>İlan Seçimi</label>
            <input
              type="text"
              placeholder="İlan Ara..."
              value={announcementSearch}
              onChange={(e) => setAnnouncementSearch(e.target.value)}
              onFocus={() => setShowAnnouncementSelect(true)}
              style={{ ...styles.input, marginBottom: 8 }}
            />
            {showAnnouncementSelect && (
              <div style={styles.dropdown}>
                {filteredAnnouncements.map((a) => (
                  <div
                    key={a.id}
                    style={styles.dropdownItem}
                    onClick={() => {
                      setSelectedAnnouncement(a.id);
                      setAnnouncementSearch(a.title);
                      setShowAnnouncementSelect(false);
                    }}
                  >
                    {a.title}
                  </div>
                ))}
              </div>
            )}
          </div>

          <input
            type="text"
            placeholder="Jüri Ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc", marginBottom: 24 }}
          />

          <div style={{ textAlign: "right", marginBottom: 24 }}>
            <button
              onClick={() => setShowModal(true)}
              style={{ padding: "8px 12px", backgroundColor: "#28a745", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}
            >
              Yeni Jüri Ekle
            </button>
          </div>

          <h2 style={{ color: "#009944", fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Kullanıcı Listesi</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 16, marginBottom: 24 }}>
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                style={{
                  border: juryList.find((u) => u.id === user.id) ? "2px solid #009944" : "1px solid #ccc",
                  borderRadius: 12,
                  padding: 12,
                  backgroundColor: "#fff",
                  cursor: "pointer",
                }}
                onClick={() => toggleSelectUser(user)}
              >
                <p style={{ margin: 0, fontWeight: 600 }}>{user.name}</p>
                <p style={{ margin: 0, fontSize: 13, color: "#666" }}>TC: {user.tc}</p>
                <p style={{ margin: 0, fontSize: 13, color: "#007c39" }}>{user.role}</p>
              </div>
            ))}
          </div>

          <h3 style={{ fontSize: 16, fontWeight: 600, color: "#333", marginBottom: 12 }}>Seçilen Jüri Üyeleri</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
            {juryList.map((user) => (
              <div key={user.id} style={{ backgroundColor: "#e6f0e6", padding: "8px 12px", borderRadius: 8, display: "flex", alignItems: "center", gap: 8 }}>
                <span>{user.name}</span>
                <button onClick={() => toggleSelectUser(user)} style={{ border: "none", background: "none", color: "#dc3545", fontWeight: "bold", cursor: "pointer" }}>
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "right" }}>
            <button
              onClick={handleCompleteAssignment}
              style={{ backgroundColor: "#009944", color: "#fff", padding: "10px 20px", border: "none", borderRadius: 12, fontWeight: 600, cursor: "pointer" }}
            >
              Atamayı Tamamla
            </button>
          </div>
        </div>

        {showModal && (
          <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ backgroundColor: "#fff", padding: 24, borderRadius: 12, width: "100%", maxWidth: 400 }}>
              <h2 style={{ marginBottom: 16, color: "#009944" }}>Yeni Jüri Ekle</h2>
              <input type="text" placeholder="TC Kimlik Numarası" value={newJury.tc} onChange={(e) => setNewJury({ ...newJury, tc: e.target.value })} style={{ ...styles.input, marginBottom: 12 }} />
              <input type="text" placeholder="Ad Soyad" value={newJury.name} onChange={(e) => setNewJury({ ...newJury, name: e.target.value })} style={{ ...styles.input, marginBottom: 12 }} />
              <input type="text" placeholder="Unvan (Rol)" value={newJury.role} onChange={(e) => setNewJury({ ...newJury, role: e.target.value })} style={{ ...styles.input, marginBottom: 16 }} />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button onClick={() => setShowModal(false)} style={{ padding: "8px 16px", border: "1px solid #ccc", borderRadius: 8 }}>İptal</button>
                <button onClick={handleAddNewJury} style={{ padding: "8px 16px", backgroundColor: "#28a745", color: "#fff", border: "none", borderRadius: 8 }}>Ekle</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const styles = {
  container: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "24px",
    backgroundColor: "#f4f6f9",
    fontFamily: "Arial, sans-serif"
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc"
  },
  dropdownContainer: {
    position: "relative",
    marginBottom: "24px"
  },
  dropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    border: "1px solid #ccc",
    borderRadius: "8px",
    maxHeight: "200px",
    overflowY: "auto",
    zIndex: 10,
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
  },
  dropdownItem: {
    padding: "10px",
    cursor: "pointer",
    borderBottom: "1px solid #eee",
    "&:hover": {
      backgroundColor: "#f8f9fa"
    }
  }
};

export default JuriAtama;
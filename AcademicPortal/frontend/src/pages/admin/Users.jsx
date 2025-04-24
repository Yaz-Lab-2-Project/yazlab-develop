import React, { useState } from "react";
import AdminNavbar from "../../components/navbars/AdminNavbar.jsx"; // AdminNavbar bileşenini import ettik

const sampleUsers = [
  {
    id: 1,
    name: "Ahmet Yılmaz",
    email: "ahmet@example.com",
    tc: "12345678901",
    role: "Aday",
    lastLogin: "2025-03-28",
    status: "Aktif",
    phone: "05551112233",
    registeredAt: "2024-12-01",
    applications: ["Bilgisayar Müh. - Dr. Öğr. Üyesi"]
  },
  {
    id: 2,
    name: "Zeynep Demir",
    email: "zeynep@example.com",
    tc: "10987654321",
    role: "Jüri",
    lastLogin: "2025-03-20",
    status: "Pasif",
    phone: "",
    registeredAt: "2024-10-15",
    applications: []
  }
];

const Users = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const sortedUsers = [...sampleUsers].sort((a, b) => {
    if (!sortKey) return 0;
    const valA = a[sortKey]?.toLowerCase?.() || a[sortKey];
    const valB = b[sortKey]?.toLowerCase?.() || b[sortKey];
    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const filteredUsers = sortedUsers.filter((user) => {
    return (
      (!filterRole || user.role === filterRole) &&
      (!filterStatus || user.status === filterStatus) &&
      (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.tc.includes(searchTerm))
    );
  });

  const toggleStatus = (id) => {
    const user = sampleUsers.find((u) => u.id === id);
    if (user) {
      alert(`${user.name} kullanıcısı ${user.status === "Aktif" ? "pasif" : "aktif"} hale getirilecektir.`);
    }
  };

  return (
    <>
      <AdminNavbar /> {/* Navbar bileşeni */}
      <div className="users-container">
        <h2 className="title">Kullanıcı Listesi</h2>

        <div className="filters">
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
            <option value="">Tüm Roller</option>
            <option value="Aday">Aday</option>
            <option value="Jüri">Jüri</option>
            <option value="Yönetici">Yönetici</option>
            <option value="Admin">Admin</option>
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">Tüm Durumlar</option>
            <option value="Aktif">Aktif</option>
            <option value="Pasif">Pasif</option>
          </select>
          <input
            type="text"
            placeholder="İsim / TC / E-posta"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Masaüstü görünüm */}
        <div className="desktop-table">
          <table>
            <thead>
              <tr>
                {["name", "email", "tc", "role", "lastLogin", "status"].map((key) => (
                  <th key={key} onClick={() => handleSort(key)}>
                    {key === "name" && "Adı Soyadı"}
                    {key === "email" && "E-posta"}
                    {key === "tc" && "TC Kimlik No"}
                    {key === "role" && "Rol"}
                    {key === "lastLogin" && "Son Giriş"}
                    {key === "status" && "Durum"}
                    {sortKey === key ? (sortOrder === "asc" ? " ▲" : " ▼") : ""}
                  </th>
                ))}
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.tc}</td>
                  <td>{user.role}</td>
                  <td>{user.lastLogin}</td>
                  <td className={user.status === "Aktif" ? "aktif" : "pasif"}>{user.status}</td>
                  <td>
                    <div className="actions">
                      <button onClick={() => setSelectedUser(user)}>Detay</button>
                      <button>Düzenle</button>
                      <button onClick={() => toggleStatus(user.id)}>
                        {user.status === "Aktif" ? "Pasif Et" : "Aktif Et"}
                      </button>
                      <button className="sil">Sil</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobil görünüm */}
        <div className="mobile-cards">
          {filteredUsers.map((user) => (
            <div className="user-card" key={user.id}>
              <h3>{user.name}</h3>
              <p>
                <strong>E-posta:</strong> {user.email}
              </p>
              <p>
                <strong>TC:</strong> {user.tc}
              </p>
              <p>
                <strong>Rol:</strong> {user.role}
              </p>
              <p>
                <strong>Durum:</strong>{" "}
                <span className={user.status === "Aktif" ? "aktif" : "pasif"}>{user.status}</span>
              </p>
              <p>
                <strong>Son Giriş:</strong> {user.lastLogin}
              </p>
              <div className="actions">
                <button onClick={() => setSelectedUser(user)}>Detay</button>
                <button>Düzenle</button>
                <button onClick={() => toggleStatus(user.id)}>
                  {user.status === "Aktif" ? "Pasif Et" : "Aktif Et"}
                </button>
                <button className="sil">Sil</button>
              </div>
            </div>
          ))}
        </div>

        {/* Kullanıcı Detay */}
        {selectedUser && (
          <div className="user-detail">
            <h3>{selectedUser.name}</h3>
            <p>
              <strong>E-posta:</strong> {selectedUser.email}
            </p>
            <p>
              <strong>Telefon:</strong> {selectedUser.phone || "-"}
            </p>
            <p>
              <strong>TC Kimlik No:</strong> {selectedUser.tc}
            </p>
            <p>
              <strong>Rol:</strong> {selectedUser.role}
            </p>
            <p>
              <strong>Kayıt Tarihi:</strong> {selectedUser.registeredAt}
            </p>
            <p>
              <strong>Son Giriş:</strong> {selectedUser.lastLogin}
            </p>
            <p>
              <strong>Durum:</strong> {selectedUser.status}
            </p>
            {selectedUser.role === "Aday" && (
              <>
                <h4>Başvurular</h4>
                <ul>
                  {selectedUser.applications.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </>
            )}
            <div className="actions">
              <button>Şifre Sıfırla</button>
              <button>Yetki Güncelle</button>
              <button onClick={() => setSelectedUser(null)}>Kapat</button>
            </div>
          </div>
        )}

        <style>{`
          .users-container { padding: 20px; background-color: #f4f6f9; min-height: 100vh; font-family: sans-serif; }
          .title { color: #009944; margin-bottom: 16px; }
          .filters { display: flex; align-items:center; flex-wrap: wrap; gap: 10px; margin-bottom: 20px; }
          .filters select, .filters input { padding: 10px; height:40px; border: 1px solid #ccc; border-radius: 8px; flex: 1 1 200px; }

          table { width: 100%; border-collapse: collapse; background-color: white; border-radius: 12px; overflow: hidden; }
          th, td { padding: 10px; border-bottom: 1px solid #eee; text-align: left; }
          th { background-color: #009944; color: white; cursor: pointer; }

          .aktif { color: #28a745; }
          .pasif { color: #dc3545; }

          .actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
          .actions button { flex: 1 1 auto; padding: 6px 10px; border: none; border-radius: 6px; cursor: pointer; }
          .actions button:nth-child(1) { background-color: #007c39; color: white; }
          .actions button:nth-child(2) { background-color: #ffc107; color: #333; }
          .actions button:nth-child(3) { background-color: #28a745; color: white; }
          .actions button.sil { background-color: #999; color: white; }

          .user-card { background: white; border-radius: 12px; padding: 16px; box-shadow: 0 0 10px rgba(0,0,0,0.05); margin-bottom: 12px; }
          .user-card h3 { margin-top: 0; color: #007c39; }

          .mobile-cards { display: none; }

          @media (max-width: 768px) {
            .desktop-table { display: none; }
            .mobile-cards { display: block; }
          }
        `}</style>
      </div>
    </>
  );
};

export default Users;
// src/pages/manager/Ilan.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import ManagerNavbar from "../../components/navbars/ManagerNavbar"; // Navbar import edildi (varsayılıyor)
import { FaCog } from 'react-icons/fa'; // Kriterler için cog ikonu (varsayılıyor)

const Ilan = () => {
    const [ilanlar, setIlanlar] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        fetchIlanlar();
    }, []);

    const fetchIlanlar = () => {
        setLoading(true);
        setError(null);
        fetch('http://localhost:8000/api/ilanlar/', { credentials: 'include' })
            .then(res => {
                if (!res.ok) {
                    throw new Error(`İlanlar alınamadı (${res.status})`);
                }
                return res.json();
            })
            .then(data => {
                setIlanlar(data.results || data);
                setError(null);
            })
            .catch(err => {
                setError(err.message);
                setIlanlar([]);
            })
            .finally(() => setLoading(false));
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredIlanlar = ilanlar.filter((ilan) => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
            ilan.baslik?.toLowerCase().includes(searchLower)
        );
    });

const navigateToKriterDuzenle = (id) => {
  navigate(`/manager-ilan/${id}`);
};

    if (loading) {
        return (
            <>
               <ManagerNavbar />

            <div className="ilan-container loading">
               
                <div className="loading-message">İlanlar yükleniyor...</div>
                <style>{ilanCss}</style>
            </div>
            </>
        );
    }

    if (error) {
        return (
          <>
          <ManagerNavbar />

            <div className="ilan-container error">
                <div className="error-message">Hata: {error}</div>
                <style>{ilanCss}</style>
            </div>

            </>
        );
    }

    return (
      <>
      <ManagerNavbar />
        <div className="ilan-container">
            
            <div className="content-wrapper">
                <input
                    type="text"
                    placeholder="Başlık Ara..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="search-input"
                />
                <div className="table-container card">
                    <table>
                        <thead>
                            <tr>
                                <th>Başlık</th>
                                <th className="actions-column">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredIlanlar.map((ilan) => (
                                <tr key={ilan.id}>
                                    <td>{ilan.baslik}</td>
                                    <td className="actions-column">
                                        <button
                                            onClick={() => navigateToKriterDuzenle(ilan.id)}
                                            className="action-btn edit"
                                            title="Kriterleri Düzenle"
                                        >
                                            <FaCog /> Kriterleri Düzenle
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredIlanlar.length === 0 && (
                                <tr>
                                    <td colSpan="2" className="no-results">
                                        Gösterilecek ilan bulunamadı.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <style>{ilanCss}</style>
        </div>
        </>
        
    );
};

const ilanCss = `
.ilan-container {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #f4f7f6; /* Açık yeşilimsi arka plan */
    min-height: 100vh;
    padding: 20px;
    box-sizing: border-box;
}

.content-wrapper {
    max-width: 1200px;
    margin: 20px auto;
    padding: 20px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.loading-message, .error-message {
    text-align: center;
    padding: 20px;
    color: #555;
}

.error-message {
    color: #dc3545;
    background-color: #fdecea;
    border: 1px solid #fcc2c3;
    border-radius: 5px;
}

.search-input {
    width: 100%;
    padding: 10px;
    margin-bottom: 20px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 1rem;
    box-sizing: border-box;
}

.table-container.card {
    overflow-x: auto;
}

table {
    width: 100%;
    border-collapse: collapse;
}

th, td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid #eee;
}

th {
    background-color: #e9ecef; /* Açık gri başlık */
    font-weight: bold;
    color: #333;
}

tbody tr:hover {
    background-color: #f5f5f5;
}

.actions-column {
    white-space: nowrap;
}

.action-btn {
    background-color: #28a745; /* Yeşil buton */
    color: white;
    border: none;
    padding: 8px 12px;
    margin-right: 5px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background-color 0.3s ease;
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    float: left; /* Butonları sola hizala */
}

.action-btn:hover {
    background-color: #1e7e34; /* Koyu yeşil hover */
}

.no-results {
    padding: 15px;
    text-align: center;
    color: #777;
}

/* Responsive Tasarım */
@media (max-width: 768px) {
    .content-wrapper {
        padding: 15px;
        margin: 10px auto;
    }

    table {
        font-size: 0.9rem;
    }

    th, td {
        padding: 8px 10px;
    }

    .action-btn {
        font-size: 0.8rem;
        padding: 6px 10px;
        margin-bottom: 5px;
        float: none; /* Mobil görünümde float'ı kaldır */
    }

    .actions-column {
        display: flex;
        flex-direction: column;
        align-items: flex-start; /* Mobil görünümde butonları sola hizala */
    }
}
`;

export default Ilan;
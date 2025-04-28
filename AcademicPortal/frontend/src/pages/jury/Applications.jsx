import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import JuryNavbar from "../../components/navbars/JuryNavbar.jsx";
import api from '../../services/api';

const Applications = () => {
  const [sortKey, setSortKey] = useState("name");
  const [filter, setFilter] = useState("");
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      try {
        const response = await api.get('/juri-atamalar/detayli/?my_assignments=true');
        console.log('API response:', response.data);
        setApplications(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const filtered = applications
    .filter(app =>
      (app.ilan?.kadro_tipi?.tip?.toLowerCase().includes(filter.toLowerCase()) ||
      app.ilan?.baslik?.toLowerCase().includes(filter.toLowerCase()) ||
      app.juri_uyesi?.first_name?.toLowerCase().includes(filter.toLowerCase()) ||
      app.juri_uyesi?.last_name?.toLowerCase().includes(filter.toLowerCase()))
    )
    .sort((a, b) => {
      switch(sortKey) {
        case "name":
          return `${a.juri_uyesi?.first_name} ${a.juri_uyesi?.last_name}`.localeCompare(
            `${b.juri_uyesi?.first_name} ${b.juri_uyesi?.last_name}`
          );
        case "position":
          return (a.ilan?.kadro_tipi?.tip || '').localeCompare(b.ilan?.kadro_tipi?.tip || '');
        case "title":
          return (a.ilan?.baslik || '').localeCompare(b.ilan?.baslik || '');
        case "date":
          return new Date(a.atama_tarihi) - new Date(b.atama_tarihi);
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <>
        <JuryNavbar />
        <div className="applications-container">
          <p>Yükleniyor...</p>
        </div>
        <style>{css}</style>
      </>
    );
  }

  if (error) {
    return (
      <>
        <JuryNavbar />
        <div className="applications-container">
          <p style={{ color: 'red' }}>Hata: {error}</p>
        </div>
        <style>{css}</style>
      </>
    );
  }

  return (
    <>
      <style>{css}</style>
      <JuryNavbar />
      <div className="applications-container">
        <h1 className="applications-title">Başvurular</h1>

        <input
          type="text"
          placeholder="Filtrele: Aday, kadro, ilan..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="filter-input"
        />

        <div className="overflow-x-auto">
          <table className="applications-table">
            <thead>
              <tr>
                <th onClick={() => setSortKey("position")}>Kadro</th>
                <th onClick={() => setSortKey("title")}>İlan Başlığı</th>
                <th onClick={() => setSortKey("date")}>Atama Tarihi</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map((app) => (
                <React.Fragment key={app.id}>
                  <tr>
                    <td>{app.ilan?.kadro_tipi_ad || app.ilan?.kadro_tipi?.tip || '-'}</td>
                    <td>{app.ilan?.baslik || '-'}</td>
                    <td>{app.atama_tarihi ? new Date(app.atama_tarihi).toLocaleDateString('tr-TR') : '-'}</td>
                    <td>
                      <button
                        className="action-button"
                        onClick={() => setExpandedRow(expandedRow === app.id ? null : app.id)}
                      >
                        {expandedRow === app.id ? "Kapat" : "Başvuruları Gör"}
                      </button>
                    </td>
                  </tr>
                  {expandedRow === app.id && (
                    <tr>
                      <td colSpan={4} style={{ background: "#f9f9f9", padding: 0 }}>
                        <div style={{ padding: "18px 0", display: 'flex', justifyContent: 'center' }}>
                          {app.basvurular && app.basvurular.length > 0 ? (
                            <div className="basvuru-cards" style={{ justifyContent: app.basvurular.length === 1 ? 'center' : 'flex-start' }}>
                              {app.basvurular.map((basvuru) => (
                                <div className="basvuru-card" key={basvuru.id} style={{ minWidth: 180, maxWidth: 260, margin: '0 auto' }}>
                                  <div className="aday">{basvuru.aday?.first_name} {basvuru.aday?.last_name}</div>
                                  <div className="tarih">{basvuru.basvuru_tarihi ? new Date(basvuru.basvuru_tarihi).toLocaleDateString('tr-TR') : '-'}</div>
                                  <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                                    <span className={`status-badge status-${(basvuru.durum || 'Beklemede').toLowerCase()}`}>{basvuru.durum}</span>
                                  </div>
                                  <button
                                    className="action-button"
                                    onClick={() => navigate(`/jury-userapplication/${basvuru.id}`)}
                                  >
                                    Detaylar
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div style={{padding: '12px 0'}}>Bu ilana henüz başvuru yapılmamış.</div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '1rem' }}>
                    {applications.length === 0 ? 'Size atanmış başvuru bulunmamaktadır.' : 'Filtreye uygun başvuru bulunamadı.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

const css = `
  .applications-container {
    padding: 24px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    min-height: calc(100vh - 70px);
    max-width: 1400px;
    margin: 0 auto;
  }

  .applications-title {
    font-size: 2.3rem;
    font-weight: bold;
    margin-bottom: 28px;
    color: #009944;
    letter-spacing: 1px;
    text-shadow: 0 2px 8px rgba(0,0,0,0.07);
  }

  .filter-input {
    width: 100%;
    padding: 14px;
    border-radius: 10px;
    border: 1.5px solid #cce3d3;
    background-color: #fff;
    color: #333;
    margin-bottom: 28px;
    font-size: 1.08rem;
    transition: border-color 0.2s, box-shadow 0.2s;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  }

  .filter-input:focus {
    outline: none;
    border-color: #009944;
    box-shadow: 0 0 0 2px #b6f5d8;
  }

  .applications-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    background-color: #fff;
    border-radius: 18px;
    overflow: hidden;
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.10);
  }

  .applications-table th {
    background: #fff;
    color: #009944;
    text-align: left;
    padding: 18px 16px 18px 16px;
    cursor: pointer;
    font-size: 1.08rem;
    font-weight: 600;
    letter-spacing: 0.5px;
    border-bottom: 2px solid #e0e0e0;
    border-top: 4px solid #00c97b;
    border-bottom: 4px solid #00c97b;
    position: relative;
    z-index: 1;
  }
  .applications-table th:first-child {
    border-top-left-radius: 18px;
  }
  .applications-table th:last-child {
    border-top-right-radius: 18px;
  }
  .applications-table tr:last-child td:first-child {
    border-bottom-left-radius: 18px;
  }
  .applications-table tr:last-child td:last-child {
    border-bottom-right-radius: 18px;
  }

  .applications-table td {
    padding: 18px 16px;
    color: #333;
    border-bottom: 1px solid #f0f0f0;
    font-size: 1.01rem;
    vertical-align: middle;
    background: #fff;
    transition: background 0.2s;
  }

  .applications-table tr:last-child td {
    border-bottom: none;
  }

  .applications-table tbody tr:hover {
    background-color: #f6fbf8;
  }

  .status-badge {
    display: inline-block;
    padding: 6px 16px;
    border-radius: 16px;
    font-size: 0.98rem;
    font-weight: 700;
    letter-spacing: 0.2px;
    background: #e0e0e0;
    color: #333;
    box-shadow: 0 1px 4px rgba(0,0,0,0.04);
    margin-bottom: 2px;
    margin-top: 2px;
    min-width: 90px;
    text-align: center;
    border: 1.5px solid #e0e0e0;
    transition: background 0.2s, color 0.2s, border 0.2s;
  }
  .status-beklemede {
    background: #fffbe6;
    color: #bfa100;
    border: 1.5px solid #ffe066;
  }
  .status-incelemede {
    background: #e6f7ff;
    color: #0077b6;
    border: 1.5px solid #90e0ef;
  }
  .status-onaylandı {
    background: #e6ffe6;
    color: #009944;
    border: 1.5px solid #b6f5d8;
  }
  .status-reddedildi {
    background: #ffe6e6;
    color: #d90429;
    border: 1.5px solid #ffb3b3;
  }

  .action-button {
    padding: 9px 18px;
    border-radius: 8px;
    font-size: 0.97rem;
    background: linear-gradient(90deg, #009944 80%, #00c97b 100%);
    color: #fff;
    border: none;
    cursor: pointer;
    font-weight: 600;
    margin-bottom: 3px;
    margin-right: 2px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.07);
    transition: all 0.18s;
  }

  .action-button:hover {
    background: linear-gradient(90deg, #008038 80%, #00b36b 100%);
    transform: translateY(-2px) scale(1.04);
    box-shadow: 0 4px 16px rgba(0,0,0,0.10);
  }

  .action-button:active {
    transform: translateY(0) scale(0.98);
  }

  /* Açılır başvuru kutuları */
  .basvuru-cards {
    display: flex;
    flex-wrap: wrap;
    gap: 18px;
    margin-top: 8px;
    justify-content: flex-start;
  }
  .basvuru-card {
    background: #f8fff9;
    border: 1.5px solid #cce3d3;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    padding: 18px 22px;
    min-width: 180px;
    max-width: 260px;
    flex: 1 1 180px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: space-between;
    transition: box-shadow 0.2s, border 0.2s;
    margin: 0 8px;
  }
  .basvuru-card:hover {
    box-shadow: 0 6px 24px rgba(0,0,0,0.13);
    border: 1.5px solid #009944;
  }
  .basvuru-card .aday {
    font-weight: 600;
    color: #009944;
    margin-bottom: 6px;
    font-size: 1.08rem;
    text-align: center;
    width: 100%;
  }
  .basvuru-card .tarih {
    color: #666;
    font-size: 0.98rem;
    margin-bottom: 4px;
    text-align: center;
    width: 100%;
  }
  .basvuru-card .status-badge {
    margin-bottom: 10px;
    margin-top: 0;
    width: auto;
    min-width: 90px;
    text-align: center;
    display: inline-block;
  }
  .basvuru-card .action-button {
    margin-top: 6px;
    width: 100%;
  }

  @media (max-width: 900px) {
    .applications-container {
      padding: 10px;
    }
    .applications-title {
      font-size: 1.5rem;
      margin-bottom: 16px;
    }
    .applications-table th, .applications-table td {
      padding: 10px 7px;
      font-size: 0.97rem;
    }
    .basvuru-card {
      min-width: 160px;
      padding: 12px 10px;
    }
  }
`;

export default Applications;
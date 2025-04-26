import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserNavbar from "../../components/navbars/UserNavbar";

// --- IlanCard Bileşeni ---
const IlanCard = ({ ilan }) => {
  const navigate = useNavigate();

  // Yönlendirmeyi URL parametresi ile yap
  const handleRedirect = () => {
    // localStorage.setItem("ilanId", ilan.id); // localStorage KULLANMA
    navigate(`/apply/${ilan.id}`); // /apply/:ilanId rotasına yönlendir
  };

  // Tarih formatlama (isteğe bağlı)
  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleDateString("tr-TR");
    } catch (e) {
      return dateString; // Hata olursa orijinalini göster
    }
  };
  return (
    <div className="ilan-card">
      <h2 className="ilan-title">{ilan.baslik || ilan.kadro_tipi_ad || ilan.unvan || 'Başlık Yok'}</h2>
      <p className="ilan-detail">{ilan.birim_ad || ilan.birim?.ad || ilan.birim || 'Birim Belirtilmemiş'}</p>
      <p className="ilan-detail">{ilan.bolum_ad || ilan.bolum?.ad || ilan.bolum || 'Bölüm Belirtilmemiş'}</p>
      {/* <p className="ilan-detail">Anabilim Dalı: {ilan.anabilim_dali_ad || ilan.anabilim_dali?.ad || ''}</p> */}
      <p className="ilan-dates">
        Başvuru Tarihleri: {formatDate(ilan.baslangic_tarihi)} - {formatDate(ilan.bitis_tarihi)}
      </p>
      {/* İlanın aktif olup olmadığını gösterebiliriz */}
      {/* <p>Durum: {ilan.aktif ? 'Aktif' : 'Pasif'}</p> */}
      <button className="ilan-button" onClick={handleRedirect}>
        Detayları Gör ve Başvur
      </button>
    </div>
  );
};


// --- IlanListesi Bileşeni ---
const IlanListesi = () => {
  const [ilanlarData, setIlanlarData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtre, setFiltre] = useState("");

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch('http://localhost:8000/api/ilanlar/', { credentials: 'include' })
      .then(res => {
        if (!res.ok) {
          throw new Error(`Veri çekilemedi (${res.status})`);
        }
        return res.json();
      })
      .then(data => {
        // Gelen verinin yapısına göre ayarlayın (DRF pagination kullanıyorsa data.results olabilir)
        setIlanlarData(data.results || data);
      })
      .catch(err => {
        console.error("İlanları çekerken hata:", err);
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []); // Sadece component mount olduğunda çalışır

  // Filtreleme işlemini API'den gelen veri üzerinde yap
  const filtrelenmisIlanlar = ilanlarData.filter(
    (ilan) => {
        // API'den gelen gerçek alan adlarına göre filtrele
        const searchString = filtre.toLowerCase();
        return (
            (ilan.baslik && ilan.baslik.toLowerCase().includes(searchString)) ||
            (ilan.kadro_tipi_ad && ilan.kadro_tipi_ad.toLowerCase().includes(searchString)) || // veya ilan.kadro_tipi?.tip
            (ilan.birim_ad && ilan.birim_ad.toLowerCase().includes(searchString)) || // veya ilan.birim?.ad
            (ilan.bolum_ad && ilan.bolum_ad.toLowerCase().includes(searchString)) // veya ilan.bolum?.ad
        );
    }
  );

  if (loading) {
    return <div className="ilan-listesi"><p>İlanlar yükleniyor...</p></div>;
  }

  if (error) {
    return <div className="ilan-listesi"><p>Hata: {error}</p></div>;
  }

  return (
    <div className="ilan-listesi">
      <h1 className="ilan-header">Akademik İlanlar</h1>
      <input
        type="text"
        placeholder="Başlık, unvan, birim veya bölüm ara..." // Placeholder güncellendi
        className="ilan-search"
        value={filtre}
        onChange={(e) => setFiltre(e.target.value)}
      />
      <div className="ilan-grid">
        {filtrelenmisIlanlar.length > 0 ? (
             filtrelenmisIlanlar.map((ilan) => (
                <IlanCard key={ilan.id} ilan={ilan} />
             ))
         ) : (
             <p>Filtreye uygun ilan bulunamadı.</p>
         )}
      </div>
    </div>
  );
};


// --- Ana Listings Bileşeni ---
const Listings = () => {
  return (
    <>
      <style>
        {`
          * {
            box-sizing: border-box;
          }
          .listings-page {
            background-color: #f4f6f9;
            min-height: 100vh;
            padding: 20px;
          }

          .listings-container {
            max-width: 1200px;
            padding: 50px;
            margin: 20px auto;
          }

          .ilan-listesi {
            background-color: #f4f6f9;
            padding: 20px;
            border-radius: 10px;
          }

          .ilan-header {
            font-size: 24px;
            font-weight: bold;
            color: #333;
            margin-bottom: 20px;
          }

          .ilan-search {
            width: 100%;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 10px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }

          .ilan-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .ilan-card {
            background-color: white;
            border: 1px solid #eee;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
            transition: background-color 0.3s ease, transform 0.3s ease;
          }

          .ilan-card:hover {
            background-color: #e6f0e6;
            transform: translateY(-5px);
          }

          .ilan-title {
            font-size: 20px;
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
          }

          .ilan-detail {
            font-size: 16px;
            color: #555;
            margin-bottom: 5px;
          }

          .ilan-dates {
            font-size: 14px;
            color: #666;
            margin-top: 10px;
          }

          .ilan-button {
            display: inline-block;
            margin-top: 15px;
            padding: 10px 20px;
            background-color: #009944;
            color: white;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            transition: background-color 0.3s ease;
          }

          .ilan-button:hover {
            background-color: #007c39;
          }
        `}
      </style>
      <div className="listings-page">
        <UserNavbar />
        <div className="listings-container">
          <IlanListesi />
        </div>
      </div>
    </>
  );
};

export default Listings;
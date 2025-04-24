import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import UserNavbar from "../../components/navbars/UserNavbar";

const ilanlar = [
  {
    id: 1,
    unvan: "Dr. Öğr. Üyesi",
    birim: "Mühendislik Fakültesi",
    bölüm: "Bilgisayar Mühendisliği",
    baslangicTarihi: "2025-04-01",
    bitisTarihi: "2025-04-20",
  },
  {
    id: 2,
    unvan: "Doçent",
    birim: "İktisadi ve İdari Bilimler Fakültesi",
    bölüm: "İşletme",
    baslangicTarihi: "2025-03-30",
    bitisTarihi: "2025-04-18",
  },
  {
    id: 3,
    unvan: "Profesör",
    birim: "Fen-Edebiyat Fakültesi",
    bölüm: "Fizik",
    baslangicTarihi: "2025-04-05",
    bitisTarihi: "2025-04-25",
  },
  {
    id: 4,
    unvan: "Dr. Öğr. Üyesi",
    birim: "Sağlık Bilimleri Fakültesi",
    bölüm: "Beslenme ve Diyetetik",
    baslangicTarihi: "2025-04-02",
    bitisTarihi: "2025-04-21",
  },
];

const IlanCard = ({ ilan }) => {
  const navigate = useNavigate();

  const handleRedirect = () => {
    localStorage.setItem("ilanId", ilan.id); // ilanId'yi localStorage'a kaydet
    navigate("/apply"); // /apply rotasına yönlendir
  };

  return (
    <div className="ilan-card">
      <h2 className="ilan-title">{ilan.unvan}</h2>
      <p className="ilan-detail">{ilan.birim}</p>
      <p className="ilan-detail">{ilan.bölüm}</p>
      <p className="ilan-dates">
        Başvuru Tarihleri: {ilan.baslangicTarihi} - {ilan.bitisTarihi}
      </p>
      <button className="ilan-button" onClick={handleRedirect}>
        Detayları Gör
      </button>
    </div>
  );
};

const IlanListesi = () => {
  const [filtre, setFiltre] = useState("");

  const filtrelenmisIlanlar = ilanlar.filter(
    (ilan) =>
      ilan.unvan.toLowerCase().includes(filtre.toLowerCase()) ||
      ilan.birim.toLowerCase().includes(filtre.toLowerCase()) ||
      ilan.bölüm.toLowerCase().includes(filtre.toLowerCase())
  );

  return (
    <div className="ilan-listesi">
      <h1 className="ilan-header">Akademik İlanlar</h1>
      <input
        type="text"
        placeholder="Unvan, birim veya bölüm ara..."
        className="ilan-search"
        value={filtre}
        onChange={(e) => setFiltre(e.target.value)}
      />
      <div className="ilan-grid">
        {filtrelenmisIlanlar.map((ilan) => (
          <IlanCard key={ilan.id} ilan={ilan} />
        ))}
      </div>
    </div>
  );
};

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
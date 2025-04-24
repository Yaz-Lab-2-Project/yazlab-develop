import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import UserNavbar from "../../components/navbars/UserNavbar.jsx"; // UserNavbar bileşenini import edin

// SABİT VERİLER
const ilanlar = [
  {
    id: "9f1b6a7c-1a2b-4c3d-9e8f-000000000001",
    kadro_tipi: "Doktor Öğr. Üyesi",
    baslangic_tarihi: "2025-04-01",
    bitis_tarihi: "2025-04-15",
    aciklama: "2024-2025 Bahar dönemi için Doktor Öğretim Üyesi alımı yapılacaktır. Başvuru kriterlerini dikkatlice inceleyiniz.",
    created_by: "1a2b3c4d-6666-ffff-gggg-000000000006"
  },
  {
    id: "2c3d4e5f-2b3c-4d5e-9f0a-000000000002",
    kadro_tipi: "Doçent",
    baslangic_tarihi: "2025-04-10",
    bitis_tarihi: "2025-04-25",
    aciklama: "Mühendislik Fakültesi için Doçent kadrosuna başvurular açılmıştır. Gerekli belgeleri sisteme yüklemeyi unutmayınız.",
    created_by: "1a2b3c4d-7777-gggg-hhhh-000000000007"
  },
  {
    id: "3e4f5a6b-3c4d-5e6f-af0b-000000000003",
    kadro_tipi: "Profesör",
    baslangic_tarihi: "2025-04-20",
    bitis_tarihi: "2025-05-05",
    aciklama: "Fen Edebiyat Fakültesi'ne Profesör kadrosu için başvurular başlamıştır. Lütfen atama yönergesine uygun belgeleri yükleyiniz.",
    created_by: "1a2b3c4d-6666-ffff-gggg-000000000006"
  }
];

const duyurular = [
  {
    id: 1,
    baslik: "Proje Teslim Tarihi",
    icerik: "Projenizi 20 Nisan 2025 saat 17.00’ye kadar GitHub’a yüklemelisiniz.",
    hedef_rol: "Tümü",
    olusturma_tarihi: "2025-03-27T09:00:00",
    gecerlilik_bitis: "2025-04-20T17:00:00",
    onem_durumu: true
  },
  {
    id: 2,
    baslik: "Jüri Değerlendirme Başladı",
    icerik: "Atandığınız adaylar için değerlendirme raporlarını yüklemeyi unutmayın.",
    hedef_rol: "Jüri Üyesi",
    olusturma_tarihi: "2025-04-21T10:00:00",
    gecerlilik_bitis: "2025-04-30T23:59:59",
    onem_durumu: false
  },
  {
    id: 3,
    baslik: "Sistem Güncellemesi",
    icerik: "28 Mart’ta sistem bakımda olacak, giriş yapılamayacak.",
    hedef_rol: "Tümü",
    olusturma_tarihi: "2025-03-26T14:30:00",
    gecerlilik_bitis: "2025-03-29T00:00:00",
    onem_durumu: true
  }
];

const basvurular = [
  {
    id: 1,
    aday_id: "1a2b3c4d-1111-aaaa-bbbb-000000000001",
    ilan_id: 501,
    basvuru_tarihi: "2025-04-03T14:25:00Z",
    durum: "Beklemede",
    pdf_url: "https://akademikportal.edu/pdf/basvuru1.pdf"
  },
  {
    id: 2,
    aday_id: "1a2b3c4d-1111-aaaa-bbbb-000000000001",
    ilan_id: 503,
    basvuru_tarihi: "2025-04-10T09:45:00Z",
    durum: "Onaylandı",
    pdf_url: "https://akademikportal.edu/pdf/basvuru2.pdf"
  },
  {
    id: 3,
    aday_id: 101,
    ilan_id: 504,
    basvuru_tarihi: "2025-04-15T11:30:00Z",
    durum: "Reddedildi",
    pdf_url: "https://akademikportal.edu/pdf/basvuru3.pdf"
  },
  {
    id: 4,
    aday_id: 101,
    ilan_id: 505,
    basvuru_tarihi: "2025-04-20T16:10:00Z",
    durum: "Beklemede",
    pdf_url: "https://akademikportal.edu/pdf/basvuru4.pdf"
  }
];

const predefinedUsers = [
  {
    id: "1a2b3c4d-1111-aaaa-bbbb-000000000001",
    ad: "Ali",
    soyad: "Yılmaz",
    rol: "user"
  },
  // Diğer kullanıcılar (gerekirse buraya eklenebilir)
];

const UserDashboard = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [user, setUser] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [latestAnnouncements, setLatestAnnouncements] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("role");
    const userId = localStorage.getItem("userId");

    if (!role || role !== "user") {
      navigate("/login");
      return;
    }

    // Kullanıcıyı mock veriden bul
    const foundUser = predefinedUsers.find((u) => u.id === userId);
    setUser(foundUser);

    // Duyuruları filtrele
    const genelDuyurular = duyurular.filter((d) => d.hedef_rol === "Tümü");
    setAnnouncements(genelDuyurular);

    // En güncel ilanlar
    const aktifIlanlar = ilanlar.filter(
      (i) => new Date(i.bitis_tarihi) >= new Date()
    );
    setLatestAnnouncements(aktifIlanlar);
  }, [navigate]);

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const days = daysInMonth(year, month);

    // Sadece predefinedUsers içerisindeki kullanıcıların başvurularını filtrele
    const validUserIds = predefinedUsers.map((user) => user.id);
    const filteredApplications = basvurular.filter((b) =>
      validUserIds.includes(b.aday_id)
    );

    const calendar = [];
    for (let i = 0; i < firstDay; i++) {
      calendar.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let day = 1; day <= days; day++) {
      const currentDateStr = new Date(year, month, day).toISOString().split("T")[0];
      const dailyApplications = filteredApplications.filter(
        (b) => b.basvuru_tarihi.split("T")[0] === currentDateStr
      );

      calendar.push(
        <div key={day} className="calendar-day">
          <div className="day-number">{day}</div>
          {dailyApplications.map((app) => (
            <div key={app.id} className={`application ${app.durum.toLowerCase()}`}>
              <a href={app.pdf_url} target="_blank" rel="noopener noreferrer">
                {app.durum}
              </a>
            </div>
          ))}
        </div>
      );
    }

    return calendar;
  };

  return (
    <div className="dashboard">
      <UserNavbar /> {/* Navbar */}
      {user && (
        <div className="user-welcome">
          <h2>Hoş geldiniz, {user.ad} {user.soyad}</h2>
        </div>
      )}
      <div className="container">
        <div className="calendar-container">
          <div className="calendar-header">
            <button onClick={handlePrevMonth}>&lt;</button>
            <h2>
              {currentDate.toLocaleString("tr-TR", {
                year: "numeric",
                month: "long",
              })}
            </h2>
            <button onClick={handleNextMonth}>&gt;</button>
          </div>
          <div className="calendar-grid">
            {["Pzt", "Sal", "Çrş", "Prş", "Cum", "Cmt", "Paz"].map((day) => (
              <div key={day} className="calendar-day-header">{day}</div>
            ))}
            {renderCalendar()}
          </div>
        </div>
        <div className="sidebar">
          <div className="announcements">
            <h3>Duyurular</h3>
            <ul>
              {announcements.map((d) => (
                <li key={d.id}>
                  <strong>{d.baslik}:</strong> {d.icerik}
                </li>
              ))}
            </ul>
          </div>
          <div className="latest-announcements">
            <h3>Anlık İlanlar</h3>
            <ul>
              {latestAnnouncements.map((i) => (
                <li key={i.id}>
                  <strong>{i.kadro_tipi}:</strong> {i.aciklama}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <style>
        {`
          /* CSS kodları buraya eklendi */
          .user-navbar {
              width: 100%;
              position: relative;
              z-index: 10;
              background-color: white;
              box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          }

          .dashboard {
              display: flex;
              flex-direction: column;
              align-items: stretch;
              width: 100%;
              margin: 0 auto;
              padding: 0;
              box-sizing: border-box;
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #f4f6f9;
              gap: 20px;
          }

          .container {
              display: flex;
              flex-direction: row;
              gap: 20px;
              width: 100%;
          }

          .user-welcome {
              width: 100%;
              margin-bottom: 20px;
          }

          .announcements, .latest-announcements {
              background-color: white;
              border-radius: 10px;
              box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
              padding: 20px;
          }

          .announcements:hover, .latest-announcements:hover {
              transform: translateY(-5px);
          }

          .announcements h3, .latest-announcements h3 {
              margin-bottom: 15px;
              border-bottom: 2px solid #009944;
              padding-bottom: 10px;
              font-size: 20px;
              color: #009944;
          }

          .announcements ul, .latest-announcements ul {
              list-style: none;
              padding: 0;
              margin: 0;
              max-height: 300px;
              overflow-y: auto;
          }

          .announcements li, .latest-announcements li {
              margin-bottom: 15px;
              padding-bottom: 10px;
              border-bottom: 1px solid #eee;
              font-size: 16px;
              color: #555;
              padding: 10px;
              border-radius: 4px;
              transition: background-color 0.1s ease-in-out;
              cursor: pointer;
          }

          .announcements li:hover, .latest-announcements li:hover {
              background-color: #e6f0e6;
          }

          .calendar-container {
              flex: 2;
              background-color: white;
              border-radius: 10px;
              padding: 20px;
              box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          }

          .calendar-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 20px;
          }

          .calendar-header h2 {
              font-size: 20px;
              color: #009944;
          }

          .calendar-header button {
              background-color: #009944;
              color: white;
              border: none;
              border-radius: 5px;
              padding: 10px 15px;
              font-size: 16px;
              cursor: pointer;
              transition: background-color 0.3s ease;
          }

          .calendar-header button:hover {
              background-color: #007c39;
          }

          .calendar-grid {
              display: grid;
              grid-template-columns: repeat(7, 1fr);
              gap: 10px;
          }

          .calendar-day-header {
              font-weight: bold;
              text-align: center;
              padding: 10px;
              background-color: #e6f0e6;
              border-radius: 4px;
              color: #009944;
          }

          .calendar-day {
              text-align: center;
              padding: 15px;
              border-radius: 4px;
              background-color: #f0f0f0;
              transition: background-color 0.2s ease-in-out;
              position: relative;
              cursor: pointer;
          }

          .calendar-day:hover {
              background-color: #d9f2d9;
          }

          .calendar-day.empty {
              background-color: transparent;
          }

          .calendar-day .day-number {
              font-weight: bold;
              margin-bottom: 5px;
          }

          .application {
              font-size: 12px;
              margin-top: 5px;
              padding: 5px;
              border-radius: 4px;
              text-align: center;
              color: white;
              font-weight: bold;
          }

          .application.beklemede {
              background-color: #ffc107;
          }

          .application.onaylandı {
              background-color: #28a745;
          }

          .application.reddedildi {
              background-color: #dc3545;
          }
        `}
      </style>
    </div>
  );
};

export default UserDashboard;

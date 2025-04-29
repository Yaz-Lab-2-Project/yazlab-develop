import React, { useState, useEffect } from "react";
// useNavigate artık burada gerekmeyebilir, çünkü yetkisiz erişimi ProtectedRoute hallediyor.
// import { useNavigate } from "react-router-dom";
import UserNavbar from "../../components/navbars/UserNavbar.jsx";
import { useAuth } from "../../context/AuthContext"; // AuthContext'i import et
import api from '../../services/api';

// SABİT VERİLERİ SİLİN (ilanlar, duyurular, basvurular, predefinedUsers)

const UserDashboard = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { user } = useAuth(); // Kullanıcı bilgisini Context'ten alıyoruz
  const [announcements, setAnnouncements] = useState([]);
  const [latestAnnouncements, setLatestAnnouncements] = useState([]);
  const [applications, setApplications] = useState([]); // Başvurular için state
  const [loading, setLoading] = useState(true); // Veri yükleme durumu
  const [error, setError] = useState(null); // Hata durumu
  // const navigate = useNavigate(); // Artık burada navigate'e gerek yok

  useEffect(() => {
    // localStorage kontrolünü ve navigate('/login') çağrısını kaldırın.
    // Bu kontrolü ProtectedRoute yapmalı.

    // Verileri API'den çek
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [announcementsRes, listingsRes, applicationsRes] = await Promise.all([
          api.get('/bildirimler/'),
          api.get('/ilanlar/', { params: { aktif: true } }),
          api.get('/basvurular/')
        ]);
        setAnnouncements(announcementsRes.data.results || announcementsRes.data);
        setLatestAnnouncements(listingsRes.data.results || listingsRes.data);
        setApplications(applicationsRes.data.results || applicationsRes.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Sadece component mount olduğunda çalışır

  // Takvim fonksiyonları (aynı kalabilir)
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

    const calendar = [];
    // Takvimin başına boş günler ekle (Pazartesi'den başlaması için ayar gerekebilir)
    let startDay = firstDay === 0 ? 6 : firstDay -1; // Haftayı Pazartesi'den başlat
    for (let i = 0; i < startDay; i++) {
      calendar.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Tarih karşılaştırması için pad fonksiyonu
    const pad = (n) => n.toString().padStart(2, '0');

    for (let day = 1; day <= days; day++) {
      const dayDate = new Date(year, month, day);
      const currentDateStr = `${dayDate.getFullYear()}-${pad(dayDate.getMonth() + 1)}-${pad(dayDate.getDate())}`;

      // API'den gelen başvuruları filtrele (backend 'basvuru_tarihi' formatına dikkat!)
      const dailyApplications = applications.filter(
        (b) => {
          if (!b.basvuru_tarihi) return false;
          const d = new Date(b.basvuru_tarihi);
          const bDateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
          return bDateStr === currentDateStr;
        }
      );

      calendar.push(
        <div key={day} className="calendar-day">
          <div className="day-number">{day}</div>
          {dailyApplications.map((app) => (
            <div key={app.id} className={`application ${app.durum ? app.durum.toLowerCase() : 'bilinmiyor'}`}>
               {/* Backend'den PDF URL gelmiyorsa linki kaldırın veya düzenleyin */}
               {app.durum || 'Detay'}
               {/* Eğer PDF URL varsa:
               <a href={app.pdf_url} target="_blank" rel="noopener noreferrer">
                 {app.durum}
               </a>
               */}
            </div>
          ))}
        </div>
      );
    }
    return calendar;
  };


  // Yükleme veya Hata Durumlarını Göster
  if (loading) {
      return <div><UserNavbar /> <div className="container">Yükleniyor...</div></div>;
  }

  if (error) {
       return <div><UserNavbar /> <div className="container">Hata: {error}</div></div>;
  }

  // Veri başarıyla yüklendiyse render et
  return (
    <div className="dashboard">
      <UserNavbar /> {/* Navbar */}
      {/* user bilgisini localStorage yerine Context'ten alıyoruz */}
      {user && (
        <div className="user-welcome" style={{ padding: '0 20px' }}> {/* Padding ekledim */}
          <h2>Hoş geldiniz, {user.first_name} {user.last_name}</h2>
        </div>
      )}
      <div className="container" style={{ padding: '0 20px 20px 20px' }}> {/* Padding ekledim */}
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
            <h3>Duyurular (Bildirimler)</h3> {/* Başlığı güncelledim */}
            <ul>
              {announcements.length > 0 ? announcements.map((d) => (
                <li key={d.id}>
                  {/* Backend'den gelen bildirim modeline göre alan adlarını güncelleyin */}
                  <strong>{d.baslik}:</strong> {d.mesaj}
                </li>
              )) : <li>Gösterilecek duyuru yok.</li>}
            </ul>
          </div>
          <div className="latest-announcements">
            <h3>Aktif İlanlar</h3> {/* Başlığı güncelledim */}
            <ul>
               {/* Backend'den gelen ilan modeline göre alan adlarını güncelleyin */}
              {latestAnnouncements.length > 0 ? latestAnnouncements.map((i) => (
                <li key={i.id}>
                   {/* İlanın kadro tipi yerine başlığını göstermek daha anlamlı olabilir */}
                  <strong>{i.baslik}:</strong> {i.kadro_tipi_ad || i.kadro_tipi} - Bitiş: {new Date(i.bitis_tarihi).toLocaleDateString('tr-TR')}
                  {/* Belki ilanın detayına link verilebilir */}
                </li>
              )) : <li>Aktif ilan bulunmuyor.</li>}
            </ul>
          </div>
        </div>
      </div>
      {/* CSS Kodları (Değişiklik Yok) */}
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
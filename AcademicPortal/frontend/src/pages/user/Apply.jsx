import React, { useEffect, useState } from "react";
import UserNavbar from "../../components/navbars/UserNavbar";
const academicAnnouncements = [
  {
    id: 1,
    title: "Bilgisayar Mühendisliği Bölümü - Dr. Öğr. Üyesi Kadrosu",
    position: "Dr. Öğr. Üyesi",
    faculty: "Mühendislik Fakültesi",
    department: "Bilgisayar Mühendisliği",
    startDate: "2025-04-01",
    endDate: "2025-04-20",
    requiredDocuments: [
      "Özgeçmiş",
      "Yüksek Lisans ve Doktora Belgeleri",
      "İndeksli Yayın Kanıtı (A1-A5)",
      "En az 1 A1/A2 yayını",
      "Başlıca yazar kanıtı",
    ],
    applicationCriteria: {
      minPublications: 4,
      publicationConditions: {
        mustIncludeA1orA2: true,
        atLeastOneLeadAuthor: true,
      },
    },
  },
  {
    id: 2,
    title: "İktisat Bölümü - Doçent Kadrosu",
    position: "Doçent",
    faculty: "İktisadi ve İdari Bilimler Fakültesi",
    department: "İktisat",
    startDate: "2025-04-05",
    endDate: "2025-04-25",
    requiredDocuments: [
      "Doçentlik Belgesi",
      "Bilimsel Yayınlar",
      "Katılım Belgeleri (Konferans)",
      "Atıf Belgeleri",
      "Tablo 5 Otomatik Oluşacak",
    ],
    applicationCriteria: {
      minPoints: 100,
      requiredActivities: ["A1-A4 Yayın", "Konferans Sunumu", "Kitap Bölümü"],
      scoringMethod: "Otomatik Hesaplama",
    },
  },
  {
    id: 3,
    title: "Elektrik-Elektronik Mühendisliği - Profesör Kadrosu",
    position: "Profesör",
    faculty: "Mühendislik Fakültesi",
    department: "Elektrik-Elektronik Mühendisliği",
    startDate: "2025-03-30",
    endDate: "2025-04-20",
    requiredDocuments: [
      "Profesörlük Başvuru Dilekçesi",
      "Doçentlik ve Doktora Belgeleri",
      "En Az 10 Yayın",
      "Proje Yürütücülüğü Belgeleri",
      "Başlıca Yazar Olduğu Yayınlar",
    ],
    applicationCriteria: {
      minPublications: 10,
      publicationBreakdown: {
        mustInclude: ["A1", "A2", "Proje"],
        leadAuthorCount: 2,
      },
      scoringMethod: "KOÜ Yönergesi'ne Göre",
    },
  },
  {
    id: 4,
    title: "Hukuk Fakültesi - Dr. Öğr. Üyesi Kadrosu (Özel Alan)",
    position: "Dr. Öğr. Üyesi",
    faculty: "Hukuk Fakültesi",
    department: "Kamu Hukuku",
    startDate: "2025-04-02",
    endDate: "2025-04-18",
    requiredDocuments: [
      "Lisans, Yüksek Lisans, Doktora Belgeleri",
      "Alan Dışı Yayınlar Kanıtı",
      "Katılım Belgeleri",
      "En Az 3 Yayın (A1-A4)",
    ],
    applicationCriteria: {
      minPublications: 3,
      requiredArea: "Kamu Hukuku",
      customCriteria: "A1-A4 yayından en az 1 tanesi A1 olmak zorundadır",
    },
  },
];

const Apply = () => {
  const [announcement, setAnnouncement] = useState(null);
  const [applicationData, setApplicationData] = useState({
    fullName: "",
    email: "",
    documents: {},
    documentNames: {},
  });
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const ilanId = parseInt(localStorage.getItem("ilanId")); // localStorage'dan ilanId'yi al
    const found = academicAnnouncements.find((item) => item.id === ilanId);
    setAnnouncement(found);
  }, []);

  const handleInputChange = (e) => {
    setApplicationData({ ...applicationData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e, docName) => {
    const file = e.target.files[0];
    setApplicationData({
      ...applicationData,
      documents: {
        ...applicationData.documents,
        [docName]: file,
      },
      documentNames: {
        ...applicationData.documentNames,
        [docName]: file ? file.name : "",
      },
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Başvuru Verisi:", applicationData);
    setSubmitted(true);
  };

  if (!announcement) {
    return (
      <div className="container">
        <UserNavbar />
        <div className="section">İlan bulunamadı.</div>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          /* Genel Konteyner */
          .container {
              background-color: #f4f6f9;
              padding: 2rem;
              border-radius: 16px;
              max-width: 800px;
              margin: 2rem auto;
              font-family: sans-serif;
              color: #555;
          }

          .title {
              color: #333;
              font-size: 2rem;
              margin-bottom: 1rem;
              text-align: center;
          }

          .subtitle {
              color: #009944;
              font-size: 1.25rem;
              margin-bottom: 0.5rem;
          }

          .section {
              background-color: #fff;
              border: 1px solid #eee;
              padding: 1rem;
              border-radius: 12px;
              margin-bottom: 1.5rem;
          }

          ul {
              padding-left: 1.2rem;
          }

          li {
              margin-bottom: 0.3rem;
              color: #666;
          }

          .form {
              display: flex;
              flex-direction: column;
              gap: 1rem;
          }

          label {
              display: flex;
              flex-direction: column;
              font-weight: bold;
              color: #555;
          }

          input[type="text"],
          input[type="email"],
          input[type="file"] {
              margin-top: 0.5rem;
              padding: 0.5rem;
              border-radius: 8px;
              border: 1px solid #ccc;
          }

          .submitButton {
              background-color: #009944;
              color: #fff;
              border: none;
              padding: 0.75rem 1rem;
              border-radius: 10px;
              cursor: pointer;
              transition: background-color 0.3s;
              font-size: 1rem;
              font-weight: bold;
          }

          .submitButton:hover {
              background-color: #007c39;
          }

          /* Scrollbar */
          ::-webkit-scrollbar {
              width: 10px;
          }

          ::-webkit-scrollbar-thumb {
              background-color: #ccc;
              border-radius: 5px;
          }

          ::-webkit-scrollbar-track {
              background: transparent;
          }

          /* Hover efektleri */
          .section:hover {
              background-color: #e6f0e6;
          }
        `}
      </style>
      <UserNavbar />
      <div className="container">
        <div className="section">
          <h1 className="title">{announcement.title}</h1>
          <p>
            <strong>Fakülte:</strong> {announcement.faculty}
          </p>
          <p>
            <strong>Bölüm:</strong> {announcement.department}
          </p>
          <p>
            <strong>Kadro:</strong> {announcement.position}
          </p>
          <p>
            <strong>Başvuru Tarihleri:</strong> {announcement.startDate} -{" "}
            {announcement.endDate}
          </p>

          <h3 className="subtitle">Gerekli Belgeler</h3>
          <ul>
            {announcement.requiredDocuments.map((doc, index) => (
              <li key={index}>{doc}</li>
            ))}
          </ul>

          {!showForm && !submitted && (
            <button
              onClick={() => setShowForm(true)}
              className="submitButton"
            >
              Başvuru Yap
            </button>
          )}

          {showForm && !submitted && (
            <form onSubmit={handleSubmit} className="form">
              <label>
                Ad Soyad:
                <input
                  type="text"
                  name="fullName"
                  onChange={handleInputChange}
                  required
                />
              </label>
              <label>
                Email:
                <input
                  type="email"
                  name="email"
                  onChange={handleInputChange}
                  required
                />
              </label>

              {announcement.requiredDocuments.map((doc, index) => (
                <label key={index}>
                  {doc}:
                  <input
                    type="file"
                    onChange={(e) => handleFileChange(e, doc)}
                    required
                  />
                </label>
              ))}

              <button type="submit" className="submitButton">
                Başvur
              </button>
            </form>
          )}

          {submitted && (
            <div className="section">
              ✅ Başvurunuz başarıyla alınmıştır. Teşekkür ederiz!
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Apply;

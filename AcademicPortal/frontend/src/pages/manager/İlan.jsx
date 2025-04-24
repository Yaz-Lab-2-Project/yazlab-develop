// IlanOlusturmaFormu.jsx (React Component + Gömülü Stiller)

import React, { useState } from 'react';
// import './IlanFormu.css'; // CSS import satırı kaldırıldı
import ManagerNavbar from '../../components/navbars/ManagerNavbar'; // Bu import hala gerekli olabilir

// Django modelindeki choices ile aynı olmalı
const UNVAN_CHOICES = [
    { value: 'DR_OGR_UYESI', label: 'Doktor Öğretim Üyesi' },
    { value: 'DOCENT', label: 'Doçent' },
    { value: 'PROFESOR', label: 'Profesör' },
];

const TEMEL_ALAN_CHOICES = [
    { value: 'SAGLIK', label: 'Sağlık Bilimleri' },
    { value: 'FEN_MAT', label: 'Fen Bilimleri ve Matematik' },
    { value: 'MUHENDISLIK', label: 'Mühendislik' },
    { value: 'ZIRAAT_ORMAN_SU', label: 'Ziraat, Orman ve Su Ürünleri' },
    { value: 'SOSYAL_BESERI', label: 'Sosyal, Beşeri ve İdari Bilimler' },
    { value: 'FILOLOJI', label: 'Filoloji' },
    { value: 'EGITIM', label: 'Eğitim Bilimleri' },
    { value: 'MIMARLIK_PLANLAMA', label: 'Mimarlık, Planlama ve Tasarım' },
    { value: 'SPOR', label: 'Spor Bilimleri' },
    { value: 'HUKUK', label: 'Hukuk' },
    { value: 'ILAHIYAT', label: 'İlahiyat' },
    { value: 'GUZEL_SANATLAR', label: 'Güzel Sanatlar' },
    // Diğer alanlar
];

// CSS Stillerini bir string olarak tanımla
const styles = `
.ilan-form-container {
    max-width: 800px;
    margin: 20px auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 8px;
    font-family: sans-serif;
}

.genel-kriterler {
    background-color: #f8f9fa;
    border: 1px dashed #dee2e6;
    padding: 15px;
    margin-bottom: 20px;
    border-radius: 5px;
}

.genel-kriterler h2 {
    margin-top: 0;
    color: #495057;
    font-size: 1.1em;
    border-bottom: 1px solid #ccc;
    padding-bottom: 5px;
}

.genel-kriterler ul {
    padding-left: 20px;
    font-size: 0.9em;
    color: #6c757d;
}
.genel-kriterler li {
    margin-bottom: 5px;
}


.ilan-form h2 {
    color: #007bff;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
    margin-bottom: 20px;
}
.ilan-form h3 {
    color: #6c757d;
    font-size: 1.0em;
    margin-top: 25px;
    margin-bottom: 15px;
}

.form-grup {
    margin-bottom: 15px;
}

.form-grup label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
    font-size: 0.9em;
}

.form-grup input[type="text"],
.form-grup input[type="number"],
.form-grup input[type="date"],
.form-grup select,
.form-grup textarea {
    width: 100%;
    padding: 8px;
    border: 1px solid #ced4da;
    border-radius: 4px;
    box-sizing: border-box; /* padding ve border'ın genişliği etkilememesi için */
    font-size: 14px;
}

.form-grup textarea {
    resize: vertical; /* Sadece dikeyde boyutlandırma */
}
.form-grup-checkbox {
    display: flex;
    align-items: center;
    margin-top: 10px;
    margin-bottom: 20px;
}
.form-grup-checkbox input[type="checkbox"] {
   width: auto; /* Checkbox'ın varsayılan genişliğini kullanır */
   margin-right: 10px;
}
.form-grup-checkbox label {
    margin-bottom: 0; /* label'ın altındaki boşluğu kaldırır */
    font-weight: normal; /* Kalınlığı normale çevirir */
}

.submit-button {
    background-color: #28a745;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1em;
}

.submit-button:hover {
    background-color: #218838;
}

.hata-mesaji {
    color: #dc3545;
    background-color: #f8d7da;
    border: 1px solid #f5c6cb;
    padding: 10px;
    border-radius: 5px;
    margin-top: 15px;
}

.basari-mesaji {
    color: #155724;
    background-color: #d4edda;
    border: 1px solid #c3e6cb;
    padding: 10px;
    border-radius: 5px;
    margin-top: 15px;
}
hr {
    margin-top: 25px;
    margin-bottom: 25px;
    border: 0;
    border-top: 1px solid #eee;
}
`;

function IlanOlusturmaFormu() {
    const [formData, setFormData] = useState({
        unvan: UNVAN_CHOICES[0].value,
        temel_alan: TEMEL_ALAN_CHOICES[0].value,
        birim: '',
        kadro_adedi: 1,
        son_basvuru_tarihi: '',
        min_toplam_puan: '',
        min_yay_sayisi: '',
        min_baslica_yazar_sayisi: '',
        gerekli_yayin_kategorileri_aciklama: '',
        gerekli_tez_danismanligi: '',
        gerekli_proje_gorevi: '',
        ilan_metni: '',
        ozel_kosullar: '',
        aktif: true,
    });
    const [mesaj, setMesaj] = useState('');
    const [hata, setHata] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

     const handleSubmit = async (e) => {
        e.preventDefault();
        setMesaj('');
        setHata('');

        if (!formData.birim || !formData.son_basvuru_tarihi) {
            setHata("Birim ve Son Başvuru Tarihi alanları zorunludur.");
            return;
        }

        const apiUrl = 'http://127.0.0.1:8000/api/ilanlar/olustur/';

        const dataToSend = {
            ...formData,
            kadro_adedi: parseInt(formData.kadro_adedi) || 1,
            min_toplam_puan: formData.min_toplam_puan ? parseInt(formData.min_toplam_puan) : null,
            min_yay_sayisi: formData.min_yay_sayisi ? parseInt(formData.min_yay_sayisi) : null,
            min_baslica_yazar_sayisi: formData.min_baslica_yazar_sayisi ? parseInt(formData.min_baslica_yazar_sayisi) : null,
        };

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend)
            });

            const result = await response.json();

            if (response.ok) {
                setMesaj(`İlan başarıyla oluşturuldu! ID: ${result.id}`);
                 setFormData({
                    unvan: UNVAN_CHOICES[0].value,
                    temel_alan: TEMEL_ALAN_CHOICES[0].value,
                    birim: '', kadro_adedi: 1, son_basvuru_tarihi: '',
                    min_toplam_puan: '', min_yay_sayisi: '', min_baslica_yazar_sayisi: '',
                    gerekli_yayin_kategorileri_aciklama: '', gerekli_tez_danismanligi: '',
                    gerekli_proje_gorevi: '', ilan_metni: '', ozel_kosullar: '', aktif: true,
                });
            } else {
                let errorMessages = [];
                for (const key in result) {
                    errorMessages.push(`${key}: ${result[key].join(', ')}`);
                }
                setHata(`İlan oluşturulamadı: ${response.status} ${response.statusText}. ${errorMessages.join('; ')}`);
                console.error('API Hata Detayı:', result);
            }
        } catch (error) {
            setHata(`Bir ağ hatası oluştu: ${error.message}`);
            console.error('Fetch Hatası:', error);
        }
    };

    return (
        <>
            {/* Gömülü CSS stilleri */}
            <style>{styles}</style>

            <ManagerNavbar />
            <div className="ilan-form-container">
                <h1>Yeni Akademik İlan Oluştur</h1>

                <div className="genel-kriterler">
                    <h2>Tüm İlanlar İçin Geçerli Kriterler (Otomatik)</h2>
                    <p>
                        Başvuracak adayların aşağıdaki genel şartları sağlaması beklenir:
                    </p>
                    <ul>
                        <li>2547 Sayılı Kanun, ilgili Yönetmelik ve Kocaeli Üniversitesi Öğretim Üyeliği Atama ve Yükseltme Yönergesi hükümlerine uygunluk.</li>
                        <li>Yönergede belirtilen asgari koşullar (puan, yayın vb.) minimum düzeydedir, sağlanması atanma garantisi vermez.</li>
                        <li>Başvuru dosyasının Yönerge Madde 10(2)'ye göre eksiksiz hazırlanması (Özgeçmiş, diplomalar, dil belgesi, yayınlar, atıflar, projeler, Tablo 5 USB vb.).</li>
                        <li>Değerlendirme sürecinin (Ön Değerlendirme Komisyonu, Jüri Raporları) Yönerge'ye göre işleyeceği.</li>
                        <li>Dr.Öğr.Üyesi (ilk atama), Doçent ve Profesör kadroları için Yönerge'de belirtilen sınavlardan asgari 65 yabancı dil puanı veya eşdeğeri (Birimler daha yüksek isteyebilir).</li>
                        <li>Puanlamanın Yönerge Tablo 3 ve Tablo 4'e göre yapılacağı.</li>
                        <li>*Detaylar için güncel Kocaeli Üniversitesi Öğretim Üyeliği Atama ve Yükseltme Yönergesi incelenmelidir.*</li>
                     </ul>
                </div>

                <form onSubmit={handleSubmit} className="ilan-form">
                    <h2>İlana Özel Kriterler (Yönetici Girişi)</h2>

                    {/* Form grupları buraya gelecek (yukarıdaki kod ile aynı) */}
                     <div className="form-grup">
                        <label htmlFor="unvan">Akademik Unvan:</label>
                        <select id="unvan" name="unvan" value={formData.unvan} onChange={handleChange}>
                            {UNVAN_CHOICES.map(choice => (
                                <option key={choice.value} value={choice.value}>{choice.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-grup">
                        <label htmlFor="temel_alan">Temel Alan:</label>
                        <select id="temel_alan" name="temel_alan" value={formData.temel_alan} onChange={handleChange}>
                            {TEMEL_ALAN_CHOICES.map(choice => (
                                <option key={choice.value} value={choice.value}>{choice.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-grup">
                        <label htmlFor="birim">Birim (Fakülte/Enstitü/YO/MYO): *</label>
                        <input type="text" id="birim" name="birim" value={formData.birim} onChange={handleChange} required />
                    </div>

                    <div className="form-grup">
                        <label htmlFor="kadro_adedi">Kadro Adedi:</label>
                        <input type="number" id="kadro_adedi" name="kadro_adedi" min="1" value={formData.kadro_adedi} onChange={handleChange} />
                    </div>

                     <div className="form-grup">
                        <label htmlFor="son_basvuru_tarihi">Son Başvuru Tarihi: *</label>
                        <input type="date" id="son_basvuru_tarihi" name="son_basvuru_tarihi" value={formData.son_basvuru_tarihi} onChange={handleChange} required />
                    </div>

                    <hr/>
                    <h3>Minimum Kriterler (Yönergeye Göre Giriniz)</h3>

                     <div className="form-grup">
                        <label htmlFor="min_toplam_puan">Asgari Toplam Puan (Tablo 2):</label>
                        <input type="number" id="min_toplam_puan" name="min_toplam_puan" value={formData.min_toplam_puan} onChange={handleChange} placeholder="Örn: 250" />
                    </div>

                    <div className="form-grup">
                        <label htmlFor="min_yay_sayisi">Asgari Toplam Makale Sayısı (Tablo 1):</label>
                        <input type="number" id="min_yay_sayisi" name="min_yay_sayisi" value={formData.min_yay_sayisi} onChange={handleChange} placeholder="Örn: 6" />
                    </div>

                     <div className="form-grup">
                        <label htmlFor="min_baslica_yazar_sayisi">Asgari Başlıca Yazar Sayısı (Tablo 1):</label>
                        <input type="number" id="min_baslica_yazar_sayisi" name="min_baslica_yazar_sayisi" value={formData.min_baslica_yazar_sayisi} onChange={handleChange} placeholder="Örn: 2" />
                    </div>

                     <div className="form-grup">
                        <label htmlFor="gerekli_yayin_kategorileri_aciklama">Gerekli Yayın Kategorileri Açıklaması:</label>
                        <textarea
                            id="gerekli_yayin_kategorileri_aciklama"
                            name="gerekli_yayin_kategorileri_aciklama"
                            value={formData.gerekli_yayin_kategorileri_aciklama}
                            onChange={handleChange}
                            placeholder="Tablo 1'e göre ilanın gerektirdiği yayın türü ve sayılarını açıklayınız. Örn: En az 2 adet A.1-A.4, en az 4 adet A.1-A.6..."
                            rows="3"
                        ></textarea>
                    </div>

                     <div className="form-grup">
                        <label htmlFor="gerekli_tez_danismanligi">Gerekli Tez Danışmanlığı Şartı (Varsa):</label>
                        <input type="text" id="gerekli_tez_danismanligi" name="gerekli_tez_danismanligi" value={formData.gerekli_tez_danismanligi} onChange={handleChange} placeholder="Örn: En az 1 Dr. veya 2 YL" />
                    </div>

                     <div className="form-grup">
                        <label htmlFor="gerekli_proje_gorevi">Gerekli Proje Görevi Şartı (Varsa):</label>
                        <input type="text" id="gerekli_proje_gorevi" name="gerekli_proje_gorevi" value={formData.gerekli_proje_gorevi} onChange={handleChange} placeholder="Örn: En az 1 H.1-H.12 veya 2 H.13-H.17" />
                    </div>

                    <hr/>
                     <h3>Diğer İlan Detayları</h3>

                     <div className="form-grup">
                        <label htmlFor="ilan_metni">İlan Metni / Ek Açıklamalar:</label>
                        <textarea id="ilan_metni" name="ilan_metni" value={formData.ilan_metni} onChange={handleChange} rows="5"></textarea>
                     </div>

                     <div className="form-grup">
                        <label htmlFor="ozel_kosullar">Varsa Diğer Özel Koşullar:</label>
                        <textarea id="ozel_kosullar" name="ozel_kosullar" value={formData.ozel_kosullar} onChange={handleChange} rows="3"></textarea>
                     </div>

                     <div className="form-grup-checkbox">
                           <input type="checkbox" id="aktif" name="aktif" checked={formData.aktif} onChange={handleChange} />
                           <label htmlFor="aktif">İlan Aktif Olarak Yayınlansın</label>
                     </div>

                    {/* Hata ve başarı mesajları */}
                    {hata && <p className="hata-mesaji">{hata}</p>}
                    {mesaj && <p className="basari-mesaji">{mesaj}</p>}

                    {/* Submit butonu */}
                    <button type="submit" className="submit-button">İlan Oluştur</button>
                </form>
            </div>
        </>
    );
}

export default IlanOlusturmaFormu;
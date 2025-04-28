import requests
from xml.etree import ElementTree as ET


def verify_tc_kimlik(tc_kimlik_no, ad, soyad, dogum_yili):
    """
    TC Kimlik numarası doğrulama fonksiyonu

    :param tc_kimlik_no: TC Kimlik numarası (11 haneli)
    :param ad: Kişinin adı (Türkçe karakter içerebilir)
    :param soyad: Kişinin soyadı (Türkçe karakter içerebilir)
    :param dogum_yili: Doğum yılı (YYYY formatında)
    :return: Doğrulama sonucu (True/False)
    """
    # XML SOAP isteği için şablon
    soap_request = """<?xml version="1.0" encoding="utf-8"?>
    <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
      <soap:Body>
        <TCKimlikNoDogrula xmlns="http://tckimlik.nvi.gov.tr/WS">
          <TCKimlikNo>{}</TCKimlikNo>
          <Ad>{}</Ad>
          <Soyad>{}</Soyad>
          <DogumYili>{}</DogumYili>
        </TCKimlikNoDogrula>
      </soap:Body>
    </soap:Envelope>""".format(tc_kimlik_no, ad.upper(), soyad.upper(), dogum_yili)

    # HTTP başlıkları
    headers = {
        "Content-Type": "text/xml; charset=utf-8",
        "SOAPAction": "http://tckimlik.nvi.gov.tr/WS/TCKimlikNoDogrula"
    }

    try:
        # SOAP isteği gönder
        response = requests.post(
            "https://tckimlik.nvi.gov.tr/Service/KPSPublic.asmx",
            data=soap_request.encode('utf-8'),
            headers=headers
        )

        # XML yanıtını ayrıştır
        root = ET.fromstring(response.content)

        # Namespace'i tanımla
        namespace = {'soap': 'http://schemas.xmlsoap.org/soap/envelope/',
                     'xsi': 'http://www.w3.org/2001/XMLSchema-instance',
                     'xsd': 'http://www.w3.org/2001/XMLSchema',
                     'ns': 'http://tckimlik.nvi.gov.tr/WS'}

        # Sonucu al
        result = root.find('.//ns:TCKimlikNoDogrulaResult', namespace)

        if result is not None:
            return result.text.lower() == 'true'
        else:
            print("Sonuç bulunamadı.")
            return False

    except Exception as e:
        print(f"Doğrulama sırasında hata oluştu: {str(e)}")
        return False


# Kullanım örneği
if __name__ == "__main__":
    tc_no = "10916539904"
    ad = "yusuf samet"
    soyad = "özal"
    dogum_yili = "2002"

    result = verify_tc_kimlik(tc_no, ad, soyad, dogum_yili)
    print(result)
    if result:
        print("TC Kimlik numarası doğrulandı.")
    else:
        print("TC Kimlik numarası doğrulanamadı.")
# AI GPR Suite

An enterprise-grade, AI-powered Ground Penetrating Radar (GPR) software suite designed for geophysics, utility mapping, archaeology, infrastructure inspection, cavity detection, and advanced subsurface analysis.

This project delivers a premium, industrial-grade mobile control station interface optimized for touch screen visibility and high-reliability field operations.

---

## 🎨 Tasarım Felsefesi (Design Philosophy)

Arayüz; profesyonel yer kontrol istasyonları, Tesla sadeliği, askeri düzey saha ekipmanları ve modern endüstriyel takip panellerinin harmanlanmasıyla tasarlanmıştır:
- **Yüksek Okunabilirlik:** Açık havada doğrudan güneş ışığında çalışırken bile maksimum görünürlük.
- **Sade ve Odaklanmış Arayüz:** Aşırı neon efektlerden kaçınılmış, kritik verilere ve büyük telemetri göstergelerine öncelik veren modern endüstriyel görünüm.
- **Göz Yormayan Palet:** Uzun süreli saha taramalarında göz yorgunluğunu minimize eden tonlar.

---

## 🚀 Öne Çıkan Özellikler (Key Features)

### 1. Donanım Teşhis Sistemi (Startup Self-Test)
Uygulama her açıldığında donanım birimlerini otomatik olarak test eder:
- Pil Hücreleri
- Puls 10V / 3.3V Jeneratörleri
- Regülatör ve Boost Dönüştürücüler
- Alıcı / Verici Anten Sinyalleri
- GPS Bağımsız RTK Bağlantısı
- Yerel Depolama ve YZ Motoru

### 2. Canlı Tarama Modülü (Live GPR Scan)
- **Gerçek Zamanlı Radargram:** Yeraltı katmanlarını ve cisim yansımalarını simüle eden akan grid ekranı.
- **Canlı Osiloskop Sinyalleri:** Verici puls dalgası, alıcı sinyal genliği ve FFT Spektrum Analiz grafikleri.
- **3D Yeraltı Görselleştirme:** Toprak katmanlarını, boruları ve boşlukları 3 boyutlu izometrik uzayda döndürme ve şeffaflıkla izleme paneli.
- **Akıllı Anomali Tespiti:** Yeraltı cisimleri algılandığında anlık görsel uyarılar, güven skoru ve tahmini derinlik/boyut hesaplamaları.

### 3. Madde Analizi (Material Analysis Mode)
Frekans yanıtı ve sinyal sönümleme karakteristiklerini inceleyerek metal, boşluk, tünel, beton, su vb. yeraltı materyallerini yapay zeka desteğiyle sınıflandırır ve benzerlik oranlarını grafiklendirir.

### 4. Kayıtlar ve Rotalar (Logs & Locations)
- **Liste ve Zaman Tüneli (Timeline):** Geçmiş taramaların detaylı dökümü.
- **Tarama Kapsama Haritası:** GPS RTK rotaları, ısı haritası kapsama alanları ve anomali işaretleyicileri.
- **Raporlama:** Tek tıkla PDF, CSV veya PNG formatında saha raporu dışa aktarma simülasyonu.

### 5. Çok Dilli Yapılandırma (Localization System)
Dil seçimi yapıldığı anda uygulamadaki tüm metinler, raporlar ve yapay zeka analizleri yeniden başlatmaya gerek olmadan anında güncellenir:
- Türkçe (Varsayılan / Default)
- English
- Deutsch
- Français
- Русский
- العربية

---

## 🛠️ Kurulum ve Çalıştırma (Setup & Installation)

1. Proje bağımlılıklarını kurun:
   ```bash
   npm install --legacy-peer-deps
   ```
2. Expo Metro önbelleğini temizleyerek uygulamayı başlatın:
   ```bash
   npx expo start -c
   ```

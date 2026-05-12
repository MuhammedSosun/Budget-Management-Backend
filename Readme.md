## Profile and Sidebar
Bu geliştirmede kullanıcı profil yönetimi ve uygulama navigasyonu iyileştirildi.

Profil sayfasında kullanıcı; profil fotoğrafını güncelleyebilir, ad-soyad bilgilerini düzenleyebilir, e-posta bilgisini görüntüleyebilir ve şifresini değiştirebilir. Kodun daha okunabilir olması için profil sayfası componentlere ayrıldı ve profil işlemleri `useProfile` hook'u üzerinden yönetildi.

Uygulama içerisinde dashboard ve profil gibi ana sayfalara daha kolay erişim sağlamak için sidebar yapısı eklendi. Sidebar sabit yapıda tasarlanarak uzun sayfalarda da erişilebilir kalması hedeflendi.


Arayüzde `react-icons` kullanılarak profil, güvenlik, düzenleme, kaydetme ve fotoğraf güncelleme gibi işlemler görsel olarak desteklendi.

Backend tarafında profil işlemleri için ayrı bir `user` modülü oluşturuldu. Bu modül üzerinden profil bilgisi güncelleme, avatar yükleme ve şifre değiştirme işlemleri yönetildi. Avatar dosyaları veritabanına base64 olarak kaydedilmek yerine S3 uyumlu MinIO storage üzerinde saklandı. Veritabanında yalnızca avatar URL bilgisi tutuldu.


Profil sayfasındaki metinler `i18n` yapısına bağlanarak Türkçe ve İngilizce dil desteği sağlandı.


- Project Overview
- Tech Stack
- Current Features
- Authentication
- Profile & Settings
- Avatar Upload with MinIO/S3
- Dashboard & Transactions
- Planned Features

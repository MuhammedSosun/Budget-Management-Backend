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

# E-posta Doğrulama Süreci

Bu geliştirme kapsamında kullanıcı kayıt olduktan sonra e-posta doğrulama adımı eklendi. Amaç, sisteme kayıt olan kullanıcının e-posta adresine gerçekten erişebildiğini kontrol etmek ve doğrulanmamış kullanıcıların giriş yapmasını engellemektir.

---
## Mailtrap Kullanımı

Geliştirme ve test ortamında e-posta gönderimlerini test etmek için Mailtrap kullanıldı.

Mailtrap burada gerçek kullanıcı inbox’ına mail göndermek için değil, geliştirme ortamında e-posta akışını güvenli şekilde test etmek için kullanılıyor.

Yani şu an gönderilen doğrulama kodları gerçek e-posta adresine gitmez. Kodlar Mailtrap sandbox inbox üzerinden görüntülenir.

Bu tercih sayesinde:

- Gerçek kullanıcılara test e-postası gönderilmez.
- Mail template tasarımı kontrol edilebilir.
- Doğrulama kodu akışı güvenli şekilde test edilir.
- Development ortamında SMTP entegrasyonu denenebilir.

Production ortamında gerçek e-posta gönderimi yapılmak istenirse Mailtrap sandbox yerine gerçek bir mail sağlayıcısının SMTP bilgileri kullanılmalıdır.

Örneğin:

- Mailtrap Email Sending
- SendGrid
- Amazon SES
- Brevo
- Resend
- Gmail SMTP veya kurumsal SMTP

Production’a geçerken `.env` dosyasındaki mail bilgileri gerçek SMTP sağlayıcısına göre değiştirilmelidir.

---

## Kod Süresi

Doğrulama kodlarına geçerlilik süresi eklendi.

Bu sayede kullanıcıya gönderilen kod süresiz olarak kullanılamaz. Kodun süresi dolduğunda backend doğrulama isteğini reddeder.

Bu kontrol güvenlik açısından önemlidir çünkü eski bir doğrulama kodunun sonradan kullanılmasını engeller.

Örnek senaryo:

1. Kullanıcı kayıt olur.
2. Doğrulama kodu oluşturulur.
3. Kod için son geçerlilik zamanı kaydedilir.
4. Kullanıcı süre dolduktan sonra aynı kodu girmeye çalışır.
5. Backend “Doğrulama kodunun süresi doldu.” hatası döner.

---

## Kod Deneme Limiti

Doğrulama kodu için hatalı deneme limiti eklendi.

Kullanıcı çok fazla yanlış kod girerse sistem doğrulama işlemini kısıtlar. Bu yapı özellikle brute-force tarzı tahmin denemelerine karşı temel bir güvenlik önlemidir.

Bu sayede 6 haneli kodun sürekli denenerek bulunması zorlaştırılır.

Örnek senaryo:

1. Kullanıcı yanlış kod girer.
2. Hatalı deneme sayısı artırılır.
3. Belirlenen limit aşılırsa doğrulama işlemi engellenir.
4. Kullanıcıdan yeni kod istemesi beklenir.

---

## Tekrar Kod Gönderme Limiti

Kod tekrar gönderme işlemi için rate limit eklendi.

Kullanıcı çok kısa süre içinde sürekli yeni doğrulama kodu isteyemez. Bu hem sistemi hem de mail gönderim servisini korumak için eklendi.

Bu kontrol sayesinde:

- Gereksiz mail gönderimi engellenir.
- Spam benzeri kullanım azaltılır.
- Mail servis limitlerinin hızlı tüketilmesi önlenir.
- Kullanıcı deneyimi daha kontrollü hale gelir.

---

## Login Kontrolü

Login işlemine e-posta doğrulama kontrolü eklendi.

Kullanıcı kayıt olmuş olsa bile e-posta adresini doğrulamadıysa sisteme giriş yapamaz.

Backend login sırasında kullanıcının `isEmailVerified` değerini kontrol eder. Eğer bu değer `false` ise login işlemi durdurulur.

Bu durumda kullanıcıya önce e-posta adresini doğrulaması gerektiği bildirilir.



############################################## Workspace Modülü ##############################################


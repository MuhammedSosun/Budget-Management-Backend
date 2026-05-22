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



# Workspace Modülü Geliştirmeleri

Bu geliştirme kapsamında proje, kullanıcı bazlı transaction yönetiminden workspace bazlı yapıya taşındı. Amaç, bir kullanıcının birden fazla workspace içinde farklı rollerle çalışabilmesini sağlamak ve transaction yönetimini ekip/workspace mantığına uygun hale getirmektir.

---

## Backend Mimarisi

Backend tarafında mevcut user-based transaction yapısı workspace-based yapıya dönüştürüldü. Önceden transaction kayıtları doğrudan `userId` üzerinden filtrelenirken, artık transaction işlemleri `workspaceId` üzerinden yönetilmektedir.

Kullanıcı rollerini doğrudan `User` modeli içinde tutmak yerine ayrı bir `WorkspaceMember` modeli oluşturuldu. Bunun nedeni, aynı kullanıcının farklı workspace’lerde farklı rollere sahip olabilmesidir. Örneğin bir kullanıcı bir workspace’te `OWNER`, başka bir workspace’te `VIEWER` olabilir.

`WorkspaceMember` modeli temel olarak şu ilişkiyi tutar:

- `userId`
- `workspaceId`
- `role`

Bu yapı sayesinde kullanıcı, workspace ve rol ilişkisi merkezi bir şekilde yönetilebilir hale getirildi.

---

## Rol ve Yetki Kontrolü

API tarafında generic bir `requireWorkspaceRole` middleware’i geliştirildi. Bu middleware, JWT içerisinden gelen `userId` bilgisini ve route parametresinden gelen `workspaceId` bilgisini kullanarak kullanıcının ilgili workspace içerisindeki rolünü kontrol eder.

Eğer kullanıcının rolü route için izin verilen rollerden biriyse işlem devam eder. Aksi durumda kullanıcı yetkisiz kabul edilir.

Bu yapı ile roller merkezi şekilde yönetilmektedir:

- `OWNER`: Workspace yönetimi, üye yönetimi, rol güncelleme ve transaction işlemleri
- `EDITOR`: Transaction ekleme, düzenleme ve silme işlemleri
- `VIEWER`: Sadece görüntüleme işlemleri

Böylece her endpoint içinde tekrar tekrar yetki kontrolü yazmak yerine tek bir middleware üzerinden güvenli ve sürdürülebilir bir yapı kurulmuştur.

---

## Transaction Yapısının Workspace’e Taşınması

Transaction endpointleri workspace bazlı hale getirildi.

Önceki yapı genel olarak kullanıcıya bağlı çalışırken, yeni yapı şu formata taşındı:

Bu yapıda:

workspaceId body’den değil route parametresinden alınır.
createdBy bilgisi client tarafından gönderilmez, JWT içerisindeki kullanıcı bilgisinden alınır.
Transaction kayıtları artık ilgili workspace’e bağlı olarak oluşturulur ve listelenir.

Bu sayede client tarafında workspaceId veya createdBy gibi kritik alanların manipüle edilmesi engellenmiştir.


veritabanı seviyesinde duplicate kayıtları engellemek ve sorgu performansını artırmak için index yapıları kullanıldı:

workspaceId + userId compound index
Pending invitation tekrarını önlemek için partial unique index



Çözüm sırası bence şöyle olmalı
1. Backend error handler düzeltilecek

Çünkü HTML hata response’u diğer tüm frontend hata yönetimini bozuyor.

2. Register/login verification flow düzeltilecek

Auth flow temel olduğu için önce bunu sağlamlaştırmak lazım.

3. Workspace sayfası ayrı modül yapılacak

Settings içinden çıkaracağız.

4. Workspace listeleme + aktif workspace değiştirme ekranı yapılacak

Desktop ve mobile beraber düşünülmeli.

5. Transaction sonrası total/summary refresh bug’ı çözülecek

Yeni kayıt eklenince dashboard güncellenecek.

6. Mobil workspace selector düzeltilecek

Mobil kullanılabilirlik için şart.

7. Layout/padding sistemi toparlanacak

Sayfaların genel gövdesi hizaya girecek.

8. Invitation toast error mapping yapılacak

Daha profesyonel, i18n uyumlu mesajlar gelecek.
Frontend erişim linki
https://github.com/MuhammedSosun/Budget-Management-Frontend

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



## Budget Limit ve Şifremi Unuttum Özellikleri

Bu geliştirme sürecinde projeye iki önemli özellik eklendi:

1. Workspace bazlı bütçe limiti yönetimi
2. Şifremi unuttum / şifre sıfırlama akışı

Bu özellikler hem backend hem frontend tarafında mevcut mimariye uygun şekilde geliştirildi.

---

## 1. Budget Limit Özelliği

Budget Limit özelliği ile kullanıcılar, içinde bulundukları workspace için kategori bazlı aylık bütçe limitleri oluşturabilir.

Örneğin kullanıcı bir workspace içinde:

- Food kategorisi için 5000 TRY
- Transport kategorisi için 2000 TRY
- Shopping kategorisi için 3000 TRY

gibi aylık harcama limitleri tanımlayabilir.

Bu yapı sayesinde kullanıcı, belirli bir ay içinde hangi kategoride ne kadar harcama yaptığını, limitine ne kadar yaklaştığını ve limiti aşıp aşmadığını görebilir.

---

### Backend Tarafında Yapılanlar

Budget Limit için ayrı bir yapı oluşturuldu.

Eklenen temel özellikler:

- Workspace bazlı budget limit oluşturma
- Budget limit listeleme
- Budget limit güncelleme
- Budget limit silme
- Belirli ay için kategori bazlı kullanım hesaplama
- Genel bütçe özeti hesaplama

Budget limit kayıtları workspace ile ilişkilendirildi. Böylece her workspace kendi bütçe limitlerine sahip olabilir.

---

### Budget Limit Model Mantığı

Her bütçe limiti aşağıdaki temel bilgileri içerir:

- workspaceId
- category
- limit amount
- currency
- period
- createdBy

Şu an period alanı monthly olarak kullanılmaktadır. Yani sistem aylık bütçe takibi üzerine kuruludur.

Kategori isimleri normalize edilerek saklanır. Bu sayede aynı kategori için farklı yazım biçimlerinden kaynaklanabilecek tekrarların önüne geçilir.

---

### Budget Usage Hesaplama

Budget Usage tarafında sistem şu mantıkla çalışır:

1. Kullanıcı bir ay seçer.
2. Sistem o ayın başlangıç ve bitiş tarihlerini hesaplar.
3. Workspace içindeki budget limit kategorileri alınır.
4. Transaction kayıtları içinden sadece expense olanlar dikkate alınır.
5. Her kategori için toplam harcama hesaplanır.
6. Limit, harcanan tutar ve kalan tutar karşılaştırılır.
7. Kategoriye göre durum belirlenir.

Kullanılan durumlar:

- SAFE
- WARNING
- EXCEEDED

SAFE, limitin güvenli seviyede olduğunu belirtir.

WARNING, kullanıcının limite yaklaştığını belirtir.

EXCEEDED, limitin aşıldığını belirtir.

---

### Budget Summary

Budget Summary endpoint’i ile seçilen ay için genel bir özet döndürülür.

Bu özet içinde:

- toplam bütçe limiti sayısı
- güvenli kategoriler
- uyarı durumundaki kategoriler
- limiti aşan kategoriler
- toplam limit
- toplam harcama
- toplam kalan bütçe
- genel kullanım yüzdesi

gibi bilgiler yer alır.


---

### Frontend Tarafında Yapılanlar

Frontend tarafında Budget Limit ekranı geliştirildi.

Kullanıcı bu ekranda:

- yeni bütçe limiti oluşturabilir
- mevcut limiti güncelleyebilir
- limiti silebilir
- ay seçebilir
- para birimi seçebilir
- kategori bazlı bütçe kullanımını görebilir

Budget Limit formunda validation kontrolleri eklendi.

Kontrol edilen alanlar:

- kategori boş olamaz
- kategori minimum ve maksimum uzunluk sınırlarına uymalıdır
- tutar boş olamaz
- tutar geçerli bir sayı olmalıdır
- tutar sıfırdan büyük olmalıdır
- tutar maksimum limite takılmamalıdır
- tutar en fazla iki ondalık basamak içermelidir
- para birimi zorunludur

Mobil görünüm için de düzenlemeler yapıldı. Toolbar, filtre alanları, ay seçimi ve currency select alanları küçük ekranlarda daha düzgün görünecek şekilde responsive hale getirildi.

---

## 2. Şifremi Unuttum Özelliği

Şifremi unuttum özelliği ile kullanıcı, hesabının şifresini mail üzerinden güvenli şekilde sıfırlayabilir.

Bu akışta Mailtrap kullanılmıştır. Mailtrap test ortamı olduğu için gönderilen e-postalar gerçek kullanıcı mail kutusuna değil, Mailtrap inbox içerisine düşmektedir.

---

### Şifre Sıfırlama Akışı

Şifre sıfırlama süreci şu şekilde çalışır:

1. Kullanıcı “Şifremi Unuttum” sayfasına gider.
2. Kayıtlı e-posta adresini girer.
3. Backend bu e-posta için kullanıcı olup olmadığını kontrol eder.
4. Güvenlik nedeniyle kullanıcı bulunmasa bile aynı başarılı cevap döndürülür.
5. Kullanıcı varsa random bir reset token oluşturulur.
6. Token veritabanına açık haliyle değil, hashlenmiş haliyle kaydedilir.
7. Token için geçerlilik süresi belirlenir.
8. Kullanıcıya Mailtrap üzerinden reset linki gönderilir.
9. Kullanıcı maildeki linke tıklar.
10. Frontend reset-password sayfasını açar.
11. Kullanıcı yeni şifresini ve şifre tekrarını girer.
12. Backend token kontrolü yapar.
13. Token geçerliyse şifre güncellenir.
14. Reset token temizlenir.
15. Kullanıcının mevcut refresh token bilgisi temizlenir.

---

### Güvenlik İçin Yapılanlar

Şifre sıfırlama sürecinde güvenlik açısından bazı önlemler alındı.

Önlemler:

- Reset token random olarak oluşturuldu.
- Token veritabanında plain text olarak tutulmadı.
- Token SHA-256 ile hashlenerek saklandı.
- Token için süre sınırı eklendi.
- Süresi geçmiş token ile işlem yapılması engellendi.
- Başarılı şifre güncellemesinden sonra reset token temizlendi.
- Şifre güncellendiğinde refresh token null yapıldı.
- Böylece eski oturumların geçerliliği kaldırıldı.
- Kullanıcı bulunmasa bile aynı başarılı cevap döndürülerek email enumeration riski azaltıldı.

---

### Backend Tarafında Yapılanlar

AuthService içine forgotPassword ve resetPassword metotları eklendi.

forgotPassword metodu:

- e-posta adresine göre kullanıcıyı bulur
- kullanıcı yoksa yine başarılı cevap döner
- Google hesabı olup local password olmayan kullanıcılar için reset maili göndermez
- reset token üretir
- token hashini kullanıcı üzerinde saklar
- token süresini belirler
- reset linkini oluşturur
- MailService üzerinden reset maili gönderir

resetPassword metodu:

- gelen tokenı hashler
- veritabanındaki hash ile kullanıcıyı bulur
- token geçersizse hata döner
- token süresi dolmuşsa tokenı temizler ve hata döner
- yeni şifreyi kullanıcıya atar
- passwordResetToken ve passwordResetTokenExpiresAt alanlarını temizler
- refreshToken bilgisini null yapar
- kullanıcıyı kaydeder

User modeline şu alanlar eklendi:

- passwordResetToken
- passwordResetTokenExpiresAt

---

### MailService Tarafında Yapılanlar

MailService içine şifre sıfırlama maili gönderimi için yeni bir metot eklendi.

Eklenen metot:

- sendPasswordResetLink

Bu metot kullanıcıya şifre sıfırlama bağlantısı içeren HTML mail gönderir.

Mail içeriğinde:

- Bütçem marka başlığı
- açıklama metni
- şifre sıfırlama butonu
- buton çalışmazsa kullanılabilecek direkt reset linki
- güvenlik bilgilendirmesi

yer almaktadır.

---

### Frontend Tarafında Yapılanlar

Frontend tarafında iki yeni sayfa oluşturuldu:

- ForgotPassword
- ResetPassword

ForgotPassword sayfasında kullanıcı e-posta adresini girerek reset linki talep eder.

ResetPassword sayfasında kullanıcı yeni şifresini belirler.

ResetPassword formunda iki şifre alanı vardır:

- Yeni Şifre
- Yeni Şifre Tekrar

Bu sayede kullanıcı şifresini yanlış yazma riskine karşı ikinci kez doğrulama yapar.

---

### Frontend Validation

Başlangıçta validation toast mesajları ile yapıldı. Daha sonra daha profesyonel bir UX için input altı hata gösterimi eklendi.

Bu sayede kullanıcı hatayı sadece toast olarak değil, doğrudan ilgili inputun altında da görebilir.

Kontroller:

ForgotPassword için:

- e-posta boş olamaz
- e-posta geçerli formatta olmalıdır

ResetPassword için:

- token bulunmalıdır
- şifre boş olamaz
- şifre minimum 6 karakter olmalıdır
- confirm password boş olamaz
- password ve confirm password aynı olmalıdır

---

### i18n Desteği

ForgotPassword ve ResetPassword sayfalarındaki sabit Türkçe metinler i18n yapısına taşındı.

Böylece sistemin aktif diline göre:

- başlıklar
- açıklamalar
- input label değerleri
- placeholder metinleri
- validation mesajları
- toast mesajları
- button textleri

Türkçe veya İngilizce olarak gösterilebilir.

---

## Error Handling ve Frontend Uyum Süreci

Backend tarafında AppError, ErrorCode ve ErrorMessages yapısı kullanılarak hatalar standart hale getirildi.

Standart hata response yapısı:

```json
{
  "success": false,
  "code": "ERROR_CODE",
  "message": "Error message",
  "statusCode": 400
}


# Notification System

Bu geliştirme kapsamında projeye workspace tabanlı bir bildirim sistemi eklendi.

## Amaç

Kullanıcıların workspace içinde gerçekleşen önemli işlemlerden haberdar olması hedeflendi. Bildirimler hem backend tarafında event-driven bir yapı ile üretiliyor hem de frontend tarafında header bell, dropdown ve bildirim sayfası üzerinden görüntüleniyor.

## Backend Geliştirmeleri

Backend tarafında notification sistemi için aşağıdaki yapılar oluşturuldu:

* `NotificationModel`
* `NotificationRepository`
* `NotificationService`
* `NotificationController`
* `NotificationRoutes`
* `NotificationEventHandlers`
* `NotificationRecipientService`

Bildirimler repository pattern yapısına uygun şekilde geliştirildi.

## Event-Driven Yapı

Notification sistemi doğrudan controller içinde manuel bildirim oluşturmak yerine event mantığıyla çalışacak şekilde tasarlandı.

Örnek akış:

```txt
Transaction oluşturulur
↓
EventBus üzerinden event yayınlanır
↓
Notification event handler olayı yakalar
↓
İlgili workspace üyeleri bulunur
↓
Notification kayıtları oluşturulur
```

Bu yapı observer pattern mantığına uygun şekilde kuruldu.

## Desteklenen Bildirim Türleri

Aşağıdaki olaylar için bildirim üretimi desteklendi:

```txt
BUDGET_LIMIT_CREATED
BUDGET_LIMIT_UPDATED
BUDGET_LIMIT_DELETED
BUDGET_LIMIT_WARNING
BUDGET_LIMIT_EXCEEDED

TRANSACTION_CREATED
TRANSACTION_UPDATED
TRANSACTION_DELETED

WORKSPACE_MEMBER_JOINED
WORKSPACE_MEMBER_REMOVED
WORKSPACE_MEMBER_LEFT
WORKSPACE_MEMBER_ROLE_UPDATED

WORKSPACE_INVITATION_CREATED
WORKSPACE_INVITATION_ACCEPTED
WORKSPACE_INVITATION_REJECTED
```

## Workspace Üyelerine Bildirim Gönderimi

Bildirimler workspace bazlı çalışır. İlgili event oluştuğunda sistem workspace üyelerini bulur ve bildirimi uygun kullanıcılara gönderir.

Bazı işlemlerde bildirimi yapan kullanıcı hariç tutulur. Örneğin:

```txt
Bir kullanıcı transaction eklerse bildirim diğer workspace üyelerine gider.
```

Bazı sistemsel uyarılarda ise kullanıcı dahil tüm workspace üyeleri bilgilendirilir. Örneğin:

```txt
Bütçe limiti aşıldığında tüm workspace üyelerine bildirim gider.
```

## Duplicate Bildirim Önleme

Aynı olay için gereksiz tekrar bildirim oluşmasını engellemek amacıyla `dedupeKey` yapısı eklendi.

Örneğin aynı ay, aynı workspace, aynı kategori için tekrar tekrar bütçe aşımı bildirimi oluşması engellenir.

## Bildirimlerin Saklanması

Bildirimler MongoDB üzerinde saklanır. Her bildirim için `expiresAt` alanı kullanılır ve TTL index ile bildirimlerin belirli süre sonra otomatik silinmesi sağlanır.

Varsayılan saklama süresi:

```txt
90 gün
```

## Çoklu Dil Desteği

Backend tarafında artık statik `title` ve `message` metni tutulmaz.

Bunun yerine bildirimler şu alanlarla kaydedilir:

```txt
titleKey
messageKey
messageParams
```

Frontend tarafında bu key değerleri i18n sistemiyle çevrilir.

Bu sayede kullanıcı dili Türkçe ise bildirim Türkçe, İngilizce ise İngilizce gösterilir.

Örnek:

```json
{
  "titleKey": "notification_message.budget_limit_exceeded.title",
  "messageKey": "notification_message.budget_limit_exceeded.message",
  "messageParams": {
    "category": "food"
  }
}
```

## Frontend Geliştirmeleri

Frontend tarafında aşağıdaki yapılar oluşturuldu:

* `NotificationBell`
* `NotificationDropdown`
* `NotificationItem`
* `NotificationsPage`
* `useNotifications`
* `notification.service.ts`
* `notification.types.ts`

## Header Notification Bell

Header içerisine notification bell eklendi.

Özellikler:

```txt
Okunmamış bildirim sayısı gösterilir.
Tıklanınca son bildirimler dropdown içinde gösterilir.
Bildirim okundu olarak işaretlenebilir.
Tüm bildirimler sayfasına geçiş yapılabilir.
```

## Notifications Page

Bildirimler için ayrı bir sayfa oluşturuldu.

Sayfada:

```txt
Tüm bildirimler listelenir.
Okunmuş / okunmamış filtreleri bulunur.
Pagination desteklenir.
Tümünü okundu yap işlemi yapılabilir.
```

## Header Count Güncellemesi

Bildirim sayfasında bir bildirim okundu yapıldığında header’daki bell count değerinin güncel kalması için frontend tarafında küçük bir notification change event yapısı eklendi.

Bu sayede farklı component’lerde yapılan bildirim değişiklikleri header bell tarafından algılanır.

## Sonuç

Bu geliştirme ile proje içerisinde merkezi, event-driven, workspace tabanlı ve çoklu dil destekli bir notification sistemi kurulmuştur.

export enum ErrorMessages {
    UNAUTHORIZED = "Yetkisiz Erişim",
    INVALID_OR_EXPIRED_TOKEN = "Geçersiz veya süresi dolmuş token.",
    TOKEN_NOT_FOUND = "Token bulunamadı",
    NOT_FOUND = "Bulunamadı",
    FORBIDDEN = "Erişim engellendi",
    USER_NOT_FOUND = "Kullanıcı bulunamadı",
    USER_ALREADY_EXISTS = "Kullanıcı zaten mevcut",
    INVALID_CREDENTIALS = "Kullanıcı adı veya şifre hatalı",
    REFRESH_TOKEN_NOT_FOUND = "Refresh token bulunamadı",
    TRANSACTION_NOT_FOUND = "İşlem bulunamadı",
    TRANSACTION_ALREADY_EXISTS = "İşlem zaten mevcut",
    VALIDATION_ERROR = "Geçersiz veri gönderildi",
    INTERNAL_SERVER_ERROR = "Sunucu hatası oluştu",
    RATE_LIMIT_EXCEEDED = "Çok hızlı işlem yapıyorsunuz, lütfen yavaşlayın."

}
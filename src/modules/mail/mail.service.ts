import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

interface SendVerificationCodeParams {
  to: string;
  firstName?: string;
  code: string;
}
interface SendPasswordResetLinkParams {
  to: string;
  firstName?: string;
  resetLink: string;
}

class MailService {
  private transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  async sendVerificationCode({
    to,
    firstName,
    code,
  }: SendVerificationCodeParams) {
    await this.transporter.sendMail({
      from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_EMAIL}>`,
      to,
      subject: "Bütçem e-posta doğrulama kodu",
      html: this.getVerificationTemplate(firstName || "Merhaba", code),
    });
  }

  async sendPasswordResetLink({
    to,
    firstName,
    resetLink,
  }: SendPasswordResetLinkParams) {
    await this.transporter.sendMail({
      from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_EMAIL}>`,
      to,
      subject: "Bütçem şifre sıfırlama bağlantısı",
      html: this.getPasswordResetTemplate(firstName || "Merhaba", resetLink),
    });
  }

  private getVerificationTemplate(name: string, code: string) {
    return `
      <!doctype html>
      <html lang="tr">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>E-posta Doğrulama</title>
        </head>
        <body style="margin:0; padding:0; background:#0f172a; font-family:Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a; padding:32px 16px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px; background:#1e293b; border-radius:20px; overflow:hidden; border:1px solid #334155;">
                  <tr>
                    <td style="padding:32px;">
                      <h1 style="margin:0 0 12px; color:#34d399; font-size:28px;">
                        Bütçem.
                      </h1>

                      <h2 style="margin:0 0 16px; color:#f8fafc; font-size:24px;">
                        E-posta adresini doğrula
                      </h2>

                      <p style="margin:0 0 24px; color:#cbd5e1; font-size:16px; line-height:1.6;">
                        ${name}, hesabını kullanmaya başlamak için aşağıdaki doğrulama kodunu girmen yeterli.
                      </p>

                      <div style="background:#0f172a; border:1px solid #334155; border-radius:16px; padding:24px; text-align:center; margin-bottom:24px;">
                        <p style="margin:0 0 8px; color:#94a3b8; font-size:14px;">
                          Doğrulama kodun
                        </p>

                        <div style="color:#34d399; font-size:36px; font-weight:800; letter-spacing:8px;">
                          ${code}
                        </div>
                      </div>

                      <p style="margin:0; color:#94a3b8; font-size:14px; line-height:1.6;">
                        Bu kod kısa süre içinde geçerliliğini kaybeder. Eğer bu işlemi sen yapmadıysan bu e-postayı yok sayabilirsin.
                      </p>
                    </td>
                  </tr>
                </table>

                <p style="color:#64748b; font-size:12px; margin-top:16px;">
                  © Bütçem. Budget Management
                </p>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;
  }

  private getPasswordResetTemplate(name: string, resetLink: string) {
    return `
    <!doctype html>
    <html lang="tr">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Şifre Sıfırlama</title>
      </head>
      <body style="margin:0; padding:0; background:#0f172a; font-family:Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a; padding:32px 16px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px; background:#1e293b; border-radius:20px; overflow:hidden; border:1px solid #334155;">
                <tr>
                  <td style="padding:32px;">
                    <h1 style="margin:0 0 12px; color:#34d399; font-size:28px;">
                      Bütçem.
                    </h1>

                    <h2 style="margin:0 0 16px; color:#f8fafc; font-size:24px;">
                      Şifreni sıfırla
                    </h2>

                    <p style="margin:0 0 24px; color:#cbd5e1; font-size:16px; line-height:1.6;">
                      ${name}, hesabın için bir şifre sıfırlama isteği aldık. Yeni şifre oluşturmak için aşağıdaki butona tıklayabilirsin.
                    </p>

                    <div style="text-align:center; margin-bottom:24px;">
                      <a href="${resetLink}" target="_blank" style="display:inline-block; background:#34d399; color:#0f172a; text-decoration:none; padding:14px 24px; border-radius:12px; font-size:16px; font-weight:700;">
                        Şifremi Sıfırla
                      </a>
                    </div>

                    <div style="background:#0f172a; border:1px solid #334155; border-radius:16px; padding:16px; margin-bottom:24px;">
                      <p style="margin:0 0 8px; color:#94a3b8; font-size:14px;">
                        Buton çalışmazsa bu bağlantıyı tarayıcına yapıştır:
                      </p>

                      <p style="margin:0; color:#34d399; font-size:14px; line-height:1.6; word-break:break-all;">
                        ${resetLink}
                      </p>
                    </div>

                    <p style="margin:0 0 12px; color:#94a3b8; font-size:14px; line-height:1.6;">
                      Bu bağlantı kısa süre içinde geçerliliğini kaybeder. Güvenliğin için bağlantıyı kimseyle paylaşma.
                    </p>

                    <p style="margin:0; color:#94a3b8; font-size:14px; line-height:1.6;">
                      Eğer bu işlemi sen yapmadıysan bu e-postayı yok sayabilirsin. Hesabında herhangi bir değişiklik yapılmaz.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="color:#64748b; font-size:12px; margin-top:16px;">
                © Bütçem. Budget Management
              </p>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
  }
}

export const mailService = new MailService();

export const emailVerificationTemplate = (code: string) => {
  return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>E-posta Doğrulama</title>
</head>
<body style="margin:0; padding:0; background-color:#0f172a; font-family:Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#0f172a; padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px; background-color:#1e293b; border-radius:20px; overflow:hidden; border:1px solid #334155;">
          <tr>
            <td style="padding:32px 28px 16px 28px; text-align:center;">
              <h1 style="margin:0; color:#34d399; font-size:32px; font-weight:800;">
                Bütçem.
              </h1>
              <p style="margin:10px 0 0; color:#94a3b8; font-size:15px;">
                E-posta doğrulama kodun hazır.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:16px 28px 8px 28px;">
              <h2 style="margin:0; color:#f8fafc; font-size:26px; line-height:1.3;">
                Hesabını doğrula
              </h2>
              <p style="margin:16px 0 0; color:#cbd5e1; font-size:16px; line-height:1.7;">
                Bütçem hesabını kullanmaya başlamak için aşağıdaki 6 haneli doğrulama kodunu uygulamaya girmen gerekiyor.
              </p>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:28px;">
              <div style="background-color:#0f172a; border:1px solid #334155; border-radius:16px; padding:22px;">
                <p style="margin:0 0 12px; color:#94a3b8; font-size:14px;">
                  Doğrulama Kodun
                </p>
                <div style="letter-spacing:8px; color:#34d399; font-size:34px; font-weight:800;">
                  ${code}
                </div>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:0 28px 28px 28px;">
              <p style="margin:0; color:#94a3b8; font-size:14px; line-height:1.6;">
                Bu kod kısa süre içinde geçerliliğini kaybedebilir. Eğer bu işlemi sen başlatmadıysan bu e-postayı görmezden gelebilirsin.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:20px 28px; background-color:#111827; text-align:center;">
              <p style="margin:0; color:#64748b; font-size:13px;">
                © ${new Date().getFullYear()} Bütçem. Tüm hakları saklıdır.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
};

import nodemailer from "nodemailer";

// Buat transporter Gmail SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Kirim email OTP verifikasi
export async function sendOTPEmail(to: string, name: string, otp: string) {
  await transporter.sendMail({
    from: `"JOTENG" <${process.env.GMAIL_USER}>`,
    to,
    subject: "Kode Verifikasi JOTENG",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0;padding:0;background:#0a0a0a;font-family:'Segoe UI',sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
          <tr>
            <td align="center">
              <table width="480" cellpadding="0" cellspacing="0" style="background:#111;border-radius:16px;overflow:hidden;border:1px solid #222;">
                <tr>
                  <td style="background:linear-gradient(135deg,#6c63ff,#a855f7);padding:32px;text-align:center;">
                    <h1 style="margin:0;color:#fff;font-size:28px;font-weight:800;letter-spacing:2px;">JOTENG</h1>
                    <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">Platform Sosial Media Modern</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:40px 32px;">
                    <p style="color:#aaa;font-size:15px;margin:0 0 8px;">Halo, <strong style="color:#fff;">${name}</strong> 👋</p>
                    <p style="color:#888;font-size:14px;margin:0 0 32px;line-height:1.6;">
                      Gunakan kode verifikasi berikut untuk mengaktifkan akun JOTENG kamu.
                      Kode ini berlaku selama <strong style="color:#a855f7;">5 menit</strong>.
                    </p>
                    <div style="text-align:center;margin:0 0 32px;">
                      <div style="display:inline-block;background:#1a1a2e;border:2px solid #6c63ff;border-radius:12px;padding:20px 40px;">
                        <span style="color:#fff;font-size:40px;font-weight:800;letter-spacing:12px;">${otp}</span>
                      </div>
                    </div>
                    <p style="color:#555;font-size:12px;margin:0;text-align:center;">
                      Jika kamu tidak mendaftar di JOTENG, abaikan email ini.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="background:#0d0d0d;padding:20px 32px;text-align:center;border-top:1px solid #222;">
                    <p style="color:#444;font-size:12px;margin:0;">© ${new Date().getFullYear()} JOTENG. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  });
}

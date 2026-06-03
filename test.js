import dotenv from 'dotenv';
import { Resend } from 'resend';

dotenv.config();
const verificationUrl = `https:www.aynbyhadiyaz.com/verify-email?token=$2b$10$TyMM.WbCLkaQRH4g8pr1GuDBppViza/ph1G4Jt9PMuulhgyMvhd0a`;

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
  try {
    const { data, error } = await resend.emails.send({
      from: "AynByHadiyaz <no-reply@aynbyhadiyaz.com>",
      to: "akshaikhlaq002@gmail.com",
      subject: "Verify Your Email - AynByHadiyaz",
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          
          <h2 style="color:#1a1a1a;">
            Welcome to AynByHadiyaz, Aksha 👋
          </h2>

          <p>Please verify your email by clicking the button below:</p>

          <div style="text-align:center; margin:30px 0;">
            <a href="${verificationUrl}"
               style="background:#000;color:#fff;padding:12px 25px;
               text-decoration:none;border-radius:6px;display:inline-block;">
              Verify Email
            </a>
          </div>

          <p>Or copy this link:</p>
          <p style="color:#666;word-break:break-all;">
            ${verificationUrl}
          </p>

          <p style="color:#999;font-size:12px;margin-top:30px;">
            This link expires in 24 hours.
          </p>

        </div>
      `
    });

    console.log("DATA:", data);
    console.log("ERROR:", error);

  } catch (err) {
    console.error(err);
  }
}





testEmail();
import crypto from 'crypto';
import { Resend } from 'resend';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Generate token
export const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};



// ========================
// VERIFY EMAIL
// ========================
export const sendVerificationEmail = async (email, name, token) => {
  try {

    const baseUrl = process.env.BASE_URL;
    const verificationUrl = `${baseUrl}/verify-email?token=${token}`;

    const { data, error } = await resend.emails.send({
      from: 'AynByHadiyaz <no-reply@aynbyhadiyaz.com>',
      to: email,
      subject: 'Verify Your Email - AynByHadiyaz',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          
          <h2 style="color:#1a1a1a;">
            Welcome to AynByHadiyaz, ${name} 👋
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

    if (error) {
      console.error('Resend Error (verification):', error);
      return false;
    }

    console.log('Verification email sent:', data?.id);
    return true;

  } catch (err) {
    console.error('Email exception (verification):', err);
    return false;
  }
};



// ========================
// PASSWORD RESET EMAIL
// ========================
export const sendPasswordResetEmail = async (email, name, token) => {
  try {

    const baseUrl = process.env.BASE_URL;
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    const { data, error } = await resend.emails.send({
      from: 'AynByHadiyaz <no-reply@aynbyhadiyaz.com>',
      to: email,
      subject: 'Reset Your Password - AynByHadiyaz',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">

          <h2>Password Reset Request</h2>

          <p>Hi ${name},</p>

          <p>We received a request to reset your password.</p>

          <div style="text-align:center; margin:30px 0;">
            <a href="${resetUrl}"
               style="background:#000;color:#fff;padding:12px 25px;
               text-decoration:none;border-radius:6px;display:inline-block;">
              Reset Password
            </a>
          </div>

          <p>Or copy this link:</p>
          <p style="color:#666;word-break:break-all;">
            ${resetUrl}
          </p>

          <p style="color:#999;font-size:12px;margin-top:30px;">
            This link expires in 1 hour.
          </p>

        </div>
      `
    });

    if (error) {
      console.error('Resend Error (reset):', error);
      return false;
    }

    console.log('Reset email sent:', data?.id);
    return true;

  } catch (err) {
    console.error('Email exception (reset):', err);
    return false;
  }
};
import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Generate token
export const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// FIXED: Use BASE_URL from environment
export const sendVerificationEmail = async (email, name, token) => {
  const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
  const verificationUrl = `${baseUrl}/verify-email?token=${token}`;
  console.log('📧 Verification URL:', verificationUrl);
  const mailOptions = {
    from: `"aynByHadiyaz" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify Your Email - aynByHadiyaz',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">
          Welcome to aynByHadiyaz, ${name}!
        </h2>
        <p>
          Thank you for registering. Please verify your email address by clicking the button below:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="
               background: #1a1a1a;
               color: white;
               padding: 12px 30px;
               text-decoration: none;
               border-radius: 5px;
               display: inline-block;
             ">
            Verify Email
          </a>
        </div>
        <p>
          Or copy and paste this link in your browser:
        </p>
        <p style="color: #666; word-break: break-all;">
          ${verificationUrl}
        </p>

        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          This link will expire in 24 hours.
          If you didn't create an account, please ignore this email.
        </p>

      </div>
    `
  };

  try {

    await transporter.sendMail(mailOptions);

    console.log('✅ Verification email sent to:', email);

    return true;

  } catch (err) {

    console.error('❌ Email send error:', err);

    return false;
  }
};

// FIXED: Password reset email
export const sendPasswordResetEmail = async (email, name, token) => {
  const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  const mailOptions = {
    from: `"aynByHadiyaz" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Reset Your Password - aynByHadiyaz',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">Password Reset Request</h2>
        <p>Hi ${name},</p>
        <p>We received a request to reset your password. Click the button below to reset it:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background: #1a1a1a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>Or copy and paste this link in your browser:</p>
        <p style="color: #666; word-break: break-all;">${resetUrl}</p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          This link will expire in 1 hour. If you didn't request this, please ignore this email.
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent to:', email);
    console.log('📧 Reset URL:', resetUrl);
    return true;
  } catch (err) {
    console.error('❌ Email send error:', err);
    return false;
  }
};
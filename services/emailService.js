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

// Send password reset email
export const sendPasswordResetEmail = async (email, name, token) => {
  const resetUrl = `${process.env.BASE_URL}/reset-password?token=${token}`;

  const mailOptions = {
    from: `"Velmora" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Reset Your Password - Velmora',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">Password Reset Request</h2>
        <p>Hi ${name},</p>
        <p>Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background: #1a1a1a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>Or copy this link: ${resetUrl}</p>
        <p style="color: #999; font-size: 12px;">
          This link expires in 1 hour. If you didn't request this, ignore this email.
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (err) {
    console.error('Email send error:', err);
    return false;
  }
};

// Send verification email
export const sendVerificationEmail = async (email, name, token) => {
  const verificationUrl = `${process.env.BASE_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: `"Velmora" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify Your Email - Velmora',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">Welcome to Velmora, ${name}!</h2>
        <p>Please verify your email address:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background: #1a1a1a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email
          </a>
        </div>
        <p>Or copy this link: ${verificationUrl}</p>
        <p style="color: #999; font-size: 12px;">
          This link expires in 24 hours.
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (err) {
    console.error('Email send error:', err);
    return false;
  }
};
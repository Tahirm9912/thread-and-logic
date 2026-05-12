import bcrypt from "bcrypt";
import { createUser, findUserByEmail } from "../models/userModel.js";
import { createToken } from "../utils/jwt.js";
import { generateToken, sendPasswordResetEmail, sendVerificationEmail } from "../services/emailService.js";
import pool from "../config/db.js"


// REGISTER USER WITH EMAIL VERIFICATION
export const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      tel,
      password,
      address,
      postal_code,
      allow_promotions,
      returnUrl
    } = req.body;

    // Existing validations...
    if (!name || !email || !password || !address || !postal_code || !tel) {
      return res.status(400).render("layouts/signup", {
        error: "Please fill in all required fields",
        returnUrl: returnUrl || '/'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).render("layouts/signup", {
        error: "Invalid email format",
        returnUrl: returnUrl || '/'
      });
    }

    if (password.length < 8) {
      return res.status(400).render("layouts/signup", {
        error: "Password must be at least 8 characters",
        returnUrl: returnUrl || '/'
      });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).render("layouts/signup", {
        error: "An account with this email already exists",
        returnUrl: returnUrl || '/'
      });
    }

    const promotions = allow_promotions === "on";
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification token
    const verificationToken = generateToken();
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user with verification token
    const user = await pool.query(
      `INSERT INTO users 
      (name, email, password, address, postal_code, allow_promotions, tel, 
       email_verified, verification_token, verification_token_expires)
      VALUES ($1, $2, $3, $4, $5, $6, $7, false, $8, $9)
      RETURNING userid, name, email, is_admin`,
      [name, email, hashedPassword, address, postal_code, promotions, tel, 
       verificationToken, tokenExpiry]
    );

    // Send verification email
    await sendVerificationEmail(email, name, verificationToken);

    // Auto-login after registration (even though not verified)
    const token = createToken({
      userid: user.rows[0].userid,
      name: user.rows[0].name,
      email: user.rows[0].email,
      is_admin: user.rows[0].is_admin || false
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000
    });

    // Redirect with message to check email
    const finalUrl = returnUrl && returnUrl !== '/' && returnUrl !== '/login' && returnUrl !== '/signup' 
      ? decodeURIComponent(returnUrl) 
      : '/';
    
    return res.redirect(finalUrl + '?verified=pending');

  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).render("layouts/signup", {
      error: "Server error occurred. Please try again.",
      returnUrl: req.body.returnUrl || '/'
    });
  }
};


export const loginUser = async (req, res) => {
  try {
    const { email, password, returnUrl } = req.body;

    console.log('=== LOGIN DEBUG ===');
    console.log('Email:', email);
    console.log('ReturnUrl from body:', returnUrl);

    if (!email || !password) {
      return res.render("layouts/login", {
        error: "Please enter email and password",
        returnUrl: returnUrl || '/'
      });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.render("layouts/login", {
        error: "Invalid email or password",
        returnUrl: returnUrl || '/'
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.render("layouts/login", {
        error: "Invalid email or password",
        returnUrl: returnUrl || '/'
      });
    }

    const token = createToken({
      userid: user.userid,
      name: user.name,
      email: user.email,
      is_admin: user.is_admin || false
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000
    });

    // FIXED: Properly decode and redirect
    let redirectTo = '/';
    
    if (returnUrl && returnUrl.trim() !== '' && returnUrl !== '/' && returnUrl !== '/login' && returnUrl !== '/signup') {
      try {
        redirectTo = decodeURIComponent(returnUrl);
        // Security: Make sure it's a relative URL
        if (!redirectTo.startsWith('/')) {
          redirectTo = '/';
        }
      } catch (e) {
        console.error('Invalid returnUrl:', returnUrl, e);
        redirectTo = '/';
      }
    }

    console.log('Redirecting to:', redirectTo);
    console.log('===================');
    
    return res.redirect(redirectTo);

  } catch (err) {
    console.error("Login error:", err);
    return res.render("layouts/login", {
      error: "Server error. Please try again.",
      returnUrl: req.body.returnUrl || '/'
    });
  }
};

// VERIFY EMAIL
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.render("layouts/error", {
        message: "Invalid verification link"
      });
    }

    const user = await pool.query(
      `SELECT * FROM users 
       WHERE verification_token = $1 
       AND verification_token_expires > NOW()`,
      [token]
    );

    if (user.rows.length === 0) {
      return res.render("layouts/error", {
        message: "Verification link is invalid or expired"
      });
    }

    await pool.query(
      `UPDATE users 
       SET email_verified = true, 
           verification_token = NULL, 
           verification_token_expires = NULL
       WHERE userid = $1`,
      [user.rows[0].userid]
    );

    return res.render("layouts/success", {
      message: "Email verified successfully!",
      redirectUrl: '/',
      redirectText: 'Go to Home'
    });

  } catch (err) {
    console.error("Verify email error:", err);
    return res.render("layouts/error", {
      message: "Could not verify email"
    });
  }
};

// FORGOT PASSWORD
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    console.log('Forgot password request for:', email);

    const user = await findUserByEmail(email);

    // Always show success (security)
    if (!user) {
      return res.render("layouts/forgot-password", {
        success: "If an account exists, we've sent a reset link to your email."
      });
    }

    const resetToken = generateToken();
    const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await pool.query(
      `UPDATE users 
       SET reset_token = $1, reset_token_expires = $2 
       WHERE userid = $3`,
      [resetToken, tokenExpiry, user.userid]
    );

    const emailSent = await sendPasswordResetEmail(email, user.name, resetToken);
    
    console.log('Reset email sent:', emailSent);

    return res.render("layouts/forgot-password", {
      success: "If an account exists, we've sent a reset link to your email."
    });

  } catch (err) {
    console.error("Forgot password error:", err);
    return res.render("layouts/forgot-password", {
      error: "Server error. Please try again."
    });
  }
};

// RESET PASSWORD
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    console.log('Reset password request with token:', token);

    if (!token || !password) {
      return res.render("layouts/reset-password", {
        error: "Missing required fields",
        token: token
      });
    }

    if (password.length < 8) {
      return res.render("layouts/reset-password", {
        error: "Password must be at least 8 characters",
        token: token
      });
    }

    const user = await pool.query(
      `SELECT * FROM users 
       WHERE reset_token = $1 
       AND reset_token_expires > NOW()`,
      [token]
    );

    if (user.rows.length === 0) {
      return res.render("layouts/error", {
        message: "Password reset link is invalid or expired"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `UPDATE users 
       SET password = $1, 
           reset_token = NULL, 
           reset_token_expires = NULL
       WHERE userid = $2`,
      [hashedPassword, user.rows[0].userid]
    );

    return res.render("layouts/success", {
      message: "Password reset successful! You can now login.",
      redirectUrl: '/login',
      redirectText: 'Go to Login'
    });

  } catch (err) {
    console.error("Reset password error:", err);
    return res.render("layouts/error", {
      message: "Could not reset password"
    });
  }
};

import bcrypt from "bcrypt";
import { createUser, findUserByEmail } from "../models/userModel.js";
import { createToken } from "../utils/jwt.js";

// ==========================
// 🟢 REGISTER USER
// ==========================
export const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      tel,
      password,
      address,
      postal_code,
      allow_promotions
    } = req.body;

    // Required fields
    if (!name || !email || !password || !address || !postal_code || !tel) {
      return res.status(400).render("layouts/signup", {
        error: "Please fill in all required fields"
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).render("layouts/signup", {
        error: "Invalid email format"
      });
    }

    // Password validation
    if (password.length < 8) {
      return res.status(400).render("layouts/signup", {
        error: "Password must be at least 8 characters"
      });
    }

    // Postal code validation
    if (postal_code.length < 4 || postal_code.length > 10) {
      return res.status(400).render("layouts/signup", {
        error: "Invalid Postal Code"
      });
    }

    // Phone validation
    const telRegex = /^[0-9]{10,15}$/;
    if (!telRegex.test(tel.replace(/[\s-]/g, ''))) {
      return res.status(400).render("layouts/signup", {
        error: "Invalid phone number"
      });
    }

    // Check existing user
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).render("layouts/signup", {
        error: "An account with this email already exists"
      });
    }

    // Promotions checkbox
    const promotions = allow_promotions === "on";

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in DB
    const user = await createUser(
      name,
      email,
      hashedPassword,
      address,
      postal_code,
      promotions,
      tel
    );

    // 🔥 FIX: Include is_admin in token
    const token = createToken({
      userid: user.userid,
      name: user.name,
      email: user.email,
      is_admin: user.is_admin || false
    });

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000
    });

    return res.redirect("/");

  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).render("layouts/signup", {
      error: "Server error occurred. Please try again."
    });
  }
};


// ==========================
// 🔵 LOGIN USER
// ==========================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Required fields
    if (!email || !password) {
      return res.render("layouts/login", {
        error: "Please enter email and password"
      });
    }

    // Find user
    const user = await findUserByEmail(email);
    if (!user) {
      return res.render("layouts/login", {
        error: "Invalid email or password"
      });
    }

    // Compare password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.render("layouts/login", {
        error: "Invalid email or password"
      });
    }

    // 🔥 FIX: Include is_admin in token
    const token = createToken({
      userid: user.userid,
      name: user.name,
      email: user.email,
      is_admin: user.is_admin || false
    });

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000
    });

    return res.redirect("/");

  } catch (err) {
    console.error("Login error:", err);
    return res.render("layouts/login", {
      error: "Server error. Please try again."
    });
  }
};
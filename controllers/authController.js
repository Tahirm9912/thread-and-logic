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

    // 🔴 Required fields
    if (!name || !email || !password || !address || !postal_code || !tel) {
      return res.status(400).render("layouts/signup", {
        error: "Fill each detail"
      });
    }

    // 🔴 Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).render("layouts/signup", {
        error: "Invalid email format"
      });
    }

    // 🔴 Password validation
    if (password.length < 8) {
      return res.status(400).render("layouts/signup", {
        error: "Password must be at least 8 characters"
      });
    }

    // 🔴 Postal code validation
    if (postal_code.length < 4 || postal_code.length > 10) {
      return res.status(400).render("layouts/signup", {
        error: "Invalid Postal Code"
      });
    }

    // 🟡 Promotions checkbox
    const promotions = allow_promotions === "on";

    // 🟢 Hash password
    const existingUser = await findUserByEmail(email);
    
    if (existingUser) {
      console.log("Existing users while registrering")
      return res.status(400).render("layouts/signup", {
        error: "Email already exists"
      });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🟢 Create user in DB
    const user = await createUser(
      name,
      email,
      hashedPassword,
      address,
      postal_code,
      promotions,
      tel
    );

    // 🟢 Create JWT token
    const token = createToken({
      userid: user.userid,
      name: user.name
    });

    // 🟢 Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000
    });

    return res.redirect("/");

  } catch (err) {
    console.error(err);
    return res.status(500).render("layouts/signup", {
      error: "Server Error Occurred. Please Try Again"
    });
  }
};


// ==========================
// 🔵 LOGIN USER
// ==========================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.body)
    console.log("loginUser Triggered");
    console.log(email)
    console.log(password)

    // 🔴 Find user
    const user = await findUserByEmail(email);

    if (!user) {
      console.log("user not found")
      return res.render("layouts/login", {
        error: "Invalid credentials"
      });
    }

    // 🔴 Compare password
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      console.log("Password mismatched")
      return res.render("layouts/login", {
        error: "Invalid credentials"
      });
    }

    // 🟢 Create token (FIXED)
    const token = createToken({
      userid: user.userid,
      name: user.name
    });

    // 🟢 Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000
    });

    console.log("Logged in successfully");

    return res.redirect("/");

  } catch (err) {
    console.error(err);
    return res.render("layouts/login", {
      error: "Server Error. Please try again."
    });
  }
};
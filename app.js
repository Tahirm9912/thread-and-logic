import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/authRoutes.js";
import pageRoutes from "./routes/pageRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";

import { authMiddleware } from "./middleware/authMiddleware.js";
import { cartMiddleware } from "./middleware/cartMiddleware.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 📦 core middlewares
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 🔐 auth must run BEFORE anything else
  
  
  
  
  app.use(authMiddleware);
  app.use(cartMiddleware);
  
  
  
  // 🌍 make user available in all EJS pages
  app.use((req, res, next) => {
    res.locals.user = req.user || null;
  next();
});

// 🧭 routes (AFTER middleware)
app.use("/api/auth", authRoutes);
app.use("/", pageRoutes);
app.use("/cart", cartRoutes);

// 🎨 view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

export default app;
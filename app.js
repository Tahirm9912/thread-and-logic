import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/authRoutes.js";
import pageRoutes from "./routes/pageRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { logTraffic } from "./middleware/logTraffic.js";
import sitemapRoutes from "./routes/sitemapRoutes.js"

import { authMiddleware } from "./middleware/authMiddleware.js";
import { attachCart } from "./middleware/cartData.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 🎨 view engine (MUST be before routes)
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// 📦 core middlewares
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 🔐 auth middleware (runs on every request)
app.use(authMiddleware);
app.use(logTraffic)

// 🛒 cart data (runs on every request, after auth)
app.use(attachCart);

// 🌍 make user available in ALL EJS views (CRITICAL FIX)
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  res.locals.items = res.locals.items || [];
  res.locals.cartCount = res.locals.cartCount || 0;
  next();
});

// 🧭 routes
app.use("/api/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/cart", cartRoutes);
app.use("/order", orderRoutes);

app.use("/", pageRoutes);

app.use("/", sitemapRoutes)




app.use((req, res) => {
  res.status(404).render("layouts/404", { message: "Page not found" });
});

// 🔥 global error handler (must have 4 args)
app.use((err, req, res, next) => {
  console.error("Global Error:", err.stack);
  res.status(500).render("layouts/error", { 
    message: "Something went wrong. Please try again.",
    user: req.user || null,
    items: res.locals.items || [],
    cartCount: res.locals.cartCount || 0
  });
});

export default app;
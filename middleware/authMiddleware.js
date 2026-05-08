import jwt from "jsonwebtoken";

// ==========================
// 🟢 AUTH MIDDLEWARE (runs on every request)
// ==========================
export const authMiddleware = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    // token invalid or expired
    req.user = null;
    res.clearCookie("token");
    next();
  }
};


// ==========================
// 🔒 REQUIRE AUTH (for protected routes)
// ==========================
export const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.redirect("/login");
  }
  next();
};


// ==========================
// 🔒 REQUIRE ADMIN (for admin routes)
// ==========================
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.redirect("/login");
  }

  // check if user is admin (you need to add is_admin column to users table)
  if (!req.user.is_admin) {
    return res.status(403).render("layouts/error", {
      message: "Access denied. Admin only."
    });
  }

  next();
};
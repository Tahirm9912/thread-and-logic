import jwt from "jsonwebtoken";

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
    req.user = null;
    res.clearCookie("token");
    next();
  }
};

// UPDATED: Store return URL before redirecting to login
export const requireAuth = (req, res, next) => {
  if (!req.user) {
    // Store the original URL they were trying to access
    const returnUrl = req.originalUrl;
    return res.redirect(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
  }
  next();
};

export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.redirect("/login");
  }

  if (!req.user.is_admin) {
    return res.status(403).render("layouts/error", {
      message: "Access denied. Admin only."
    });
  }

  next();
};
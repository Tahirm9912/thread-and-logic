import jwt from "jsonwebtoken";

export const protectPage = (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      // Store the original URL
      const returnUrl = req.originalUrl;
      return res.redirect(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();

  } catch (err) {
    res.clearCookie("token");
    const returnUrl = req.originalUrl;
    return res.redirect(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
  }
};
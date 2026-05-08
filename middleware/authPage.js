import jwt from "jsonwebtoken";

export const protectPage = (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.redirect("/login");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();

  } catch (err) {
    res.clearCookie("token");
    return res.redirect("/login");
  }
};
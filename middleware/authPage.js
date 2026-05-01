import jwt from "jsonwebtoken";






export const protectPage = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    req.user = null;
    return res.redirect("/login");
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    res.locals.user = req.user; 
    next();
  } catch {
    return res.redirect("/login");
  }
};
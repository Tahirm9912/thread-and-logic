import express from "express";
import { protectPage } from "../middleware/authPage.js";
import ejs from "ejs"

const router = express.Router();

// public pages
router.get("/", (req, res) => res.render("layouts/home"));
router.get("/login", (req, res) => res.render("layouts/login", {
  error: null
}));
router.get("/signup", (req, res) => res.render("layouts/signup", {
  error: null
}));
router.get("/list", (req, res)=>{res.render("layouts/list")})
router.get("/product", (req, res)=>{res.render("layouts/product")})

router.get("/logout", (req, res)=>{
  res.clearCookie("token");
  return res.redirect("/")
})


// protected pages
router.get("/account", protectPage, (req, res) => {
  res.render("layouts/account", {user: req.user});
});

router.get("/checkout", protectPage, (req, res) => {
  res.render("layouts/checkout");
});

router.get("/payout", protectPage, (req, res) => {
  res.render("layouts/payout");
});

router.get("/admin", protectPage, (req, res) => {
  res.render("layouts/admin");
});



export default router;
import express from "express";
import { protectPage } from "../middleware/authPage.js";

import { showProduct, showProducts } from "../controllers/productController.js";
import { getCheckoutPage } from "../controllers/cartController.js";
import { getAccountPage } from "../controllers/orderController.js";
import { updateUser } from "../controllers/userController.js";

const router = express.Router();


// ==========================
// 🟢 PUBLIC PAGES
// ==========================

router.get("/", (req, res) => {
  res.render("layouts/home");
});

router.get("/login", (req, res) => {
  res.render("layouts/login", { error: null });
});

router.get("/signup", (req, res) => {
  res.render("layouts/signup", { error: null });
});


// ==========================
// 🟢 PRODUCT PAGES
// ==========================

router.get("/list", showProducts);

router.get("/product/:id", showProduct);


// ==========================
// 🔒 PROTECTED PAGES
// ==========================
router.get("/account", protectPage, getAccountPage);



router.get("/checkout", protectPage, getCheckoutPage);

router.get("/payout", protectPage, (req, res) => {
  res.render("layouts/payout");
});

router.get("/admin", protectPage, (req, res) => {
  res.render("layouts/admin");
});
router.post("/user/update", protectPage, updateUser);



// ==========================
// 🚪 LOGOUT
// ==========================

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  return res.redirect("/");
});


export default router;
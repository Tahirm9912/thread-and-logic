import express from "express";
import { addToCart, getCartItems, updateCartItem, removeCartItem } from "../controllers/cartController.js";
import { protectPage } from "../middleware/authPage.js";
import { createOrder, confirmOrder } from "../controllers/orderControlller.js";

const router = express.Router();

router.post("/add", protectPage, addToCart);
router.get("/", protectPage, getCartItems);
router.post("/update", protectPage, updateCartItem);
router.post("/remove", protectPage, removeCartItem);
// router.post("/checkout/select", protectPage, saveSelectedItems);
router.post("/order/create", protectPage, createOrder);
router.post("/order/confirm", protectPage, confirmOrder);

export default router;
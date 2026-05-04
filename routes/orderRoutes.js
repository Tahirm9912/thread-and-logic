import express from "express";
import { createOrder, confirmOrder } from "../controllers/orderControlller.js";
import { protectPage } from "../middleware/authPage.js";

const router = express.Router();

router.post("/create", protectPage, createOrder);
router.post("/order/confirm", protectPage, confirmOrder);

export default router;
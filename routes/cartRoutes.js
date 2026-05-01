import express from "express";
import { addToCart } from "../controllers/cartController.js";
import { protectPage } from "../middleware/authPage.js";

const router = express.Router();

router.post("/add", protectPage, addToCart);

export default router;
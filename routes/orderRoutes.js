import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { createOrder, confirmOrder } from "../controllers/orderController.js";

const router = express.Router();

// all order routes require authentication
router.use(requireAuth);

router.post("/create", createOrder);
router.post("/confirm", confirmOrder);

export default router;
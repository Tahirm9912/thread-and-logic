import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { 
  addToCart, 
  getCartItems, 
  updateCartItem, 
  removeCartItem,
  clearCart 
} from "../controllers/cartController.js";

const router = express.Router();

// all cart routes require authentication
router.use(requireAuth);

router.post("/add", addToCart);
router.get("/", getCartItems);
router.post("/update", updateCartItem);
router.post("/remove", removeCartItem);
router.post("/clear", clearCart);

export default router;
import express from "express";
import { requireAdmin } from "../middleware/authMiddleware.js";
import {
  getAdminDashboard,
  getAdminProducts,
  deleteProductController,
  getAdminUsers,
  getAdminOrders,
  getOrderDetail,
  updateOrderStatus
} from "../controllers/adminController.js";
import { addProductController } from "../controllers/productController.js";
import { getSettingsPage, updateSettings } from "../controllers/settingsController.js";
import { 
  getAllMessages, 
  updateMessageStatus, 
  deleteMessage 
} from "../controllers/contactController.js";


const router = express.Router();

router.use(requireAdmin);

router.get("/", getAdminDashboard);

router.get("/products", getAdminProducts);
router.get("/products/add", (req, res) => {
  res.render("layouts/admin/add-product");
});
router.post("/products/add", addProductController);
router.delete("/products/:id", deleteProductController);

router.get("/users", getAdminUsers);

router.get("/orders", getAdminOrders);
router.get("/orders/:id", getOrderDetail); // NEW
router.post("/orders/update-status", updateOrderStatus);

router.get("/settings", getSettingsPage);
router.post("/settings/update", updateSettings);
// Add these routes
router.get("/messages", getAllMessages);
router.post("/messages/update-status", updateMessageStatus);
router.delete("/messages/:id", deleteMessage);

export default router;
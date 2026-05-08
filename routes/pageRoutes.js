import express from "express";
import pool from "../config/db.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { showProduct, showProducts } from "../controllers/productController.js";
import { getCheckoutPage } from "../controllers/cartController.js";
import { getAccountPage } from "../controllers/orderController.js";
import { getPayoutPage } from "../controllers/payoutController.js";
import { updateUser } from "../controllers/userController.js";
import { submitContactForm } from "../controllers/contactController.js";

const router = express.Router();

// ==========================
// 🟢 API ENDPOINTS (MUST BE FIRST)
// ==========================

router.get("/api/trending-products", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.productid,
        p.name,
        p.price,
        pv.variant_id,
        pi.image_url
      FROM products p
      JOIN LATERAL (
        SELECT variant_id 
        FROM product_variants 
        WHERE product_id = p.productid 
        LIMIT 1
      ) pv ON true
      LEFT JOIN product_images pi 
        ON pi.product_id = p.productid AND pi.is_primary = true
      WHERE p.is_active = true AND p.is_trending = true
      ORDER BY p.created_at DESC
      LIMIT 6
    `);

    res.json({ products: result.rows });
  } catch (err) {
    console.error(err);
    res.json({ products: [] });
  }
});

// ==========================
// 🟢 PUBLIC PAGES
// ==========================

router.get("/", async (req, res) => {
  try {
    const settings = await pool.query(
      "SELECT * FROM site_settings WHERE setting_key LIKE 'carousel_%' OR setting_key LIKE 'popup_%'"
    );

    const settingsMap = {};
    settings.rows.forEach(s => {
      settingsMap[s.setting_key] = s.setting_value;
    });

    res.render("layouts/home", {
      carousel_images: [
        settingsMap.carousel_1 || '/images/a.webp',
        settingsMap.carousel_2 || '/images/image 2.jpg',
        settingsMap.carousel_3 || '/images/image 1.jpg',
        settingsMap.carousel_4 || '/images/b.webp',
        settingsMap.carousel_5 || '/images/image 5.webp'
      ],
      popup_image: settingsMap.popup_image || '/images/a.webp',
      popup_enabled: settingsMap.popup_enabled === 'true'
    });
  } catch (err) {
    console.error("Home page error:", err);
    res.render("layouts/home", {
      carousel_images: ['/images/a.webp', '/images/image 2.jpg', '/images/image 1.jpg', '/images/b.webp', '/images/image 5.webp'],
      popup_image: '/images/a.webp',
      popup_enabled: true
    });
  }
});

router.get("/login", (req, res) => {
  if (req.user) {
    return res.redirect("/");
  }
  res.render("layouts/login", { error: null });
});

router.get("/signup", (req, res) => {
  if (req.user) {
    return res.redirect("/");
  }
  res.render("layouts/signup", { error: null });
});

router.get("/contact", (req, res) => {
  res.render("layouts/contact");
});

// ==========================
// 🟢 PRODUCT PAGES
// ==========================

router.get("/list", showProducts);
router.get("/product/:id", showProduct);

// ==========================
// 🔒 PROTECTED PAGES
// ==========================

router.get("/account", requireAuth, getAccountPage);
router.get("/checkout", requireAuth, getCheckoutPage);
router.get("/payout", requireAuth, getPayoutPage);

router.post("/user/update", requireAuth, updateUser);

//Cart Count Controller
// Add this with other API routes
router.get("/api/cart-count", requireAuth, async (req, res) => {
  try {
    const userId = req.user.userid;

    const cart = await pool.query(
      "SELECT id FROM cart WHERE user_id = $1",
      [userId]
    );

    if (cart.rows.length === 0) {
      return res.json({ count: 0 });
    }

    const count = await pool.query(
      "SELECT SUM(quantity) as total FROM cart_items WHERE cart_id = $1",
      [cart.rows[0].id]
    );

    res.json({ count: parseInt(count.rows[0].total) || 0 });

  } catch (err) {
    console.error(err);
    res.json({ count: 0 });
  }
});



// Add this with other API routes
router.get("/api/cart-items", requireAuth, async (req, res) => {
  try {
    const userId = req.user.userid;

    const cart = await pool.query(
      "SELECT id FROM cart WHERE user_id = $1",
      [userId]
    );

    if (cart.rows.length === 0) {
      return res.json({ items: [] });
    }

    const items = await pool.query(`
      SELECT 
        ci.id,
        ci.quantity,
        p.productid,
        p.name,
        p.price,
        pv.size,
        pv.color,
        pi.image_url
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.productid
      JOIN product_variants pv ON ci.variant_id = pv.variant_id
      LEFT JOIN product_images pi 
        ON pi.product_id = p.productid AND pi.is_primary = true
      WHERE ci.cart_id = $1
    `, [cart.rows[0].id]);

    res.json({ items: items.rows });

  } catch (err) {
    console.error(err);
    res.json({ items: [] });
  }
});



//order Details

router.get("/order/:id", requireAuth, async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.userid;

    // Get order with ownership check
    const order = await pool.query(
      "SELECT * FROM orders WHERE id = $1 AND user_id = $2",
      [orderId, userId]
    );

    if (order.rows.length === 0) {
      return res.status(404).render("layouts/404", { message: "Order not found" });
    }

    // Get order items
    const items = await pool.query(`
      SELECT 
        oi.quantity,
        oi.price,
        p.name,
        pi.image_url
      FROM order_items oi
      JOIN products p ON oi.product_id = p.productid
      LEFT JOIN product_images pi 
        ON pi.product_id = p.productid AND pi.is_primary = true
      WHERE oi.order_id = $1
    `, [orderId]);

    // Get user details
    const user = await pool.query(
      "SELECT name, email, tel, address FROM users WHERE userid = $1",
      [userId]
    );

    res.render("layouts/order-detail", {
      order: order.rows[0],
      items: items.rows,
      user: user.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).render("layouts/error", { message: "Could not load order" });
  }
});


// Buy Now - Direct checkout for single product
router.post("/buy-now", requireAuth, async (req, res) => {
  try {
    const { product_id, variant_id, quantity } = req.body;
    const userId = req.user.userid;

    if (!product_id || !variant_id || !quantity) {
      return res.status(400).json({ success: false, message: "Missing data" });
    }

    const qty = parseInt(quantity);
    if (qty < 1) {
      return res.status(400).json({ success: false, message: "Invalid quantity" });
    }

    // Get variant details
    const variant = await pool.query(
      "SELECT * FROM product_variants WHERE variant_id = $1 AND product_id = $2",
      [variant_id, product_id]
    );

    if (variant.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (variant.rows[0].stock < qty) {
      return res.status(400).json({ success: false, message: "Not enough stock" });
    }

    const price = parseFloat(variant.rows[0].price);
    const total = (price * qty).toFixed(2);

    // Create order directly (skip cart)
    const order = await pool.query(`
      INSERT INTO orders (user_id, status, total_amount, payment_status)
      VALUES ($1, 'pending', $2, 'unpaid')
      RETURNING id
    `, [userId, total]);

    const orderId = order.rows[0].id;

    // Insert order item
    await pool.query(`
      INSERT INTO order_items (order_id, product_id, variant_id, quantity, price)
      VALUES ($1, $2, $3, $4, $5)
    `, [orderId, product_id, variant_id, qty, price]);

    // Return order ID for payout
    return res.json({ success: true, orderId });

  } catch (err) {
    console.error("Buy now error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/contact/submit", submitContactForm);




// ==========================
// 🚪 LOGOUT
// ==========================

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});

export default router;
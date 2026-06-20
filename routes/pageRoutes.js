import express from "express";
import pool from "../config/db.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { showProduct, showProducts } from "../controllers/productController.js";
import { getCheckoutPage } from "../controllers/cartController.js";
import { getAccountPage } from "../controllers/orderController.js";
import { getPayoutPage } from "../controllers/payoutController.js";
import { updateUser } from "../controllers/userController.js";
import { submitContactForm } from "../controllers/contactController.js";
import { 
  verifyEmail,
  forgotPassword,
  resetPassword  
} from "../controllers/authController.js";
import jwt from "jsonwebtoken";

const router = express.Router();


router.get("/", async (req, res) => {
  try {
    // Get settings
    const settings = await pool.query(
      "SELECT * FROM site_settings WHERE setting_key LIKE 'carousel_%' OR setting_key LIKE 'popup_%'"
    );

    const settingsObj = {};
    settings.rows.forEach(s => {
      settingsObj[s.setting_key] = s.setting_value;
    });

    // Get trending products
    const trending = await pool.query(`
      SELECT 
        p.productid,
        p.name,
        p.price,
        pv.variant_id,
        pi.image_url,
        pi.alt_text
      FROM products p
      JOIN LATERAL (
        SELECT variant_id 
        FROM product_variants 
        WHERE product_id = p.productid 
        LIMIT 1
      ) pv ON true
      LEFT JOIN product_images pi 
        ON pi.product_id = p.productid AND pi.is_primary = true
      WHERE p.is_trending = true AND p.is_active = true
      LIMIT 8
    `);

    // NEW: Get active categories for homepage
    const categories = await pool.query(`
      SELECT * FROM product_categories 
      WHERE is_active = true 
      ORDER BY display_order ASC
      LIMIT 6
    `);

    res.render("layouts/home", {
      trendingProducts: trending.rows,
      categories: categories.rows,  // NEW
      settings: settingsObj
    });

  } catch (err) {
    console.error("Home page error:", err);
    res.render("layouts/home", {
      trendingProducts: [],
      categories: [],  // NEW
      settings: {}
    });
  }
});
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

// router.get("/", async (req, res) => {
//   try {
//     const settings = await pool.query(
//       "SELECT * FROM site_settings WHERE setting_key LIKE 'carousel_%' OR setting_key LIKE 'popup_%'"
//     );

//     const settingsMap = {};
//     settings.rows.forEach(s => {
//       settingsMap[s.setting_key] = s.setting_value;
//     });

//     res.render("layouts/home", {
//       carousel_images: [
//         settingsMap.carousel_1 || '/images/a.webp',
//         settingsMap.carousel_2 || '/images/image 2.jpg',
//         settingsMap.carousel_3 || '/images/image 1.jpg',
//         settingsMap.carousel_4 || '/images/b.webp',
//         settingsMap.carousel_5 || '/images/image 5.webp'
//       ],
//       popup_image: settingsMap.popup_image || '/images/a.webp',
//       popup_enabled: settingsMap.popup_enabled === 'true'
//     });
//   } catch (err) {
//     console.error("Home page error:", err);
//     res.render("layouts/home", {
//       carousel_images: ['/images/a.webp', '/images/image 2.jpg', '/images/image 1.jpg', '/images/b.webp', '/images/image 5.webp'],
//       popup_image: '/images/a.webp',
//       popup_enabled: true
//     });
//   }
// });

router.get("/login", (req, res) => {
  if (req.user) {
    return res.redirect("/");
  }
  
  // Pass returnUrl to the login page
  const returnUrl = req.query.returnUrl || '/';
  
  res.render("layouts/login", { 
    error: null,
    returnUrl: returnUrl
  });
});

router.get("/signup", (req, res) => {
  if (req.user) {
    return res.redirect("/");
  }
  
  // Pass returnUrl to signup page
  const returnUrl = req.query.returnUrl || '/';
  
  res.render("layouts/signup", { 
    error: null,
    returnUrl: returnUrl
  });
});

router.get("/contact", (req, res) => {
  res.render("layouts/contact");
});

// Category page
router.get("/category/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    // Get category
    const category = await pool.query(
      "SELECT * FROM product_categories WHERE slug = $1 AND is_active = true",
      [slug]
    );

    if (category.rows.length === 0) {
      return res.status(404).render("layouts/404", { message: "Category not found" });
    }

    const cat = category.rows[0];

    // Build search query from category's search_query
    let query = `
      SELECT 
        p.productid,
        p.name,
        p.price,
        p.tags,
        pv.variant_id,
        pi.image_url,
        pi.alt_text
      FROM products p
      JOIN LATERAL (
        SELECT variant_id 
        FROM product_variants 
        WHERE product_id = p.productid 
        LIMIT 1
      ) pv ON true
      LEFT JOIN product_images pi 
        ON pi.product_id = p.productid AND pi.is_primary = true
      WHERE p.is_active = true
    `;

    const values = [];

    // Use search_query from category
    if (cat.search_query) {
      const terms = cat.search_query.split(',').map(t => t.trim());
      const conditions = terms.map((_, i) => `p.tags ILIKE $${i + 1}`).join(' OR ');
      query += ` AND (${conditions})`;
      values.push(...terms.map(t => `%${t}%`));
    }

    query += ` ORDER BY p.created_at DESC`;

    const products = await pool.query(query, values);

    res.render("layouts/list", {
      products: products.rows,
      activeTag: null,
      searchQuery: null,
      categoryName: cat.name,
      breadcrumbs: [
        { name: 'Home', url: '/' },
        { name: cat.name, url: '' }
      ]
    });

  } catch (err) {
    console.error("Category page error:", err);
    res.status(500).render("layouts/error", { message: "Could not load category" });
  }
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

// Cart count API
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
      "SELECT COALESCE(SUM(quantity), 0) as total FROM cart_items WHERE cart_id = $1",
      [cart.rows[0].id]
    );

    res.json({ count: parseInt(count.rows[0].total) });

  } catch (err) {
    console.error(err);
    res.json({ count: 0 });
  }
});

// Cart items API
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
        pv.price,
        pv.size,
        pv.color,
        pi.image_url,
        pi.alt_text
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

// Render direct order form (for non-logged in users)
// GET /direct-order - Render the direct order form
// GET /direct-order - Render the direct order form
// GET /direct-order - Render the direct order form
router.get("/direct-order", async (req, res) => {
  try {
    const { 
      product, 
      variant, 
      quantity, 
      size, 
      color, 
      customization, 
      isCustom, 
      total 
    } = req.query;


    if (!product || !variant || !quantity) {
      return res.status(400).json({ success: false, message: "Missing product data" });
    }


    // Get product details (products table uses productid)
    const productData = await pool.query(
      "SELECT * FROM products WHERE productid = $1",
      [product]
    );


    if (productData.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }


    // Get product image (product_images table uses product_id)
    const images = await pool.query(
      "SELECT image_url FROM product_images WHERE product_id = $1 LIMIT 1",
      [product]
    );


    const productImage = images.rows.length > 0 ? images.rows[0].image_url : '/images/default.jpg';


    // Calculate total if not provided
    const totalAmount = total || (parseFloat(productData.rows[0].price) * parseInt(quantity)).toFixed(2);


    // Render direct-order.ejs
    res.render('layouts/direct-order', {
      product: productData.rows[0],
      productImage,
      productId: product,
      variantId: variant,
      quantity: quantity,
      size: size,
      color: color,
      customizationNote: customization || null,
      isCustom: isCustom || false,
      totalAmount: totalAmount
    });


  } catch (err) {
    console.error("Direct order error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST /direct-order/confirm - Confirm direct order payment
router.post("/direct-order/confirm", async (req, res) => {
  try {
    const { orderId, method } = req.body;


    if (!orderId) {
      return res.status(400).json({ success: false, message: "Missing order ID" });
    }


    if (method !== "COD") {
      return res.status(400).json({ success: false, message: "Invalid payment method" });
    }


    // Update direct order status
    await pool.query(
      "UPDATE direct_orders SET status = 'confirmed' WHERE id = $1",
      [orderId]
    );


    return res.json({ success: true, message: "Order confirmed successfully!" });


  } catch (err) {
    console.error("Direct order confirm error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});


// Submit direct order and create order
// POST /direct-order/submit - Submit the direct order form
router.post("/direct-order/submit", async (req, res) => {
  try {
    const {
      product_id,
      variant_id,
      quantity,
      size,
      color,
      customization_note,
      is_custom,
      total_amount,
      customer_name,
      customer_email,
      customer_phone,
      customer_address,
      postal_code
    } = req.body;


    // Validate required fields
    if (!product_id || !variant_id || !quantity || !customer_name || !customer_email || !customer_phone || !customer_address) {
      return res.status(400).json({ success: false, message: "Missing required data" });
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


    // Save to direct_orders table
    const result = await pool.query(`
      INSERT INTO direct_orders 
      (product_id, variant_id, quantity, size, color, customization_note, is_custom, customer_name, customer_email, customer_phone, customer_address, postal_code, status, total_amount)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'pending', $13)
      RETURNING id
    `, [product_id, variant_id, qty, size || null, color || null, customization_note || null, is_custom || false, customer_name, customer_email, customer_phone, customer_address, postal_code, total_amount]);


    const directOrderId = result.rows[0].id;


    // Update stock
    await pool.query(
      "UPDATE product_variants SET stock = stock - $1 WHERE variant_id = $2",
      [qty, variant_id]
    );


    // Redirect to payout-direct (for non-logged-in users)
    return res.redirect(`/payout-direct?order=${directOrderId}`);


  } catch (err) {
    console.error("Direct order submit error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// Buy Now - Direct checkout for single product
router.post("/buy-now", async (req, res) => {
  try {
    const { product_id, variant_id, quantity, customizationNote, isCustom, size, color } = req.body;
    
    // Check if user has token
    const token = req.cookies?.token;
    let userId = null;


    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.userid;
    }


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


    // IF TOKEN FOUND: Create order and redirect to payout
    if (userId) {
      const order = await pool.query(`
        INSERT INTO orders (user_id, status, total_amount, payment_status)
        VALUES ($1, 'pending', $2, 'unpaid')
        RETURNING id
      `, [userId, total]);


      const orderId = order.rows[0].id;


      await pool.query(`
        INSERT INTO order_items (order_id, product_id, variant_id, quantity, price, customization_note, is_custom)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [orderId, product_id, variant_id, qty, price, customizationNote || null, isCustom || false]);


      return res.redirect(`/payout?order=${orderId}`);


    } else {
      // IF NO TOKEN: Redirect to direct-order with product data (no INSERT yet)
      return res.redirect(`/direct-order?product=${product_id}&variant=${variant_id}&quantity=${quantity}&size=${size || ''}&color=${color || ''}&customization=${encodeURIComponent(customizationNote || '')}&isCustom=${isCustom || false}&total=${total}`);
    }


  } catch (err) {
    console.error("Buy now error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});


// New route for direct orders (non-logged-in users)
router.get("/payout-direct", async (req, res) => {
  try {
    const orderId = req.query.order;


    if (!orderId) {
      return res.redirect("/checkout");
    }


    // Get direct order data
    const order = await pool.query(
      "SELECT * FROM direct_orders WHERE id = $1",
      [orderId]
    );


    if (order.rows.length === 0) {
      return res.redirect("/checkout");
    }


    const orderData = order.rows[0];


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


    return res.render("layouts/payout", {
      order: orderData,
      items: items.rows,
      isDirectOrder: true  // <-- ADD THIS
    });


  } catch (err) {
    console.error("Payout direct error:", err);
    return res.redirect("/checkout");
  }
});


router.post("/contact/submit", submitContactForm);



// Email verification
router.get("/verify-email", verifyEmail);

// Forgot password
router.get("/forgot-password", (req, res) => {
  res.render("layouts/forgot-password", { error: null, success: null });
});
router.post("/forgot-password", forgotPassword);

// Reset password
router.get("/reset-password", (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.render("layouts/error", { message: "Invalid reset link" });
  }
  res.render("layouts/reset-password", { error: null, token });
});
router.post("/reset-password", resetPassword);


// Terms and Conditions page
router.get("/terms-and-conditions", (req, res) => {
  res.render("layouts/terms");
});

// Privacy Policy page
router.get("/privacy-policy", (req, res) => {
  res.render("layouts/privacy");
});

// About Us page
router.get("/about", (req, res) => {
  res.render("layouts/about");
});
// ==========================
// 🚪 LOGOUT
// ==========================

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});

export default router;
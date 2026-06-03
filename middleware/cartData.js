import pool from "../config/db.js";

// ==========================
// 🛒 ATTACH CART DATA (runs on every request)
// ==========================
export const attachCart = async (req, res, next) => {
  try {
    // if user not logged in → empty cart
    if (!req.user) {
      res.locals.items = [];
      res.locals.cartCount = 0;
      return next();
    }

    const userId = req.user.userid;

    const cart = await pool.query(
      "SELECT id FROM cart WHERE user_id = $1",
      [userId]
    );

    if (cart.rows.length === 0) {
      res.locals.items = [];
      res.locals.cartCount = 0;
      return next();
    }

    const items = await pool.query(
      `SELECT 
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
      WHERE ci.cart_id = $1`,
      [cart.rows[0].id]
    );

    // make cart data available everywhere
    res.locals.items = items.rows;
    res.locals.cartCount = items.rows.reduce((sum, item) => sum + item.quantity, 0);

    next();

  } catch (err) {
    console.error("Cart middleware error:", err);
    res.locals.items = [];
    res.locals.cartCount = 0;
    next();
  }
};
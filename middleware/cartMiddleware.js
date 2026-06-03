import pool from "../config/db.js";

export const cartMiddleware = async (req, res, next) => {
  try {
    // if user not logged in
    if (!req.user) {
      res.locals.items = [];
      return next();
    }

    const userId = req.user.userid;

    // get cart id
    const cartResult = await pool.query(
      "SELECT id FROM cart WHERE user_id = $1",
      [userId]
    );

    if (cartResult.rows.length === 0) {
      res.locals.items = [];
      return next();
    }

    const cartId = cartResult.rows[0].id;

    // get cart items
    const itemsResult = await pool.query(
      `SELECT 
        ci.quantity,
        p.name,
        p.price,
        pv.size,
        pv.color,
        pi.image_url
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.productid
      LEFT JOIN product_variants pv ON ci.variant_id = pv.variant_id
      LEFT JOIN product_images pi ON pi.product_id = p.productid AND pi.is_primary = true
      WHERE ci.cart_id = $1`,
      [cartId]
    );

    res.locals.items = itemsResult.rows;

    next();

  } catch (err) {
    console.log("Cart middleware error:", err);
    res.locals.items = [];
    next();
  }
};
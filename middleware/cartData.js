import pool from "../config/db.js";

export const attachCart = async (req, res, next) => {
  try {
    // if user not logged in → empty cart
    if (!req.user) {
      res.locals.items = [];
      return next();
    }

    const userId = req.user.userid;

    const cart = await pool.query(
      "SELECT id FROM cart WHERE user_id = $1",
      [userId]
    );

    if (cart.rows.length === 0) {
      res.locals.items = [];
      return next();
    }

    const items = await pool.query(
      `SELECT 
        ci.quantity,
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

    // 🔥 THIS MAKES IT AVAILABLE EVERYWHERE
    res.locals.items = items.rows;

    next();

  } catch (err) {
    console.log(err);
    res.locals.items = [];
    next();
  }
};
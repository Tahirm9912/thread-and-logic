import pool from "../config/db.js";

export const getOrCreateCart = async (userId) => {
  let cart = await pool.query(
    "SELECT id FROM cart WHERE user_id = $1",
    [userId]
  );

  if (cart.rows.length === 0) {
    cart = await pool.query(
      "INSERT INTO cart (user_id) VALUES ($1) RETURNING id",
      [userId]
    );
  }

  return cart.rows[0];
};

export const getCartWithItems = async (userId) => {
  const cart = await getOrCreateCart(userId);

  const items = await pool.query(
    `SELECT 
      ci.id,
      ci.quantity,
      p.productid,
      p.name,
      p.price,
      pv.variant_id,
      pv.size,
      pv.color,
      pi.image_url
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.productid
    JOIN product_variants pv ON ci.variant_id = pv.variant_id
    LEFT JOIN product_images pi 
      ON pi.product_id = p.productid AND pi.is_primary = true
    WHERE ci.cart_id = $1`,
    [cart.id]
  );

  return {
    cartId: cart.id,
    items: items.rows
  };
};
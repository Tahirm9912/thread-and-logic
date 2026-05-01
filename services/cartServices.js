import pool from "../config/db.js";

export const getOrCreateCart = async (userId) => {
  let cart = await pool.query(
    "SELECT * FROM cart WHERE user_id = $1",
    [userId]
  );

  if (cart.rows.length === 0) {
    cart = await pool.query(
      "INSERT INTO cart (user_id) VALUES ($1) RETURNING *",
      [userId]
    );
  }

  return cart.rows[0];
};
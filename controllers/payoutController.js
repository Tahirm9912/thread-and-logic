import pool from "../config/db.js";

// ==========================
// 🟢 GET PAYOUT PAGE
// ==========================
export const getPayoutPage = async (req, res) => {
  try {
    const orderId = req.query.order;
    const userId = req.user.userid;

    if (!orderId) {
      return res.redirect("/checkout");
    }

    // 🔒 ownership check — user can only see their own order
    const order = await pool.query(
      "SELECT * FROM orders WHERE id = $1 AND user_id = $2",
      [orderId, userId]
    );

    if (order.rows.length === 0) {
      return res.redirect("/checkout");
    }

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
      order: order.rows[0],
      items: items.rows
    });

  } catch (err) {
    console.error("Payout page error:", err);
    return res.redirect("/checkout");
  }
};
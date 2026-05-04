import pool from "../config/db.js";

export const createOrder = async (req, res) => {
  try {
    const userId = req.user.userid;
    const selectedItems = req.body.selectedItems || [];

    if (!selectedItems.length) {
      return res.json({
        success: false,
        message: "No items selected"
      });
    }

    // get cart
    const cart = await pool.query(
      "SELECT id FROM cart WHERE user_id = $1",
      [userId]
    );

    if (cart.rows.length === 0) {
      return res.json({ success: false, message: "Cart empty" });
    }

    const cartId = cart.rows[0].id;

    // get ONLY selected items
    const items = await pool.query(`
      SELECT ci.*, p.price
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.productid
      WHERE ci.cart_id = $1
      AND ci.id = ANY($2::int[])
    `, [cartId, selectedItems]);

    if (items.rows.length === 0) {
      return res.json({ success: false, message: "No valid items" });
    }

    // calculate total
    let total = 0;
    items.rows.forEach(i => {
      total += i.price * i.quantity;
    });

    // create order
    const order = await pool.query(`
      INSERT INTO orders (user_id, status, total_amount)
      VALUES ($1, 'pending', $2)
      RETURNING id
    `, [userId, total]);

    const orderId = order.rows[0].id;

    // insert order items
    for (let item of items.rows) {
      await pool.query(`
        INSERT INTO order_items
        (order_id, product_id, variant_id, quantity, price)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        orderId,
        item.product_id,
        item.variant_id,
        item.quantity,
        item.price
      ]);
    }

    return res.json({
      success: true,
      orderId,
      total
    });

  } catch (err) {
    console.log("CREATE ORDER ERROR:", err);
    res.status(500).json({ success: false });
  }
};


// ==========================
// 🟢 CONFIRM ORDER
// ==========================
export const confirmOrder = async (req, res) => {
  try {
    const { orderId, method } = req.body;
    const userId = req.user.userid;

    // COD → instant confirm
    let status = method === "COD" ? "confirmed" : "pending_payment";

    await pool.query(
      `UPDATE orders SET status = $1 WHERE id = $2 AND user_id = $3`,
      [status, orderId, userId]
    );

    // if COD → clear cart
    if (method === "COD") {
      const cart = await pool.query(
        "SELECT id FROM cart WHERE user_id = $1",
        [userId]
      );

      await pool.query(
        "DELETE FROM cart_items WHERE cart_id = $1",
        [cart.rows[0].id]
      );
    }

    res.json({ success: true });

  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
};


// =======
// Account Page

export const getAccountPage = async (req, res) => {
  try {
    const userId = req.user.userid;

    const orders = await pool.query(`
      SELECT * FROM orders
      WHERE user_id = $1
      ORDER BY created_at DESC
    `, [userId]);

    for (let order of orders.rows) {
      const items = await pool.query(`
        SELECT 
          oi.quantity,
          p.name,
          pi.image_url
        FROM order_items oi
        JOIN products p ON oi.product_id = p.productid
        LEFT JOIN product_images pi 
          ON pi.product_id = p.productid 
          AND pi.is_primary = true
        WHERE oi.order_id = $1
      `, [order.id]);

      order.items = items.rows;
    }

    res.render("layouts/account", {
      user: req.user,
      orders: orders.rows
    });

  } catch (err) {
    console.log(err);
    res.send("error");
  }
};
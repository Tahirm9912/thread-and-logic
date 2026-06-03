import pool from "../config/db.js";
import { findUserById } from "../models/userModel.js";

// ==========================
// 🟢 CREATE ORDER
// ==========================
export const createOrder = async (req, res) => {
  try {
    const userId = req.user.userid;

    // get cart
    const cart = await pool.query(
      "SELECT id FROM cart WHERE user_id = $1",
      [userId]
    );

    if (cart.rows.length === 0) {
      return res.json({ success: false, message: "Your cart is empty" });
    }

    // get cart items with price from variant
    const items = await pool.query(`
      SELECT 
        ci.id,
        ci.product_id,
        ci.variant_id,
        ci.quantity,
        pv.price,
        pv.stock
      FROM cart_items ci
      JOIN product_variants pv ON ci.variant_id = pv.variant_id
      WHERE ci.cart_id = $1
    `, [cart.rows[0].id]);

    if (items.rows.length === 0) {
      return res.json({ success: false, message: "Your cart is empty" });
    }

    // check stock availability
    for (let item of items.rows) {
      if (item.stock < item.quantity) {
        return res.json({ 
          success: false, 
          message: `Insufficient stock for one or more items` 
        });
      }
    }

    // calculate total as number
    let total = 0;
    items.rows.forEach(i => {
      total += parseFloat(i.price) * parseInt(i.quantity);
    });

    const totalAmount = total.toFixed(2);

    // create order
    const order = await pool.query(`
      INSERT INTO orders (user_id, status, total_amount, payment_status)
      VALUES ($1, 'pending', $2, 'unpaid')
      RETURNING id
    `, [userId, totalAmount]);

    const orderId = order.rows[0].id;

    // insert order items
    for (let item of items.rows) {
      await pool.query(`
        INSERT INTO order_items (order_id, product_id, variant_id, quantity, price)
        VALUES ($1, $2, $3, $4, $5)
      `, [orderId, item.product_id, item.variant_id, item.quantity, item.price]);
      
      // reduce stock
      await pool.query(`
        UPDATE product_variants 
        SET stock = stock - $1 
        WHERE variant_id = $2
      `, [item.quantity, item.variant_id]);
    }

    return res.json({ success: true, orderId, total: totalAmount });

  } catch (err) {
    console.error("Create order error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


// ==========================
// 🟢 CONFIRM ORDER
// ==========================
export const confirmOrder = async (req, res) => {
  try {
    const { orderId, method } = req.body;
    const userId = req.user.userid;

    if (!orderId || !method) {
      return res.status(400).json({ success: false, message: "Missing data" });
    }

    // ownership check
    const orderCheck = await pool.query(
      "SELECT id FROM orders WHERE id = $1 AND user_id = $2",
      [orderId, userId]
    );

    if (orderCheck.rows.length === 0) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    let status;
    let paymentStatus;

    if (method === "COD") {
      status = "placed";
      paymentStatus = "unpaid";
    } else if (method === "easypaisa") {
      status = "pending_verification";
      paymentStatus = "pending";
    } else {
      return res.status(400).json({ success: false, message: "Invalid payment method" });
    }

    await pool.query(`
      UPDATE orders
      SET status = $1, payment_method = $2, payment_status = $3
      WHERE id = $4
    `, [status, method, paymentStatus, orderId]);

    // clear cart after confirm
    const cart = await pool.query(
      "SELECT id FROM cart WHERE user_id = $1",
      [userId]
    );

    if (cart.rows.length > 0) {
      await pool.query(
        "DELETE FROM cart_items WHERE cart_id = $1",
        [cart.rows[0].id]
      );
    }

    return res.json({ success: true });

  } catch (err) {
    console.error("Confirm order error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


// ==========================
// 🟢 ACCOUNT PAGE (FIXED)
// ==========================
export const getAccountPage = async (req, res) => {
  try {
    const userId = req.user.userid;

    // Get full user details from database
    const userDetails = await findUserById(userId);

    // Get orders
    const orders = await pool.query(`
      SELECT * FROM orders
      WHERE user_id = $1
      ORDER BY created_at DESC
    `, [userId]);

    // Get order items
    let orderItems = [];
    if (orders.rows.length > 0) {
      const orderIds = orders.rows.map(o => o.id);

      const itemsResult = await pool.query(`
        SELECT 
          oi.order_id,
          oi.quantity,
          oi.price,
          p.name,
          pi.image_url
        FROM order_items oi
        JOIN products p ON oi.product_id = p.productid
        LEFT JOIN product_images pi 
          ON pi.product_id = p.productid AND pi.is_primary = true
        WHERE oi.order_id = ANY($1)
      `, [orderIds]);

      orderItems = itemsResult.rows;
    }

    // Attach items to each order
    const ordersWithItems = orders.rows.map(order => ({
      ...order,
      items: orderItems.filter(item => item.order_id === order.id)
    }));

 return res.render("layouts/account", {
      user: userDetails,
      orders: ordersWithItems,
      breadcrumbs: [
        { name: 'Home', url: '/' },
        { name: 'My Account', url: '' }
      ]
    });

  } catch (err) {
    console.error("Account page error:", err);
    return res.status(500).render("layouts/error", {
      message: "Could not load account page"
    });
  }
};
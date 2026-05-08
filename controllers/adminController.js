import pool from "../config/db.js";
import { getAllProducts, deleteProduct } from "../models/productModel.js";
import { getAllUsers } from "../models/userModel.js";

export const getAdminDashboard = async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM products WHERE is_active = true) as total_products,
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM orders WHERE status != 'cancelled') as total_orders,
        (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE payment_status = 'paid') as total_revenue
    `);

    const recentOrders = await pool.query(`
      SELECT 
        o.id,
        o.created_at,
        o.status,
        o.total_amount,
        o.payment_method,
        u.name as user_name,
        u.email as user_email
      FROM orders o
      JOIN users u ON o.user_id = u.userid
      ORDER BY o.created_at DESC
      LIMIT 10
    `);

    return res.render("layouts/admin/dashboard", {
      stats: stats.rows[0],
      recentOrders: recentOrders.rows
    });

  } catch (err) {
    console.error("Admin dashboard error:", err);
    return res.status(500).render("layouts/error", {
      message: "Could not load dashboard"
    });
  }
};

export const getAdminProducts = async (req, res) => {
  try {
    const products = await getAllProducts();

    return res.render("layouts/admin/products", {
      products
    });

  } catch (err) {
    console.error("Admin products error:", err);
    return res.status(500).render("layouts/error", {
      message: "Could not load products"
    });
  }
};

export const deleteProductController = async (req, res) => {
  try {
    const { id } = req.params;

    await deleteProduct(id);

    return res.json({ success: true });

  } catch (err) {
    console.error("Delete product error:", err);
    return res.status(500).json({ success: false, message: "Could not delete product" });
  }
};

export const getAdminUsers = async (req, res) => {
  try {
    const users = await getAllUsers();

    return res.render("layouts/admin/users", {
      users
    });

  } catch (err) {
    console.error("Admin users error:", err);
    return res.status(500).render("layouts/error", {
      message: "Could not load users"
    });
  }
};

export const getAdminOrders = async (req, res) => {
  try {
    const orders = await pool.query(`
      SELECT 
        o.*,
        u.name as user_name,
        u.email as user_email,
        u.tel as user_phone
      FROM orders o
      JOIN users u ON o.user_id = u.userid
      ORDER BY o.created_at DESC
    `);

    return res.render("layouts/admin/orders", {
      orders: orders.rows
    });

  } catch (err) {
    console.error("Admin orders error:", err);
    return res.status(500).render("layouts/error", {
      message: "Could not load orders"
    });
  }
};

// NEW: Get single order detail
export const getOrderDetail = async (req, res) => {
  try {
    const orderId = req.params.id;

    const order = await pool.query(
      "SELECT * FROM orders WHERE id = $1",
      [orderId]
    );

    if (order.rows.length === 0) {
      return res.status(404).render("layouts/404", { message: "Order not found" });
    }

    const customerInfo = await pool.query(
      "SELECT name, email, tel, address, postal_code FROM users WHERE userid = $1",
      [order.rows[0].user_id]
    );

    const items = await pool.query(`
      SELECT 
        oi.quantity,
        oi.price,
        p.name,
        pv.size,
        pv.color,
        pi.image_url
      FROM order_items oi
      JOIN products p ON oi.product_id = p.productid
      LEFT JOIN product_variants pv ON oi.variant_id = pv.variant_id
      LEFT JOIN product_images pi 
        ON pi.product_id = p.productid AND pi.is_primary = true
      WHERE oi.order_id = $1
    `, [orderId]);

    res.render("layouts/admin/order-detail", {
      order: order.rows[0],
      customerInfo: customerInfo.rows[0],
      items: items.rows
    });

  } catch (err) {
    console.error("Order detail error:", err);
    res.status(500).render("layouts/error", { message: "Could not load order" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    const validStatuses = ['pending', 'placed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    await pool.query(
      "UPDATE orders SET status = $1 WHERE id = $2",
      [status, orderId]
    );

    return res.json({ success: true });

  } catch (err) {
    console.error("Update order status error:", err);
    return res.status(500).json({ success: false, message: "Could not update order" });
  }
};
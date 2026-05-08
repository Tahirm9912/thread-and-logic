import pool from "../config/db.js";

export const addToCart = async (req, res) => {
  const client = await pool.connect(); // Use connection from pool
  
  try {
    const { product_id, variant_id, quantity } = req.body;
    const userId = req.user.userid;

    if (!product_id || !variant_id) {
      return res.status(400).json({ success: false, message: "Invalid data" });
    }

    const qty = parseInt(quantity) || 1;
    if (qty < 1) {
      return res.status(400).json({ success: false, message: "Invalid quantity" });
    }

    // Check variant exists
    const variant = await client.query(
      "SELECT * FROM product_variants WHERE variant_id = $1 AND product_id = $2",
      [variant_id, product_id]
    );

    if (variant.rows.length === 0) {
      client.release();
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (variant.rows[0].stock < qty) {
      client.release();
      return res.status(400).json({ success: false, message: "Not enough stock" });
    }

    // START TRANSACTION
    await client.query('BEGIN');

    // Get or create cart with lock
    let cart = await client.query(
      "SELECT id FROM cart WHERE user_id = $1 FOR UPDATE",
      [userId]
    );

    let cartId;

    if (cart.rows.length === 0) {
      const newCart = await client.query(
        "INSERT INTO cart (user_id) VALUES ($1) RETURNING id",
        [userId]
      );
      cartId = newCart.rows[0].id;
    } else {
      cartId = cart.rows[0].id;
    }

    // Check existing item with lock
    const existing = await client.query(
      `SELECT id, quantity FROM cart_items 
       WHERE cart_id = $1 AND product_id = $2 AND variant_id = $3
       FOR UPDATE`,
      [cartId, product_id, variant_id]
    );

    if (existing.rows.length > 0) {
      // Update existing
      await client.query(
        `UPDATE cart_items 
         SET quantity = quantity + $1 
         WHERE id = $2`,
        [qty, existing.rows[0].id]
      );
    } else {
      // Insert new
      await client.query(
        `INSERT INTO cart_items (cart_id, product_id, variant_id, quantity)
         VALUES ($1, $2, $3, $4)`,
        [cartId, product_id, variant_id, qty]
      );
    }

    await client.query('COMMIT');
    client.release();
    
    return res.json({ success: true });

  } catch (err) {
    await client.query('ROLLBACK');
    client.release();
    console.error("Add to cart error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getCartItems = async (req, res) => {
  try {
    const userId = req.user.userid;

    const cart = await pool.query(
      "SELECT id FROM cart WHERE user_id = $1",
      [userId]
    );

    if (cart.rows.length === 0) {
      return res.render("partials/cart", { items: [] });
    }

    const items = await pool.query(`
      SELECT 
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
      WHERE ci.cart_id = $1
    `, [cart.rows[0].id]);

    return res.render("partials/cart", { items: items.rows });

  } catch (err) {
    console.error("Get cart error:", err);
    return res.render("partials/cart", { items: [] });
  }
};

export const getCheckoutPage = async (req, res) => {
  try {
    const userId = req.user.userid;

    const cart = await pool.query(
      "SELECT id FROM cart WHERE user_id = $1",
      [userId]
    );

    if (cart.rows.length === 0) {
      return res.render("layouts/checkout", { items: [], total: 0 });
    }

    const items = await pool.query(`
      SELECT 
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
      WHERE ci.cart_id = $1
    `, [cart.rows[0].id]);

    let total = 0;
    items.rows.forEach(item => {
      total += parseFloat(item.price) * item.quantity;
    });

    return res.render("layouts/checkout", {
      items: items.rows,
      total: total.toFixed(2)
    });

  } catch (err) {
    console.error("Checkout page error:", err);
    return res.render("layouts/checkout", { items: [], total: 0 });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const { itemId, quantity } = req.body;
    const userId = req.user.userid;

    const qty = parseInt(quantity);
    if (!qty || qty < 1) {
      return res.status(400).json({ success: false, message: "Invalid quantity" });
    }

    const check = await pool.query(`
      SELECT ci.id FROM cart_items ci
      JOIN cart c ON ci.cart_id = c.id
      WHERE ci.id = $1 AND c.user_id = $2
    `, [itemId, userId]);

    if (check.rows.length === 0) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await pool.query(
      "UPDATE cart_items SET quantity = $1 WHERE id = $2",
      [qty, itemId]
    );

    return res.json({ success: true });

  } catch (err) {
    console.error("Update cart error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const removeCartItem = async (req, res) => {
  try {
    const { itemId } = req.body;
    const userId = req.user.userid;

    const check = await pool.query(`
      SELECT ci.id FROM cart_items ci
      JOIN cart c ON ci.cart_id = c.id
      WHERE ci.id = $1 AND c.user_id = $2
    `, [itemId, userId]);

    if (check.rows.length === 0) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await pool.query("DELETE FROM cart_items WHERE id = $1", [itemId]);

    return res.json({ success: true });

  } catch (err) {
    console.error("Remove cart item error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const clearCart = async (req, res) => {
  try {
    const userId = req.user.userid;

    const cart = await pool.query(
      "SELECT id FROM cart WHERE user_id = $1",
      [userId]
    );

    if (cart.rows.length === 0) {
      return res.json({ success: true });
    }

    await pool.query(
      "DELETE FROM cart_items WHERE cart_id = $1",
      [cart.rows[0].id]
    );

    return res.json({ success: true });

  } catch (err) {
    console.error("Clear cart error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
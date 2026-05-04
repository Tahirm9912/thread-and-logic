import pool from "../config/db.js";

// ==========================
// 🟢 ADD TO CART
// ==========================
export const addToCart = async (req, res) => {
  try {
    const { product_id, variant_id, quantity } = req.body;
    const userId = req.user.userid;

    if (!product_id || !variant_id) {
      return res.status(400).json({ success: false, message: "Invalid data" });
    }

    // get or create cart
    let cart = await pool.query(
      "SELECT id FROM cart WHERE user_id = $1",
      [userId]
    );

    let cartId;

    if (cart.rows.length === 0) {
      const newCart = await pool.query(
        "INSERT INTO cart (user_id) VALUES ($1) RETURNING id",
        [userId]
      );
      cartId = newCart.rows[0].id;
    } else {
      cartId = cart.rows[0].id;
    }

    // check existing item
    const existing = await pool.query(
      `SELECT id FROM cart_items 
       WHERE cart_id = $1 AND product_id = $2 AND variant_id = $3`,
      [cartId, product_id, variant_id]
    );

    if (existing.rows.length > 0) {
      await pool.query(
        `UPDATE cart_items 
         SET quantity = quantity + $1 
         WHERE id = $2`,
        [quantity, existing.rows[0].id]
      );
    } else {
      await pool.query(
        `INSERT INTO cart_items 
        (cart_id, product_id, variant_id, quantity)
        VALUES ($1, $2, $3, $4)`,
        [cartId, product_id, variant_id, quantity]
      );
    }

    res.json({ success: true });

  } catch (err) {
    console.log("ADD CART ERROR:", err);
    res.status(500).json({ success: false });
  }
};



// ==========================
// 🟢 GET CART ITEMS
// ==========================
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

    res.render("partials/cart", {
      items: items.rows
    });

  } catch (err) {
    console.log(err);
    res.render("partials/cart", { items: [] });
  }
};



// ==========================
// 🟢 CHECKOUT PAGE
// ==========================
export const getCheckoutPage = async (req, res) => {
  try {
    const userId = req.user.userid;

    const cart = await pool.query(
      "SELECT id FROM cart WHERE user_id = $1",
      [userId]
    );

    if (cart.rows.length === 0) {
      return res.render("layouts/checkout", {
        items: [],
        total: 0
      });
    }

    const items = await pool.query(`
      SELECT 
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
      WHERE ci.cart_id = $1
    `, [cart.rows[0].id]);

      let total = 0;

// 🔥 calculate total
items.rows.forEach(item => {
  total += item.price * item.quantity;
});

return res.render("layouts/checkout", {
  items: items.rows,
  total
});

  } catch (err) {
    console.log(err);
    res.render("layouts/checkout", {
      items: [],
      total: 0
    });
  }
};



// ==========================
// 🟢 UPDATE QTY
// ==========================
export const updateCartItem = async (req, res) => {
  try {
    const { itemId, quantity } = req.body;

    await pool.query(
      `UPDATE cart_items SET quantity = $1 WHERE id = $2`,
      [quantity, itemId]
    );

    res.json({ success: true });

  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
};



// ==========================
// 🟢 REMOVE ITEM
// ==========================
export const removeCartItem = async (req, res) => {
  try {
    const { itemId } = req.body;

    await pool.query(
      "DELETE FROM cart_items WHERE id = $1",
      [itemId]
    );

    res.json({ success: true });

  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
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

    res.json({ success: true });

  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
};
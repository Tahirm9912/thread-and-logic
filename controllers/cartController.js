import pool from "../config/db.js";

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

    const items = await pool.query(
      `SELECT 
        ci.id,
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

return res.render("partials/cart", {
  items: items.rows || []
});

  } catch (err) {
    console.log(err);
    res.render("partials/cart", { items: [] });
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
      return res.render("layouts/checkout", {
        items: [],
        total: 0
      });
    }

    const items = await pool.query(
      `SELECT 
        ci.quantity,
        p.name,
        p.price,
        pv.size,
        pv.color
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.productid
      JOIN product_variants pv ON ci.variant_id = pv.variant_id
      WHERE ci.cart_id = $1`,
      [cart.rows[0].id]
    );

    let total = 0;
    items.rows.forEach(i => {
      total += i.price * i.quantity;
    });

return res.render("partials/cart", {
  items: items.rows || []
});

  } catch (err) {
    console.log(err);
    return res.send("error");
  }
};


export const addToCart = async (req, res) => {
  console.log("addToCart", req.body)
  try {
    const userId = req.user.userid;
    const { product_id, variant_id, quantity } = req.body;

    // 1. get cart
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

    // 2. check if item exists already
    const existing = await pool.query(
      `SELECT * FROM cart_items 
       WHERE cart_id = $1 AND product_id = $2 AND variant_id = $3`,
      [cartId, product_id, variant_id]
    );

    if (existing.rows.length > 0) {
      // update quantity
      await pool.query(
        `UPDATE cart_items 
         SET quantity = quantity + $1 
         WHERE id = $2`,
        [quantity, existing.rows[0].id]
      );
    } else {
      // insert new item
      await pool.query(
        `INSERT INTO cart_items 
        (cart_id, product_id, variant_id, quantity)
        VALUES ($1, $2, $3, $4)`,
        [cartId, product_id, variant_id, quantity]
      );
    }

    return res.json({ success: true });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Server error" });
  }
};
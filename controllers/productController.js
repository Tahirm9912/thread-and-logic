import {
  createProduct,
  addProductImage,
  addVariant,
  getAllProducts,
  getProductFull
} from "../models/productModel.js";



// ==========================
// 🟢 SHOW ALL PRODUCTS
// ==========================
export const showProduct = async (req, res) => {
  try {
    const id = req.params.id;

    const product = await pool.query(
      "SELECT * FROM products WHERE productid = $1",
      [id]
    );

    const variants = await pool.query(
      "SELECT * FROM product_variants WHERE product_id = $1",
      [id]
    );

    const images = await pool.query(
      "SELECT * FROM product_images WHERE product_id = $1",
      [id]
    );

    // 🔥 TAGS PARSING ADDED HERE
    const productData = product.rows[0];

    if (productData.tags) {
      productData.tags = productData.tags
        .split(",")
        .map(tag => tag.trim());
    } else {
      productData.tags = [];
    }

    res.render("layouts/product", {
      product: productData,
      variants: variants.rows,
      images: images.rows
    });

  } catch (err) {
    console.log(err);
    res.send("error");
  }
};





// ==========================
// 🟢 ADD PRODUCT (ADMIN)
// ==========================
export const addProductController = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      is_trending,
      is_top,
      is_featured,
      is_active,

      images,   // array
      variants  // array
    } = req.body;

    // 🟢 1. Create product
    const product = await createProduct({
      name,
      description,
      category,
      is_trending: is_trending === "on",
      is_top: is_top === "on",
      is_featured: is_featured === "on",
      is_active: is_active === "on"
    });

    // 🟢 2. Insert images
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        await addProductImage(
          product.productid,
          images[i],
          i === 0 // first = primary
        );
      }
    }

    // 🟢 3. Insert variants
    if (variants && variants.length > 0) {
      for (let v of variants) {
        await addVariant({
          product_id: product.productid,
          color: v.color,
          size: v.size,
          fabric: v.fabric,
          piece_type: v.piece_type,
          stock: v.stock,
          price: v.price
        });
      }
    }

    return res.redirect("/admin/products");

  } catch (err) {
    console.log(err);
    return res.send("Error creating product");
  }
};


import pool from "../config/db.js";

// ==========================
// 🟢 GET ALL PRODUCTS (ONLY WITH VARIANTS)
// ==========================
export const showProducts = async (req, res) => {
  try {
    const { tag } = req.query;

    let query = `
      SELECT 
        p.productid,
        p.name,
        p.price,
        p.tags,
        pv.variant_id,
        pi.image_url

      FROM products p

      JOIN LATERAL (
        SELECT variant_id 
        FROM product_variants 
        WHERE product_id = p.productid 
        LIMIT 1
      ) pv ON true

      LEFT JOIN product_images pi 
        ON pi.product_id = p.productid 
        AND pi.is_primary = true

      WHERE p.is_active = true
    `;

    let values = [];

    // 🔥 FILTER BY TAG
    if (tag) {
      query += ` AND p.tags ILIKE $1`;
      values.push(`%${tag}%`);
    }

    const result = await pool.query(query, values);

    // parse tags
    const products = result.rows.map(p => ({
      ...p,
      tags: p.tags
        ? p.tags.split(",").map(t => t.trim())
        : []
    }));

    res.render("layouts/list", {
      products,
      activeTag: tag || null
    });

  } catch (err) {
    console.log(err);
    res.send("Error loading products");
  }
};
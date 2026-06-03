import pool from "../config/db.js";

// ==========================
// 🟢 CREATE PRODUCT
// ==========================
export const createProduct = async (productData) => {
  const {
    name,
    description,
    category,
    price,
    stock,
    tags,
    is_trending,
    is_top,
    is_featured,
    is_active
  } = productData;

  const result = await pool.query(
    `INSERT INTO products 
    (name, description, category, price, stock, tags, is_trending, is_top, is_featured, is_active)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *`,
    [name, description, category, price, stock, tags, is_trending, is_top, is_featured, is_active]
  );

  return result.rows[0];
};


// ==========================
// 🟢 ADD PRODUCT IMAGE
// ==========================
export const addProductImage = async (product_id, image_url, is_primary) => {
  const result = await pool.query(
    `INSERT INTO product_images (product_id, image_url, is_primary)
     VALUES ($1, $2, $3) RETURNING *`,
    [product_id, image_url, is_primary]
  );

  return result.rows[0];
};


// ==========================
// 🟢 ADD VARIANT
// ==========================
export const addVariant = async (variantData) => {
  const {
    product_id,
    color,
    size,
    fabric,
    piece_type,
    stock,
    price
  } = variantData;

  const result = await pool.query(
    `INSERT INTO product_variants
    (product_id, color, size, fabric, piece_type, stock, price)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *`,
    [product_id, color, size, fabric, piece_type, stock, price]
  );

  return result.rows[0];
};


// ==========================
// 📦 GET ALL PRODUCTS (WITH PRIMARY IMAGE)
// ==========================
export const getAllProducts = async () => {
  const result = await pool.query(`
    SELECT 
      p.productid,
      p.name,
      p.price,
      p.stock,
      p.is_active,
      p.is_trending,
      p.is_top,
      p.is_featured,
      p.created_at,
      MIN(pv.variant_id) as variant_id,
      pi.image_url
    FROM products p
    LEFT JOIN product_variants pv ON p.productid = pv.product_id
    LEFT JOIN product_images pi 
      ON pi.product_id = p.productid AND pi.is_primary = true
    GROUP BY p.productid, pi.image_url
    ORDER BY p.created_at DESC
  `);

  return result.rows;
};


// ==========================
// 🔍 GET SINGLE PRODUCT (FULL DATA)
// ==========================
export const getProductFull = async (productId) => {
  // product
  const productRes = await pool.query(
    "SELECT * FROM products WHERE productid = $1",
    [productId]
  );

  // images
  const imageRes = await pool.query(
    "SELECT * FROM product_images WHERE product_id = $1 ORDER BY is_primary DESC",
    [productId]
  );

  // variants
  const variantRes = await pool.query(
    "SELECT * FROM product_variants WHERE product_id = $1",
    [productId]
  );

  return {
    product: productRes.rows[0],
    images: imageRes.rows,
    variants: variantRes.rows
  };
};


// ==========================
// 🗑️ DELETE PRODUCT
// ==========================
export const deleteProduct = async (productId) => {
  await pool.query("DELETE FROM product_images WHERE product_id = $1", [productId]);
  await pool.query("DELETE FROM product_variants WHERE product_id = $1", [productId]);
  await pool.query("DELETE FROM products WHERE productid = $1", [productId]);
};


// ==========================
// ✏️ UPDATE PRODUCT
// ==========================
export const updateProduct = async (productId, productData) => {
  const {
    name,
    description,
    category,
    price,
    stock,
    tags,
    is_trending,
    is_top,
    is_featured,
    is_active
  } = productData;

  const result = await pool.query(
    `UPDATE products 
     SET name = $1, description = $2, category = $3, price = $4, stock = $5, 
         tags = $6, is_trending = $7, is_top = $8, is_featured = $9, is_active = $10
     WHERE productid = $11
     RETURNING *`,
    [name, description, category, price, stock, tags, is_trending, is_top, is_featured, is_active, productId]
  );

  return result.rows[0];
};
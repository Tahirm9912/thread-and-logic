import pool from "../config/db.js";
import {
  createProduct,
  addProductImage,
  addVariant
} from "../models/productModel.js";

export const showProduct = async (req, res) => {
  try {
    const id = req.params.id;

    const product = await pool.query(
      "SELECT * FROM products WHERE productid = $1 AND is_active = true",
      [id]
    );

    if (product.rows.length === 0) {
      return res.status(404).render("layouts/404", { message: "Product not found" });
    }

    const variants = await pool.query(
      "SELECT * FROM product_variants WHERE product_id = $1",
      [id]
    );

    const images = await pool.query(
      "SELECT * FROM product_images WHERE product_id = $1 ORDER BY is_primary DESC",
      [id]
    );

    const productData = product.rows[0];

    if (productData.tags) {
      productData.tags = productData.tags.split(",").map(tag => tag.trim());
    } else {
      productData.tags = [];
    }

    // GET RELATED PRODUCTS (same category or tags)
    const relatedProducts = await pool.query(`
      SELECT 
        p.productid,
        p.name,
        p.price,
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
        ON pi.product_id = p.productid AND pi.is_primary = true
      WHERE p.is_active = true 
        AND p.productid != $1
        AND (p.category = $2 OR p.tags ILIKE $3)
      ORDER BY RANDOM()
      LIMIT 4
    `, [id, productData.category, `%${productData.tags[0] || ''}%`]);

    return res.render("layouts/product", {
      product: productData,
      variants: variants.rows,
      images: images.rows,
      relatedProducts: relatedProducts.rows,
      breadcrumbs: [
        { name: 'Home', url: '/' },
        { name: 'Products', url: '/list' },
        { name: productData.name, url: '' }
      ]
    });

  } catch (err) {
    console.error("Show product error:", err);
    return res.status(500).render("layouts/error", { message: "Could not load product" });
  }
};

export const showProducts = async (req, res) => {
  try {
    const { tag, sort, search } = req.query;

    let query = `
      SELECT 
        p.productid,
        p.name,
        p.price,
        p.tags,
        p.created_at,
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
        ON pi.product_id = p.productid AND pi.is_primary = true
      WHERE p.is_active = true
    `;

    let values = [];
    let paramCount = 0;

    // FILTER BY SEARCH - search in name, description, tags, category
    if (search && search.trim() !== '') {
      paramCount++;
      query += ` AND (
        p.name ILIKE $${paramCount} OR 
        p.description ILIKE $${paramCount} OR 
        p.tags ILIKE $${paramCount} OR 
        p.category ILIKE $${paramCount}
      )`;
      values.push(`%${search.trim()}%`);
    }

    // FILTER BY TAG
    if (tag) {
      paramCount++;
      query += ` AND p.tags ILIKE $${paramCount}`;
      values.push(`%${tag}%`);
    }

    // SORTING
    if (sort === 'low') {
      query += ` ORDER BY p.price ASC`;
    } else if (sort === 'high') {
      query += ` ORDER BY p.price DESC`;
    } else if (sort === 'new') {
      query += ` ORDER BY p.created_at DESC`;
    } else {
      query += ` ORDER BY p.created_at DESC`;
    }

    const result = await pool.query(query, values);

    const products = result.rows.map(p => ({
      ...p,
      tags: p.tags ? p.tags.split(",").map(t => t.trim()) : []
    }));

 return res.render("layouts/list", {
      products,
      activeTag: tag || null,
      searchQuery: search || null,
      breadcrumbs: [
        { name: 'Home', url: '/' },
        { name: 'Products', url: '' }
      ]
    });

  } catch (err) {
    console.error("Show products error:", err);
    return res.status(500).render("layouts/error", { message: "Could not load products" });
  }
};

export const addProductController = async (req, res) => {
  try {
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
      is_active,
      images,
      variants
    } = req.body;

    if (!name || !price) {
      return res.status(400).send("Name and price are required");
    }

    const product = await createProduct({
      name,
      description,
      category,
      price,
      stock: stock || 0,
      tags: tags || "",
      is_trending: is_trending === "on",
      is_top: is_top === "on",
      is_featured: is_featured === "on",
      is_active: is_active === "on"
    });

    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        await addProductImage(product.productid, images[i], i === 0);
      }
    }

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
    console.error("Add product error:", err);
    return res.status(500).send("Error creating product");
  }
};
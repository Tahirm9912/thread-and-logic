import pool from "../config/db.js";

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
        pi.image_url,
        pi.alt_text
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

    // FILTER BY SEARCH
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

    // FIXED: Always provide all expected variables
    return res.render("layouts/list", {
      products,
      activeTag: tag || null,
      searchQuery: search || null,
      categoryName: null,  // Add this
      breadcrumbs: [
        { name: 'Home', url: '/' },
        { name: 'Products', url: '' }
      ]
    });

  } catch (err) {
    console.error("Show products error:", err);
    return res.status(500).render("layouts/error", { 
      message: "Could not load products" 
    });
  }
};

export const showProduct = async (req, res) => {
  try {
    const id = req.params.id;

    const product = await pool.query(
      "SELECT * FROM products WHERE productid = $1 AND is_active = true",
      [id]
    );

    if (product.rows.length === 0) {
      return res.status(404).render("layouts/404", { 
        message: "Product not found" 
      });
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

    // GET RELATED PRODUCTS
    const relatedProducts = await pool.query(`
      SELECT 
        p.productid,
        p.name,
        p.price,
        pv.variant_id,
        pi.image_url,
        pi.alt_text
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
    return res.status(500).render("layouts/error", { 
      message: "Could not load product" 
    });
  }
};

// ADD PRODUCT CONTROLLER
export const addProductController = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      price,
      stock,
      tags,
      images,
      image_alts,
      is_active,
      is_trending,
      is_featured,
      is_top
    } = req.body;

    const variants = [];
    if (req.body.variants) {
      for (let i = 0; i < req.body.variants.length; i++) {
        const v = req.body.variants[i];
        if (v.size || v.color) {
          variants.push({
            size: v.size || 'One Size',
            color: v.color || 'Default',
            fabric: v.fabric || null,
            piece_type: v.piece_type || null,
            stock: parseInt(v.stock) || 0,
            price: parseFloat(v.price) || parseFloat(price)
          });
        }
      }
    }

    if (variants.length === 0) {
      variants.push({
        size: 'One Size',
        color: 'Default',
        fabric: null,
        piece_type: null,
        stock: parseInt(stock) || 0,
        price: parseFloat(price)
      });
    }

    const product = await pool.query(
      `INSERT INTO products 
      (name, description, category, price, stock, tags, is_active, is_trending, is_featured, is_top) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
      RETURNING productid`,
      [
        name,
        description,
        category,
        price,
        stock,
        tags,
        is_active === 'on',
        is_trending === 'on',
        is_featured === 'on',
        is_top === 'on'
      ]
    );

    const productId = product.rows[0].productid;

    // Insert images with alt text
    if (images) {
      const imageArray = Array.isArray(images) ? images : [images];
      const altArray = image_alts ? (Array.isArray(image_alts) ? image_alts : [image_alts]) : [];

      for (let i = 0; i < imageArray.length; i++) {
        if (imageArray[i]) {
          await pool.query(
            `INSERT INTO product_images (product_id, image_url, alt_text, is_primary) 
             VALUES ($1, $2, $3, $4)`,
            [productId, imageArray[i], altArray[i] || name, i === 0]
          );
        }
      }
    }

    // Insert variants
    for (let variant of variants) {
      await pool.query(
        `INSERT INTO product_variants 
        (product_id, size, color, fabric, piece_type, stock, price) 
        VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          productId,
          variant.size,
          variant.color,
          variant.fabric,
          variant.piece_type,
          variant.stock,
          variant.price
        ]
      );
    }

    res.redirect("/admin/products?success=1");

  } catch (err) {
    console.error("Add product error:", err);
    res.redirect("/admin/products?error=1");
  }
};

// GET EDIT PRODUCT PAGE
export const getEditProductPage = async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await pool.query(
      "SELECT * FROM products WHERE productid = $1",
      [productId]
    );

    if (product.rows.length === 0) {
      return res.status(404).render("layouts/404", { 
        message: "Product not found" 
      });
    }

    const variants = await pool.query(
      "SELECT * FROM product_variants WHERE product_id = $1",
      [productId]
    );

    res.render("layouts/admin/edit-product", {
      product: product.rows[0],
      variants: variants.rows
    });

  } catch (err) {
    console.error("Edit product page error:", err);
    res.status(500).render("layouts/error", { 
      message: "Could not load product" 
    });
  }
};

// UPDATE PRODUCT
export const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const {
      name,
      description,
      category,
      price,
      stock,
      tags,
      is_active,
      is_trending,
      is_featured,
      is_top,
      variant_ids,
      variant_stocks,
      variant_prices
    } = req.body;

    await pool.query(`
      UPDATE products 
      SET name = $1, 
          description = $2, 
          category = $3, 
          price = $4, 
          stock = $5, 
          tags = $6,
          is_active = $7,
          is_trending = $8,
          is_featured = $9,
          is_top = $10
      WHERE productid = $11
    `, [
      name, 
      description, 
      category, 
      price, 
      stock, 
      tags,
      is_active === 'on',
      is_trending === 'on',
      is_featured === 'on',
      is_top === 'on',
      productId
    ]);

    // Update variants
    if (variant_ids && variant_stocks && variant_prices) {
      const ids = Array.isArray(variant_ids) ? variant_ids : [variant_ids];
      const stocks = Array.isArray(variant_stocks) ? variant_stocks : [variant_stocks];
      const prices = Array.isArray(variant_prices) ? variant_prices : [variant_prices];

      for (let i = 0; i < ids.length; i++) {
        await pool.query(`
          UPDATE product_variants 
          SET stock = $1, price = $2 
          WHERE variant_id = $3
        `, [stocks[i], prices[i], ids[i]]);
      }
    }

    res.redirect("/admin/products?success=1");

  } catch (err) {
    console.error("Update product error:", err);
    res.redirect("/admin/products?error=1");
  }
};
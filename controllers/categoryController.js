import pool from "../config/db.js";

// Get all categories for admin
export const getAllCategories = async (req, res) => {
  try {
    const categories = await pool.query(
      "SELECT * FROM product_categories ORDER BY display_order ASC"
    );

    res.render("layouts/admin/categories", {
      categories: categories.rows,
      editCategory: null
    });

  } catch (err) {
    console.error("Get categories error:", err);
    res.status(500).render("layouts/error", { message: "Could not load categories" });
  }
};

// NEW: Get single category for editing
export const getEditCategoryPage = async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await pool.query(
      "SELECT * FROM product_categories WHERE id = $1",
      [id]
    );

    if (category.rows.length === 0) {
      return res.redirect("/admin/categories?error=notfound");
    }

    const allCategories = await pool.query(
      "SELECT * FROM product_categories ORDER BY display_order ASC"
    );

    res.render("layouts/admin/categories", {
      categories: allCategories.rows,
      editCategory: category.rows[0]
    });

  } catch (err) {
    console.error("Get edit category error:", err);
    res.redirect("/admin/categories?error=1");
  }
};

// Add category
export const addCategory = async (req, res) => {
  try {
    const { name, slug, search_query, image_url, external_url, display_order } = req.body;

    await pool.query(
      `INSERT INTO product_categories 
       (name, slug, search_query, image_url, external_url, display_order, is_active) 
       VALUES ($1, $2, $3, $4, $5, $6, true)`,
      [name, slug, search_query || '', image_url || '', external_url || '', parseInt(display_order) || 0]
    );

    res.redirect("/admin/categories?success=1");

  } catch (err) {
    console.error("Add category error:", err);
    res.redirect("/admin/categories?error=1");
  }
};

// Update category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, search_query, image_url, external_url, display_order, is_active } = req.body;

    await pool.query(
      `UPDATE product_categories 
       SET name = $1, slug = $2, search_query = $3, image_url = $4, 
           external_url = $5, display_order = $6, is_active = $7
       WHERE id = $8`,
      [
        name, 
        slug, 
        search_query || '', 
        image_url || '', 
        external_url || '', 
        parseInt(display_order) || 0, 
        is_active === 'on',
        id
      ]
    );

    res.redirect("/admin/categories?success=1");

  } catch (err) {
    console.error("Update category error:", err);
    res.redirect("/admin/categories?error=1");
  }
};

// Delete category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM product_categories WHERE id = $1", [id]);

    res.json({ success: true });

  } catch (err) {
    console.error("Delete category error:", err);
    res.status(500).json({ success: false });
  }
};
import express from "express";
import pool from "../config/db.js";

const router = express.Router();

router.get("/sitemap.xml", async (req, res) => {
  try {
    const baseUrl = "https://aynbyhadiyaz.com";

    // Get all products
    const result = await pool.query(
      "SELECT productid FROM products WHERE is_active = true"
    );

    let xml = `<?xml version="1.0" encoding="UTF-8"?>`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Static pages
    const pages = [
      "/",
      "/list",
      "/contact",
      "/account",
      "/login",
      "/signup"
    ];

    pages.forEach(page => {
      xml += `
  <url>
    <loc>${baseUrl}${page}</loc>
  </url>`;
    });

    // Dynamic products
    result.rows.forEach(p => {
      xml += `
  <url>
    <loc>${baseUrl}/product/${p.productid}</loc>
  </url>`;
    });

    xml += `
</urlset>`;

    res.header("Content-Type", "application/xml");
    res.send(xml);

  } catch (err) {
    console.error("Sitemap error:", err);
    res.status(500).send("Error generating sitemap");
  }
});

export default router;
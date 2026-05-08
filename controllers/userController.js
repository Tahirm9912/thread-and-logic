import pool from "../config/db.js";

export const updateUser = async (req, res) => {
  try {
    const userId = req.user.userid;
    const { email, tel, address, postal_code } = req.body;

    // Validate email if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: "Invalid email format" });
      }

      // Check if email taken by another user
      const existing = await pool.query(
        "SELECT userid FROM users WHERE email = $1 AND userid != $2",
        [email, userId]
      );

      if (existing.rows.length > 0) {
        return res.status(400).json({ success: false, message: "Email already in use" });
      }
    }

    await pool.query(`
      UPDATE users
      SET 
        email = COALESCE($1, email),
        tel = COALESCE($2, tel),
        address = COALESCE($3, address),
        postal_code = COALESCE($4, postal_code)
      WHERE userid = $5
    `, [email || null, tel || null, address || null, postal_code || null, userId]);

    return res.json({ success: true, message: "Profile updated successfully" });

  } catch (err) {
    console.error("Update user error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
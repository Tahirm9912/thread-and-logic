import pool from "../config/db.js";

export const updateUser = async (req, res) => {
  try {
    const userId = req.user.userid;
    const { email, tel, address, postal_code } = req.body;

    console.log('Update user request:', { userId, email, tel, address, postal_code });

    // Validate email if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid email format" 
        });
      }

      // Check if email taken by another user
      const existing = await pool.query(
        "SELECT userid FROM users WHERE email = $1 AND userid != $2",
        [email, userId]
      );

      if (existing.rows.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: "Email already in use" 
        });
      }
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramCount = 0;

    if (email) {
      paramCount++;
      updates.push(`email = $${paramCount}`);
      values.push(email);
    }

    if (tel) {
      paramCount++;
      updates.push(`tel = $${paramCount}`);
      values.push(tel);
    }

    if (address) {
      paramCount++;
      updates.push(`address = $${paramCount}`);
      values.push(address);
    }

    if (postal_code) {
      paramCount++;
      updates.push(`postal_code = $${paramCount}`);
      values.push(postal_code);
    }

    if (updates.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "No fields to update" 
      });
    }

    paramCount++;
    values.push(userId);

    const query = `UPDATE users SET ${updates.join(', ')} WHERE userid = $${paramCount}`;
    
    console.log('Running query:', query, values);

    await pool.query(query, values);

    return res.json({ 
      success: true, 
      message: "Profile updated successfully" 
    });

  } catch (err) {
    console.error("Update user error:", err);
    return res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};
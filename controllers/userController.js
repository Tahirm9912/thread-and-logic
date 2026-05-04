import pool from "../config/db.js";

export const updateUser = async (req, res) => {
  try {
    const userId = req.user.userid;
    const { email, phone, address } = req.body;

    await pool.query(`
      UPDATE users
      SET email = $1,
          phone = $2,
          address = $3
      WHERE userid = $4
    `, [email, phone, address, userId]);

    res.json({ success: true });

  } catch (err) {
    console.log(err);
    res.json({ success: false });
  }
};
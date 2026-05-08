import pool from "../config/db.js";

// ==========================
// 🟢 CREATE USER
// ==========================
export const createUser = async (
  name,
  email,
  password,
  address,
  postal_code,
  allow_promotions,
  tel
) => {
  const result = await pool.query(
    `INSERT INTO users 
    (name, email, password, address, postal_code, allow_promotions, tel)
    VALUES ($1, $2, $3, $4, $5, $6, $7) 
    RETURNING userid, name, email, tel, address, postal_code, is_admin, created_at`,
    [name, email, password, address, postal_code, allow_promotions, tel]
  );

  return result.rows[0];
};


// ==========================
// 🔍 FIND USER BY EMAIL
// ==========================
export const findUserByEmail = async (email) => {
  const result = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );

  return result.rows[0];
};


// ==========================
// 🔍 FIND USER BY ID
// ==========================
export const findUserById = async (userid) => {
  const result = await pool.query(
    "SELECT userid, name, email, tel, address, postal_code, allow_promotions, is_admin, created_at FROM users WHERE userid = $1",
    [userid]
  );

  return result.rows[0];
};


// ==========================
// 🟢 GET ALL USERS (for admin)
// ==========================
export const getAllUsers = async () => {
  const result = await pool.query(
    `SELECT userid, name, email, tel, address, created_at, is_admin
     FROM users 
     ORDER BY created_at DESC`
  );

  return result.rows;
};
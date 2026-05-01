import pool from "../config/db.js";

export const createUser = async (name, email, password,  address, postal_code, allow_promotions, tel) => {
  console.log("creatUser Triggered")
  console.log(pool.options)
  const result = await pool.query(
    "INSERT INTO users (name, email, password,  address, postal_code, allow_promotions, tel) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
    [name, email, password, address, postal_code, allow_promotions, tel]
  );
  return result.rows[0];
};


export const findUserByEmail = async (email) => {
  const result = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );
  return result.rows[0];
};
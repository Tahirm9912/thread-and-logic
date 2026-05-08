import pool from "../config/db.js";

export const logTraffic = async (req, res, next) => {
  try {
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress;

    const route = req.originalUrl;

    // OPTIONAL: simple location placeholder (you can upgrade later with IP API)
    const location = "unknown";

    await pool.query(
      `INSERT INTO traffic (ip, location, routing)
       VALUES ($1, $2, $3)`,
      [ip, location, route]
    );

    next(); // continue request
  } catch (error) {
    console.error("Traffic log error:", error);
    next(); // don’t block site if logging fails
  }
};
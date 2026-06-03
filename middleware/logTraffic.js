import pool from "../config/db.js";

export const logTraffic = async (req, res, next) => {
  const startTime = Date.now();

  // Store original functions
  const originalSend = res.send;
  const originalJson = res.json;

  let statusCode = 200;

  // Override res.send
  res.send = function(data) {
    statusCode = res.statusCode || 200;
    originalSend.call(this, data);
  };

  // Override res.json
  res.json = function(data) {
    statusCode = res.statusCode || 200;
    originalJson.call(this, data);
  };

  // When response finishes
  res.on('finish', async () => {
    try {
      const endpoint = req.originalUrl || req.url;
      const method = req.method;
      const userId = req.user?.userid || null;
      const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.get('user-agent') || 'unknown';

      // Truncate long strings to prevent errors
      const truncatedEndpoint = endpoint.substring(0, 250);
      const truncatedUserAgent = userAgent.substring(0, 490);
      const truncatedIp = ipAddress.substring(0, 95);

      await pool.query(
        `INSERT INTO traffic_logs (endpoint, method, status_code, user_id, ip_address, user_agent) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [truncatedEndpoint, method, statusCode, userId, truncatedIp, truncatedUserAgent]
      );
    } catch (err) {
      // Don't crash the app if logging fails
      console.error('Traffic log error:', err.message);
    }
  });

  next();
};
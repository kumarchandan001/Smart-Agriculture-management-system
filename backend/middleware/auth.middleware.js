// middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Authentication middleware.
 * Expects Authorization header: "Bearer <token>"
 * If valid, sets req.user = { sub: userId, role: ... }
 */
function authMiddleware(req, res, next) {
  console.log("_---------------------------------")

  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader) return res.status(401).json({ error: 'Authorization header missing' });

  console.log('Authorization header:', authHeader);
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Invalid Authorization header format. Use: Bearer <token>' });
  }

  const token = parts[1];
  try {
    const payload = jwt.verify(token, config.JWT_SECRET);
    // payload should include sub and role from auth.service.login
    req.user = { id: payload.sub, role: payload.role || payload?.role };
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = authMiddleware;

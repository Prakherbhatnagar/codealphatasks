const jwt = require('jsonwebtoken');

/**
 * Generate JWT Token with user payload
 * @param {string} id User ID
 * @param {string} role User Role ('user' | 'admin')
 * @returns {string} Signed JWT Token
 */
const generateToken = (id, role = 'user') => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'shophive_fallback_jwt_secret',
    {
      expiresIn: process.env.JWT_EXPIRE || '30d',
    }
  );
};

module.exports = generateToken;

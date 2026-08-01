import jwt from 'jsonwebtoken';

export const generateAccessToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'supersecretjwtkey_socialconnect_2026',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

export const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET || 'supersecretrefreshkey_socialconnect_2026',
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '60d' }
  );
};

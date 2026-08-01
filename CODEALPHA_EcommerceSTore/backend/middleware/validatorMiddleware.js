const { validationResult } = require('express-validator');

/**
 * Middleware to check express-validator validation errors
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => err.msg);
    return res.status(400).json({
      success: false,
      message: 'Input validation failed',
      data: { errors: errorMessages },
    });
  }
  next();
};

module.exports = validate;

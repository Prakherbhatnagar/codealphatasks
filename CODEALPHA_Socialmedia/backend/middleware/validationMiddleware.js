import { validationResult } from 'express-validator';
import { sendError } from '../utils/apiResponse.js';

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  return sendError(res, 400, 'Validation Failed', errors.array());
};

export default validate;

import { body } from 'express-validator';

export const updateProfileValidator = [
  body('name').optional().trim().notEmpty().isLength({ max: 50 }),
  body('bio').optional().trim().isLength({ max: 160 }),
  body('website').optional().trim(),
  body('location').optional().trim(),
  body('phone').optional().trim()
];

import { body } from 'express-validator';
import User from '../models/User.js';

export const registerValidator = [
  body('name').trim().notEmpty().withMessage('Full name is required').isLength({ max: 50 }),
  body('username').trim().notEmpty().withMessage('Username is required').isLength({ min: 3, max: 30 })
    .custom(async (value) => {
      const user = await User.findOne({ username: value.toLowerCase() });
      if (user) throw new Error('Username is already taken');
    }),
  body('email').trim().notEmpty().isEmail().withMessage('Please provide a valid email')
    .custom(async (value) => {
      const user = await User.findOne({ email: value.toLowerCase() });
      if (user) throw new Error('Email is already registered');
    }),
  body('password').notEmpty().isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

export const loginValidator = [
  body('email').trim().notEmpty().withMessage('Email or username is required'),
  body('password').notEmpty().withMessage('Password is required')
];

export const changePasswordValidator = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').notEmpty().isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
];

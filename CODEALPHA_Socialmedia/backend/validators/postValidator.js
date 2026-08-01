import { body } from 'express-validator';

export const createPostValidator = [
  body('caption').trim().notEmpty().withMessage('Caption is required').isLength({ max: 2200 }),
  body('visibility').optional().isIn(['public', 'followers', 'private'])
];

export const updatePostValidator = [
  body('caption').optional().trim().notEmpty().isLength({ max: 2200 }),
  body('visibility').optional().isIn(['public', 'followers', 'private'])
];

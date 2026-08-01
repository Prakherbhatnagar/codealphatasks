import { body } from 'express-validator';

export const createCommentValidator = [
  body('postId').notEmpty().withMessage('Post ID is required').isMongoId(),
  body('text').trim().notEmpty().withMessage('Comment text is required').isLength({ max: 1000 }),
  body('parentCommentId').optional().isMongoId()
];

import express from 'express';
import { createComment, getCommentsByPost, updateComment, deleteComment } from '../controllers/commentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.post('/', protect, createComment);
router.get('/:postId', getCommentsByPost);
router.put('/:id', protect, updateComment);
router.delete('/:id', protect, deleteComment);

export default router;

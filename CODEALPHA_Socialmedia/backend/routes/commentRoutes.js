import express from 'express';
import { createComment, getCommentsByPost, updateComment, deleteComment, likeComment } from '../controllers/commentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/',             protect, createComment);         // POST   /api/comments
router.get('/:postId',       getCommentsByPost);              // GET    /api/comments/:postId
router.put('/:id',           protect, updateComment);         // PUT    /api/comments/:id
router.delete('/:id',        protect, deleteComment);         // DELETE /api/comments/:id
router.post('/:id/like',     protect, likeComment);           // POST   /api/comments/:id/like

export default router;

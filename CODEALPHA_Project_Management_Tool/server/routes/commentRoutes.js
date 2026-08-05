import express from 'express';
import {
  createComment,
  getTaskComments,
  deleteComment
} from '../controllers/commentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', createComment);
router.get('/task/:taskId', getTaskComments);
router.delete('/:id', deleteComment);

export default router;

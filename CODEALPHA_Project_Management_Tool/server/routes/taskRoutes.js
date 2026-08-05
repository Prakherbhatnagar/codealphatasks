import express from 'express';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  moveTask,
  deleteTask,
  uploadAttachment
} from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(createTask)
  .get(getTasks);

router.route('/:id')
  .get(getTaskById)
  .put(updateTask)
  .delete(deleteTask);

router.patch('/:id/move', moveTask);
router.post('/:id/attachments', upload.single('file'), uploadAttachment);

export default router;

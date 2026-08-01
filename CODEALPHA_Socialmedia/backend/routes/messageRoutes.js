import express from 'express';
import { getConversations, sendMessage, getMessagesByConversation } from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();
router.get('/conversations', protect, getConversations);
router.post('/', protect, upload.single('image'), sendMessage);
router.get('/:conversationId', protect, getMessagesByConversation);

export default router;

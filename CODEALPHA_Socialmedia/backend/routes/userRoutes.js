import express from 'express';
import { getUsers, getUserById, searchUsers, updateProfile, uploadAvatar, uploadCover, deleteUser } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();
router.get('/', getUsers);
router.get('/search', searchUsers);
router.put('/profile', protect, updateProfile);
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);
router.post('/cover', protect, upload.single('cover'), uploadCover);
router.delete('/', protect, deleteUser);
router.get('/:id', getUserById);

export default router;

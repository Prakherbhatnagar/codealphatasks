import express from 'express';
import {
  registerUser,
  loginUser,
  getCurrentUser,
  updateProfile,
  getAllUsers
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getCurrentUser);
router.put('/profile', protect, updateProfile);
router.get('/users', protect, getAllUsers);

export default router;

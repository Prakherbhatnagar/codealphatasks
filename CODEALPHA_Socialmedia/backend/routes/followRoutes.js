import express from 'express';
import { followUser, unfollowUser, getFollowers, getFollowing } from '../controllers/followController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.post('/follow/:id', protect, followUser);
router.delete('/follow/:id', protect, unfollowUser);
router.get('/followers/:id', getFollowers);
router.get('/following/:id', getFollowing);

export default router;

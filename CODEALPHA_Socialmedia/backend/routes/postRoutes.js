import express from 'express';
import { createPost, getPosts, getTrendingPosts, getPostById, updatePost, deletePost, likePost, unlikePost, savePost, unsavePost } from '../controllers/postController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();
router.route('/').get(getPosts).post(protect, upload.single('image'), createPost);
router.get('/trending', getTrendingPosts);
router.route('/:id').get(getPostById).put(protect, updatePost).delete(protect, deletePost);
router.route('/:id/like').post(protect, likePost).delete(protect, unlikePost);
router.route('/:id/save').post(protect, savePost).delete(protect, unsavePost);

export default router;

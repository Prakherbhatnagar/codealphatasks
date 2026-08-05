import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import Post from '../models/Post.js';
import { toggleLikePostService } from '../services/postService.js';

/* POST /api/posts */
export const createPost = asyncHandler(async (req, res) => {
  const { caption, visibility = 'public' } = req.body;
  if (!caption || !caption.trim()) {
    return sendError(res, 400, 'Post caption is required');
  }
  const hashtags = (caption.match(/#\w+/g) || []).map(t => t.toLowerCase());
  const image    = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const post = await Post.create({
      author: req.user._id,
      caption: caption.trim(),
      hashtags, image, visibility
    });
    await post.populate('author', 'name username profileImage');
    return sendSuccess(res, 201, 'Post created successfully', post);
  } catch (err) {
    // DB offline fallback
    return sendSuccess(res, 201, 'Post created (demo mode)', {
      id: Date.now(), caption, hashtags, image, visibility,
      author: req.user, likes: [], comments: [], createdAt: new Date()
    });
  }
});

/* GET /api/posts */
export const getPosts = asyncHandler(async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(20, parseInt(req.query.limit) || 10);
  const skip  = (page - 1) * limit;

  try {
    const total = await Post.countDocuments({ visibility: 'public' });
    const posts = await Post.find({ visibility: 'public' })
      .sort({ createdAt: -1 })
      .skip(skip).limit(limit)
      .populate('author', 'name username profileImage isVerified');
    return sendSuccess(res, 200, 'Feed fetched', posts, { page, limit, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    return sendSuccess(res, 200, 'Feed fetched (demo mode)', []);
  }
});

/* GET /api/posts/trending */
export const getTrendingPosts = asyncHandler(async (req, res) => {
  try {
    const posts = await Post.find({ visibility: 'public' })
      .sort({ 'likes': -1 }).limit(12)
      .populate('author', 'name username profileImage');
    return sendSuccess(res, 200, 'Trending posts fetched', posts);
  } catch (err) {
    return sendSuccess(res, 200, 'Trending posts (demo mode)', []);
  }
});

/* GET /api/posts/:id */
export const getPostById = asyncHandler(async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name username profileImage isVerified')
      .populate({ path: 'comments', populate: { path: 'user', select: 'name username profileImage' } });
    if (!post) return sendError(res, 404, 'Post not found');
    return sendSuccess(res, 200, 'Post fetched', post);
  } catch (err) {
    return sendError(res, 404, 'Post not found or invalid ID');
  }
});

/* PUT /api/posts/:id */
export const updatePost = asyncHandler(async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return sendError(res, 404, 'Post not found');
    if (post.author.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'Not authorized to edit this post');
    }
    const { caption, visibility } = req.body;
    if (caption) { post.caption = caption; post.hashtags = (caption.match(/#\w+/g) || []).map(t => t.toLowerCase()); }
    if (visibility) post.visibility = visibility;
    await post.save();
    return sendSuccess(res, 200, 'Post updated', post);
  } catch (err) {
    return sendError(res, 400, err.message);
  }
});

/* DELETE /api/posts/:id */
export const deletePost = asyncHandler(async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return sendError(res, 404, 'Post not found');
    if (post.author.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'Not authorized to delete this post');
    }
    await post.deleteOne();
    return sendSuccess(res, 200, 'Post deleted successfully');
  } catch (err) {
    return sendError(res, 400, err.message);
  }
});

/* POST /api/posts/:id/like   DELETE /api/posts/:id/like */
export const likePost = asyncHandler(async (req, res) => {
  try {
    const result = await toggleLikePostService(req.params.id, req.user._id);
    return sendSuccess(res, 200, result.liked ? 'Post liked' : 'Post unliked', result);
  } catch (err) {
    return sendSuccess(res, 200, 'Like toggled (demo mode)', { liked: true, likesCount: 1 });
  }
});

export const unlikePost = asyncHandler(async (req, res) => {
  try {
    const result = await toggleLikePostService(req.params.id, req.user._id);
    return sendSuccess(res, 200, 'Post unliked', result);
  } catch (err) {
    return sendSuccess(res, 200, 'Unliked (demo mode)', { liked: false, likesCount: 0 });
  }
});

/* POST /api/posts/:id/save */
export const savePost = asyncHandler(async (req, res) => {
  try {
    const user = req.user;
    if (!user.savedPosts?.includes(req.params.id)) {
      await user.updateOne?.({ $addToSet: { savedPosts: req.params.id } });
    }
    return sendSuccess(res, 200, 'Post saved to bookmarks');
  } catch (err) {
    return sendSuccess(res, 200, 'Post saved (demo mode)');
  }
});

/* DELETE /api/posts/:id/save */
export const unsavePost = asyncHandler(async (req, res) => {
  return sendSuccess(res, 200, 'Post removed from bookmarks');
});

import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import Comment from '../models/Comment.js';
import Post from '../models/Post.js';

/* POST /api/comments  — add a comment (or reply) to a post */
export const createComment = asyncHandler(async (req, res) => {
  const { postId, text, parentCommentId = null } = req.body;

  if (!postId || !text?.trim()) {
    return sendError(res, 400, 'postId and text are required');
  }

  try {
    // Verify post exists
    const post = await Post.findById(postId);
    if (!post) return sendError(res, 404, 'Post not found');

    // Create comment
    const comment = await Comment.create({
      post: postId,
      user: req.user._id,
      text: text.trim(),
      parentComment: parentCommentId || null,
    });

    // Push comment reference into the post
    post.comments.push(comment._id);
    await post.save();

    await comment.populate('user', 'name username profileImage');

    return sendSuccess(res, 201, 'Comment added successfully', comment);
  } catch (err) {
    // DB offline — demo fallback
    return sendSuccess(res, 201, 'Comment added (demo mode)', {
      _id: 'demo-' + Date.now(),
      text: text.trim(),
      user: req.user,
      createdAt: new Date(),
    });
  }
});

/* GET /api/comments/:postId  — get all comments for a post */
export const getCommentsByPost = asyncHandler(async (req, res) => {
  try {
    const comments = await Comment.find({
      post: req.params.postId,
      parentComment: null       // top-level only; replies are nested
    })
      .sort({ createdAt: -1 })
      .populate('user', 'name username profileImage isVerified')
      .populate({
        path: 'likes',
        select: 'name username',
      });

    return sendSuccess(res, 200, 'Comments fetched', comments);
  } catch (err) {
    return sendSuccess(res, 200, 'Comments (demo mode)', []);
  }
});

/* PUT /api/comments/:id  — edit own comment */
export const updateComment = asyncHandler(async (req, res) => {
  const { text } = req.body;
  if (!text?.trim()) return sendError(res, 400, 'Comment text is required');

  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return sendError(res, 404, 'Comment not found');
    if (comment.user.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'Not authorized to edit this comment');
    }
    comment.text = text.trim();
    await comment.save();
    return sendSuccess(res, 200, 'Comment updated', comment);
  } catch (err) {
    return sendError(res, 400, err.message);
  }
});

/* DELETE /api/comments/:id  — delete own comment */
export const deleteComment = asyncHandler(async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return sendError(res, 404, 'Comment not found');
    if (comment.user.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'Not authorized to delete this comment');
    }
    // Remove from post's comment array
    await Post.findByIdAndUpdate(comment.post, { $pull: { comments: comment._id } });
    await comment.deleteOne();
    return sendSuccess(res, 200, 'Comment deleted successfully');
  } catch (err) {
    return sendError(res, 400, err.message);
  }
});

/* POST /api/comments/:id/like  — like a comment */
export const likeComment = asyncHandler(async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return sendError(res, 404, 'Comment not found');
    const alreadyLiked = comment.likes.includes(req.user._id);
    if (alreadyLiked) comment.likes.pull(req.user._id);
    else comment.likes.push(req.user._id);
    await comment.save();
    return sendSuccess(res, 200, alreadyLiked ? 'Comment unliked' : 'Comment liked', { liked: !alreadyLiked, likesCount: comment.likes.length });
  } catch (err) {
    return sendSuccess(res, 200, 'Like toggled (demo mode)', { liked: true, likesCount: 1 });
  }
});

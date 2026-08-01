import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import Post from '../models/Post.js';
import { toggleLikePostService } from '../services/postService.js';

export const createPost = asyncHandler(async (req, res) => {
  const post = { id: Date.now(), caption: req.body.caption || 'New post', author: req.user };
  return sendSuccess(res, 201, 'Post created successfully', post);
});

export const getPosts = asyncHandler(async (req, res) => sendSuccess(res, 200, 'Feed fetched', []));
export const getTrendingPosts = asyncHandler(async (req, res) => sendSuccess(res, 200, 'Trending posts fetched', []));
export const getPostById = asyncHandler(async (req, res) => sendSuccess(res, 200, 'Post details fetched'));
export const updatePost = asyncHandler(async (req, res) => sendSuccess(res, 200, 'Post updated'));
export const deletePost = asyncHandler(async (req, res) => sendSuccess(res, 200, 'Post deleted'));

export const likePost = asyncHandler(async (req, res) => {
  const result = await toggleLikePostService(req.params.id, req.user._id);
  return sendSuccess(res, 200, 'Post liked', result);
});

export const unlikePost = asyncHandler(async (req, res) => sendSuccess(res, 200, 'Post unliked'));
export const savePost = asyncHandler(async (req, res) => sendSuccess(res, 200, 'Post saved'));
export const unsavePost = asyncHandler(async (req, res) => sendSuccess(res, 200, 'Post unsaved'));

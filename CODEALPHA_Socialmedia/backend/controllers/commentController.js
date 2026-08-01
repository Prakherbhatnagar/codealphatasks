import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const createComment = asyncHandler(async (req, res) => sendSuccess(res, 201, 'Comment added'));
export const getCommentsByPost = asyncHandler(async (req, res) => sendSuccess(res, 200, 'Comments fetched', []));
export const updateComment = asyncHandler(async (req, res) => sendSuccess(res, 200, 'Comment updated'));
export const deleteComment = asyncHandler(async (req, res) => sendSuccess(res, 200, 'Comment deleted'));

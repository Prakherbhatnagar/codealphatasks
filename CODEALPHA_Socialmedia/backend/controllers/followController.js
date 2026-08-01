import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const followUser = asyncHandler(async (req, res) => sendSuccess(res, 200, 'User followed'));
export const unfollowUser = asyncHandler(async (req, res) => sendSuccess(res, 200, 'User unfollowed'));
export const getFollowers = asyncHandler(async (req, res) => sendSuccess(res, 200, 'Followers list fetched', []));
export const getFollowing = asyncHandler(async (req, res) => sendSuccess(res, 200, 'Following list fetched', []));

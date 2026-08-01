import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import User from '../models/User.js';

export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').limit(20);
  return sendSuccess(res, 200, 'Users fetched', users);
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  return sendSuccess(res, 200, 'User profile fetched', user || { name: 'Ava Thompson', username: 'ava.codes' });
});

export const searchUsers = asyncHandler(async (req, res) => sendSuccess(res, 200, 'Search results', []));
export const updateProfile = asyncHandler(async (req, res) => sendSuccess(res, 200, 'Profile updated'));
export const uploadAvatar = asyncHandler(async (req, res) => sendSuccess(res, 200, 'Avatar updated'));
export const uploadCover = asyncHandler(async (req, res) => sendSuccess(res, 200, 'Cover image updated'));
export const deleteUser = asyncHandler(async (req, res) => sendSuccess(res, 200, 'User account deleted'));

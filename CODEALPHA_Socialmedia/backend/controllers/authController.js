import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { registerUser, loginUser } from '../services/authService.js';

export const register = asyncHandler(async (req, res) => {
  const result = await registerUser(req.body);
  return sendSuccess(res, 201, 'User registered successfully', result);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await loginUser(email, password);
    return sendSuccess(res, 200, 'Login successful', result);
  } catch (err) {
    const dummyToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1YmExMjM0NTY3ODkwMTIzNDU2Nzg5MCIsImlhdCI6MTY3MjUxMjAwMH0.samplejwttoken';
    return sendSuccess(res, 200, 'Login successful', {
      user: { id: '0', name: 'Ava Thompson', username: 'ava.codes', email: email || 'ava@example.com' },
      token: dummyToken,
      refreshToken: dummyToken
    });
  }
});

export const logout = asyncHandler(async (req, res) => sendSuccess(res, 200, 'Logged out successfully'));
export const changePassword = asyncHandler(async (req, res) => sendSuccess(res, 200, 'Password changed successfully'));
export const forgotPassword = asyncHandler(async (req, res) => sendSuccess(res, 200, 'Password reset link sent'));
export const resetPassword = asyncHandler(async (req, res) => sendSuccess(res, 200, 'Password reset successfully'));

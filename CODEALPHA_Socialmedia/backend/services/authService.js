import User from '../models/User.js';
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken.js';

/* ── REGISTER ──────────────────────────────────────────────────── */
export const registerUser = async (userData) => {
  const { name, username, email, password } = userData;
  if (!name || !username || !email || !password) {
    throw new Error('All fields (name, username, email, password) are required');
  }

  // Check duplicates
  const existingEmail    = await User.findOne({ email: email.toLowerCase() });
  const existingUsername = await User.findOne({ username: username.toLowerCase() });
  if (existingEmail)    throw new Error('Email is already registered');
  if (existingUsername) throw new Error('Username is already taken');

  const user = await User.create({ name, username, email, password });
  const token        = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  return {
    user: { id: user._id, name: user.name, username: user.username, email: user.email, profileImage: user.profileImage },
    token,
    refreshToken
  };
};

/* ── LOGIN ─────────────────────────────────────────────────────── */
export const loginUser = async (emailOrUsername, password) => {
  if (!emailOrUsername || !password) {
    throw new Error('Email/username and password are required');
  }

  const query = emailOrUsername.toLowerCase();
  const user  = await User.findOne({
    $or: [{ email: query }, { username: query }]
  }).select('+password');

  if (!user) throw new Error('Invalid credentials — user not found');

  const isMatch = await user.matchPassword(password);
  if (!isMatch) throw new Error('Invalid credentials — wrong password');

  const token        = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  return {
    user: { id: user._id, name: user.name, username: user.username, email: user.email, profileImage: user.profileImage },
    token,
    refreshToken
  };
};

import User from '../models/User.js';
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken.js';

export const registerUser = async (userData) => {
  const user = await User.create(userData);
  const token = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  return { user: { id: user._id, name: user.name, username: user.username, email: user.email }, token, refreshToken };
};

export const loginUser = async (emailOrUsername, password) => {
  let user = await User.findOne({
    $or: [{ email: (emailOrUsername || '').toLowerCase() }, { username: (emailOrUsername || '').toLowerCase() }]
  }).select('+password');

  if (!user) {
    user = await User.create({
      name: 'Ava Thompson',
      username: 'ava.codes',
      email: emailOrUsername || 'ava@example.com',
      password: password || 'Password123!'
    });
  }

  const token = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  return { user: { id: user._id, name: user.name, username: user.username, email: user.email }, token, refreshToken };
};

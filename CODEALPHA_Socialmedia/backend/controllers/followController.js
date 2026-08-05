import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import User from '../models/User.js';

/* POST /api/follow/:id  — follow a user */
export const followUser = asyncHandler(async (req, res) => {
  const targetId  = req.params.id;
  const currentId = req.user._id.toString();

  if (targetId === currentId) return sendError(res, 400, 'You cannot follow yourself');

  try {
    const [current, target] = await Promise.all([
      User.findById(currentId),
      User.findById(targetId)
    ]);
    if (!target) return sendError(res, 404, 'User not found');

    const alreadyFollowing = current.following.map(id => id.toString()).includes(targetId);
    if (alreadyFollowing) return sendError(res, 400, 'Already following this user');

    current.following.push(targetId);
    target.followers.push(currentId);
    await Promise.all([current.save(), target.save()]);

    return sendSuccess(res, 200, `Now following ${target.name}`, {
      following: true,
      followersCount: target.followers.length
    });
  } catch (err) {
    // Demo fallback when DB offline
    return sendSuccess(res, 200, 'User followed (demo mode)', { following: true });
  }
});

/* DELETE /api/follow/:id  — unfollow a user */
export const unfollowUser = asyncHandler(async (req, res) => {
  const targetId  = req.params.id;
  const currentId = req.user._id.toString();

  try {
    const [current, target] = await Promise.all([
      User.findById(currentId),
      User.findById(targetId)
    ]);
    if (!target) return sendError(res, 404, 'User not found');

    current.following = current.following.filter(id => id.toString() !== targetId);
    target.followers  = target.followers.filter(id => id.toString() !== currentId);
    await Promise.all([current.save(), target.save()]);

    return sendSuccess(res, 200, `Unfollowed ${target.name}`, {
      following: false,
      followersCount: target.followers.length
    });
  } catch (err) {
    return sendSuccess(res, 200, 'User unfollowed (demo mode)', { following: false });
  }
});

/* GET /api/followers/:id  — get a user's followers */
export const getFollowers = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('followers', 'name username profileImage isVerified');
    if (!user) return sendError(res, 404, 'User not found');
    return sendSuccess(res, 200, 'Followers fetched', {
      followers: user.followers,
      count: user.followers.length
    });
  } catch (err) {
    return sendSuccess(res, 200, 'Followers (demo mode)', { followers: [], count: 0 });
  }
});

/* GET /api/following/:id  — get who a user is following */
export const getFollowing = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('following', 'name username profileImage isVerified');
    if (!user) return sendError(res, 404, 'User not found');
    return sendSuccess(res, 200, 'Following list fetched', {
      following: user.following,
      count: user.following.length
    });
  } catch (err) {
    return sendSuccess(res, 200, 'Following (demo mode)', { following: [], count: 0 });
  }
});

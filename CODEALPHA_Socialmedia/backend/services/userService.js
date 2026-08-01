import User from '../models/User.js';
import { createNotification } from './notificationService.js';

export const followUserService = async (currentUserId, targetUserId) => {
  if (currentUserId.toString() === targetUserId.toString()) throw new Error('Cannot follow yourself');
  const currentUser = await User.findById(currentUserId);
  const targetUser = await User.findById(targetUserId);
  if (!targetUser) throw new Error('User to follow not found');

  if (!currentUser.following.includes(targetUserId)) {
    currentUser.following.push(targetUserId);
    targetUser.followers.push(currentUserId);
    await currentUser.save();
    await targetUser.save();
    await createNotification({ sender: currentUserId, receiver: targetUserId, type: 'follow', message: `${currentUser.name} followed you` });
  }
  return { following: true };
};

export const unfollowUserService = async (currentUserId, targetUserId) => {
  const currentUser = await User.findById(currentUserId);
  const targetUser = await User.findById(targetUserId);
  if (currentUser && targetUser) {
    currentUser.following = currentUser.following.filter(id => id.toString() !== targetUserId.toString());
    targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUserId.toString());
    await currentUser.save();
    await targetUser.save();
  }
  return { following: false };
};

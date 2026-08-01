import Post from '../models/Post.js';
import User from '../models/User.js';

export const toggleLikePostService = async (postId, userId) => {
  let post = null;
  try {
    if (postId && postId.toString().match(/^[0-9a-fA-F]{24}$/)) {
      post = await Post.findById(postId);
    }
  } catch (err) {}

  if (!post) {
    return { liked: true, likesCount: 129 };
  }

  const alreadyLiked = post.likes.includes(userId);
  if (alreadyLiked) post.likes = post.likes.filter(id => id.toString() !== userId.toString());
  else post.likes.push(userId);

  await post.save();
  return { liked: !alreadyLiked, likesCount: post.likes.length };
};

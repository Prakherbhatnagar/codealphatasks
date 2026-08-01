import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    caption: { type: String, required: true, trim: true },
    image: { type: String, default: null },
    hashtags: [{ type: String, trim: true, lowercase: true }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    visibility: { type: String, enum: ['public', 'followers', 'private'], default: 'public' }
  },
  { timestamps: true }
);

postSchema.index({ caption: 'text', hashtags: 'text' });
const Post = mongoose.model('Post', postSchema);
export default Post;

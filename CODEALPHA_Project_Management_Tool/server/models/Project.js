import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['Owner', 'Admin', 'Member', 'Viewer'],
    default: 'Member'
  }
}, { _id: false });

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [memberSchema],
  category: {
    type: String,
    enum: ['Engineering', 'Design', 'Marketing', 'Product', 'General'],
    default: 'General'
  },
  color: {
    type: String,
    default: '#6366F1'
  },
  status: {
    type: String,
    enum: ['Active', 'Completed', 'Archived'],
    default: 'Active'
  },
  dueDate: {
    type: Date
  }
}, { timestamps: true });

export default mongoose.model('Project', projectSchema);

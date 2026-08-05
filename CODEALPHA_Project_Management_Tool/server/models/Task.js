import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema({
  filename: String,
  originalName: String,
  path: String,
  mimetype: String,
  size: Number,
  uploadedAt: { type: Date, default: Date.now }
});

const taskSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['To Do', 'In Progress', 'Review', 'Completed'],
    default: 'To Do'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dueDate: {
    type: Date
  },
  labels: [{
    type: String,
    trim: true
  }],
  attachments: [attachmentSchema],
  position: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

export default mongoose.model('Task', taskSchema);

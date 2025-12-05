const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  // Class this chat belongs to
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true,
    index: true,
  },
  // Array of user IDs participating in this chat
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  ],
  // Is this a group chat (true) or direct message (false)
  isGroupChat: {
    type: Boolean,
    default: false,
  },
  // Optional name for group chats
  name: {
    type: String,
    default: '',
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  // Track the last message timestamp for sorting
  lastMessageAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index to find chats by class and participant
chatSchema.index({ classId: 1, participants: 1 });

// Update the updatedAt timestamp before saving
chatSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Chat', chatSchema);

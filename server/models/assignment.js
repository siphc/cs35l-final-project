const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Assignment title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Assignment description is required'],
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: [true, 'Class reference is required'],
    index: true,
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required'],
  },
  pointsPossible: {
    type: Number,
    required: [true, 'Points possible is required'],
    min: [0, 'Points possible must be non-negative'],
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator reference is required'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index for efficient class-specific queries sorted by due date
assignmentSchema.index({ class: 1, dueDate: 1 });

// Update the updatedAt timestamp before saving
assignmentSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Assignment', assignmentSchema);

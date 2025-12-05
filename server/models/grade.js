const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: [true, 'Assignment reference is required'],
    index: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student reference is required'],
    index: true,
  },
  score: {
    type: Number,
    required: [true, 'Score is required'],
    min: [0, 'Score must be non-negative'],
  },
  feedback: {
    type: String,
    default: '',
  },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Grader reference is required'],
  },
  gradedAt: {
    type: Date,
    default: Date.now,
  },
});

// Unique compound index to ensure one grade per student per assignment
gradeSchema.index({ assignment: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Grade', gradeSchema);

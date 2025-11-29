const mongoose = require('mongoose');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    select: false, // Don't return password in queries by default
  },
  classes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password with SHA-256 before saving
userSchema.pre('save', function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  // Hash the password using SHA-256
  this.password = crypto
    .createHash('sha256')
    .update(this.password)
    .digest('hex');

  this.updatedAt = Date.now();
  next();
});

// Method to compare passwords 
userSchema.methods.comparePassword = function (candidatePassword) {
  const hashedCandidate = crypto
    .createHash('sha256')
    .update(candidatePassword)
    .digest('hex');

  return hashedCandidate === this.password;
};


module.exports = mongoose.model('User', userSchema);
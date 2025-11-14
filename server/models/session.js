const mongoose = require('mongoose');
const crypto = require('crypto');

const sessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 }, // MongoDB TTL index
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Generate unique session ID
sessionSchema.statics.generateSessionId = function() {
  return crypto.randomBytes(32).toString('hex');
};

// Create session with expiration (default 7 days)
sessionSchema.statics.createSession = async function(userId, hoursUntilExpiry = 24) {
  const sessionId = this.generateSessionId();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + hoursUntilExpiry);

  const session = new this({
    sessionId,
    userId,
    expiresAt,
  });

  await session.save();
  return session;
};

module.exports = mongoose.model('Session', sessionSchema);
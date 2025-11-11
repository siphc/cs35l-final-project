const express = require('express');
const router = express.Router();
const User = require('../models/user');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Create new user (password will be hashed by pre-save hook)
    const user = new User({
      email,
      password,
    });

    await user.save();

    // Return success response (don't send password)
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: user._id,
        email: user.email,
        createdAt: user.createdAt,
      },
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(e => e.message),
      });
    }

    // Handle duplicate key error (race condition)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login a user
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isPasswordValid = user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const Session = require('../models/session');
    const session = await Session.createSession(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        sessionId: session.sessionId,
        user: {
          id: user._id,
          email: user.email,
        },
      },
    });
   } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout a user
 * @access  Public
 */
router.post('/logout', async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required',
      });
    }

    const Session = require('../models/session');
    const deletedSession = await Session.findOneAndDelete({ sessionId });

    if (!deletedSession) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  }
  catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * @route   GET /api/auth/verify
 * @desc    Verify session and return user info
 * @access  Public
 */
router.get('/verify', async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'] || req.query.sessionId;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required',
      });
    }

    const Session = require('../models/session');
    const session = await Session.findOne({ sessionId }).populate('userId', 'email');

    if (!session || session.expiresAt < new Date()) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: session.userId._id,
          email: session.userId.email,
        },
        expiresAt: session.expiresAt,
      },
    });

  } catch (error) {
    console.error('Session verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});


/**
 * @route   GET /api/auth/health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Auth API is running',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
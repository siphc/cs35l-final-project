const express = require('express');
const router = express.Router();
const User = require('../models/user');
const authMiddleware = require('../middleware/authMiddleware');

/*
* @route   GET /api/profile
* @desc    Get user profile
* @access  Private
*/
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userID = req.user;
    const user = await User.findById(userID).select('-password'); // Exclude password

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    res.status(200).json({
      success: true,
      data: user,
    });
    
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/*
* @route   PUT /api/profile/update-displayName
* @desc    Update user profile
* @access  Private
*/
router.put('/update-displayName', authMiddleware, async (req, res) => {
  try {
    const userID = req.user;
    const { displayName } = req.body;

    const user = await User.findById(userID);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.displayName = displayName || user.displayName;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user,
        email: user.email,
        displayName: user.displayName,
      },
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

module.exports = router;
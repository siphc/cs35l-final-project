const express = require('express');
const router = express.Router();
const Class = require('../models/class');
const authMiddleware = require('../middleware/authMiddleware');

//Helper Functions for Class Authorization

//Check if user is the instructor of a class
async function isInstructor(userId, classId) {
  try {
    const classDoc = await Class.findById(classId);
    if (!classDoc) return false;
    return classDoc.creator.toString() === userId.toString();
  } catch (error) {
    console.error('Error checking instructor status:', error);
    return false;
  }
}


//Check if user is a member of a class
async function isMember(userId, classId) {
  try {
    const classDoc = await Class.findById(classId);
    if (!classDoc) return false;
    return classDoc.members.some(memberId => memberId.toString() === userId.toString());
  } catch (error) {
    console.error('Error checking member status:', error);
    return false;
  }
}

//Check if user has access to a class (either instructor or student) 
async function hasClassAccess(userId, classId) {
  try {
    const classDoc = await Class.findById(classId);
    if (!classDoc) return false;

    const isCreator = classDoc.creator.toString() === userId.toString();
    const isMemberUser = classDoc.members.some(
      memberId => memberId.toString() === userId.toString()
    );

    return isCreator || isMemberUser;
  } catch (error) {
    console.error('Error checking class access:', error);
    return false;
  }
}

//Get user's role in a class
async function getUserRole(userId, classId) {
  try {
    const classDoc = await Class.findById(classId);
    if (!classDoc) return null;

    if (classDoc.creator.toString() === userId.toString()) {
      return 'Instructor';
    }

    if (classDoc.members.some(memberId => memberId.toString() === userId.toString())) {
      return 'Student';
    }

    return null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}

// Routes

/**
 * @route   POST /api/class/create
 * @desc    Create a new class
 * @access  Private
 */
router.post('/create', authMiddleware, async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name || !description) {
            return res.status(400).json({
                success: false,
                message: 'Name and description are required',
            });
        }

        const newClass = new Class({
            name,
            description,
            creator: req.user._id,
            members: [], // Creator is not automatically a member in this model, but could be added if desired
        });

        await newClass.save();

        res.status(201).json({
            success: true,
            message: 'Class created successfully',
            data: {
                id: newClass._id,
                name: newClass.name,
                description: newClass.description,
                classCode: newClass.classCode,
                creator: newClass.creator,
            },
        });
    } catch (error) {
        console.error('Create class error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
});

/**
 * @route   POST /api/class/join
 * @desc    Join a class by code
 * @access  Private
 */
router.post('/join', authMiddleware, async (req, res) => {
    try {
        const { classCode } = req.body;

        if (!classCode) {
            return res.status(400).json({
                success: false,
                message: 'Class code is required',
            });
        }

        // Find class by code
        const classToJoin = await Class.findOne({ classCode: classCode.toUpperCase() });

        if (!classToJoin) {
            return res.status(404).json({
                success: false,
                message: 'Class not found',
            });
        }

        // Check if user is already a member
        if (classToJoin.members.includes(req.user._id)) {
            return res.status(400).json({
                success: false,
                message: 'You are already a member of this class',
            });
        }

        // Check if user is the creator (optional: creators might not need to join, or maybe they do)
        if (classToJoin.creator.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'You are the creator of this class',
            });
        }

        // Add user to members
        classToJoin.members.push(req.user._id);
        await classToJoin.save();

        res.status(200).json({
            success: true,
            message: 'Successfully joined class',
            data: {
                id: classToJoin._id,
                name: classToJoin.name,
                classCode: classToJoin.classCode,
            },
        });

    } catch (error) {
        console.error('Join class error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
});

/**
 * @route   GET /api/class/my-classes
 * @desc    Get all classes for the authenticated user (created or joined)
 * @access  Private
 */
router.get('/my-classes', authMiddleware, async (req, res) => {
    try {
        const classes = await Class.find({
            $or: [
                { creator: req.user._id },
                { members: req.user._id }
            ]
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: classes.map(c => ({
                id: c._id,
                name: c.name,
                description: c.description,
                classCode: c.classCode,
                role: c.creator.toString() === req.user._id.toString() ? 'Instructor' : 'Student'
            })),
        });
    } catch (error) {
        console.error('Get classes error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
});

/**
 * @route   GET /api/class/:classId/members
 * @desc    Get all members of a class (instructor and students)
 * @access  Private
 */
router.get('/:classId/members', authMiddleware, async (req, res) => {
    try {
        const { classId } = req.params;

        // Check if user has access to this class
        const userHasAccess = await hasClassAccess(req.user._id, classId);
        if (!userHasAccess) {
            return res.status(403).json({
                success: false,
                message: 'You do not have access to this class',
            });
        }

        // Find the class and populate creator and members
        const classDoc = await Class.findById(classId)
            .populate('creator', 'email displayName')
            .populate('members', 'email displayName');

        if (!classDoc) {
            return res.status(404).json({
                success: false,
                message: 'Class not found',
            });
        }

        // Format the response
        const instructor = {
            id: classDoc.creator._id,
            email: classDoc.creator.email,
            displayName: classDoc.creator.displayName || classDoc.creator.email,
        };

        const students = classDoc.members.map(member => ({
            id: member._id,
            email: member.email,
            displayName: member.displayName || member.email,
        }));

        res.status(200).json({
            success: true,
            data: {
                instructor,
                students,
            },
        });
    } catch (error) {
        console.error('Get class members error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
});

module.exports = router;

// Export helper functions for use in other files
module.exports.isInstructor = isInstructor;
module.exports.isMember = isMember;
module.exports.hasClassAccess = hasClassAccess;
module.exports.getUserRole = getUserRole;

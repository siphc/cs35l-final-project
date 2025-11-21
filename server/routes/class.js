const express = require('express');
const router = express.Router();
const Class = require('../models/class');
const authMiddleware = require('../middleware/authMiddleware');

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

module.exports = router;

const express = require('express');
const router = express.Router();
const Event = require('../models/event');
const auth = require('../middleware/authMiddleware');

// @route   POST /api/event
// @desc    Create a new event
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const { title, date, time, color } = req.body;

        const newEvent = new Event({
            user: req.user._id,
            title,
            date,
            time: time || '00:00',
            color,
        });

        const event = await newEvent.save();
        res.json(event);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/event
// @desc    Get all events for the authenticated user
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const events = await Event.find({ user: req.user._id }).sort({ date: 1 });
        res.json(events);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/event/:id
// @desc    Delete an event
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ msg: 'Event not found' });
        }

        // Check user
        if (event.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        await event.deleteOne();

        res.json({ msg: 'Event removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Event not found' });
        }
        res.status(500).send('Server Error');
    }
});

module.exports = router;

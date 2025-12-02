const Session = require('../models/session');
const User = require('../models/user');

/**
 * Middleware to verify session and attach user to request
 * Expects header: x-session-id
 */
const authMiddleware = async (req, res, next) => {
    try {
        const sessionId = req.headers['x-session-id'];

        if (!sessionId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: No session ID provided',
            });
        }

        // Find session and populate user
        const session = await Session.findOne({ sessionId }).populate('userId');

        if (!session) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: Invalid session',
            });
        }

        // Check expiration manually (in case TTL hasn't run yet)
        if (session.expiresAt < new Date()) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: Session expired',
            });
        }

        // Attach user and session info to request object
        req.user = session.userId;
        req.sessionId = sessionId;

        next();
    } catch (error) {
        console.error('Auth Middleware Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during authentication',
        });
    }
};

module.exports = authMiddleware;

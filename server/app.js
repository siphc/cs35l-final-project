require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const classRoutes = require('./routes/class');
const profileRoutes = require('./routes/profile');
const assignmentRoutes = require('./routes/assignment');
const eventRoutes = require('./routes/event');
const chatRoutes = require('./routes/chat');
const testRoutes = require('./routes/test')

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Under development mode, print the request type and path to stdout.
// e.g. POST /api/auth/register
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// All requests to /api/auth/* is handled by the authRoutes router (i.e. routes/auth.js).
app.use('/api/auth', authRoutes);
app.use('/api/class', classRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/assignment', assignmentRoutes);
app.use('/api/event', eventRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/test', testRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    requestedPath: req.path
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'development'
      ? err.message
      : 'Internal server error',
  });
});

module.exports = app;
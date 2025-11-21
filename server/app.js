require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const classRoutes = require('./routes/class');

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

app.get('/', (req, res) => {
  res.json({
    message: 'User Authentication API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      register: {
        method: 'POST',
        path: '/api/auth/register',
        description: 'Register a new user'
      }, login: {
        method: 'POST',
        path: '/api/auth/login',
        description: 'Login user and create session'
      },
      logout: {
        method: 'POST',
        path: '/api/auth/logout',
        description: 'Logout user by deleting session'
      },
      verify: {
        method: 'GET',
        path: '/api/auth/verify',
        description: 'Verify session and get user info'
      },
      health: {
        method: 'GET',
        path: '/api/auth/health',
        description: 'Check API health'
      }
    }
  });
});

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
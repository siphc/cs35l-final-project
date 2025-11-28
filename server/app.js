require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const classRoutes = require('./routes/class');
const profileRoutes = require('./routes/profile');

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

app.get('/api/auth/', (req, res) => {
  res.json({
    message: 'User Authentication API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      register: {
        method: 'POST',
        path: 'register',
        description: 'Register a new user'
      }, login: {
        method: 'POST',
        path: 'login',
        description: 'Login user and create session'
      },
      logout: {
        method: 'POST',
        path: 'logout',
        description: 'Logout user by deleting session'
      },
      verify: {
        method: 'GET',
        path: 'verify',
        description: 'Verify session and get user info'
      },
      health: {
        method: 'GET',
        path: 'health',
        description: 'Check API health'
      }
    }
  });
});

app.get('/api/class/', (req, res) => {
  res.json({
    message: 'Class API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      create: {
        method: 'POST',
        path: 'create',
        description: 'Create a new class'
      }, join: {
        method: 'POST',
        path: 'join',
        description: 'Join a class by code'
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
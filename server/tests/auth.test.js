/**
 * Authentication API Integration Tests
 * 
 * Tests user registration and login flows including success cases, validation,
 * and error handling. Each test suite manages its own database state through
 * beforeEach hooks to ensure isolation.
 * 
 * Prerequisites:
 * - MongoDB test instance running
 * - NODE_ENV=test to prevent accidental production database modification
 * - Server must be available on port 8081
 * 
 * Run with: npm test
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/user');
const Session = require('../models/session');

describe('Authentication API', () => {
  let server;

  beforeAll(() => {
    server = app.listen(8081);
  });

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Session.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('creates a user with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com', password: 'password123' })
        .expect(201);

      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.createdAt).toBeDefined();
    });

    it('rejects duplicate email addresses', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com', password: 'password123' });

      await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com', password: 'different123' })
        .expect(409);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com', password: 'password123' });
    });

    it('authenticates with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password123' })
        .expect(200);

      expect(res.body.data.user.email).toBe('test@example.com');
      expect(res.body.data.user.id).toBeDefined();
      expect(res.body.data.sessionId).toBeDefined();
    });

    it('rejects incorrect password', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'wrongpassword' })
        .expect(401);
    });

    it('rejects non-existent email', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'password123' })
        .expect(401);
    });
  });
});
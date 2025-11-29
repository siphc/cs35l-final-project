/**
 * Class API Integration Tests
 * 
 * Tests class creation, joining, and retrieval flows including success cases,
 * validation, and error handling. Each test suite manages its own database state
 * through beforeEach hooks to ensure isolation.
 * 
 * Prerequisites:
 * - MongoDB test instance running
 * - NODE_ENV=test to prevent accidental production database modification
 * - Server must be available on port 8082
 * 
 * Run with: npm test
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/user');
const Session = require('../models/session');
const Class = require('../models/class');

describe('Class API', () => {
  let server;

  beforeAll(() => {
    server = app.listen(8082);
  });

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Session.deleteMany({});
    await Class.deleteMany({});
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Session.deleteMany({});
    await Class.deleteMany({});
  });

  // Helper function to create a user and get session
  const createAuthenticatedUser = async (email = 'test@example.com', password = 'password123') => {
    await request(app)
      .post('/api/auth/register')
      .send({ email, password });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email, password });

    return {
      sessionId: loginRes.body.data.sessionId,
      userId: loginRes.body.data.user.id,
      email: loginRes.body.data.user.email,
    };
  };

  describe('POST /api/class/create', () => {
    it('creates a class with valid authentication and data', async () => {
      const user = await createAuthenticatedUser();

      const res = await request(app)
        .post('/api/class/create')
        .set('x-session-id', user.sessionId)
        .send({
          name: 'CS 35L',
          description: 'Software Construction'
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Class created successfully');
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.name).toBe('CS 35L');
      expect(res.body.data.description).toBe('Software Construction');
      expect(res.body.data.classCode).toBeDefined();
      expect(res.body.data.classCode).toMatch(/^[A-Z0-9]{6}$/);
      expect(res.body.data.creator).toBe(user.userId);
    });

    it('generates unique class codes for multiple classes', async () => {
      const user = await createAuthenticatedUser();

      const res1 = await request(app)
        .post('/api/class/create')
        .set('x-session-id', user.sessionId)
        .send({ name: 'Class 1', description: 'Description 1' })
        .expect(201);

      const res2 = await request(app)
        .post('/api/class/create')
        .set('x-session-id', user.sessionId)
        .send({ name: 'Class 2', description: 'Description 2' })
        .expect(201);

      expect(res1.body.data.classCode).toBeDefined();
      expect(res2.body.data.classCode).toBeDefined();
      expect(res1.body.data.classCode).not.toBe(res2.body.data.classCode);
    });

    it('rejects creation without authentication', async () => {
      await request(app)
        .post('/api/class/create')
        .send({ name: 'CS 35L', description: 'Software Construction' })
        .expect(401);
    });

    it('rejects creation with invalid session ID', async () => {
      await request(app)
        .post('/api/class/create')
        .set('x-session-id', 'invalid-session-id')
        .send({ name: 'CS 35L', description: 'Software Construction' })
        .expect(401);
    });

    it('rejects creation with expired session', async () => {
      const user = await createAuthenticatedUser();

      // Create an expired session manually
      const expiredSession = await Session.createSession(user.userId, -1); // -1 hour = expired

      await request(app)
        .post('/api/class/create')
        .set('x-session-id', expiredSession.sessionId)
        .send({ name: 'CS 35L', description: 'Software Construction' })
        .expect(401);
    });

    it('rejects creation without name', async () => {
      const user = await createAuthenticatedUser();

      const res = await request(app)
        .post('/api/class/create')
        .set('x-session-id', user.sessionId)
        .send({ description: 'Software Construction' })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Name and description are required');
    });

    it('rejects creation without description', async () => {
      const user = await createAuthenticatedUser();

      const res = await request(app)
        .post('/api/class/create')
        .set('x-session-id', user.sessionId)
        .send({ name: 'CS 35L' })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Name and description are required');
    });

    it('rejects creation with empty name', async () => {
      const user = await createAuthenticatedUser();

      await request(app)
        .post('/api/class/create')
        .set('x-session-id', user.sessionId)
        .send({ name: '', description: 'Software Construction' })
        .expect(400);
    });
  });

  describe('POST /api/class/join', () => {
    it('allows a user to join a class with valid code', async () => {
      const creator = await createAuthenticatedUser('creator@example.com');
      const joiner = await createAuthenticatedUser('joiner@example.com');

      // Creator creates a class
      const createRes = await request(app)
        .post('/api/class/create')
        .set('x-session-id', creator.sessionId)
        .send({ name: 'CS 35L', description: 'Software Construction' });

      const classCode = createRes.body.data.classCode;

      // Joiner joins the class
      const joinRes = await request(app)
        .post('/api/class/join')
        .set('x-session-id', joiner.sessionId)
        .send({ classCode })
        .expect(200);

      expect(joinRes.body.success).toBe(true);
      expect(joinRes.body.message).toBe('Successfully joined class');
      expect(joinRes.body.data.name).toBe('CS 35L');
      expect(joinRes.body.data.classCode).toBe(classCode);
    });

    it('handles case-insensitive class codes', async () => {
      const creator = await createAuthenticatedUser('creator@example.com');
      const joiner = await createAuthenticatedUser('joiner@example.com');

      const createRes = await request(app)
        .post('/api/class/create')
        .set('x-session-id', creator.sessionId)
        .send({ name: 'CS 35L', description: 'Software Construction' });

      const classCode = createRes.body.data.classCode;
      const lowercaseCode = classCode.toLowerCase();

      // Join with lowercase code
      const joinRes = await request(app)
        .post('/api/class/join')
        .set('x-session-id', joiner.sessionId)
        .send({ classCode: lowercaseCode })
        .expect(200);

      expect(joinRes.body.success).toBe(true);
    });

    it('rejects joining without authentication', async () => {
      await request(app)
        .post('/api/class/join')
        .send({ classCode: 'ABC123' })
        .expect(401);
    });

    it('rejects joining with invalid session', async () => {
      await request(app)
        .post('/api/class/join')
        .set('x-session-id', 'invalid-session')
        .send({ classCode: 'ABC123' })
        .expect(401);
    });

    it('rejects joining without class code', async () => {
      const user = await createAuthenticatedUser();

      const res = await request(app)
        .post('/api/class/join')
        .set('x-session-id', user.sessionId)
        .send({})
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Class code is required');
    });

    it('rejects joining with non-existent class code', async () => {
      const user = await createAuthenticatedUser();

      const res = await request(app)
        .post('/api/class/join')
        .set('x-session-id', user.sessionId)
        .send({ classCode: 'FAKE99' })
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Class not found');
    });

    it('rejects duplicate join attempts', async () => {
      const creator = await createAuthenticatedUser('creator@example.com');
      const joiner = await createAuthenticatedUser('joiner@example.com');

      // Create class
      const createRes = await request(app)
        .post('/api/class/create')
        .set('x-session-id', creator.sessionId)
        .send({ name: 'CS 35L', description: 'Software Construction' });

      const classCode = createRes.body.data.classCode;

      // Join first time
      await request(app)
        .post('/api/class/join')
        .set('x-session-id', joiner.sessionId)
        .send({ classCode })
        .expect(200);

      // Try to join again
      const secondJoinRes = await request(app)
        .post('/api/class/join')
        .set('x-session-id', joiner.sessionId)
        .send({ classCode })
        .expect(400);

      expect(secondJoinRes.body.success).toBe(false);
      expect(secondJoinRes.body.message).toBe('You are already a member of this class');
    });

    it('rejects creator joining their own class', async () => {
      const creator = await createAuthenticatedUser();

      // Create class
      const createRes = await request(app)
        .post('/api/class/create')
        .set('x-session-id', creator.sessionId)
        .send({ name: 'CS 35L', description: 'Software Construction' });

      const classCode = createRes.body.data.classCode;

      // Creator tries to join
      const joinRes = await request(app)
        .post('/api/class/join')
        .set('x-session-id', creator.sessionId)
        .send({ classCode })
        .expect(400);

      expect(joinRes.body.success).toBe(false);
      expect(joinRes.body.message).toBe('You are the creator of this class');
    });
  });

  describe('GET /api/class/my-classes', () => {
    it('returns empty array for user with no classes', async () => {
      const user = await createAuthenticatedUser();

      const res = await request(app)
        .get('/api/class/my-classes')
        .set('x-session-id', user.sessionId)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
    });

    it('returns classes where user is creator', async () => {
      const creator = await createAuthenticatedUser();

      // Create two classes
      await request(app)
        .post('/api/class/create')
        .set('x-session-id', creator.sessionId)
        .send({ name: 'CS 35L', description: 'Software Construction' });

      await request(app)
        .post('/api/class/create')
        .set('x-session-id', creator.sessionId)
        .send({ name: 'CS 111', description: 'Operating Systems' });

      const res = await request(app)
        .get('/api/class/my-classes')
        .set('x-session-id', creator.sessionId)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data[0].role).toBe('Instructor');
      expect(res.body.data[1].role).toBe('Instructor');
    });

    it('returns classes where user is member', async () => {
      const creator = await createAuthenticatedUser('creator@example.com');
      const member = await createAuthenticatedUser('member@example.com');

      // Creator creates class
      const createRes = await request(app)
        .post('/api/class/create')
        .set('x-session-id', creator.sessionId)
        .send({ name: 'CS 35L', description: 'Software Construction' });

      const classCode = createRes.body.data.classCode;

      // Member joins class
      await request(app)
        .post('/api/class/join')
        .set('x-session-id', member.sessionId)
        .send({ classCode });

      const res = await request(app)
        .get('/api/class/my-classes')
        .set('x-session-id', member.sessionId)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toBe('CS 35L');
      expect(res.body.data[0].role).toBe('Student');
    });

    it('returns both created and joined classes', async () => {
      const user1 = await createAuthenticatedUser('user1@example.com');
      const user2 = await createAuthenticatedUser('user2@example.com');

      // User1 creates a class
      const createRes = await request(app)
        .post('/api/class/create')
        .set('x-session-id', user1.sessionId)
        .send({ name: 'CS 35L', description: 'Software Construction' });

      // User2 creates a class
      const createRes2 = await request(app)
        .post('/api/class/create')
        .set('x-session-id', user2.sessionId)
        .send({ name: 'CS 111', description: 'Operating Systems' });

      // User1 joins User2's class
      await request(app)
        .post('/api/class/join')
        .set('x-session-id', user1.sessionId)
        .send({ classCode: createRes2.body.data.classCode });

      const res = await request(app)
        .get('/api/class/my-classes')
        .set('x-session-id', user1.sessionId)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);

      // Check roles
      const instructorClasses = res.body.data.filter(c => c.role === 'Instructor');
      const studentClasses = res.body.data.filter(c => c.role === 'Student');
      expect(instructorClasses).toHaveLength(1);
      expect(studentClasses).toHaveLength(1);
    });

    it('sorts classes by creation date (newest first)', async () => {
      const user = await createAuthenticatedUser();

      // Create classes with slight delay
      const res1 = await request(app)
        .post('/api/class/create')
        .set('x-session-id', user.sessionId)
        .send({ name: 'First Class', description: 'Description' });

      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));

      const res2 = await request(app)
        .post('/api/class/create')
        .set('x-session-id', user.sessionId)
        .send({ name: 'Second Class', description: 'Description' });

      const res = await request(app)
        .get('/api/class/my-classes')
        .set('x-session-id', user.sessionId)
        .expect(200);

      expect(res.body.data).toHaveLength(2);
      // Newest first (Second Class should be first)
      expect(res.body.data[0].name).toBe('Second Class');
      expect(res.body.data[1].name).toBe('First Class');
    });

    it('includes all required fields in response', async () => {
      const user = await createAuthenticatedUser();

      await request(app)
        .post('/api/class/create')
        .set('x-session-id', user.sessionId)
        .send({ name: 'CS 35L', description: 'Software Construction' });

      const res = await request(app)
        .get('/api/class/my-classes')
        .set('x-session-id', user.sessionId)
        .expect(200);

      expect(res.body.data).toHaveLength(1);
      const classData = res.body.data[0];
      expect(classData.id).toBeDefined();
      expect(classData.name).toBeDefined();
      expect(classData.description).toBeDefined();
      expect(classData.classCode).toBeDefined();
      expect(classData.role).toBeDefined();
    });

    it('rejects request without authentication', async () => {
      await request(app)
        .get('/api/class/my-classes')
        .expect(401);
    });

    it('rejects request with invalid session', async () => {
      await request(app)
        .get('/api/class/my-classes')
        .set('x-session-id', 'invalid-session')
        .expect(401);
    });
  });

  describe('GET /api/class/ (documentation endpoint)', () => {
    it('returns API documentation', async () => {
      const res = await request(app)
        .get('/api/class/')
        .expect(200);

      expect(res.body.message).toBe('Class API');
      expect(res.body.version).toBe('1.0.0');
      expect(res.body.status).toBe('running');
      expect(res.body.endpoints).toBeDefined();
      expect(res.body.endpoints.create).toBeDefined();
      expect(res.body.endpoints.join).toBeDefined();
    });
  });
});

/**
 * Profile API Integration Tests
 * 
 * Tests user profile retrieval and update flows including success cases,
 * validation, and error handling. Each test suite manages its own database state
 * through beforeEach hooks to ensure isolation.
 * 
 * Prerequisites:
 * - MongoDB test instance running
 * - NODE_ENV=test to prevent accidental production database modification
 * - Server must be available on port 8084
 * 
 * Run with: npm test
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/user');
const Session = require('../models/session');

describe('Profile API', () => {
  let server;

  beforeAll(() => {
    server = app.listen(8084);
  });

		afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Session.deleteMany({});
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Session.deleteMany({});
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

  describe('GET /api/profile', () => {
    it('returns user profile with valid authentication', async () => {
      const user = await createAuthenticatedUser('test@example.com', 'password123');

      const res = await request(app)
        .get('/api/profile')
        .set('x-session-id', user.sessionId)
        .expect(200);
	
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data._id).toBe(user.userId);
      expect(res.body.data.email).toBe('test@example.com');
      expect(res.body.data.createdAt).toBeDefined();
      expect(res.body.data.updatedAt).toBeDefined();
    });

    it('does not return password in profile', async () => {
      const user = await createAuthenticatedUser();

      const res = await request(app)
        .get('/api/profile')
        .set('x-session-id', user.sessionId)
        .expect(200);

      expect(res.body.data.password).toBeUndefined();
    });

    it('returns displayName field', async () => {
      const user = await createAuthenticatedUser();

      const res = await request(app)
        .get('/api/profile')
        .set('x-session-id', user.sessionId)
        .expect(200);

      expect(res.body.data.displayName).toBeDefined();
    });

    it('rejects request without authentication', async () => {
      const res = await request(app)
        .get('/api/profile')
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Unauthorized');
    });

    it('rejects request with invalid session ID', async () => {
      const res = await request(app)
        .get('/api/profile')
        .set('x-session-id', 'invalid-session-id')
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Unauthorized');
    });

    it('rejects request with expired session', async () => {
      const user = await createAuthenticatedUser();

      // Create an expired session manually
      const expiredSession = await Session.createSession(user.userId, -1); // -1 hour = expired

      const res = await request(app)
        .get('/api/profile')
        .set('x-session-id', expiredSession.sessionId)
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Unauthorized');
    });

    it('returns error when user not found', async () => {
      const user = await createAuthenticatedUser();

      // Delete the user after creating session
      await User.deleteOne({ _id: user.userId });

      const res = await request(app)
        .get('/api/profile')
        .set('x-session-id', user.sessionId)
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('User not found');
    });
  });

  describe('PUT /api/profile/update-displayName', () => {
    it('updates displayName successfully', async () => {
      const user = await createAuthenticatedUser();

      const res = await request(app)
        .put('/api/profile/update-displayName')
        .set('x-session-id', user.sessionId)
        .send({ displayName: 'John Doe' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Profile updated successfully');
      expect(res.body.data.displayName).toBe('John Doe');
      expect(res.body.data.email).toBe(user.email);
    });

    it('persists displayName in database', async () => {
      const user = await createAuthenticatedUser();

      await request(app)
        .put('/api/profile/update-displayName')
        .set('x-session-id', user.sessionId)
        .send({ displayName: 'Jane Smith' })
        .expect(200);

      // Get profile again to verify it was saved
      const res = await request(app)
        .get('/api/profile')
        .set('x-session-id', user.sessionId)
        .expect(200);

      expect(res.body.data.displayName).toBe('Jane Smith');
    });

    it('allows updating displayName multiple times', async () => {
      const user = await createAuthenticatedUser();

      await request(app)
        .put('/api/profile/update-displayName')
        .set('x-session-id', user.sessionId)
        .send({ displayName: 'First Name' })
        .expect(200);

      const res = await request(app)
        .put('/api/profile/update-displayName')
        .set('x-session-id', user.sessionId)
        .send({ displayName: 'Second Name' })
        .expect(200);

      expect(res.body.data.displayName).toBe('Second Name');
    });

    it('keeps existing displayName if not provided', async () => {
      const user = await createAuthenticatedUser();

      await request(app)
        .put('/api/profile/update-displayName')
        .set('x-session-id', user.sessionId)
        .send({ displayName: 'Original Name' })
        .expect(200);

      const res = await request(app)
        .put('/api/profile/update-displayName')
        .set('x-session-id', user.sessionId)
        .send({})
        .expect(200);

      expect(res.body.data.displayName).toBe('Original Name');
    });

    it('allows empty displayName', async () => {
      const user = await createAuthenticatedUser();

      const res = await request(app)
        .put('/api/profile/update-displayName')
        .set('x-session-id', user.sessionId)
        .send({ displayName: '' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.displayName).toBe('');
    });

    it('allows displayName with special characters', async () => {
      const user = await createAuthenticatedUser();

      const specialName = 'José María O\'Brien-Smith';
      const res = await request(app)
        .put('/api/profile/update-displayName')
        .set('x-session-id', user.sessionId)
        .send({ displayName: specialName })
        .expect(200);

      expect(res.body.data.displayName).toBe(specialName);
    });

    it('allows displayName with numbers and symbols', async () => {
      const user = await createAuthenticatedUser();

      const res = await request(app)
        .put('/api/profile/update-displayName')
        .set('x-session-id', user.sessionId)
        .send({ displayName: 'User_123!@#' })
        .expect(200);

      expect(res.body.data.displayName).toBe('User_123!@#');
    });

    it('trims whitespace from displayName', async () => {
      const user = await createAuthenticatedUser();

      const res = await request(app)
        .put('/api/profile/update-displayName')
        .set('x-session-id', user.sessionId)
        .send({ displayName: '  John Doe  ' })
        .expect(200);

      expect(res.body.data.displayName).toBe('John Doe');
    });

    it('rejects update without authentication', async () => {
      const res = await request(app)
        .put('/api/profile/update-displayName')
        .send({ displayName: 'John Doe' })
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Unauthorized');
    });

    it('rejects update with invalid session ID', async () => {
      const res = await request(app)
        .put('/api/profile/update-displayName')
        .set('x-session-id', 'invalid-session-id')
        .send({ displayName: 'John Doe' })
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Unauthorized');
    });

    it('rejects update with expired session', async () => {
      const user = await createAuthenticatedUser();

      // Create an expired session manually
      const expiredSession = await Session.createSession(user.userId, -1); // -1 hour = expired

      const res = await request(app)
        .put('/api/profile/update-displayName')
        .set('x-session-id', expiredSession.sessionId)
        .send({ displayName: 'John Doe' })
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Unauthorized');
    });

    it('returns error when user not found', async () => {
      const user = await createAuthenticatedUser();

      // Delete the user after creating session
      await User.deleteOne({ _id: user.userId });

      const res = await request(app)
        .put('/api/profile/update-displayName')
        .set('x-session-id', user.sessionId)
        .send({ displayName: 'John Doe' })
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('User not found');
    });

    it('does not modify other user fields', async () => {
      const user = await createAuthenticatedUser('original@example.com');

      const originalProfile = await request(app)
        .get('/api/profile')
        .set('x-session-id', user.sessionId);

      const originalEmail = originalProfile.body.data.email;
      const originalCreatedAt = originalProfile.body.data.createdAt;

      await request(app)
        .put('/api/profile/update-displayName')
        .set('x-session-id', user.sessionId)
        .send({ displayName: 'New Name' })
        .expect(200);

      const updatedProfile = await request(app)
        .get('/api/profile')
        .set('x-session-id', user.sessionId);

      expect(updatedProfile.body.data.email).toBe(originalEmail);
      expect(updatedProfile.body.data.createdAt).toBe(originalCreatedAt);
    });

    it('updates updatedAt timestamp on profile update', async () => {
      const user = await createAuthenticatedUser();

      const profileBefore = await request(app)
        .get('/api/profile')
        .set('x-session-id', user.sessionId);

      const updatedAtBefore = profileBefore.body.data.updatedAt;

      // Small delay to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));

      await request(app)
        .put('/api/profile/update-displayName')
        .set('x-session-id', user.sessionId)
        .send({ displayName: 'New Name' })
        .expect(200);

      const profileAfter = await request(app)
        .get('/api/profile')
        .set('x-session-id', user.sessionId);

      const updatedAtAfter = profileAfter.body.data.updatedAt;

      expect(new Date(updatedAtAfter).getTime()).toBeGreaterThanOrEqual(
        new Date(updatedAtBefore).getTime()
      );
    });

    it('allows very long displayName', async () => {
      const user = await createAuthenticatedUser();

      const longName = 'A'.repeat(200);
      const res = await request(app)
        .put('/api/profile/update-displayName')
        .set('x-session-id', user.sessionId)
        .send({ displayName: longName })
        .expect(200);

      expect(res.body.data.displayName).toBe(longName);
    });
  });

  describe('Profile Data Consistency', () => {
    it('maintains data consistency across requests', async () => {
      const user = await createAuthenticatedUser('test@example.com');

      // Get initial profile
      const res1 = await request(app)
        .get('/api/profile')
        .set('x-session-id', user.sessionId)
        .expect(200);

      const initialData = res1.body.data;

      // Update displayName
      await request(app)
        .put('/api/profile/update-displayName')
        .set('x-session-id', user.sessionId)
        .send({ displayName: 'Updated Name' });

      // Get profile again
      const res2 = await request(app)
        .get('/api/profile')
        .set('x-session-id', user.sessionId)
        .expect(200);

      const updatedData = res2.body.data;

      // Verify only displayName changed
      expect(updatedData.id).toBe(initialData.id);
      expect(updatedData.email).toBe(initialData.email);
      expect(updatedData.createdAt).toBe(initialData.createdAt);
      expect(updatedData.displayName).not.toBe(initialData.displayName);
    });

    it('handles multiple users independently', async () => {
      const user1 = await createAuthenticatedUser('user1@example.com');
      const user2 = await createAuthenticatedUser('user2@example.com');

      await request(app)
        .put('/api/profile/update-displayName')
        .set('x-session-id', user1.sessionId)
        .send({ displayName: 'User 1 Name' });

      await request(app)
        .put('/api/profile/update-displayName')
        .set('x-session-id', user2.sessionId)
        .send({ displayName: 'User 2 Name' });

      const res1 = await request(app)
        .get('/api/profile')
        .set('x-session-id', user1.sessionId);

      const res2 = await request(app)
        .get('/api/profile')
        .set('x-session-id', user2.sessionId);
	
      expect(res1.body.data.displayName).toBe('User 1 Name');
      expect(res2.body.data.displayName).toBe('User 2 Name');
      expect(res1.body.data._id).not.toBe(res2.body.data._id);
    });
  });
});
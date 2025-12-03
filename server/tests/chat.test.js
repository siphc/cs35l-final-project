/**
 * Chat API Integration Tests
 *
 * Tests chat creation, messaging, duplicate prevention, and member management.
 * Each test suite manages its own database state through beforeEach hooks
 * to ensure isolation.
 *
 * Prerequisites:
 * - MongoDB test instance running
 * - NODE_ENV=test to prevent accidental production database modification
 * - Server must be available on port 8083
 *
 * Run with: npm test
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/user');
const Session = require('../models/session');
const Class = require('../models/class');
const Chat = require('../models/Chat');
const Message = require('../models/Message');

describe('Chat API', () => {
  let server;

  beforeAll(() => {
    server = app.listen(8083);
  });

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Session.deleteMany({});
    await Class.deleteMany({});
    await Chat.deleteMany({});
    await Message.deleteMany({});
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Session.deleteMany({});
    await Class.deleteMany({});
    await Chat.deleteMany({});
    await Message.deleteMany({});
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

  // Helper function to create a class
  const createClass = async (sessionId, name = 'CS 35L', description = 'Software Construction') => {
    const res = await request(app)
      .post('/api/class/create')
      .set('x-session-id', sessionId)
      .send({ name, description });

    return res.body.data;
  };

  // Helper function to join a class
  const joinClass = async (sessionId, classCode) => {
    await request(app)
      .post('/api/class/join')
      .set('x-session-id', sessionId)
      .send({ classCode });
  };

  describe('POST /api/chat/create', () => {
    it('creates a direct chat with valid data', async () => {
      const user1 = await createAuthenticatedUser('user1@example.com');
      const user2 = await createAuthenticatedUser('user2@example.com');
      const classData = await createClass(user1.sessionId);
      await joinClass(user2.sessionId, classData.classCode);

      const res = await request(app)
        .post('/api/chat/create')
        .set('x-session-id', user1.sessionId)
        .send({
          classId: classData.id,
          participantIds: [user2.userId],
          isGroupChat: false,
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Chat created successfully');
      expect(res.body.data.chat._id).toBeDefined();
      expect(res.body.data.chat.isGroupChat).toBe(false);
      expect(res.body.data.chat.participants).toHaveLength(2);
      expect(res.body.data.isNew).toBe(true);
    });

    it('creates a group chat with multiple participants', async () => {
      const user1 = await createAuthenticatedUser('user1@example.com');
      const user2 = await createAuthenticatedUser('user2@example.com');
      const user3 = await createAuthenticatedUser('user3@example.com');
      const classData = await createClass(user1.sessionId);
      await joinClass(user2.sessionId, classData.classCode);
      await joinClass(user3.sessionId, classData.classCode);

      const res = await request(app)
        .post('/api/chat/create')
        .set('x-session-id', user1.sessionId)
        .send({
          classId: classData.id,
          participantIds: [user2.userId, user3.userId],
          isGroupChat: true,
          name: 'Study Group',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.chat.isGroupChat).toBe(true);
      expect(res.body.data.chat.name).toBe('Study Group');
      expect(res.body.data.chat.participants).toHaveLength(3);
    });

    it('prevents duplicate direct chats', async () => {
      const user1 = await createAuthenticatedUser('user1@example.com');
      const user2 = await createAuthenticatedUser('user2@example.com');
      const classData = await createClass(user1.sessionId);
      await joinClass(user2.sessionId, classData.classCode);

      // Create first chat
      await request(app)
        .post('/api/chat/create')
        .set('x-session-id', user1.sessionId)
        .send({
          classId: classData.id,
          participantIds: [user2.userId],
          isGroupChat: false,
        })
        .expect(201);

      // Try to create duplicate chat
      const res = await request(app)
        .post('/api/chat/create')
        .set('x-session-id', user1.sessionId)
        .send({
          classId: classData.id,
          participantIds: [user2.userId],
          isGroupChat: false,
        })
        .expect(200);

      expect(res.body.message).toBe('Chat already exists');
      expect(res.body.data.isNew).toBe(false);
      expect(res.body.data.chat._id).toBeDefined();
    });

    it('prevents duplicate group chats with same participants', async () => {
      const user1 = await createAuthenticatedUser('user1@example.com');
      const user2 = await createAuthenticatedUser('user2@example.com');
      const user3 = await createAuthenticatedUser('user3@example.com');
      const classData = await createClass(user1.sessionId);
      await joinClass(user2.sessionId, classData.classCode);
      await joinClass(user3.sessionId, classData.classCode);

      // Create first group chat
      await request(app)
        .post('/api/chat/create')
        .set('x-session-id', user1.sessionId)
        .send({
          classId: classData.id,
          participantIds: [user2.userId, user3.userId],
          isGroupChat: true,
          name: 'Study Group',
        })
        .expect(201);

      // Try to create duplicate with same participants (different order)
      const res = await request(app)
        .post('/api/chat/create')
        .set('x-session-id', user2.sessionId)
        .send({
          classId: classData.id,
          participantIds: [user3.userId, user1.userId],
          isGroupChat: true,
          name: 'Different Name',
        })
        .expect(200);

      expect(res.body.message).toBe('Chat already exists');
      expect(res.body.data.isNew).toBe(false);
    });

    it('rejects creation without authentication', async () => {
      const user1 = await createAuthenticatedUser('user1@example.com');
      const classData = await createClass(user1.sessionId);

      await request(app)
        .post('/api/chat/create')
        .send({
          classId: classData.id,
          participantIds: [user1.userId],
        })
        .expect(401);
    });

    it('rejects creation with non-class members', async () => {
      const user1 = await createAuthenticatedUser('user1@example.com');
      const user2 = await createAuthenticatedUser('user2@example.com');
      const classData = await createClass(user1.sessionId);
      // user2 does NOT join the class

      const res = await request(app)
        .post('/api/chat/create')
        .set('x-session-id', user1.sessionId)
        .send({
          classId: classData.id,
          participantIds: [user2.userId],
        })
        .expect(400);

      expect(res.body.message).toBe('All participants must be members of the class');
    });

    it('rejects creation when user is not in the class', async () => {
      const user1 = await createAuthenticatedUser('user1@example.com');
      const user2 = await createAuthenticatedUser('user2@example.com');
      const user3 = await createAuthenticatedUser('user3@example.com');
      const classData = await createClass(user1.sessionId);
      await joinClass(user2.sessionId, classData.classCode);
      // user3 is not in the class

      await request(app)
        .post('/api/chat/create')
        .set('x-session-id', user3.sessionId)
        .send({
          classId: classData.id,
          participantIds: [user2.userId],
        })
        .expect(403);
    });
  });

  describe('POST /api/chat/:chatId/add-members', () => {
    it('adds members to an existing chat', async () => {
      const user1 = await createAuthenticatedUser('user1@example.com');
      const user2 = await createAuthenticatedUser('user2@example.com');
      const user3 = await createAuthenticatedUser('user3@example.com');
      const classData = await createClass(user1.sessionId);
      await joinClass(user2.sessionId, classData.classCode);
      await joinClass(user3.sessionId, classData.classCode);

      // Create initial chat
      const createRes = await request(app)
        .post('/api/chat/create')
        .set('x-session-id', user1.sessionId)
        .send({
          classId: classData.id,
          participantIds: [user2.userId],
          isGroupChat: false,
        });

      const chatId = createRes.body.data.chat._id;

      // Add user3 to the chat
      const res = await request(app)
        .post(`/api/chat/${chatId}/add-members`)
        .set('x-session-id', user1.sessionId)
        .send({
          participantIds: [user3.userId],
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.chat.participants).toHaveLength(3);
      expect(res.body.data.chat.isGroupChat).toBe(true); // Becomes group chat with 3+ members
    });

    it('prevents adding members that would create a duplicate chat', async () => {
      const user1 = await createAuthenticatedUser('user1@example.com');
      const user2 = await createAuthenticatedUser('user2@example.com');
      const user3 = await createAuthenticatedUser('user3@example.com');
      const classData = await createClass(user1.sessionId);
      await joinClass(user2.sessionId, classData.classCode);
      await joinClass(user3.sessionId, classData.classCode);

      // Create chat with user1 and user3
      await request(app)
        .post('/api/chat/create')
        .set('x-session-id', user1.sessionId)
        .send({
          classId: classData.id,
          participantIds: [user2.userId, user3.userId],
          isGroupChat: true,
        });

      // Create another chat with just user1 and user2
      const createRes = await request(app)
        .post('/api/chat/create')
        .set('x-session-id', user1.sessionId)
        .send({
          classId: classData.id,
          participantIds: [user2.userId],
          isGroupChat: false,
        });

      const chatId = createRes.body.data.chat._id;

      // Try to add user3 which would make it duplicate the first chat
      const res = await request(app)
        .post(`/api/chat/${chatId}/add-members`)
        .set('x-session-id', user1.sessionId)
        .send({
          participantIds: [user3.userId],
        })
        .expect(400);

      expect(res.body.message).toBe('A chat with these participants already exists');
      expect(res.body.data.existingChatId).toBeDefined();
    });

    it('rejects adding non-class members', async () => {
      const user1 = await createAuthenticatedUser('user1@example.com');
      const user2 = await createAuthenticatedUser('user2@example.com');
      const user3 = await createAuthenticatedUser('user3@example.com');
      const classData = await createClass(user1.sessionId);
      await joinClass(user2.sessionId, classData.classCode);
      // user3 does NOT join the class

      // Create chat
      const createRes = await request(app)
        .post('/api/chat/create')
        .set('x-session-id', user1.sessionId)
        .send({
          classId: classData.id,
          participantIds: [user2.userId],
        });

      const chatId = createRes.body.data.chat._id;

      // Try to add user3 who is not in the class
      await request(app)
        .post(`/api/chat/${chatId}/add-members`)
        .set('x-session-id', user1.sessionId)
        .send({
          participantIds: [user3.userId],
        })
        .expect(400);
    });

    it('rejects adding members by non-participants', async () => {
      const user1 = await createAuthenticatedUser('user1@example.com');
      const user2 = await createAuthenticatedUser('user2@example.com');
      const user3 = await createAuthenticatedUser('user3@example.com');
      const classData = await createClass(user1.sessionId);
      await joinClass(user2.sessionId, classData.classCode);
      await joinClass(user3.sessionId, classData.classCode);

      // Create chat between user1 and user2
      const createRes = await request(app)
        .post('/api/chat/create')
        .set('x-session-id', user1.sessionId)
        .send({
          classId: classData.id,
          participantIds: [user2.userId],
        });

      const chatId = createRes.body.data.chat._id;

      // Try to add members as user3 who is not in the chat
      await request(app)
        .post(`/api/chat/${chatId}/add-members`)
        .set('x-session-id', user3.sessionId)
        .send({
          participantIds: [user3.userId],
        })
        .expect(403);
    });
  });

  describe('GET /api/chat/list', () => {
    it('returns all chats for the current user', async () => {
      const user1 = await createAuthenticatedUser('user1@example.com');
      const user2 = await createAuthenticatedUser('user2@example.com');
      const user3 = await createAuthenticatedUser('user3@example.com');
      const classData = await createClass(user1.sessionId);
      await joinClass(user2.sessionId, classData.classCode);
      await joinClass(user3.sessionId, classData.classCode);

      // Create two chats involving user1
      await request(app)
        .post('/api/chat/create')
        .set('x-session-id', user1.sessionId)
        .send({
          classId: classData.id,
          participantIds: [user2.userId],
        });

      await request(app)
        .post('/api/chat/create')
        .set('x-session-id', user1.sessionId)
        .send({
          classId: classData.id,
          participantIds: [user3.userId],
        });

      const res = await request(app)
        .get('/api/chat/list')
        .set('x-session-id', user1.sessionId)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.chats).toHaveLength(2);
    });

    it('filters chats by classId', async () => {
      const user1 = await createAuthenticatedUser('user1@example.com');
      const user2 = await createAuthenticatedUser('user2@example.com');
      const class1 = await createClass(user1.sessionId, 'Class 1');
      const class2 = await createClass(user1.sessionId, 'Class 2');
      await joinClass(user2.sessionId, class1.classCode);
      await joinClass(user2.sessionId, class2.classCode);

      // Create chat in class1
      await request(app)
        .post('/api/chat/create')
        .set('x-session-id', user1.sessionId)
        .send({
          classId: class1.id,
          participantIds: [user2.userId],
        });

      // Create chat in class2
      await request(app)
        .post('/api/chat/create')
        .set('x-session-id', user1.sessionId)
        .send({
          classId: class2.id,
          participantIds: [user2.userId],
        });

      // Get chats for class1 only
      const res = await request(app)
        .get(`/api/chat/list?classId=${class1.id}`)
        .set('x-session-id', user1.sessionId)
        .expect(200);

      expect(res.body.data.chats).toHaveLength(1);
      expect(res.body.data.chats[0].classId._id).toBe(class1.id);
    });

    it('rejects list request without authentication', async () => {
      await request(app)
        .get('/api/chat/list')
        .expect(401);
    });
  });

  describe('POST /api/chat/:chatId/send', () => {
    it('sends a message successfully', async () => {
      const user1 = await createAuthenticatedUser('user1@example.com');
      const user2 = await createAuthenticatedUser('user2@example.com');
      const classData = await createClass(user1.sessionId);
      await joinClass(user2.sessionId, classData.classCode);

      const createRes = await request(app)
        .post('/api/chat/create')
        .set('x-session-id', user1.sessionId)
        .send({
          classId: classData.id,
          participantIds: [user2.userId],
        });

      const chatId = createRes.body.data.chat._id;

      const res = await request(app)
        .post(`/api/chat/${chatId}/send`)
        .set('x-session-id', user1.sessionId)
        .send({
          content: 'Hello, this is a test message!',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.message.content).toBe('Hello, this is a test message!');
      expect(res.body.data.message.sender._id).toBe(user1.userId);
      expect(res.body.data.message.chatId).toBe(chatId);
    });

    it('rejects empty messages', async () => {
      const user1 = await createAuthenticatedUser('user1@example.com');
      const user2 = await createAuthenticatedUser('user2@example.com');
      const classData = await createClass(user1.sessionId);
      await joinClass(user2.sessionId, classData.classCode);

      const createRes = await request(app)
        .post('/api/chat/create')
        .set('x-session-id', user1.sessionId)
        .send({
          classId: classData.id,
          participantIds: [user2.userId],
        });

      const chatId = createRes.body.data.chat._id;

      await request(app)
        .post(`/api/chat/${chatId}/send`)
        .set('x-session-id', user1.sessionId)
        .send({
          content: '   ',
        })
        .expect(400);
    });

    it('rejects messages from non-participants', async () => {
      const user1 = await createAuthenticatedUser('user1@example.com');
      const user2 = await createAuthenticatedUser('user2@example.com');
      const user3 = await createAuthenticatedUser('user3@example.com');
      const classData = await createClass(user1.sessionId);
      await joinClass(user2.sessionId, classData.classCode);
      await joinClass(user3.sessionId, classData.classCode);

      const createRes = await request(app)
        .post('/api/chat/create')
        .set('x-session-id', user1.sessionId)
        .send({
          classId: classData.id,
          participantIds: [user2.userId],
        });

      const chatId = createRes.body.data.chat._id;

      // Try to send message as user3 who is not in the chat
      await request(app)
        .post(`/api/chat/${chatId}/send`)
        .set('x-session-id', user3.sessionId)
        .send({
          content: 'Hello!',
        })
        .expect(403);
    });

    it('updates chat lastMessageAt timestamp', async () => {
      const user1 = await createAuthenticatedUser('user1@example.com');
      const user2 = await createAuthenticatedUser('user2@example.com');
      const classData = await createClass(user1.sessionId);
      await joinClass(user2.sessionId, classData.classCode);

      const createRes = await request(app)
        .post('/api/chat/create')
        .set('x-session-id', user1.sessionId)
        .send({
          classId: classData.id,
          participantIds: [user2.userId],
        });

      const chatId = createRes.body.data.chat._id;
      const originalTimestamp = createRes.body.data.chat.lastMessageAt;

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 100));

      // Send message
      await request(app)
        .post(`/api/chat/${chatId}/send`)
        .set('x-session-id', user1.sessionId)
        .send({
          content: 'Test message',
        });

      // Get chat details
      const chatRes = await request(app)
        .get(`/api/chat/${chatId}`)
        .set('x-session-id', user1.sessionId);

      expect(new Date(chatRes.body.data.chat.lastMessageAt).getTime())
        .toBeGreaterThan(new Date(originalTimestamp).getTime());
    });
  });

  describe('GET /api/chat/:chatId/messages', () => {
    it('retrieves messages from a chat', async () => {
      const user1 = await createAuthenticatedUser('user1@example.com');
      const user2 = await createAuthenticatedUser('user2@example.com');
      const classData = await createClass(user1.sessionId);
      await joinClass(user2.sessionId, classData.classCode);

      const createRes = await request(app)
        .post('/api/chat/create')
        .set('x-session-id', user1.sessionId)
        .send({
          classId: classData.id,
          participantIds: [user2.userId],
        });

      const chatId = createRes.body.data.chat._id;

      // Send two messages
      await request(app)
        .post(`/api/chat/${chatId}/send`)
        .set('x-session-id', user1.sessionId)
        .send({ content: 'First message' });

      await request(app)
        .post(`/api/chat/${chatId}/send`)
        .set('x-session-id', user2.sessionId)
        .send({ content: 'Second message' });

      const res = await request(app)
        .get(`/api/chat/${chatId}/messages`)
        .set('x-session-id', user1.sessionId)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.messages).toHaveLength(2);
      expect(res.body.data.messages[0].content).toBe('First message');
      expect(res.body.data.messages[1].content).toBe('Second message');
    });

    it('rejects messages request from non-participants', async () => {
      const user1 = await createAuthenticatedUser('user1@example.com');
      const user2 = await createAuthenticatedUser('user2@example.com');
      const user3 = await createAuthenticatedUser('user3@example.com');
      const classData = await createClass(user1.sessionId);
      await joinClass(user2.sessionId, classData.classCode);
      await joinClass(user3.sessionId, classData.classCode);

      const createRes = await request(app)
        .post('/api/chat/create')
        .set('x-session-id', user1.sessionId)
        .send({
          classId: classData.id,
          participantIds: [user2.userId],
        });

      const chatId = createRes.body.data.chat._id;

      // Try to get messages as user3 who is not in the chat
      await request(app)
        .get(`/api/chat/${chatId}/messages`)
        .set('x-session-id', user3.sessionId)
        .expect(403);
    });

    it('returns empty array for chat with no messages', async () => {
      const user1 = await createAuthenticatedUser('user1@example.com');
      const user2 = await createAuthenticatedUser('user2@example.com');
      const classData = await createClass(user1.sessionId);
      await joinClass(user2.sessionId, classData.classCode);

      const createRes = await request(app)
        .post('/api/chat/create')
        .set('x-session-id', user1.sessionId)
        .send({
          classId: classData.id,
          participantIds: [user2.userId],
        });

      const chatId = createRes.body.data.chat._id;

      const res = await request(app)
        .get(`/api/chat/${chatId}/messages`)
        .set('x-session-id', user1.sessionId)
        .expect(200);

      expect(res.body.data.messages).toHaveLength(0);
    });
  });

  describe('GET /api/chat/:chatId', () => {
    it('retrieves chat details', async () => {
      const user1 = await createAuthenticatedUser('user1@example.com');
      const user2 = await createAuthenticatedUser('user2@example.com');
      const classData = await createClass(user1.sessionId);
      await joinClass(user2.sessionId, classData.classCode);

      const createRes = await request(app)
        .post('/api/chat/create')
        .set('x-session-id', user1.sessionId)
        .send({
          classId: classData.id,
          participantIds: [user2.userId],
          isGroupChat: false,
        });

      const chatId = createRes.body.data.chat._id;

      const res = await request(app)
        .get(`/api/chat/${chatId}`)
        .set('x-session-id', user1.sessionId)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.chat._id).toBe(chatId);
      expect(res.body.data.chat.participants).toHaveLength(2);
      expect(res.body.data.chat.classId.name).toBeDefined();
    });

    it('rejects chat details request from non-participants', async () => {
      const user1 = await createAuthenticatedUser('user1@example.com');
      const user2 = await createAuthenticatedUser('user2@example.com');
      const user3 = await createAuthenticatedUser('user3@example.com');
      const classData = await createClass(user1.sessionId);
      await joinClass(user2.sessionId, classData.classCode);
      await joinClass(user3.sessionId, classData.classCode);

      const createRes = await request(app)
        .post('/api/chat/create')
        .set('x-session-id', user1.sessionId)
        .send({
          classId: classData.id,
          participantIds: [user2.userId],
        });

      const chatId = createRes.body.data.chat._id;

      // Try to get chat details as user3 who is not in the chat
      await request(app)
        .get(`/api/chat/${chatId}`)
        .set('x-session-id', user3.sessionId)
        .expect(403);
    });

    it('returns 404 for non-existent chat', async () => {
      const user1 = await createAuthenticatedUser('user1@example.com');
      const fakeId = new mongoose.Types.ObjectId();

      await request(app)
        .get(`/api/chat/${fakeId}`)
        .set('x-session-id', user1.sessionId)
        .expect(404);
    });
  });

  describe('DELETE /api/chat/:chatId', () => {
    it('deletes a chat and its messages successfully', async () => {
      const user1 = await createAuthenticatedUser('user1@example.com');
      const user2 = await createAuthenticatedUser('user2@example.com');
      const classData = await createClass(user1.sessionId);
      await joinClass(user2.sessionId, classData.classCode);

      // Create chat
      const createRes = await request(app)
        .post('/api/chat/create')
        .set('x-session-id', user1.sessionId)
        .send({
          classId: classData.id,
          participantIds: [user2.userId],
        });

      const chatId = createRes.body.data.chat._id;

      // Send a message
      await request(app)
        .post(`/api/chat/${chatId}/send`)
        .set('x-session-id', user1.sessionId)
        .send({ content: 'Test message' });

      // Delete the chat
      const res = await request(app)
        .delete(`/api/chat/${chatId}`)
        .set('x-session-id', user1.sessionId)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Chat deleted successfully');

      // Verify chat is deleted
      await request(app)
        .get(`/api/chat/${chatId}`)
        .set('x-session-id', user1.sessionId)
        .expect(404);

      // Verify messages are deleted
      const messagesCount = await Message.countDocuments({ chatId });
      expect(messagesCount).toBe(0);
    });

    it('allows any participant to delete a chat', async () => {
      const user1 = await createAuthenticatedUser('user1@example.com');
      const user2 = await createAuthenticatedUser('user2@example.com');
      const classData = await createClass(user1.sessionId);
      await joinClass(user2.sessionId, classData.classCode);

      // User1 creates chat
      const createRes = await request(app)
        .post('/api/chat/create')
        .set('x-session-id', user1.sessionId)
        .send({
          classId: classData.id,
          participantIds: [user2.userId],
        });

      const chatId = createRes.body.data.chat._id;

      // User2 deletes the chat
      const res = await request(app)
        .delete(`/api/chat/${chatId}`)
        .set('x-session-id', user2.sessionId)
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('rejects deletion by non-participants', async () => {
      const user1 = await createAuthenticatedUser('user1@example.com');
      const user2 = await createAuthenticatedUser('user2@example.com');
      const user3 = await createAuthenticatedUser('user3@example.com');
      const classData = await createClass(user1.sessionId);
      await joinClass(user2.sessionId, classData.classCode);
      await joinClass(user3.sessionId, classData.classCode);

      // Create chat between user1 and user2
      const createRes = await request(app)
        .post('/api/chat/create')
        .set('x-session-id', user1.sessionId)
        .send({
          classId: classData.id,
          participantIds: [user2.userId],
        });

      const chatId = createRes.body.data.chat._id;

      // Try to delete as user3
      await request(app)
        .delete(`/api/chat/${chatId}`)
        .set('x-session-id', user3.sessionId)
        .expect(403);
    });

    it('rejects deletion without authentication', async () => {
      const user1 = await createAuthenticatedUser('user1@example.com');
      const user2 = await createAuthenticatedUser('user2@example.com');
      const classData = await createClass(user1.sessionId);
      await joinClass(user2.sessionId, classData.classCode);

      const createRes = await request(app)
        .post('/api/chat/create')
        .set('x-session-id', user1.sessionId)
        .send({
          classId: classData.id,
          participantIds: [user2.userId],
        });

      const chatId = createRes.body.data.chat._id;

      await request(app)
        .delete(`/api/chat/${chatId}`)
        .expect(401);
    });

    it('returns 404 for non-existent chat', async () => {
      const user1 = await createAuthenticatedUser('user1@example.com');
      const fakeId = new mongoose.Types.ObjectId();

      await request(app)
        .delete(`/api/chat/${fakeId}`)
        .set('x-session-id', user1.sessionId)
        .expect(404);
    });
  });
});

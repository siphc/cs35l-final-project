/**
 * Assignment API Integration Tests
 * 
 * Tests assignment creation, deletion, grading, and retrieval flows including success cases,
 * validation, authorization, and error handling. Each test suite manages its own database state
 * through beforeEach hooks to ensure isolation.
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
const Assignment = require('../models/assignment');
const Grade = require('../models/grade');

describe('Assignment API', () => {
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
    await Assignment.deleteMany({});
    await Grade.deleteMany({});
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Session.deleteMany({});
    await Class.deleteMany({});
    await Assignment.deleteMany({});
    await Grade.deleteMany({});
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
  const createClass = async (sessionId, name = 'Test Class', description = 'Test Description') => {
    const res = await request(app)
      .post('/api/class/create')
      .set('x-session-id', sessionId)
      .send({ name, description });

    return res.body.data;
  };

  describe('POST /api/assignment/create', () => {
    it('creates an assignment with valid instructor and data', async () => {
      const instructor = await createAuthenticatedUser('instructor@example.com');
      const classData = await createClass(instructor.sessionId);

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);

      const res = await request(app)
        .post('/api/assignment/create')
        .set('x-session-id', instructor.sessionId)
        .send({
          classId: classData.id,
          title: 'Homework 1',
          description: 'Complete the exercises',
          dueDate: dueDate.toISOString(),
          pointsPossible: 100,
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Assignment created successfully');
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.title).toBe('Homework 1');
      expect(res.body.data.description).toBe('Complete the exercises');
      expect(res.body.data.pointsPossible).toBe(100);
    });

    it('rejects creation without authentication', async () => {
      await request(app)
        .post('/api/assignment/create')
        .send({
          classId: new mongoose.Types.ObjectId(),
          title: 'Homework 1',
          description: 'Complete the exercises',
          dueDate: new Date(),
          pointsPossible: 100,
        })
        .expect(401);
    });

    it('rejects creation with invalid session ID', async () => {
      await request(app)
        .post('/api/assignment/create')
        .set('x-session-id', 'invalid-session-id')
        .send({
          classId: new mongoose.Types.ObjectId(),
          title: 'Homework 1',
          description: 'Complete the exercises',
          dueDate: new Date(),
          pointsPossible: 100,
        })
        .expect(401);
    });

    it('rejects creation by non-instructor', async () => {
      const instructor = await createAuthenticatedUser('instructor@example.com');
      const student = await createAuthenticatedUser('student@example.com');
      const classData = await createClass(instructor.sessionId);

      await request(app)
        .post('/api/class/join')
        .set('x-session-id', student.sessionId)
        .send({ classCode: classData.classCode });

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);

      const res = await request(app)
        .post('/api/assignment/create')
        .set('x-session-id', student.sessionId)
        .send({
          classId: classData.id,
          title: 'Homework 1',
          description: 'Complete the exercises',
          dueDate: dueDate.toISOString(),
          pointsPossible: 100,
        })
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Only instructors can create assignments');
    });

    it('rejects creation without classId', async () => {
      const instructor = await createAuthenticatedUser('instructor@example.com');

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);

      const res = await request(app)
        .post('/api/assignment/create')
        .set('x-session-id', instructor.sessionId)
        .send({
          title: 'Homework 1',
          description: 'Complete the exercises',
          dueDate: dueDate.toISOString(),
          pointsPossible: 100,
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('All fields are required');
    });

    it('rejects creation without title', async () => {
      const instructor = await createAuthenticatedUser('instructor@example.com');
      const classData = await createClass(instructor.sessionId);

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);

      const res = await request(app)
        .post('/api/assignment/create')
        .set('x-session-id', instructor.sessionId)
        .send({
          classId: classData.id,
          description: 'Complete the exercises',
          dueDate: dueDate.toISOString(),
          pointsPossible: 100,
        })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('rejects creation without description', async () => {
      const instructor = await createAuthenticatedUser('instructor@example.com');
      const classData = await createClass(instructor.sessionId);

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);

      const res = await request(app)
        .post('/api/assignment/create')
        .set('x-session-id', instructor.sessionId)
        .send({
          classId: classData.id,
          title: 'Homework 1',
          dueDate: dueDate.toISOString(),
          pointsPossible: 100,
        })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('rejects creation without dueDate', async () => {
      const instructor = await createAuthenticatedUser('instructor@example.com');
      const classData = await createClass(instructor.sessionId);

      const res = await request(app)
        .post('/api/assignment/create')
        .set('x-session-id', instructor.sessionId)
        .send({
          classId: classData.id,
          title: 'Homework 1',
          description: 'Complete the exercises',
          pointsPossible: 100,
        })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('rejects creation without pointsPossible', async () => {
      const instructor = await createAuthenticatedUser('instructor@example.com');
      const classData = await createClass(instructor.sessionId);

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);

      const res = await request(app)
        .post('/api/assignment/create')
        .set('x-session-id', instructor.sessionId)
        .send({
          classId: classData.id,
          title: 'Homework 1',
          description: 'Complete the exercises',
          dueDate: dueDate.toISOString(),
        })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('rejects creation with negative points', async () => {
      const instructor = await createAuthenticatedUser('instructor@example.com');
      const classData = await createClass(instructor.sessionId);

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);

      const res = await request(app)
        .post('/api/assignment/create')
        .set('x-session-id', instructor.sessionId)
        .send({
          classId: classData.id,
          title: 'Homework 1',
          description: 'Complete the exercises',
          dueDate: dueDate.toISOString(),
          pointsPossible: -10,
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Points possible must be non-negative');
    });
  });

  describe('GET /api/assignment/list/:classId', () => {
    it('returns empty array for class with no assignments', async () => {
      const instructor = await createAuthenticatedUser('instructor@example.com');
      const classData = await createClass(instructor.sessionId);

      const res = await request(app)
        .get(`/api/assignment/list/${classData.id}`)
        .set('x-session-id', instructor.sessionId)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.assignments).toEqual([]);
    });

    it('returns all assignments for instructor', async () => {
      const instructor = await createAuthenticatedUser('instructor@example.com');
      const classData = await createClass(instructor.sessionId);

      const dueDate1 = new Date();
      dueDate1.setDate(dueDate1.getDate() + 7);

      const dueDate2 = new Date();
      dueDate2.setDate(dueDate2.getDate() + 14);

      await request(app)
        .post('/api/assignment/create')
        .set('x-session-id', instructor.sessionId)
        .send({
          classId: classData.id,
          title: 'Assignment 1',
          description: 'Description 1',
          dueDate: dueDate1.toISOString(),
          pointsPossible: 100,
        });

      await request(app)
        .post('/api/assignment/create')
        .set('x-session-id', instructor.sessionId)
        .send({
          classId: classData.id,
          title: 'Assignment 2',
          description: 'Description 2',
          dueDate: dueDate2.toISOString(),
          pointsPossible: 50,
        });

      const res = await request(app)
        .get(`/api/assignment/list/${classData.id}`)
        .set('x-session-id', instructor.sessionId)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.assignments).toHaveLength(2);
      expect(res.body.data.assignments[0].title).toBe('Assignment 1');
      expect(res.body.data.assignments[1].title).toBe('Assignment 2');
    });

    it('returns assignments with student grades', async () => {
      const instructor = await createAuthenticatedUser('instructor@example.com');
      const student = await createAuthenticatedUser('student@example.com');
      const classData = await createClass(instructor.sessionId);

      await request(app)
        .post('/api/class/join')
        .set('x-session-id', student.sessionId)
        .send({ classCode: classData.classCode });

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);

      const assignmentRes = await request(app)
        .post('/api/assignment/create')
        .set('x-session-id', instructor.sessionId)
        .send({
          classId: classData.id,
          title: 'Assignment 1',
          description: 'Description 1',
          dueDate: dueDate.toISOString(),
          pointsPossible: 100,
        });

      const assignmentId = assignmentRes.body.data.id;

      await request(app)
        .post('/api/assignment/grade')
        .set('x-session-id', instructor.sessionId)
        .send({
          assignmentId,
          studentId: student.userId,
          score: 85,
          feedback: 'Good work',
        });

      const res = await request(app)
        .get(`/api/assignment/list/${classData.id}`)
        .set('x-session-id', student.sessionId)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.assignments).toHaveLength(1);
      expect(res.body.data.assignments[0].userGrade.score).toBe(85);
      expect(res.body.data.assignments[0].userGrade.feedback).toBe('Good work');
    });

    it('rejects access without authentication', async () => {
      await request(app)
        .get(`/api/assignment/list/${new mongoose.Types.ObjectId()}`)
        .expect(401);
    });

    it('rejects access with invalid session', async () => {
      await request(app)
        .get(`/api/assignment/list/${new mongoose.Types.ObjectId()}`)
        .set('x-session-id', 'invalid-session')
        .expect(401);
    });

    it('rejects access for non-class member', async () => {
      const instructor = await createAuthenticatedUser('instructor@example.com');
      const outsider = await createAuthenticatedUser('outsider@example.com');
      const classData = await createClass(instructor.sessionId);

      const res = await request(app)
        .get(`/api/assignment/list/${classData.id}`)
        .set('x-session-id', outsider.sessionId)
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('do not have access to this class');
    });

    it('sorts assignments by due date', async () => {
      const instructor = await createAuthenticatedUser('instructor@example.com');
      const classData = await createClass(instructor.sessionId);

      const dueDate1 = new Date();
      dueDate1.setDate(dueDate1.getDate() + 14);

      const dueDate2 = new Date();
      dueDate2.setDate(dueDate2.getDate() + 7);

      await request(app)
        .post('/api/assignment/create')
        .set('x-session-id', instructor.sessionId)
        .send({
          classId: classData.id,
          title: 'Assignment 1 (Due later)',
          description: 'Description 1',
          dueDate: dueDate1.toISOString(),
          pointsPossible: 100,
        });

      await request(app)
        .post('/api/assignment/create')
        .set('x-session-id', instructor.sessionId)
        .send({
          classId: classData.id,
          title: 'Assignment 2 (Due sooner)',
          description: 'Description 2',
          dueDate: dueDate2.toISOString(),
          pointsPossible: 100,
        });

      const res = await request(app)
        .get(`/api/assignment/list/${classData.id}`)
        .set('x-session-id', instructor.sessionId)
        .expect(200);

      expect(res.body.data.assignments[0].title).toContain('Due sooner');
      expect(res.body.data.assignments[1].title).toContain('Due later');
    });
  });

  describe('DELETE /api/assignment/:assignmentId', () => {
    it('deletes an assignment as instructor', async () => {
      const instructor = await createAuthenticatedUser('instructor@example.com');
      const classData = await createClass(instructor.sessionId);

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);

      const assignmentRes = await request(app)
        .post('/api/assignment/create')
        .set('x-session-id', instructor.sessionId)
        .send({
          classId: classData.id,
          title: 'Assignment 1',
          description: 'Description 1',
          dueDate: dueDate.toISOString(),
          pointsPossible: 100,
        });

      const assignmentId = assignmentRes.body.data.id;

      const deleteRes = await request(app)
        .delete(`/api/assignment/${assignmentId}`)
        .set('x-session-id', instructor.sessionId)
        .expect(200);

      expect(deleteRes.body.success).toBe(true);
      expect(deleteRes.body.message).toContain('deleted successfully');

      // Verify assignment is deleted
      const listRes = await request(app)
        .get(`/api/assignment/list/${classData.id}`)
        .set('x-session-id', instructor.sessionId);

      expect(listRes.body.data.assignments).toHaveLength(0);
    });

    it('deletes associated grades when deleting assignment', async () => {
      const instructor = await createAuthenticatedUser('instructor@example.com');
      const student = await createAuthenticatedUser('student@example.com');
      const classData = await createClass(instructor.sessionId);

      await request(app)
        .post('/api/class/join')
        .set('x-session-id', student.sessionId)
        .send({ classCode: classData.classCode });

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);

      const assignmentRes = await request(app)
        .post('/api/assignment/create')
        .set('x-session-id', instructor.sessionId)
        .send({
          classId: classData.id,
          title: 'Assignment 1',
          description: 'Description 1',
          dueDate: dueDate.toISOString(),
          pointsPossible: 100,
        });

      const assignmentId = assignmentRes.body.data.id;

      await request(app)
        .post('/api/assignment/grade')
        .set('x-session-id', instructor.sessionId)
        .send({
          assignmentId,
          studentId: student.userId,
          score: 85,
          feedback: 'Good work',
        });

      await request(app)
        .delete(`/api/assignment/${assignmentId}`)
        .set('x-session-id', instructor.sessionId)
        .expect(200);

      const grades = await Grade.find({ assignment: assignmentId });
      expect(grades).toHaveLength(0);
    });

    it('rejects deletion by non-instructor', async () => {
      const instructor = await createAuthenticatedUser('instructor@example.com');
      const student = await createAuthenticatedUser('student@example.com');
      const classData = await createClass(instructor.sessionId);

      await request(app)
        .post('/api/class/join')
        .set('x-session-id', student.sessionId)
        .send({ classCode: classData.classCode });

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);

      const assignmentRes = await request(app)
        .post('/api/assignment/create')
        .set('x-session-id', instructor.sessionId)
        .send({
          classId: classData.id,
          title: 'Assignment 1',
          description: 'Description 1',
          dueDate: dueDate.toISOString(),
          pointsPossible: 100,
        });

      const assignmentId = assignmentRes.body.data.id;

      const res = await request(app)
        .delete(`/api/assignment/${assignmentId}`)
        .set('x-session-id', student.sessionId)
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Only instructors can delete assignments');
    });

    it('rejects deletion without authentication', async () => {
      await request(app)
        .delete(`/api/assignment/${new mongoose.Types.ObjectId()}`)
        .expect(401);
    });

    it('rejects deletion of non-existent assignment', async () => {
      const instructor = await createAuthenticatedUser('instructor@example.com');

      const res = await request(app)
        .delete(`/api/assignment/${new mongoose.Types.ObjectId()}`)
        .set('x-session-id', instructor.sessionId)
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Assignment not found');
    });
  });

  describe('POST /api/assignment/grade', () => {
    it('creates a grade for a student', async () => {
      const instructor = await createAuthenticatedUser('instructor@example.com');
      const student = await createAuthenticatedUser('student@example.com');
      const classData = await createClass(instructor.sessionId);

      await request(app)
        .post('/api/class/join')
        .set('x-session-id', student.sessionId)
        .send({ classCode: classData.classCode });

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);

      const assignmentRes = await request(app)
        .post('/api/assignment/create')
        .set('x-session-id', instructor.sessionId)
        .send({
          classId: classData.id,
          title: 'Assignment 1',
          description: 'Description 1',
          dueDate: dueDate.toISOString(),
          pointsPossible: 100,
        });

      const assignmentId = assignmentRes.body.data.id;

      const gradeRes = await request(app)
        .post('/api/assignment/grade')
        .set('x-session-id', instructor.sessionId)
        .send({
          assignmentId,
          studentId: student.userId,
          score: 85,
          feedback: 'Excellent work',
        })
        .expect(200);

      expect(gradeRes.body.success).toBe(true);
      expect(gradeRes.body.message).toBe('Grade saved successfully');
      expect(gradeRes.body.data.score).toBe(85);
      expect(gradeRes.body.data.feedback).toBe('Excellent work');
    });

    it('updates an existing grade', async () => {
      const instructor = await createAuthenticatedUser('instructor@example.com');
      const student = await createAuthenticatedUser('student@example.com');
      const classData = await createClass(instructor.sessionId);

      await request(app)
        .post('/api/class/join')
        .set('x-session-id', student.sessionId)
        .send({ classCode: classData.classCode });

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);

      const assignmentRes = await request(app)
        .post('/api/assignment/create')
        .set('x-session-id', instructor.sessionId)
        .send({
          classId: classData.id,
          title: 'Assignment 1',
          description: 'Description 1',
          dueDate: dueDate.toISOString(),
          pointsPossible: 100,
        });

      const assignmentId = assignmentRes.body.data.id;

      await request(app)
        .post('/api/assignment/grade')
        .set('x-session-id', instructor.sessionId)
        .send({
          assignmentId,
          studentId: student.userId,
          score: 75,
          feedback: 'Needs improvement',
        });

      const updateRes = await request(app)
        .post('/api/assignment/grade')
        .set('x-session-id', instructor.sessionId)
        .send({
          assignmentId,
          studentId: student.userId,
          score: 90,
          feedback: 'Much better!',
        })
        .expect(200);

      expect(updateRes.body.data.score).toBe(90);
      expect(updateRes.body.data.feedback).toBe('Much better!');

      const grades = await Grade.find({ assignment: assignmentId });
      expect(grades).toHaveLength(1);
    });

    it('rejects grading without authentication', async () => {
      await request(app)
        .post('/api/assignment/grade')
        .send({
          assignmentId: new mongoose.Types.ObjectId(),
          studentId: new mongoose.Types.ObjectId(),
          score: 85,
        })
        .expect(401);
    });

    it('rejects grading by non-instructor', async () => {
      const instructor = await createAuthenticatedUser('instructor@example.com');
      const student = await createAuthenticatedUser('student@example.com');
      const outsider = await createAuthenticatedUser('outsider@example.com');
      const classData = await createClass(instructor.sessionId);

      await request(app)
        .post('/api/class/join')
        .set('x-session-id', student.sessionId)
        .send({ classCode: classData.classCode });

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);

      const assignmentRes = await request(app)
        .post('/api/assignment/create')
        .set('x-session-id', instructor.sessionId)
        .send({
          classId: classData.id,
          title: 'Assignment 1',
          description: 'Description 1',
          dueDate: dueDate.toISOString(),
          pointsPossible: 100,
        });

      const assignmentId = assignmentRes.body.data.id;

      const res = await request(app)
        .post('/api/assignment/grade')
        .set('x-session-id', outsider.sessionId)
        .send({
          assignmentId,
          studentId: student.userId,
          score: 85,
        })
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Only instructors can grade assignments');
    });

    it('rejects grading without assignmentId', async () => {
      const instructor = await createAuthenticatedUser('instructor@example.com');
      const student = await createAuthenticatedUser('student@example.com');

      const res = await request(app)
        .post('/api/assignment/grade')
        .set('x-session-id', instructor.sessionId)
        .send({
          studentId: student.userId,
          score: 85,
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('required');
    });

    it('rejects grading with score out of range', async () => {
      const instructor = await createAuthenticatedUser('instructor@example.com');
      const student = await createAuthenticatedUser('student@example.com');
      const classData = await createClass(instructor.sessionId);

      await request(app)
        .post('/api/class/join')
        .set('x-session-id', student.sessionId)
        .send({ classCode: classData.classCode });

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);

      const assignmentRes = await request(app)
        .post('/api/assignment/create')
        .set('x-session-id', instructor.sessionId)
        .send({
          classId: classData.id,
          title: 'Assignment 1',
          description: 'Description 1',
          dueDate: dueDate.toISOString(),
          pointsPossible: 100,
        });

      const assignmentId = assignmentRes.body.data.id;

      const res = await request(app)
        .post('/api/assignment/grade')
        .set('x-session-id', instructor.sessionId)
        .send({
          assignmentId,
          studentId: student.userId,
          score: 150,
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('between 0 and 100');
    });

    it('rejects grading for non-class member', async () => {
      const instructor = await createAuthenticatedUser('instructor@example.com');
      const nonMember = await createAuthenticatedUser('nonmember@example.com');
      const classData = await createClass(instructor.sessionId);

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);

      const assignmentRes = await request(app)
        .post('/api/assignment/create')
        .set('x-session-id', instructor.sessionId)
        .send({
          classId: classData.id,
          title: 'Assignment 1',
          description: 'Description 1',
          dueDate: dueDate.toISOString(),
          pointsPossible: 100,
        });

      const assignmentId = assignmentRes.body.data.id;

      const res = await request(app)
        .post('/api/assignment/grade')
        .set('x-session-id', instructor.sessionId)
        .send({
          assignmentId,
          studentId: nonMember.userId,
          score: 85,
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('not a member of this class');
    });

    it('rejects grading non-existent assignment', async () => {
      const instructor = await createAuthenticatedUser('instructor@example.com');
      const student = await createAuthenticatedUser('student@example.com');

      const res = await request(app)
        .post('/api/assignment/grade')
        .set('x-session-id', instructor.sessionId)
        .send({
          assignmentId: new mongoose.Types.ObjectId(),
          studentId: student.userId,
          score: 85,
        })
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Assignment not found');
    });
  });

  describe('GET /api/assignment/grades/:classId', () => {
    it('returns grades for instructor view', async () => {
      const instructor = await createAuthenticatedUser('instructor@example.com');
      const student = await createAuthenticatedUser('student@example.com');
      const classData = await createClass(instructor.sessionId);

      await request(app)
        .post('/api/class/join')
        .set('x-session-id', student.sessionId)
        .send({ classCode: classData.classCode });

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);

      const assignmentRes = await request(app)
        .post('/api/assignment/create')
        .set('x-session-id', instructor.sessionId)
        .send({
          classId: classData.id,
          title: 'Assignment 1',
          description: 'Description 1',
          dueDate: dueDate.toISOString(),
          pointsPossible: 100,
        });

      const assignmentId = assignmentRes.body.data.id;

      await request(app)
        .post('/api/assignment/grade')
        .set('x-session-id', instructor.sessionId)
        .send({
          assignmentId,
          studentId: student.userId,
          score: 85,
          feedback: 'Good work',
        });

      const res = await request(app)
        .get(`/api/assignment/grades/${classData.id}`)
        .set('x-session-id', instructor.sessionId)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.assignments).toHaveLength(1);
      expect(res.body.data.assignments[0].title).toBe('Assignment 1');
      expect(res.body.data.assignments[0].grades).toHaveLength(1);
      expect(res.body.data.assignments[0].grades[0].score).toBe(85);
    });

    it('returns only student own grades for student view', async () => {
      const instructor = await createAuthenticatedUser('instructor@example.com');
      const student1 = await createAuthenticatedUser('student1@example.com');
      const student2 = await createAuthenticatedUser('student2@example.com');
      const classData = await createClass(instructor.sessionId);

      await request(app)
        .post('/api/class/join')
        .set('x-session-id', student1.sessionId)
        .send({ classCode: classData.classCode });

      await request(app)
        .post('/api/class/join')
        .set('x-session-id', student2.sessionId)
        .send({ classCode: classData.classCode });

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);

      const assignmentRes = await request(app)
        .post('/api/assignment/create')
        .set('x-session-id', instructor.sessionId)
        .send({
          classId: classData.id,
          title: 'Assignment 1',
          description: 'Description 1',
          dueDate: dueDate.toISOString(),
          pointsPossible: 100,
        });

      const assignmentId = assignmentRes.body.data.id;

      await request(app)
        .post('/api/assignment/grade')
        .set('x-session-id', instructor.sessionId)
        .send({
          assignmentId,
          studentId: student1.userId,
          score: 85,
        });

      await request(app)
        .post('/api/assignment/grade')
        .set('x-session-id', instructor.sessionId)
        .send({
          assignmentId,
          studentId: student2.userId,
          score: 92,
        });

      const res = await request(app)
        .get(`/api/assignment/grades/${classData.id}`)
        .set('x-session-id', student1.sessionId)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.grades).toHaveLength(1);
      expect(res.body.data.grades[0].score).toBe(85);
    });

    it('rejects access without authentication', async () => {
      await request(app)
        .get(`/api/assignment/grades/${new mongoose.Types.ObjectId()}`)
        .expect(401);
    });

    it('rejects access for non-class member', async () => {
      const instructor = await createAuthenticatedUser('instructor@example.com');
      const outsider = await createAuthenticatedUser('outsider@example.com');
      const classData = await createClass(instructor.sessionId);

      const res = await request(app)
        .get(`/api/assignment/grades/${classData.id}`)
        .set('x-session-id', outsider.sessionId)
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('do not have access to this class');
    });
  });
});
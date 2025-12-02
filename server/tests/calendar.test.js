const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/user');
const Event = require('../models/Event');
const Class = require('../models/class');
const Assignment = require('../models/Assignment');

describe('Calendar Feature Tests', () => {
    let token;
    let userId;
    let classId;

    beforeAll(async () => {
        // Connect to a test database if not already connected
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/cs35l-test');
        }

        // Create a test user
        const userRes = await request(app).post('/api/auth/register').send({
            email: 'test@example.com',
            password: 'password123',
            firstName: 'Test',
            lastName: 'User',
        });

        // Login to get token
        const loginRes = await request(app).post('/api/auth/login').send({
            email: 'test@example.com',
            password: 'password123',
        });

        token = loginRes.body.data.sessionId;
        userId = loginRes.body.data.user.id;
    });

    afterAll(async () => {
        await User.deleteMany({});
        await Event.deleteMany({});
        await Class.deleteMany({});
        await Assignment.deleteMany({});
        await mongoose.connection.close();
    });

    describe('Event API', () => {
        let eventId;

        it('should create a new event', async () => {
            const res = await request(app)
                .post('/api/event')
                .set('x-session-id', token)
                .send({
                    title: 'Test Event',
                    date: new Date(),
                    time: '14:30',
                    color: '#ff0000',
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body.title).toEqual('Test Event');
            expect(res.body.time).toEqual('14:30');
            eventId = res.body._id;
        });

        it('should get all events for the user', async () => {
            const res = await request(app)
                .get('/api/event')
                .set('x-session-id', token);

            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBeTruthy();
            expect(res.body.length).toBeGreaterThan(0);
            expect(res.body[0].title).toEqual('Test Event');
        });

        it('should delete an event', async () => {
            const res = await request(app)
                .delete(`/api/event/${eventId}`)
                .set('x-session-id', token);

            expect(res.statusCode).toEqual(200);
            expect(res.body.msg).toEqual('Event removed');

            // Verify deletion
            const checkRes = await request(app)
                .get('/api/event')
                .set('x-session-id', token);
            expect(checkRes.body.length).toEqual(0);
        });
    });

    describe('Assignment Integration', () => {
        it('should fetch assignments for enrolled classes', async () => {
            // Create a class
            const classRes = await request(app)
                .post('/api/class/create')
                .set('x-session-id', token)
                .send({
                    name: 'Test Class',
                    description: 'Test Description',
                });

            classId = classRes.body.data.id;

            // Create an assignment for the class
            await request(app)
                .post('/api/assignment/create')
                .set('x-session-id', token)
                .send({
                    classId: classId,
                    title: 'Test Assignment',
                    description: 'Do this',
                    dueDate: new Date(),
                    pointsPossible: 100,
                });

            // Fetch my assignments
            const res = await request(app)
                .get('/api/assignment/my-assignments')
                .set('x-session-id', token);

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBeTruthy();
            expect(res.body.data.length).toBeGreaterThan(0);
            expect(res.body.data[0].title).toEqual('Test Assignment');
        });
    });
});

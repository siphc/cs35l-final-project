// testing w/ http module demonstration
const assert = require('assert');
const http = require('http');
const app = require('../app');

const server = app.listen(8080);

http.get('http://localhost:8080/api/auth/health', (res) => {
    // collect data for testing
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        const parsed = JSON.parse(data);
        assert.strictEqual(parsed.success, true);
        console.log("PASSED: Health check: " + parsed.timestamp);
    })
})

// testing w/ supertest module demonstration
const request = require('supertest');
const User = require('../models/user');
const Session = require('../models/session');

// we can and probably should refactor (divide up) this function. too bad.
async function testAuth() {
    // SETUP: clear all users from the database before testing
    await User.deleteMany({});
    await Session.deleteMany({});
    
    // 1. successful registration
    const res1 = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com', password: 'password123' })
        .expect(201);
    console.log('PASSED: Successful registration: ' + res1.body.data.id + ' @ ' + res1.body.data.timestamp);
    
    // 2. duplicate email
    const res2 = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com', password: 'different123' })
        .expect(409);
    console.log('PASSED: Duplicate email');

    // 3. wrong password/email
    const res3 = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'wrongpassword' })
        .expect(401);
    console.log('PASSED: Wrong password');
    
    const res4 = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'password123' })
        .expect(401);
    console.log('PASSED: Wrong email');

    // 4. successful login
    const res5 = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password123' })
        .expect(200);
    assert.strictEqual(res5.body.data.user.email, 'test@example.com');
    assert.ok(res5.body.data.user.id);
    assert.ok(res5.body.data.sessionId);
    console.log('PASSED: Successful login');

    // CLEANUP: remove all test data from database
    await User.deleteMany({});
    await Session.deleteMany({});
    
    console.log('=== All tests PASSED ===');
    process.exit(0);
}

testAuth().catch(err => {
    console.error('Test FAILED:', err);
    
    User.deleteMany({}).then(() => {
        process.exit(1);
    });
});
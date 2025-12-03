# CLAUDE.md - AI Assistant Guide

This document provides comprehensive guidance for AI assistants working on this codebase. Last updated: 2025-12-03

## Project Overview

**Digital Classroom Platform** - A full-stack web application for managing online classes, assignments, grades, and calendar events. This is a CS35L (Software Construction) final project demonstrating a learning management system similar to Canvas or Google Classroom.

### Key Features
- User authentication (session-based)
- Class management with unique join codes
- Assignment creation and submission tracking
- Grading system with gradebook views
- Calendar with personal events and assignment due dates
- Role-based access control (Instructor/Student)
- User profile management

---

## Codebase Structure

```
cs35l-final-project/
├── client/                         # Frontend React application
│   ├── public/                     # Static assets
│   ├── src/
│   │   ├── app.jsx                 # Main app with routing logic
│   │   ├── main.jsx                # React entry point
│   │   ├── login.jsx               # Login page
│   │   ├── register.jsx            # Registration page
│   │   ├── dashboard.jsx           # Main dashboard (class cards)
│   │   ├── Course.jsx              # Course detail view with tabs
│   │   ├── AssignmentsTab.jsx      # Assignment management component
│   │   ├── GradesTab.jsx           # Gradebook component
│   │   ├── GroupsTab.jsx           # Class members component
│   │   ├── calendar.jsx            # Calendar view with events
│   │   ├── account.jsx             # User account settings
│   │   ├── messaging.jsx           # Messaging UI (placeholder)
│   │   ├── sidebar.jsx             # Navigation sidebar
│   │   └── *.css                   # Component-specific styles
│   ├── package.json
│   ├── vite.config.js
│   └── eslint.config.js
│
├── server/                         # Backend Node.js/Express API
│   ├── config/
│   │   └── db.js                   # MongoDB connection logic
│   ├── models/                     # Mongoose schemas
│   │   ├── user.js                 # User model
│   │   ├── class.js                # Class model
│   │   ├── Assignment.js           # Assignment model (PascalCase)
│   │   ├── Grade.js                # Grade model (PascalCase)
│   │   ├── Event.js                # Calendar event model (PascalCase)
│   │   └── session.js              # Session model for auth
│   ├── routes/                     # API endpoint definitions
│   │   ├── auth.js                 # Authentication endpoints
│   │   ├── class.js                # Class CRUD + join logic
│   │   ├── assignment.js           # Assignment & grading endpoints
│   │   ├── event.js                # Calendar event endpoints
│   │   └── profile.js              # User profile endpoints
│   ├── middleware/
│   │   └── authMiddleware.js       # Session verification middleware
│   ├── tests/                      # Jest integration tests
│   │   ├── auth.test.js            # Auth tests (188 lines)
│   │   ├── class.test.js           # Class tests (481 lines)
│   │   ├── assignment.test.js      # Assignment tests (988 lines)
│   │   ├── calendar.test.js        # Calendar tests (129 lines)
│   │   └── profile.test.js         # Profile tests (449 lines)
│   ├── docs/                       # Documentation
│   │   ├── README.md
│   │   └── auth.md                 # API integration examples
│   ├── app.js                      # Express app configuration
│   ├── server.js                   # Server entry point
│   ├── package.json
│   └── .env.example                # Environment template
│
├── README.md                       # Setup instructions
└── .gitignore
```

---

## Tech Stack & Dependencies

### Frontend
- **React 19.1.1** - UI framework (latest version)
- **Vite 7.1.7** - Build tool and dev server
- **ESLint** - Code linting
- **No CSS framework** - Pure CSS with component-specific files
- **No Axios** - Uses native Fetch API

### Backend
- **Node.js** with **Express 5.1.0**
- **MongoDB** with **Mongoose 8.19.2** - Database and ODM
- **CORS 2.8.5** - Cross-origin resource sharing
- **dotenv 16.6.1** - Environment variables
- **Native crypto module** - SHA-256 password hashing
- **Nodemon 3.1.10** - Dev auto-reload

### Testing
- **Jest 30.2.0** - Testing framework
- **Supertest 7.1.4** - HTTP assertions
- **Total test coverage**: 2,235 lines across 5 test files

### Database
- **MongoDB** (local instance required)
  - Development: `35l_app`
  - Testing: `35l_app_test`

---

## Development Workflows

### Git Workflow (CRITICAL)
**NEVER push directly to `main`!** This project uses a strict PR-based workflow:

1. **Create a feature branch**:
   - Named by feature: `frontend-authentication`, `hotfix-calendar`
   - Or by username: `siphc`, `username`

2. **Make changes and commit** to your branch

3. **Push to your branch**: `git push origin your-branch-name`

4. **Create Pull Request** to `main`:
   - Link to the relevant [GitHub Issue](https://github.com/siphc/cs35l-final-project/issues)
   - PR should resolve the entire issue
   - Use descriptive PR titles (they become commit messages)

5. **Request review** from a team member

6. **Squash and merge** after approval:
   - Combines all commits into one
   - Keeps main branch history clean
   - Auto-closes linked issues

7. **GitHub Projects automation** marks items as done when PR merges

### Local Development Setup

#### Frontend Setup
```bash
cd client/
npm install
npm run dev          # Starts Vite dev server (usually port 5173)
```

#### Backend Setup
```bash
cd server/
npm install
npm run dev          # Starts with nodemon (auto-reload)
# OR
npm start            # Production mode
```

#### Environment Configuration
Create `/server/.env` with:
```env
MONGODB_URI=mongodb://localhost:27017/35l_app
MONGODB_TEST_URI=mongodb://localhost:27017/35l_app_test
PORT=3001
NODE_ENV=development
```

#### Running Tests
```bash
cd server/
npm test                                    # Run all tests
npm test -- --detectOpenHandles             # Debug hanging connections
npm test -- auth.test.js                    # Run specific test file
```

**Important**: Tests use `NODE_ENV=test` and a separate database to prevent data pollution.

---

## Key Conventions

### File Naming Conventions
- **React Components**: PascalCase with `.jsx` extension
  - `Course.jsx`, `AssignmentsTab.jsx`, `GradesTab.jsx`
- **Models**: Mixed convention
  - Older models: camelCase (`user.js`, `class.js`, `session.js`)
  - Newer models: PascalCase (`Assignment.js`, `Grade.js`, `Event.js`)
- **Routes**: camelCase (`auth.js`, `class.js`, `assignment.js`)
- **Middleware**: camelCase (`authMiddleware.js`)

### Code Organization Patterns

#### API Response Format
All API responses follow this structure:
```javascript
{
  "success": true,        // or false
  "message": "...",       // Human-readable message
  "data": {...}           // Response payload (optional)
}
```

#### HTTP Status Codes
- **200**: Success
- **201**: Created
- **400**: Bad request / Validation error
- **401**: Unauthorized (not authenticated)
- **403**: Forbidden (authenticated but not authorized)
- **404**: Not found
- **409**: Conflict (e.g., duplicate email)
- **500**: Server error

#### Route Documentation
Routes use JSDoc-style comments:
```javascript
/**
 * @route   POST /api/class/create
 * @desc    Create a new class
 * @access  Private
 */
```

#### Authorization Helper Functions
Located in `/server/routes/class.js`, reused across route files:
```javascript
isInstructor(classId, userId)      // Check if user is instructor
isMember(classId, userId)          // Check if user is a student
hasClassAccess(classId, userId)    // Check any access (instructor or student)
getUserRole(classId, userId)       // Get user's role in class
```

**Important**: Always use these helpers for authorization checks. They're already tested and handle edge cases.

---

## Architecture Patterns

### Authentication System

**Session-Based (NOT JWT)**
- Sessions stored in MongoDB with TTL index
- Session IDs: 64-character hex strings
- Expiration: 24 hours (automatic cleanup via MongoDB TTL)
- Storage: `sessionId` in `localStorage` on frontend

#### Session Flow
1. **Login**: POST `/api/auth/login` → returns `sessionId`
2. **Store**: `localStorage.setItem('sessionId', sessionId)`
3. **Use**: Include in requests via:
   - Header: `x-session-id: <sessionId>`
   - Query param: `?sessionId=<sessionId>`
4. **Verify**: GET `/api/auth/verify` checks session validity
5. **Logout**: POST `/api/auth/logout` destroys session

#### Protected Routes
All protected routes use `authMiddleware`:
```javascript
const authMiddleware = require('../middleware/authMiddleware');
router.post('/create', authMiddleware, async (req, res) => {
  // req.user populated by middleware
});
```

### Security Patterns

#### Password Hashing
- Uses **SHA-256** (via native crypto module)
- **Note**: Not bcrypt - acceptable for academic project but SHA-256 is less secure
- Passwords excluded from queries: `select: false` in schema

#### Model Security
```javascript
// Passwords never returned in queries
const UserSchema = new mongoose.Schema({
  password: { type: String, required: true, select: false }
});
```

### Database Patterns

#### Indexes
```javascript
// Assignment model - compound index for performance
assignmentSchema.index({ class: 1, dueDate: 1 });

// Grade model - unique constraint
gradeSchema.index({ assignment: 1, student: 1 }, { unique: true });

// Session model - TTL for auto-cleanup
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

#### Pre-save Hooks
```javascript
// Class model - generate unique code before saving
classSchema.pre('save', async function(next) {
  if (!this.code) {
    this.code = await generateUniqueCode();
  }
  next();
});

// User model - hash password before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = crypto.createHash('sha256')
      .update(this.password)
      .digest('hex');
  }
  next();
});
```

#### Cascading Deletes
When deleting assignments, grades are automatically deleted:
```javascript
// In assignment routes
await Grade.deleteMany({ assignment: assignmentId });
await Assignment.findByIdAndDelete(assignmentId);
```

### Frontend Patterns

#### API Base URL
```javascript
const API_BASE_URL = 'http://localhost:3001';
```

#### Session Persistence
```javascript
// On page load (useEffect in app.jsx)
const sessionId = localStorage.getItem('sessionId');
if (sessionId) {
  // Verify session still valid
  const response = await fetch(`${API_BASE_URL}/api/auth/verify?sessionId=${sessionId}`);
}
```

#### View-based Routing
No React Router - uses state-based view switching:
```javascript
const [currentView, setCurrentView] = useState('dashboard');

// Render based on view
if (currentView === 'dashboard') return <Dashboard />;
if (currentView === 'calendar') return <Calendar />;
```

#### Modal Pattern
Forms displayed as modals with overlay:
```html
<div className="modal-overlay">
  <div className="modal-content">
    <form>{/* form fields */}</form>
  </div>
</div>
```

---

## API Endpoints Reference

### Base URL
```
http://localhost:3001
```

### Authentication (`/api/auth/`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | No | Register new user |
| POST | `/login` | No | Login (returns sessionId) |
| POST | `/logout` | Yes | Logout |
| GET | `/verify` | Yes | Verify session validity |
| GET | `/health` | No | Health check |

### Classes (`/api/class/`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/create` | Yes | Create new class (instructor) |
| POST | `/join` | Yes | Join class via code (student) |
| GET | `/my-classes` | Yes | Get user's classes |
| GET | `/:classId` | Yes | Get class details |
| GET | `/:classId/members` | Yes | Get class members |

### Assignments (`/api/assignment/`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/create` | Yes | Create assignment (instructor) |
| GET | `/class/:classId` | Yes | Get class assignments |
| DELETE | `/:assignmentId` | Yes | Delete assignment (instructor) |
| POST | `/grade` | Yes | Grade assignment (instructor) |
| GET | `/grades/:classId` | Yes | Get gradebook |

### Calendar (`/api/event/`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/create` | Yes | Create personal event |
| GET | `/` | Yes | Get user's events |
| DELETE | `/:eventId` | Yes | Delete event |

### Profile (`/api/profile/`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Yes | Get user profile |
| PUT | `/update` | Yes | Update display name |

---

## Testing Guidelines

### Test Structure
All tests are **integration tests** using Jest + Supertest.

#### Test File Pattern
```javascript
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/user');

describe('Feature Name', () => {
  let server;

  beforeAll(() => {
    server = app.listen(8081);  // Test server on port 8081
  });

  afterAll(async () => {
    await server.close();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clean database before each test
    await User.deleteMany({});
  });

  test('should do something', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });
});
```

### Testing Best Practices
1. **Clean database** in `beforeEach` to ensure test isolation
2. **Use test database** (`35l_app_test`) to prevent data corruption
3. **Test error cases** as well as success cases
4. **Check authorization** - verify instructors can't do student actions and vice versa
5. **Test cascading deletes** - ensure related data is cleaned up
6. **Run tests sequentially** - use `--runInBand` flag (already in package.json)

### Common Test Patterns

#### Create Test User
```javascript
const testUser = {
  email: 'test@example.com',
  password: 'password123'
};

// Register
await request(app)
  .post('/api/auth/register')
  .send(testUser);

// Login to get session
const loginRes = await request(app)
  .post('/api/auth/login')
  .send(testUser);

const sessionId = loginRes.body.data.sessionId;
```

#### Make Authenticated Request
```javascript
const response = await request(app)
  .post('/api/class/create')
  .set('x-session-id', sessionId)
  .send({ name: 'CS 35L', description: 'Software Construction' });
```

---

## Common Tasks & Patterns

### Adding a New Model

1. **Create model file** in `/server/models/`
   ```javascript
   const mongoose = require('mongoose');

   const myModelSchema = new mongoose.Schema({
     field1: { type: String, required: true },
     field2: { type: Number, default: 0 },
     user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
   }, { timestamps: true });

   module.exports = mongoose.model('MyModel', myModelSchema);
   ```

2. **Add indexes** if needed for performance
   ```javascript
   myModelSchema.index({ user: 1, createdAt: -1 });
   ```

3. **Create route file** in `/server/routes/`
   ```javascript
   const express = require('express');
   const router = express.Router();
   const MyModel = require('../models/MyModel');
   const authMiddleware = require('../middleware/authMiddleware');

   router.post('/create', authMiddleware, async (req, res) => {
     // Implementation
   });

   module.exports = router;
   ```

4. **Register routes** in `/server/app.js`
   ```javascript
   const myModelRoutes = require('./routes/myModel');
   app.use('/api/mymodel', myModelRoutes);
   ```

5. **Write tests** in `/server/tests/myModel.test.js`

### Adding a New React Component

1. **Create component file** in `/client/src/`
   ```jsx
   import { useState, useEffect } from 'react';
   import './MyComponent.css';

   function MyComponent({ prop1, prop2 }) {
     const [state, setState] = useState(null);

     useEffect(() => {
       // Fetch data
     }, []);

     return (
       <div className="my-component">
         {/* JSX */}
       </div>
     );
   }

   export default MyComponent;
   ```

2. **Create CSS file** in `/client/src/MyComponent.css`

3. **Import and use** in parent component
   ```jsx
   import MyComponent from './MyComponent';

   <MyComponent prop1={value1} prop2={value2} />
   ```

### Making API Calls from Frontend

```javascript
const API_BASE_URL = 'http://localhost:3001';

async function makeApiCall() {
  try {
    const sessionId = localStorage.getItem('sessionId');

    const response = await fetch(`${API_BASE_URL}/api/endpoint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-session-id': sessionId  // Include session
      },
      body: JSON.stringify({ data: 'value' })
    });

    const result = await response.json();

    if (!result.success) {
      console.error('Error:', result.message);
      return;
    }

    // Handle success
    console.log(result.data);

  } catch (error) {
    console.error('Network error:', error);
  }
}
```

### Role-Based Authorization in Routes

```javascript
const { isInstructor, isMember } = require('./class');  // Import helpers

router.post('/restricted-action', authMiddleware, async (req, res) => {
  try {
    const { classId } = req.body;
    const userId = req.user._id;

    // Check authorization
    const instructor = await isInstructor(classId, userId);
    if (!instructor) {
      return res.status(403).json({
        success: false,
        message: 'Only instructors can perform this action'
      });
    }

    // Proceed with action

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});
```

---

## Important Gotchas & Notes

### Critical Issues to Watch For

1. **Server Entry Point**
   - README says `node app.js` but it should be `node server.js`
   - `server.js` is the entry point, `app.js` exports the Express app

2. **MongoDB Required**
   - Must have local MongoDB running on port 27017
   - Tests will fail if MongoDB is not running
   - No cloud database configured

3. **Password Security**
   - Uses SHA-256, NOT bcrypt
   - Acceptable for academic project but mention in production contexts
   - Never log passwords or session IDs

4. **No JWT**
   - This project uses session-based auth, not JWT
   - Don't suggest JWT patterns
   - Sessions are stored in MongoDB

5. **Model Naming Inconsistency**
   - Old models: `user.js`, `class.js`, `session.js`
   - New models: `Assignment.js`, `Grade.js`, `Event.js`
   - When creating new models, use PascalCase (newer convention)

6. **No React Router**
   - Uses state-based view switching
   - `currentView` state controls what's displayed
   - Don't suggest installing React Router unless specifically requested

7. **No Axios**
   - Uses native Fetch API
   - Don't suggest Axios unless specifically requested

8. **Messaging Feature**
   - UI exists but appears to be non-functional placeholder
   - No backend routes for messaging yet

9. **Test Database Cleanup**
   - Tests use `beforeEach` to clean database
   - Ensures test isolation
   - Don't remove these cleanup blocks

10. **Class Join Codes**
    - 6-character alphanumeric codes
    - Auto-generated and guaranteed unique
    - Case-insensitive when joining

### Environment-Specific Behavior

**Development Mode**:
- Detailed error messages
- MongoDB dev database
- CORS enabled for localhost

**Test Mode** (`NODE_ENV=test`):
- Uses `35l_app_test` database
- Server runs on port 8081
- Detailed error logging

**Production Mode**:
- Generic error messages
- Should use production MongoDB URI
- Appropriate CORS configuration needed

### Performance Considerations

1. **Database Indexes**
   - Critical queries have indexes
   - Compound indexes on assignments: `{ class: 1, dueDate: 1 }`
   - Unique constraint on grades: `{ assignment: 1, student: 1 }`

2. **Session TTL**
   - MongoDB automatically cleans expired sessions
   - No manual cleanup needed
   - TTL index on `expiresAt` field

3. **Cascading Operations**
   - Deleting assignments also deletes grades
   - Ensure proper order of operations
   - Use transactions for complex multi-model operations

---

## Development Tips for AI Assistants

### When Writing Code

1. **Always read existing code first** before suggesting changes
2. **Follow existing patterns** - don't introduce new paradigms
3. **Use authorization helpers** from `class.js` routes
4. **Maintain consistent error handling** - use the standard response format
5. **Write tests** for new features (integration style, not unit)
6. **Don't over-engineer** - keep solutions simple and focused
7. **Preserve naming conventions** - PascalCase for new models, components

### When Reviewing Code

1. **Check authorization** - verify only authorized users can access endpoints
2. **Validate input** - ensure proper validation for all user inputs
3. **Test error cases** - not just happy path
4. **Check database cleanup** - ensure cascading deletes work properly
5. **Verify session handling** - session required for protected routes
6. **Review test coverage** - new features should have tests

### When Debugging

1. **Check MongoDB connection** - is MongoDB running?
2. **Verify environment variables** - is `.env` configured?
3. **Check session validity** - sessions expire after 24 hours
4. **Review authorization logic** - are role checks correct?
5. **Check test database** - tests use separate database
6. **Verify CORS** - frontend on different port than backend

### When Answering Questions

1. **Reference line numbers** - use `file:line` format (e.g., `app.js:42`)
2. **Explain patterns** - describe why code is structured a certain way
3. **Mention gotchas** - highlight common pitfalls
4. **Suggest best practices** - follow this project's conventions
5. **Link to relevant files** - help user navigate codebase

### Frontend Design Principles

**Avoid Generic "AI Slop" Aesthetics** - AI assistants tend to converge toward generic, "on distribution" outputs. In frontend design, this creates what users call the "AI slop" aesthetic. Avoid this by making creative, distinctive frontends that surprise and delight.

#### Typography
- Choose fonts that are **beautiful, unique, and interesting**
- **Avoid generic fonts** like Arial, Inter, Roboto, and system fonts
- Opt for distinctive choices that elevate the frontend's aesthetics
- Consider typography as a primary design element

#### Color & Theme
- **Commit to a cohesive aesthetic** - use CSS variables for consistency
- **Dominant colors with sharp accents** outperform timid, evenly-distributed palettes
- Draw inspiration from IDE themes and cultural aesthetics
- **Avoid clichéd color schemes**, particularly purple gradients on white backgrounds
- Vary between light and dark themes based on context

#### Motion & Animation
- Use animations for effects and micro-interactions
- **Prioritize CSS-only solutions** for HTML elements
- Use Motion library for React when available
- Focus on **high-impact moments**: one well-orchestrated page load with staggered reveals (`animation-delay`) creates more delight than scattered micro-interactions
- Make animations purposeful and contextual

#### Backgrounds
- Create **atmosphere and depth** rather than defaulting to solid colors
- Layer CSS gradients for visual interest
- Use geometric patterns when appropriate
- Add contextual effects that match the overall aesthetic
- Think beyond plain white or gray backgrounds

#### What to Avoid
- ❌ Overused font families (Inter, Roboto, Arial, system fonts, Space Grotesk)
- ❌ Clichéd color schemes and predictable palettes
- ❌ Generic layouts and cookie-cutter component patterns
- ❌ Design that lacks context-specific character
- ❌ Converging on common choices across generations

#### Key Principle
**Interpret creatively and make unexpected choices** that feel genuinely designed for the context. Think outside the box and create frontends that have personality and distinction. Each design should feel intentional and unique to its purpose.

---

## Quick Reference

### Ports
- Backend API: **3001**
- Frontend Dev: **5173** (Vite default)
- Test Server: **8081**

### Key Files to Read First
1. `/server/app.js` - Express configuration
2. `/client/src/app.jsx` - Frontend routing and auth
3. `/server/routes/class.js` - Authorization helpers
4. `/server/middleware/authMiddleware.js` - Session verification
5. `/server/docs/auth.md` - API integration examples

### Common Commands
```bash
# Frontend
cd client/
npm install
npm run dev
npm run build
npm run lint

# Backend
cd server/
npm install
npm run dev        # Development with nodemon
npm start          # Production
npm test           # Run all tests
npm test -- auth   # Run specific test suite

# Git workflow
git checkout -b feature-name
git add .
git commit -m "descriptive message"
git push origin feature-name
# Then create PR on GitHub
```

### MongoDB Connection Strings
```env
# Development
MONGODB_URI=mongodb://localhost:27017/35l_app

# Testing
MONGODB_TEST_URI=mongodb://localhost:27017/35l_app_test
```

---

## Additional Resources

- **GitHub Issues**: https://github.com/siphc/cs35l-final-project/issues
- **Pull Requests**: https://github.com/siphc/cs35l-final-project/pulls
- **API Documentation**: `/server/docs/auth.md`
- **Project Board**: GitHub Projects (linked to repository)

---

## Changelog

- **2025-12-03**:
  - Initial CLAUDE.md creation with comprehensive codebase analysis
  - Added Frontend Design Principles section to guide AI assistants in creating distinctive, non-generic UIs

---

**Remember**: This is an academic project focused on learning full-stack development. The goal is clean, understandable code that demonstrates software engineering principles, not production-scale optimization.

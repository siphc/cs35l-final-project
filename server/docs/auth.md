# Authentication Backend API

A Node.js/Express REST API for user authentication with MongoDB.

## API Endpoints

Base URL: `http://localhost:3001`

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user (returns sessionId)
- `POST /api/auth/logout` - Logout user (requires sessionId)
- `GET /api/auth/verify` - Verify session (requires sessionId in header or query)
- `GET /api/auth/health` - Health check

## Frontend Integration

### Using Fetch API

```javascript
const API_URL = 'http://localhost:3001/api/auth';

// Login
async function login(email, password) {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  if (data.success) {
    localStorage.setItem('sessionId', data.data.sessionId);
  }
  return data;
}

// Verify session
async function verifySession() {
  const sessionId = localStorage.getItem('sessionId');
  const response = await fetch(`${API_URL}/verify?sessionId=${sessionId}`);
  return response.json();
}

// Logout
async function logout() {
  const sessionId = localStorage.getItem('sessionId');
  await fetch(`${API_URL}/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId })
  });
  localStorage.removeItem('sessionId');
}
```

### Using Axios

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api/auth',
  headers: { 'Content-Type': 'application/json' }
});

// Session management
const setSession = (sessionId) => {
  localStorage.setItem('sessionId', sessionId);
  api.defaults.headers.common['x-session-id'] = sessionId;
};

const clearSession = () => {
  localStorage.removeItem('sessionId');
  delete api.defaults.headers.common['x-session-id'];
};

// Login
async function login(email, password) {
  const response = await api.post('/login', { email, password });
  setSession(response.data.data.sessionId);
  return response.data;
}

// Verify
async function verifySession() {
  const sessionId = localStorage.getItem('sessionId');
  const response = await api.get('/verify', { params: { sessionId } });
  return response.data;
}

// Logout
async function logout() {
  const sessionId = localStorage.getItem('sessionId');
  if (sessionId) await api.post('/logout', { sessionId });
  clearSession();
}
```

## Notes

- Sessions expire after 24 hours
- Store `sessionId` from login response in localStorage
- Include `sessionId` in requests via `x-session-id` header or `sessionId` query parameter

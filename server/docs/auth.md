# Authentication API Documentation

A REST API for user authentication and session management.

## Base URL

```
http://localhost:3001/api/auth
```

## Endpoints

### Register
**`POST /api/auth/register`**

Create a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "user_id_here",
    "email": "user@example.com",
    "createdAt": "2025-12-03T10:30:00.000Z"
  }
}
```

---

### Login
**`POST /api/auth/login`**

Authenticate a user and get a session.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "sessionId": "unique_session_id_here",
    "user": {
      "id": "user_id_here",
      "email": "user@example.com"
    }
  }
}
```

**Save the `sessionId`** - you'll need it for authenticated requests.

---

### Logout
**`POST /api/auth/logout`**

End a user session.

**Request:**
```json
{
  "sessionId": "your_session_id_here"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

### Verify Session
**`GET /api/auth/verify`**

Check if a session is valid.

**Query Parameter or Header:**
- Via header: `x-session-id: your_session_id_here`
- Via query: `?sessionId=your_session_id_here`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id_here",
      "email": "user@example.com"
    },
    "expiresAt": "2025-12-04T10:30:00.000Z"
  }
}
```

---

### Health Check
**`GET /api/auth/health`**

Check if the API is running.

**Response (200):**
```json
{
  "success": true,
  "message": "Auth API is running",
  "timestamp": "2025-12-03T10:30:00.000Z"
}
```
# Authentication Backend API

A Node.js/Express REST API for user authentication with MongoDB.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Update `MONGODB_URI` with your MongoDB connection string
   - Adjust `PORT` if needed (default: 5002)

3. **Start the server:**
   ```bash
   # Development mode (with auto-reload)
   npm run dev

   # Production mode
   npm start
   ```

## API Endpoints

### Base URL
```
http://localhost:5002
```

### 1. Register User

Register a new user account.

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**

- **400 Bad Request** - Missing or invalid fields:
  ```json
  {
    "success": false,
    "message": "Email and password are required"
  }
  ```

- **400 Bad Request** - Invalid email format:
  ```json
  {
    "success": false,
    "message": "Please provide a valid email address"
  }
  ```

- **400 Bad Request** - Password too short:
  ```json
  {
    "success": false,
    "message": "Password must be at least 6 characters long"
  }
  ```

- **409 Conflict** - User already exists:
  ```json
  {
    "success": false,
    "message": "User with this email already exists"
  }
  ```

- **500 Internal Server Error** - Server error:
  ```json
  {
    "success": false,
    "message": "Internal server error"
  }
  ```

### 2. Health Check

Check if the API is running.

**Endpoint:** `GET /api/auth/health`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Auth API is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 3. Root Endpoint

Get API information and available endpoints.

**Endpoint:** `GET /`

**Success Response (200):**
```json
{
  "message": "User Authentication API",
  "version": "1.0.0",
  "status": "running",
  "endpoints": {
    "register": {
      "method": "POST",
      "path": "/api/auth/register",
      "description": "Register a new user"
    },
    "health": {
      "method": "GET",
      "path": "/api/auth/health",
      "description": "Check API health"
    }
  }
}
```

## Error Handling

All error responses follow this format:
```json
{
  "success": false,
  "message": "Error description"
}
```

404 responses include the requested path:
```json
{
  "success": false,
  "message": "Endpoint not found",
  "requestedPath": "/api/invalid"
}
```

## Frontend Integration Example

### Using Fetch API

```javascript
// Register a new user
async function registerUser(email, password) {
  try {
    const response = await fetch('http://localhost:5002/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('User registered:', data.data);
      return data;
    } else {
      console.error('Registration failed:', data.message);
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Network error:', error);
    throw error;
  }
}
```

### Using Axios

```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5002/api/auth';

// Register a new user
async function registerUser(email, password) {
  try {
    const response = await axios.post(`${API_BASE_URL}/register`, {
      email: email,
      password: password
    });
    
    return response.data;
  } catch (error) {
    if (error.response) {
      // Server responded with error status
      throw new Error(error.response.data.message);
    } else {
      // Network or other error
      throw error;
    }
  }
}
```

## Security Notes

- Passwords are hashed using SHA-256 before storage
- Passwords are never returned in API responses
- Email addresses are stored in lowercase and trimmed
- CORS is enabled for cross-origin requests

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | Required |
| `PORT` | Server port number | 5002 |
| `NODE_ENV` | Environment mode (development/production) | development |

## Development

- Server runs on `http://localhost:5002` by default
- In development mode, all requests are logged to the console
- Error messages include stack traces in development mode


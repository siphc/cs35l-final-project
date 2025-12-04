# Profile API Documentation

Manage user profile information including display name and personal details.

## Base URL

```
http://localhost:3001/api/profile
```

## Endpoints

### Get Profile
**`GET /api/profile`**

Retrieve the authenticated user's profile information.

**Request:**
Include your session in the header or query parameter (see Authentication section).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "user_id_here",
    "email": "user@example.com",
    "displayName": "John Doe",
    "createdAt": "2025-12-01T10:00:00.000Z",
    "updatedAt": "2025-12-03T14:30:00.000Z"
  }
}
```

---

### Update Display Name
**`PUT /api/profile/update-displayName`**

Update your display name.

**Request:**
```json
{
  "displayName": "Jane Smith"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "user_id_here",
    "email": "user@example.com",
    "displayName": "Jane Smith"
  }
}
```

---

## Authentication

All endpoints require authentication. Include your session in the header:

```
x-session-id: your_session_id_here
```

---

## Error Responses

### 400 - Bad Request
Missing or invalid fields.

### 401 - Unauthorized
Invalid or expired session.

### 404 - Not Found
User profile not found.

### 500 - Server Error
Unexpected error. Contact support.

---

## Important Notes

- **Password:** Cannot be updated via profile endpoints
- **Email:** Email address cannot be changed through this API
- **Display Name:** Can be empty, but whitespace is trimmed
- **Read-only fields:** `id`, `createdAt`, `email`
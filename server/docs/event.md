# Event API Documentation

Create and manage calendar events. Organize your schedule with color-coded events.

## Base URL

```
http://localhost:3001/api/event
```

## Endpoints

### Create Event
**`POST /api/event`**

Create a new calendar event.

**Request:**
```json
{
  "title": "CS 101 Midterm Exam",
  "date": "2025-12-20",
  "time": "14:00",
  "color": "#FF5733"
}
```

**Response (201):**
```json
{
  "id": "event_id_here",
  "user": "user_id_here",
  "title": "CS 101 Midterm Exam",
  "date": "2025-12-20",
  "time": "14:00",
  "color": "#FF5733",
  "createdAt": "2025-12-10T10:30:00.000Z"
}
```

---

### Get My Events
**`GET /api/event`**

Retrieve all events for the authenticated user, sorted by date.

**Response (200):**
```json
[
  {
    "id": "event_id_1",
    "user": "user_id_here",
    "title": "CS 101 Midterm Exam",
    "date": "2025-12-20",
    "time": "14:00",
    "color": "#FF5733",
    "createdAt": "2025-12-10T10:30:00.000Z"
  },
  {
    "id": "event_id_2",
    "user": "user_id_here",
    "title": "Homework 1 Due",
    "date": "2025-12-17",
    "time": "23:59",
    "color": "#3498DB",
    "createdAt": "2025-12-10T10:35:00.000Z"
  }
]
```

---

### Delete Event
**`DELETE /api/event/:id`**

Delete an event.

**URL Parameter:**
- `id` - The ID of the event

**Response (200):**
```json
{
  "msg": "Event removed"
}
```

---

## Authentication

All endpoints require authentication. Include your session in the header:

```
x-session-id: your_session_id_here
```

---

## Event Fields

- **Title:** Event name or description (required)
- **Date:** Event date in YYYY-MM-DD format (required)
- **Time:** Event time in HH:MM format (optional, defaults to 00:00)
- **Color:** Hex color code for visual organization (required)

---

## Date & Time Format

- **Date:** `YYYY-MM-DD` (e.g., `2025-12-20`)
- **Time:** `HH:MM` in 24-hour format (e.g., `14:00`)
- **Timezone:** Events stored in UTC; display times based on client timezone

---

## Error Responses

### 400 - Bad Request
Missing or invalid fields.

### 401 - Unauthorized
Invalid or expired session.

### 404 - Not Found
Event not found or not owned by user.

### 500 - Server Error
Unexpected error. Contact support.

---

## Important Notes

- **Personal events:** Events are visible only to the user who created them
- **Sorting:** Events are returned sorted by date (earliest first)
- **Color codes:** Use hex format (e.g., `#FF5733`)
- **Time optional:** If omitted, defaults to midnight (00:00)
- **No editing:** Delete and recreate if changes are needed
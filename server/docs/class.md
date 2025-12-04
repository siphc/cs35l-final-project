# Class API Documentation

Create and manage classes. Instructors create classes; students join using class codes.

## Base URL

```
http://localhost:3001/api/class
```

## Endpoints

### Create Class
**`POST /api/class/create`**

Create a new class (instructor).

**Request:**
```json
{
  "name": "Introduction to Computer Science",
  "description": "Learn the fundamentals of CS"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Class created successfully",
  "data": {
    "id": "class_id_here",
    "name": "Introduction to Computer Science",
    "description": "Learn the fundamentals of CS",
    "classCode": "ABC123",
    "creator": "instructor_id_here"
  }
}
```

**Important:** Save the `classCode` — students need it to join.

---

### Join Class
**`POST /api/class/join`**

Join an existing class using a class code (student).

**Request:**
```json
{
  "classCode": "ABC123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Successfully joined class",
  "data": {
    "id": "class_id_here",
    "name": "Introduction to Computer Science",
    "classCode": "ABC123"
  }
}
```

---

### Get My Classes
**`GET /api/class/my-classes`**

List all classes you created or joined.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "class_id_1",
      "name": "Introduction to Computer Science",
      "description": "Learn the fundamentals of CS",
      "classCode": "ABC123",
      "role": "Instructor"
    },
    {
      "id": "class_id_2",
      "name": "Data Structures",
      "description": "Advanced data structures course",
      "classCode": "XYZ789",
      "role": "Student"
    }
  ]
}
```

---

### Get Class Members
**`GET /api/class/:classId/members`**

List all members (instructor and students) in a class.

**URL Parameter:**
- `classId` - The ID of the class

**Response (200):**
```json
{
  "success": true,
  "data": {
    "instructor": {
      "id": "instructor_id_here",
      "email": "instructor@example.com",
      "displayName": "Dr. Smith"
    },
    "students": [
      {
        "id": "student_id_1",
        "email": "student1@example.com",
        "displayName": "John Doe"
      },
      {
        "id": "student_id_2",
        "email": "student2@example.com",
        "displayName": "Jane Doe"
      }
    ]
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

## Class Codes

- **Format:** Uppercase alphanumeric (e.g., `ABC123`)
- **Uniqueness:** Each class has one unique code
- **Sharing:** Instructors share codes with students
- **One-time use:** No limit — multiple students can use the same code

---

## Error Responses

### 400 - Bad Request
- Missing name or description
- Already a member of this class
- User is the class creator

### 403 - Forbidden
You don't have permission to access this class.

### 404 - Not Found
Class or member not found.

### 500 - Server Error
Unexpected error. Contact support.

---

## Important Notes

- **Instructors** create classes and get a unique code
- **Students** join classes using the code
- **Roles** are determined by creator vs. member status
- **Class codes** are case-insensitive when joining
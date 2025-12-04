# Assignment API Documentation

Create, grade, and manage assignments within classes.

## Base URL

```
http://localhost:3001/api/assignment
```

## Endpoints

### Create Assignment
**`POST /api/assignment/create`**

Create a new assignment (instructor only).

**Request:**
```json
{
  "classId": "class_id_here",
  "title": "Homework 1",
  "description": "Complete exercises 1-10 from chapter 5",
  "dueDate": "2025-12-17T23:59:00.000Z",
  "pointsPossible": 100
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Assignment created successfully",
  "data": {
    "id": "assignment_id_here",
    "title": "Homework 1",
    "description": "Complete exercises 1-10 from chapter 5",
    "dueDate": "2025-12-17T23:59:00.000Z",
    "pointsPossible": 100
  }
}
```

---

### List Assignments
**`GET /api/assignment/list/:classId`**

Get all assignments for a class.

**URL Parameter:**
- `classId` - The ID of the class

**Response (200) - For Students:**
```json
{
  "success": true,
  "data": {
    "assignments": [
      {
        "id": "assignment_id_1",
        "title": "Homework 1",
        "description": "Complete exercises",
        "dueDate": "2025-12-17T23:59:00.000Z",
        "pointsPossible": 100,
        "userGrade": {
          "score": 85,
          "feedback": "Good work"
        }
      }
    ]
  }
}
```

**Response (200) - For Instructors:**
```json
{
  "success": true,
  "data": {
    "assignments": [
      {
        "id": "assignment_id_1",
        "title": "Homework 1",
        "description": "Complete exercises",
        "dueDate": "2025-12-17T23:59:00.000Z",
        "pointsPossible": 100
      }
    ]
  }
}
```

---

### Grade Assignment
**`POST /api/assignment/grade`**

Grade an assignment for a student (instructor only).

**Request:**
```json
{
  "assignmentId": "assignment_id_here",
  "studentId": "student_id_here",
  "score": 85,
  "feedback": "Excellent work! A few minor errors on problem 3."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Grade saved successfully",
  "data": {
    "id": "grade_id_here",
    "score": 85,
    "feedback": "Excellent work! A few minor errors on problem 3.",
    "gradedAt": "2025-12-10T14:30:00.000Z"
  }
}
```

---

### Get Class Grades
**`GET /api/assignment/grades/:classId`**

Get all grades for a class.

**URL Parameter:**
- `classId` - The ID of the class

**Response (200) - For Instructors:**
```json
{
  "success": true,
  "data": {
    "assignments": [
      {
        "id": "assignment_id_1",
        "title": "Homework 1",
        "pointsPossible": 100,
        "dueDate": "2025-12-17T23:59:00.000Z",
        "grades": [
          {
            "student": {
              "id": "student_id_1",
              "email": "john@example.com",
              "displayName": "John Doe"
            },
            "score": 92,
            "feedback": "Great job!",
            "gradedAt": "2025-12-10T10:00:00.000Z"
          }
        ]
      }
    ]
  }
}
```

**Response (200) - For Students:**
```json
{
  "success": true,
  "data": {
    "grades": [
      {
        "assignment": {
          "id": "assignment_id_1",
          "title": "Homework 1",
          "pointsPossible": 100,
          "dueDate": "2025-12-17T23:59:00.000Z"
        },
        "score": 92,
        "feedback": "Great job!",
        "gradedAt": "2025-12-10T10:00:00.000Z"
      }
    ]
  }
}
```

---

### Delete Assignment
**`DELETE /api/assignment/:assignmentId`**

Delete an assignment and all associated grades (instructor only).

**URL Parameter:**
- `assignmentId` - The ID of the assignment

**Response (200):**
```json
{
  "success": true,
  "message": "Assignment and associated grades deleted successfully"
}
```

---

### Get My Assignments
**`GET /api/assignment/my-assignments`**

Get all assignments for classes you're enrolled in.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "assignment_id_1",
      "title": "Homework 1",
      "description": "Complete exercises",
      "dueDate": "2025-12-17T23:59:00.000Z",
      "pointsPossible": 100,
      "class": {
        "id": "class_id_here",
        "name": "CS 101"
      }
    }
  ]
}
```

---

## Authentication

All endpoints require authentication. Include your session in the header:

```
x-session-id: your_session_id_here
```

---

## Scoring Rules

- **Score range:** 0 to `pointsPossible`
- **Decimal scores:** Allowed (e.g., 85.5)
- **Updating:** Scores can be updated anytime
- **Visibility:** Students see only their own grades; instructors see all

---

## Error Responses

### 400 - Bad Request
- Missing required fields
- Score out of range
- Invalid data format

### 403 - Forbidden
- Only instructors can create/grade assignments
- You don't have access to this class

### 404 - Not Found
Assignment or student not found.

### 500 - Server Error
Unexpected error. Contact support.

---

## Important Notes

- **Instructors only:** Can create, grade, and delete assignments
- **Students:** Can view assignments and their grades
- **Due dates:** Set when creating; no automatic enforcement
- **Feedback:** Optional field for grader comments
- **Cascade delete:** Deleting an assignment deletes all grades for it
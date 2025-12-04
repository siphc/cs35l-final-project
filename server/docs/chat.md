# Chat API Documentation

Send messages and communicate within class groups. Supports direct and group chats.

## Base URL

```
http://localhost:3001/api/chat
```

## Endpoints

### Create Chat
**`POST /api/chat/create`**

Create a new direct or group chat within a class.

**Request:**
```json
{
  "classId": "class_id_here",
  "participantIds": ["user_id_1", "user_id_2"],
  "isGroupChat": false,
  "name": "Study Group"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Chat created successfully",
  "data": {
    "chat": {
      "id": "chat_id_here",
      "classId": "class_id_here",
      "participants": [
        {
          "id": "user_id_1",
          "email": "user1@example.com",
          "displayName": "User One"
        },
        {
          "id": "user_id_2",
          "email": "user2@example.com",
          "displayName": "User Two"
        }
      ],
      "isGroupChat": false,
      "name": ""
    },
    "isNew": true
  }
}
```

**Note:** If a chat with these exact participants already exists, it will be returned instead.

---

### Add Members to Chat
**`POST /api/chat/:chatId/add-members`**

Add new members to an existing group chat.

**URL Parameter:**
- `chatId` - The ID of the chat

**Request:**
```json
{
  "participantIds": ["user_id_3", "user_id_4"]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Members added successfully",
  "data": {
    "chat": {
      "id": "chat_id_here",
      "participants": [
        {"id": "user_id_1", "email": "user1@example.com", "displayName": "User One"},
        {"id": "user_id_2", "email": "user2@example.com", "displayName": "User Two"},
        {"id": "user_id_3", "email": "user3@example.com", "displayName": "User Three"}
      ]
    }
  }
}
```

---

### List Chats
**`GET /api/chat/list`**

Get all chats for the authenticated user (optionally filtered by class).

**Query Parameters (Optional):**
- `classId` - Filter chats by class ID

**Response (200):**
```json
{
  "success": true,
  "data": {
    "chats": [
      {
        "id": "chat_id_1",
        "classId": "class_id_here",
        "participants": [
          {"id": "user_id_1", "email": "user1@example.com", "displayName": "User One"},
          {"id": "user_id_2", "email": "user2@example.com", "displayName": "User Two"}
        ],
        "isGroupChat": false,
        "name": "",
        "lastMessageAt": "2025-12-10T15:30:00.000Z"
      }
    ]
  }
}
```

---

### Get Chat Details
**`GET /api/chat/:chatId`**

Get details of a specific chat.

**URL Parameter:**
- `chatId` - The ID of the chat

**Response (200):**
```json
{
  "success": true,
  "data": {
    "chat": {
      "id": "chat_id_here",
      "classId": {
        "id": "class_id_here",
        "name": "CS 101"
      },
      "participants": [
        {"id": "user_id_1", "email": "user1@example.com", "displayName": "User One"}
      ],
      "isGroupChat": false,
      "name": ""
    }
  }
}
```

---

### Get Messages
**`GET /api/chat/:chatId/messages`**

Retrieve messages from a chat (paginated).

**URL Parameter:**
- `chatId` - The ID of the chat

**Query Parameters (Optional):**
- `limit` - Number of messages to fetch (default: 50)
- `offset` - Number of messages to skip (default: 0)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "message_id_1",
        "chatId": "chat_id_here",
        "sender": {
          "id": "user_id_1",
          "email": "user1@example.com",
          "displayName": "User One"
        },
        "content": "Hey, how's the homework going?",
        "createdAt": "2025-12-10T14:20:00.000Z"
      },
      {
        "id": "message_id_2",
        "chatId": "chat_id_here",
        "sender": {
          "id": "user_id_2",
          "email": "user2@example.com",
          "displayName": "User Two"
        },
        "content": "Almost done! Question on problem 5?",
        "createdAt": "2025-12-10T14:25:00.000Z"
      }
    ]
  }
}
```

---

### Send Message
**`POST /api/chat/:chatId/send`**

Send a message to a chat.

**URL Parameter:**
- `chatId` - The ID of the chat

**Request:**
```json
{
  "content": "Hey everyone, let's discuss the assignment!"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "message": {
      "id": "message_id_here",
      "chatId": "chat_id_here",
      "sender": {
        "id": "user_id_1",
        "email": "user1@example.com",
        "displayName": "User One"
      },
      "content": "Hey everyone, let's discuss the assignment!",
      "createdAt": "2025-12-10T14:30:00.000Z"
    }
  }
}
```

---

### Delete Chat
**`DELETE /api/chat/:chatId`**

Delete a chat and all its messages.

**URL Parameter:**
- `chatId` - The ID of the chat

**Response (200):**
```json
{
  "success": true,
  "message": "Chat deleted successfully"
}
```

---

## Authentication

All endpoints require authentication. Include your session in the header:

```
x-session-id: your_session_id_here
```

---

## Chat Types

- **Direct Chat:** Between two people (2 participants)
- **Group Chat:** Multiple people (3+ participants)
- **Class Requirement:** All chats exist within a class

---

## Duplicate Prevention

- The API automatically detects duplicate chats
- If participants are identical, the existing chat is returned
- No duplicate chats can be created for the same participant set

---

## Error Responses

### 400 - Bad Request
- Missing required fields
- Empty message content
- Participants not in class
- Chat already exists with these members

### 403 - Forbidden
- Not a participant in this chat
- Not a member of the class

### 404 - Not Found
Chat not found.

### 500 - Server Error
Unexpected error. Contact support.

---

## Important Notes

- **Participants:** Must all be members of the class
- **Messages:** Cannot be edited or deleted (permanent)
- **Pagination:** Use `limit` and `offset` for large message lists
- **Timestamps:** All times are in UTC/ISO format
- **Cascade delete:** Deleting a chat deletes all its messages
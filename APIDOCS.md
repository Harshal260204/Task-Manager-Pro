# Task Manager Pro - API Documentation

This document provides comprehensive documentation for the Task Manager Pro REST API.

## Base URL

```
http://localhost:5000/api
```

## Authentication

Most endpoints require authentication using JWT (JSON Web Tokens). Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

Tokens are obtained through the `/api/auth/register` or `/api/auth/login` endpoints.

## Rate Limiting

Authentication endpoints (`/api/auth/*`) have rate limiting:
- **Limit**: 5 requests per 15 minutes per IP address
- **Response**: 429 Too Many Requests when limit is exceeded

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information (in development)"
}
```

## Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required or invalid token |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

---

## Endpoints

### Health Check

#### GET /health

Check if the server is running.

**No authentication required**

**Response:**
```json
{
  "status": "OK",
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Authentication Endpoints

### Register User

#### POST /api/auth/register

Register a new user account.

**No authentication required**

**Rate Limited**: 5 requests per 15 minutes

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123"
}
```

**Validation Rules:**
- `name`: Required, string, 2-50 characters
- `email`: Required, valid email format, unique
- `password`: Required, minimum 6 characters, must contain:
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

**Error Responses:**

**400 Bad Request** - Validation error:
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "password",
      "message": "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    }
  ]
}
```

**409 Conflict** - User already exists:
```json
{
  "success": false,
  "message": "User with this email already exists"
}
```

**429 Too Many Requests**:
```json
{
  "success": false,
  "message": "Too many authentication attempts, please try again later."
}
```

---

### Login User

#### POST /api/auth/login

Authenticate a user and receive a JWT token.

**No authentication required**

**Rate Limited**: 5 requests per 15 minutes

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

**Validation Rules:**
- `email`: Required, valid email format
- `password`: Required

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

**Error Responses:**

**401 Unauthorized** - Invalid credentials:
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

**429 Too Many Requests**:
```json
{
  "success": false,
  "message": "Too many authentication attempts, please try again later."
}
```

---

## Task Endpoints

All task endpoints require authentication. Include the JWT token in the Authorization header.

### Get All Tasks

#### GET /api/tasks

Retrieve all tasks for the authenticated user with optional filtering, search, and pagination.

**Authentication required**

**Query Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `q` | string | Search query (searches title and description) | `?q=meeting` |
| `status` | string | Filter by status (`todo`, `in-progress`, `done`) | `?status=todo` |
| `priority` | string | Filter by priority (`low`, `med`, `high`) | `?priority=high` |
| `page` | number | Page number (min: 1) | `?page=1` |
| `limit` | number | Items per page (min: 1, max: 100) | `?limit=10` |
| `sortBy` | string | Sort field (`createdAt`, `dueDate`, `title`, `priority`, `status`) | `?sortBy=dueDate` |

**Example Request:**
```
GET /api/tasks?status=todo&priority=high&page=1&limit=10&sortBy=dueDate
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Complete project documentation",
      "description": "Write comprehensive API documentation",
      "status": "todo",
      "priority": "high",
      "dueDate": "2024-12-31T23:59:59.000Z",
      "owner": "507f1f77bcf86cd799439012",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

**Error Responses:**

**400 Bad Request** - Invalid query parameters:
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "status",
      "message": "Status must be one of: todo, in-progress, done"
    }
  ]
}
```

**401 Unauthorized**:
```json
{
  "success": false,
  "message": "Authentication required"
}
```

---

### Get Single Task

#### GET /api/tasks/:id

Retrieve a single task by ID.

**Authentication required**

**URL Parameters:**
- `id` - Task ID (MongoDB ObjectId)

**Example Request:**
```
GET /api/tasks/507f1f77bcf86cd799439011
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Complete project documentation",
    "description": "Write comprehensive API documentation",
    "status": "todo",
    "priority": "high",
    "dueDate": "2024-12-31T23:59:59.000Z",
    "owner": "507f1f77bcf86cd799439012",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**

**404 Not Found**:
```json
{
  "success": false,
  "message": "Task not found"
}
```

**401 Unauthorized**:
```json
{
  "success": false,
  "message": "Authentication required"
}
```

---

### Create Task

#### POST /api/tasks

Create a new task.

**Authentication required**

**Request Body:**
```json
{
  "title": "Complete project documentation",
  "description": "Write comprehensive API documentation",
  "status": "todo",
  "priority": "high",
  "dueDate": "2024-12-31T23:59:59.000Z"
}
```

**Validation Rules:**
- `title`: Required, string, 1-200 characters
- `description`: Optional, string, max 1000 characters
- `status`: Optional, one of: `todo`, `in-progress`, `done` (default: `todo`)
- `priority`: Optional, one of: `low`, `med`, `high` (default: `med`)
- `dueDate`: Optional, valid ISO 8601 date string

**Success Response (201):**
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Complete project documentation",
    "description": "Write comprehensive API documentation",
    "status": "todo",
    "priority": "high",
    "dueDate": "2024-12-31T23:59:59.000Z",
    "owner": "507f1f77bcf86cd799439012",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**

**400 Bad Request** - Validation error:
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "title",
      "message": "Title is required"
    }
  ]
}
```

**401 Unauthorized**:
```json
{
  "success": false,
  "message": "Authentication required"
}
```

---

### Update Task

#### PUT /api/tasks/:id

Update an existing task.

**Authentication required**

**URL Parameters:**
- `id` - Task ID (MongoDB ObjectId)

**Request Body:**
```json
{
  "title": "Updated task title",
  "status": "in-progress",
  "priority": "high"
}
```

All fields are optional. Only provided fields will be updated.

**Validation Rules:**
- `title`: Optional, string, 1-200 characters (if provided)
- `description`: Optional, string, max 1000 characters
- `status`: Optional, one of: `todo`, `in-progress`, `done`
- `priority`: Optional, one of: `low`, `med`, `high`
- `dueDate`: Optional, valid ISO 8601 date string or `null`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Updated task title",
    "description": "Write comprehensive API documentation",
    "status": "in-progress",
    "priority": "high",
    "dueDate": "2024-12-31T23:59:59.000Z",
    "owner": "507f1f77bcf86cd799439012",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-02T00:00:00.000Z"
  }
}
```

**Error Responses:**

**400 Bad Request** - Validation error:
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "status",
      "message": "Status must be one of: todo, in-progress, done"
    }
  ]
}
```

**404 Not Found**:
```json
{
  "success": false,
  "message": "Task not found"
}
```

**401 Unauthorized**:
```json
{
  "success": false,
  "message": "Authentication required"
}
```

---

### Delete Task

#### DELETE /api/tasks/:id

Delete a task by ID.

**Authentication required**

**URL Parameters:**
- `id` - Task ID (MongoDB ObjectId)

**Example Request:**
```
DELETE /api/tasks/507f1f77bcf86cd799439011
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Task deleted successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Complete project documentation",
    "description": "Write comprehensive API documentation",
    "status": "todo",
    "priority": "high",
    "dueDate": "2024-12-31T23:59:59.000Z",
    "owner": "507f1f77bcf86cd799439012",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**

**404 Not Found**:
```json
{
  "success": false,
  "message": "Task not found"
}
```

**401 Unauthorized**:
```json
{
  "success": false,
  "message": "Authentication required"
}
```

---

## Data Models

### User Model

```typescript
{
  _id: ObjectId,
  name: string (2-50 chars),
  email: string (unique, lowercase),
  passwordHash: string (not returned in responses),
  createdAt: Date,
  updatedAt: Date
}
```

### Task Model

```typescript
{
  _id: ObjectId,
  title: string (1-200 chars, required),
  description: string (max 1000 chars, optional),
  status: 'todo' | 'in-progress' | 'done' (default: 'todo'),
  priority: 'low' | 'med' | 'high' (default: 'med'),
  dueDate: Date (optional),
  owner: ObjectId (reference to User, required),
  createdAt: Date,
  updatedAt: Date
}
```

---

## Task Status Values

- `todo` - Task is not started
- `in-progress` - Task is currently being worked on
- `done` - Task is completed

## Task Priority Values

- `low` - Low priority task
- `med` - Medium priority task (default)
- `high` - High priority task

---

## Example Usage

### Complete Workflow

1. **Register a new user:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123"
  }'
```

2. **Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123"
  }'
```

3. **Create a task (using token from login):**
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Complete API documentation",
    "description": "Write comprehensive API docs",
    "status": "todo",
    "priority": "high",
    "dueDate": "2024-12-31T23:59:59.000Z"
  }'
```

4. **Get all tasks:**
```bash
curl -X GET "http://localhost:5000/api/tasks?status=todo&priority=high&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

5. **Update a task:**
```bash
curl -X PUT http://localhost:5000/api/tasks/TASK_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "status": "in-progress"
  }'
```

6. **Delete a task:**
```bash
curl -X DELETE http://localhost:5000/api/tasks/TASK_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "message": "Human-readable error message",
  "error": "Detailed error information (only in development mode)"
}
```

Common error scenarios:
- **Validation errors**: Check the `errors` array for field-specific messages
- **Authentication errors**: Ensure token is valid and included in Authorization header
- **Not found errors**: Verify the resource ID exists and belongs to the authenticated user
- **Rate limit errors**: Wait before making additional requests to auth endpoints

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- Task IDs are MongoDB ObjectIds
- Users can only access their own tasks
- JWT tokens expire after 7 days (configurable via `JWT_EXPIRE` environment variable)
- Search functionality uses MongoDB text indexes on task title and description
- Pagination defaults: page=1, limit=10 (if not specified)

---

For setup instructions and project information, see [README.md](./README.md).


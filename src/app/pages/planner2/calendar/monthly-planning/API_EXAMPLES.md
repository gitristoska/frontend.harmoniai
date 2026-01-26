# Monthly Planning API - Example Payloads

All examples use base URL: `https://localhost:44304/api/monthly`

---

## 1. Create Entry (POST /)

### Request
```bash
curl -X POST https://localhost:44304/api/monthly \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "month": "2026-01",
    "intentions": "Launch new feature\nImprove health routine\nDeepen relationships",
    "moodWords": "Energetic, Focused, Grateful",
    "notes": "Q1 focus: product and wellness"
  }'
```

### Response (201 Created)
```json
{
  "id": "entry-001",
  "month": "2026-01",
  "userId": "user-123",
  "intentions": "Launch new feature\nImprove health routine\nDeepen relationships",
  "moodWords": "Energetic, Focused, Grateful",
  "notes": "Q1 focus: product and wellness",
  "goals": [],
  "reflection": null,
  "createdAt": "2026-01-15T10:00:00Z",
  "updatedAt": "2026-01-15T10:00:00Z"
}
```

---

## 2. Get Entry (GET /{month})

### Request
```bash
curl https://localhost:44304/api/monthly/2026-01 \
  -H "Authorization: Bearer <token>"
```

### Response (200 OK)
```json
{
  "id": "entry-001",
  "month": "2026-01",
  "userId": "user-123",
  "intentions": "Launch new feature\nImprove health routine\nDeepen relationships",
  "moodWords": "Energetic, Focused, Grateful",
  "notes": "Q1 focus: product and wellness",
  "goals": [
    {
      "id": "goal-001",
      "entryId": "entry-001",
      "title": "Launch Product Feature",
      "description": "Complete API integration and frontend UI for new dashboard",
      "progress": 45,
      "order": 0,
      "taskLinks": [
        { "taskId": "task-123", "taskTitle": "Design API endpoints" },
        { "taskId": "task-124", "taskTitle": "Implement authentication" }
      ],
      "createdAt": "2026-01-15T10:05:00Z",
      "updatedAt": "2026-01-20T14:30:00Z"
    },
    {
      "id": "goal-002",
      "entryId": "entry-001",
      "title": "Fitness Habit",
      "description": "Exercise 4x per week",
      "progress": 80,
      "order": 1,
      "taskLinks": [
        { "taskId": "task-200", "taskTitle": "Morning run routine" },
        { "taskId": "task-201", "taskTitle": "Gym sessions" }
      ],
      "createdAt": "2026-01-15T10:10:00Z",
      "updatedAt": "2026-01-25T09:00:00Z"
    }
  ],
  "reflection": null,
  "createdAt": "2026-01-15T10:00:00Z",
  "updatedAt": "2026-01-25T10:00:00Z"
}
```

---

## 3. Update Entry (PUT /{entryId})

### Request
```bash
curl -X PUT https://localhost:44304/api/monthly/entry-001 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "intentions": "Updated Q1 intentions",
    "moodWords": "Energetic, Grateful"
  }'
```

### Response (200 OK)
```json
{
  "id": "entry-001",
  "month": "2026-01",
  "userId": "user-123",
  "intentions": "Updated Q1 intentions",
  "moodWords": "Energetic, Grateful",
  "notes": "Q1 focus: product and wellness",
  "goals": [
    { "id": "goal-001", ... },
    { "id": "goal-002", ... }
  ],
  "reflection": null,
  "updatedAt": "2026-01-25T14:35:00Z"
}
```

---

## 4. Delete Entry (DELETE /{entryId})

### Request
```bash
curl -X DELETE https://localhost:44304/api/monthly/entry-001 \
  -H "Authorization: Bearer <token>"
```

### Response (204 No Content)
Empty response body

---

## 5. Create Goal (POST /{entryId}/goals)

### Request
```bash
curl -X POST https://localhost:44304/api/monthly/entry-001/goals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Read 2 Books",
    "description": "Non-fiction focused on personal development",
    "order": 2
  }'
```

### Response (201 Created)
```json
{
  "id": "goal-003",
  "entryId": "entry-001",
  "title": "Read 2 Books",
  "description": "Non-fiction focused on personal development",
  "progress": 0,
  "order": 2,
  "taskLinks": [],
  "createdAt": "2026-01-25T15:00:00Z",
  "updatedAt": "2026-01-25T15:00:00Z"
}
```

---

## 6. Update Goal (PUT /goals/{goalId})

### Request
```bash
curl -X PUT https://localhost:44304/api/monthly/goals/goal-001 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "progress": 75,
    "description": "Complete API integration and frontend UI - almost done"
  }'
```

### Response (200 OK)
```json
{
  "id": "goal-001",
  "entryId": "entry-001",
  "title": "Launch Product Feature",
  "description": "Complete API integration and frontend UI - almost done",
  "progress": 75,
  "order": 0,
  "taskLinks": [
    { "taskId": "task-123", "taskTitle": "Design API endpoints" },
    { "taskId": "task-124", "taskTitle": "Implement authentication" }
  ],
  "updatedAt": "2026-01-26T10:15:00Z"
}
```

---

## 7. Delete Goal (DELETE /goals/{goalId})

### Request
```bash
curl -X DELETE https://localhost:44304/api/monthly/goals/goal-003 \
  -H "Authorization: Bearer <token>"
```

### Response (204 No Content)
Empty response body

---

## 8. Link Task to Goal (POST /goals/{goalId}/tasks/{taskId})

### Request
```bash
curl -X POST https://localhost:44304/api/monthly/goals/goal-001/tasks/task-125 \
  -H "Authorization: Bearer <token>"
```

### Response (200 OK)
```json
{
  "id": "goal-001",
  "entryId": "entry-001",
  "title": "Launch Product Feature",
  "description": "Complete API integration and frontend UI for new dashboard",
  "progress": 75,
  "order": 0,
  "taskLinks": [
    { "taskId": "task-123", "taskTitle": "Design API endpoints" },
    { "taskId": "task-124", "taskTitle": "Implement authentication" },
    { "taskId": "task-125", "taskTitle": "Build dashboard UI" }
  ],
  "updatedAt": "2026-01-26T10:20:00Z"
}
```

---

## 9. Unlink Task from Goal (DELETE /goals/{goalId}/tasks/{taskId})

### Request
```bash
curl -X DELETE https://localhost:44304/api/monthly/goals/goal-001/tasks/task-124 \
  -H "Authorization: Bearer <token>"
```

### Response (200 OK)
```json
{
  "id": "goal-001",
  "entryId": "entry-001",
  "title": "Launch Product Feature",
  "description": "Complete API integration and frontend UI for new dashboard",
  "progress": 75,
  "order": 0,
  "taskLinks": [
    { "taskId": "task-123", "taskTitle": "Design API endpoints" },
    { "taskId": "task-125", "taskTitle": "Build dashboard UI" }
  ],
  "updatedAt": "2026-01-26T10:22:00Z"
}
```

---

## 10. Save Reflection (POST /{entryId}/reflection)

### Request
```bash
curl -X POST https://localhost:44304/api/monthly/entry-001/reflection \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "rating": 8,
    "wins": "- Successfully launched feature on schedule\n- Completed 16 gym sessions\n- Read 1 book in full",
    "challenges": "- Unexpected API bugs in staging environment\n- Time management issues week 2",
    "lessons": "- Breaking large tasks into chunks improves velocity\n- Regular check-ins prevent blockers",
    "nextMonthFocus": "- Automate test suite to catch bugs earlier\n- Establish fixed workout times"
  }'
```

### Response (201 Created)
```json
{
  "id": "reflection-001",
  "entryId": "entry-001",
  "rating": 8,
  "wins": "- Successfully launched feature on schedule\n- Completed 16 gym sessions\n- Read 1 book in full",
  "challenges": "- Unexpected API bugs in staging environment\n- Time management issues week 2",
  "lessons": "- Breaking large tasks into chunks improves velocity\n- Regular check-ins prevent blockers",
  "nextMonthFocus": "- Automate test suite to catch bugs earlier\n- Establish fixed workout times",
  "createdAt": "2026-02-01T18:00:00Z",
  "updatedAt": "2026-02-01T18:00:00Z"
}
```

---

## 11. Update Reflection (PUT /reflection/{reflectionId})

### Request
```bash
curl -X PUT https://localhost:44304/api/monthly/reflection/reflection-001 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "rating": 9,
    "wins": "- Successfully launched feature on schedule\n- Completed 16 gym sessions\n- Read 2 books"
  }'
```

### Response (200 OK)
```json
{
  "id": "reflection-001",
  "entryId": "entry-001",
  "rating": 9,
  "wins": "- Successfully launched feature on schedule\n- Completed 16 gym sessions\n- Read 2 books",
  "challenges": "- Unexpected API bugs in staging environment\n- Time management issues week 2",
  "lessons": "- Breaking large tasks into chunks improves velocity\n- Regular check-ins prevent blockers",
  "nextMonthFocus": "- Automate test suite to catch bugs earlier\n- Establish fixed workout times",
  "updatedAt": "2026-02-01T19:00:00Z"
}
```

---

## Error Responses

### 400 Bad Request - Invalid Month Format
```json
{
  "error": "Invalid month format. Expected YYYY-MM (e.g., 2026-01)"
}
```

### 400 Bad Request - Too Many Goals
```json
{
  "error": "Maximum 3 goals per entry allowed"
}
```

### 401 Unauthorized
```json
{
  "error": "Missing or invalid authorization token"
}
```

### 404 Not Found
```json
{
  "error": "Monthly entry not found"
}
```

### 422 Unprocessable Entity - Validation
```json
{
  "error": "Validation failed",
  "details": [
    "Progress must be between 0 and 100",
    "Rating must be between 1 and 10"
  ]
}
```

### 500 Internal Server Error
```json
{
  "error": "An unexpected error occurred while processing your request"
}
```

---

## Testing Workflow

### Complete User Flow
```bash
# 1. Create entry for January
curl -X POST https://localhost:44304/api/monthly \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"month": "2026-01", "intentions": "...", "moodWords": "...", "notes": "..."}'

# 2. Create first goal
curl -X POST https://localhost:44304/api/monthly/entry-001/goals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"title": "Goal 1", "description": "...", "order": 0}'

# 3. Link a task from planner to goal
curl -X POST https://localhost:44304/api/monthly/goals/goal-001/tasks/task-123 \
  -H "Authorization: Bearer <token>"

# 4. Update goal progress mid-month
curl -X PUT https://localhost:44304/api/monthly/goals/goal-001 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"progress": 50}'

# 5. Get full view with all data
curl https://localhost:44304/api/monthly/2026-01 \
  -H "Authorization: Bearer <token>"

# 6. Save reflection at month end
curl -X POST https://localhost:44304/api/monthly/entry-001/reflection \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"rating": 8, "wins": "...", "challenges": "...", "lessons": "...", "nextMonthFocus": "..."}'
```

---

## Notes for Backend Team

1. **Authentication**: All endpoints require Bearer token in Authorization header
2. **User Isolation**: Filter all queries by authenticated user's ID
3. **Month Format**: Always use YYYY-MM format (e.g., "2026-01")
4. **Validation Rules**:
   - Progress: 0-100
   - Rating: 1-10
   - Max 3 goals per entry
   - One reflection per entry
5. **Task Links**: Include task title when returning goal (join with task service)
6. **Empty Goals**: Don't auto-create empty slots - let frontend manage
7. **Timestamps**: Include createdAt and updatedAt on all entities
8. **Cascade Delete**: Deleting entry should cascade to all goals and reflection
9. **Orphaned Links**: Task links can remain even if task is deleted elsewhere
10. **Idempotency**: Consider idempotent keys for creation endpoints


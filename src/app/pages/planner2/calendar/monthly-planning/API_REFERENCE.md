# Monthly Planning API - Updated Reference

## API Specification

This document describes the new Monthly Planning API endpoints that replace the previous implementation.

### Base URL
```
https://localhost:44304/api/monthly
```

---

## Entries (Focus Section)

### Create Entry
```http
POST /
Content-Type: application/json

{
  "month": "2025-01",
  "intentions": "...",
  "moodWords": "...",
  "notes": "..."
}

Response: Full entry with empty goals and no reflection
```

### Get Entry
```http
GET /{month}
# e.g., GET /2025-01

Response: Entry with all goals and reflection
```

### Update Entry (Focus)
```http
PUT /{entryId}
Content-Type: application/json

{
  "intentions": "...",
  "moodWords": "...",
  "notes": "..."
}
# All fields optional

Response: Updated entry
```

### Delete Entry
```http
DELETE /{entryId}

Response: true/false
```

---

## Goals

### Create Goal
```http
POST /{entryId}/goals
Content-Type: application/json

{
  "title": "...",
  "description": "...",
  "order": 1
}

Notes:
- Max 3 goals per entry
- order: sort position (0, 1, 2, etc.)
- Returns goal with empty taskLinks array
```

### Update Goal
```http
PUT /goals/{goalId}
Content-Type: application/json

{
  "title": "...",
  "description": "...",
  "progress": 50,
  "order": 2
}
# All fields optional

Response: Updated goal
```

### Delete Goal
```http
DELETE /goals/{goalId}

Response: true/false
```

---

## Task Linking

### Link Task to Goal
```http
POST /goals/{goalId}/tasks/{taskId}

Notes:
- Each task can only link to ONE goal
- Returns updated goal with taskLinks
```

### Unlink Task from Goal
```http
DELETE /goals/{goalId}/tasks/{taskId}

Response: true/false
```

---

## Reflection

### Save/Update Reflection
```http
POST /entries/{entryId}/reflection
Content-Type: application/json

{
  "rating": 8,
  "wins": "...",
  "challenges": "...",
  "lessons": "...",
  "nextMonthFocus": "..."
}

Notes:
- One reflection per entry (auto-updates if exists)
- rating: 1-10
- Returns reflection with entryId
```

### Update Existing Reflection
```http
PUT /reflection/{reflectionId}
Content-Type: application/json

{
  "rating": 8,
  "wins": "...",
  "challenges": "...",
  "lessons": "...",
  "nextMonthFocus": "..."
}
# All fields optional

Response: Updated reflection
```

---

## Complete View

### Get Everything (One Request)
```http
GET /{month}
# e.g., GET /2025-01

Response: Complete MonthlyEntry with:
- Focus (intentions, moodWords, notes)
- Goals[] (with taskLinks)
- Reflection? (optional)
```

---

## Key Rules

| Rule | Details |
|------|---------|
| **Month Format** | YYYY-MM (e.g., "2025-01") |
| **Max Goals** | 3 per entry |
| **Task Linking** | Each task links to max 1 goal |
| **Reflection** | One per entry, auto-updates |
| **Progress** | 0-100 |
| **Rating** | 1-10 |
| **User Isolation** | All operations check user ownership |

---

## Service Methods

### MonthlyPlanningService (Angular)

```typescript
// Entries
createEntry(entry: MonthlyEntryCreateDto): Observable<MonthlyEntry>
getEntry(month: string): Observable<MonthlyEntry>
updateEntry(entryId: string, data: Partial<MonthlyEntryCreateDto>): Observable<MonthlyEntry>
deleteEntry(entryId: string): Observable<boolean>
getFullView(month: string): Observable<MonthlyEntry>

// Goals
createGoal(entryId: string, goal: MonthlyGoalCreateDto): Observable<MonthlyGoal>
updateGoal(goalId: string, data: Partial<MonthlyGoalUpdateDto>): Observable<MonthlyGoal>
deleteGoal(goalId: string): Observable<boolean>

// Task Linking
linkTaskToGoal(goalId: string, taskId: string): Observable<any>
unlinkTaskFromGoal(goalId: string, taskId: string): Observable<boolean>

// Reflection
saveReflection(entryId: string, reflection: MonthlyReflectionDto): Observable<MonthlyReflection>
updateReflection(reflectionId: string, data: Partial<MonthlyReflectionDto>): Observable<MonthlyReflection>
```

---

## Data Models

### MonthlyEntry
```typescript
{
  id: string;
  month: string;                  // YYYY-MM
  userId: string;
  intentions: string;
  moodWords: string;
  notes: string;
  goals: MonthlyGoal[];           // 0-3 items
  reflection?: MonthlyReflection;
  createdAt?: string;
  updatedAt?: string;
}
```

### MonthlyGoal
```typescript
{
  id: string;
  entryId: string;
  title: string;
  description: string;
  progress: number;               // 0-100
  order: number;
  taskLinks: { taskId: string; taskTitle: string }[];
  createdAt?: string;
  updatedAt?: string;
}
```

### MonthlyReflection
```typescript
{
  id: string;
  entryId: string;
  rating: number;                 // 1-10
  wins: string;
  challenges: string;
  lessons: string;
  nextMonthFocus: string;
  createdAt?: string;
  updatedAt?: string;
}
```

---

## Important Changes from Previous API

| Previous | New | Reason |
|----------|-----|--------|
| `/api/monthly-planning/entries` | `/api/monthly` | Simplified base URL |
| `POST /entries` | `POST /` | Cleaner endpoint |
| `GET /entries/{month}` | `GET /{month}` | Simplified path |
| `PUT /entries/{entryId}` | `PUT /{entryId}` | Simplified path |
| `POST /entries/{entryId}/goals` | `POST /{entryId}/goals` | Simplified path |
| `MonthlyFocus` (separate) | Focus fields on MonthlyEntry | Flatter structure |
| `position` (0, 1, 2) | `order` (flexible) | More flexible ordering |
| `linkedTaskIds: []` | `taskLinks: [{taskId, taskTitle}]` | Includes task titles |
| `overallRating` | `rating` | Consistency |
| `lessonsLearned` | `lessons` | Brevity |
| `focusForNextMonth` | `nextMonthFocus` | Camelcase consistency |
| Fixed 3 goals | 0-3 goals | Flexibility |

---

## Error Handling

All endpoints return standard HTTP status codes:

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 204 | No Content (delete) |
| 400 | Bad Request (validation) |
| 401 | Unauthorized |
| 404 | Not Found |
| 422 | Unprocessable Entity |
| 500 | Server Error |

---

## Frontend Integration Status

✅ **Complete**: Monthly Planning Component updated
✅ **Complete**: MonthlyPlanningService updated
✅ **Complete**: Data models updated (api.d.ts)
✅ **Complete**: Component HTML template updated
✅ **Complete**: Component TypeScript logic updated
✅ **Build Success**: No compilation errors

🚀 **Ready for**: Backend implementation of new endpoints

---

## Testing Checklist

- [ ] Create entry (POST /)
- [ ] Get entry (GET /{month})
- [ ] Update entry (PUT /{entryId})
- [ ] Create goal (POST /{entryId}/goals)
- [ ] Update goal progress (PUT /goals/{goalId})
- [ ] Link task (POST /goals/{goalId}/tasks/{taskId})
- [ ] Unlink task (DELETE /goals/{goalId}/tasks/{taskId})
- [ ] Save reflection (POST /{entryId}/reflection)
- [ ] Update reflection (PUT /reflection/{reflectionId})
- [ ] Get full view (GET /{month})
- [ ] Delete entry (DELETE /{entryId})

---

**Last Updated**: January 26, 2026
**Build Status**: ✅ Success
**API Version**: 2.0

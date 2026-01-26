# Backend Handoff - Monthly Planning API

**Frontend Status**: ✅ COMPLETE  
**Build Status**: ✅ Passing (0 errors)  
**App Running**: ✅ localhost:4200

---

## What to Implement

The backend team should implement 12 REST API endpoints for monthly planning at:

```
Base URL: https://localhost:44304/api/monthly
```

---

## Quick Start Files

### 1. **[API_REFERENCE.md](API_REFERENCE.md)** ⭐ START HERE
   - Complete endpoint specifications
   - All request/response formats
   - Data model definitions with exact field types
   - Validation rules and constraints
   - HTTP status codes
   
   **What it tells you:**
   - Exact endpoint paths (e.g., `POST /`, `GET /{month}`, `PUT /goals/{goalId}`)
   - Request body structure for each endpoint
   - Response body structure for each endpoint
   - Field types and constraints (e.g., progress 0-100, rating 1-10)

### 2. **[API_EXAMPLES.md](API_EXAMPLES.md)** ⭐ USE FOR TESTING
   - 11 complete JSON examples
   - Exact curl commands you can test with
   - Real-world user flow examples
   - Error response examples
   
   **What it tells you:**
   - Exact JSON format for request bodies
   - Exact JSON format for response bodies
   - How endpoints interact in a workflow
   - What error responses should look like

### 3. **[CHECKLIST.md](CHECKLIST.md)** ⭐ USE FOR PLANNING
   - Database schema (exact SQL table structure)
   - All validation rules organized by field
   - Required relationships and constraints
   - Testing checklist
   - Implementation timeline
   
   **What it tells you:**
   - What database tables to create
   - What columns and data types for each table
   - What validations to implement
   - What to test before marking complete

---

## The 12 Endpoints You Need to Implement

| # | Method | Endpoint | Purpose |
|---|--------|----------|---------|
| 1 | POST | `/` | Create a new monthly entry |
| 2 | GET | `/{month}` | Get entry for a specific month |
| 3 | PUT | `/{entryId}` | Update entry focus section |
| 4 | DELETE | `/{entryId}` | Delete entire entry |
| 5 | POST | `/{entryId}/goals` | Create a goal under entry |
| 6 | PUT | `/goals/{goalId}` | Update goal details/progress |
| 7 | DELETE | `/goals/{goalId}` | Delete a goal |
| 8 | POST | `/goals/{goalId}/tasks/{taskId}` | Link a planner task to goal |
| 9 | DELETE | `/goals/{goalId}/tasks/{taskId}` | Unlink a task from goal |
| 10 | POST | `/{entryId}/reflection` | Create reflection at month end |
| 11 | PUT | `/reflection/{reflectionId}` | Update existing reflection |
| 12 | GET | `/{month}` | Same as #2 - Get full entry with goals + reflection |

**Note**: Endpoints #2 and #12 are the same endpoint (GET /{month}) - it returns the complete entry with all goals and reflection.

---

## Data Models

### MonthlyEntry
```typescript
{
  id: string;                        // UUID
  month: string;                     // YYYY-MM format (e.g., "2026-01")
  userId: string;                    // User who owns this entry
  intentions: string;                // Multi-line text
  moodWords: string;                 // Comma-separated or multi-line
  notes: string;                     // Additional notes
  goals: MonthlyGoal[];              // Array of 0-3 goals
  reflection?: MonthlyReflection;    // Optional reflection
  createdAt: string;                 // ISO timestamp
  updatedAt: string;                 // ISO timestamp
}
```

### MonthlyGoal
```typescript
{
  id: string;                        // UUID
  entryId: string;                   // Reference to parent entry
  title: string;                     // Goal title
  description: string;               // Goal description
  progress: number;                  // 0-100
  order: number;                     // Sort position
  taskLinks: Array<{                 // Linked planner tasks
    taskId: string;
    taskTitle: string;
  }>;
  createdAt: string;                 // ISO timestamp
  updatedAt: string;                 // ISO timestamp
}
```

### MonthlyReflection
```typescript
{
  id: string;                        // UUID
  entryId: string;                   // Reference to parent entry
  rating: number;                    // 1-10
  wins: string;                      // Multi-line text
  challenges: string;                // Multi-line text
  lessons: string;                   // Multi-line text
  nextMonthFocus: string;            // Multi-line text
  createdAt: string;                 // ISO timestamp
  updatedAt: string;                 // ISO timestamp
}
```

---

## Key Rules & Constraints

| Rule | Details |
|------|---------|
| **Month Format** | YYYY-MM only (e.g., "2026-01"). No dates. |
| **Max Goals** | 3 goals per entry maximum |
| **Progress Range** | 0-100 only |
| **Rating Range** | 1-10 only |
| **One Entry Per Month** | Only 1 entry per user per month |
| **One Reflection Per Entry** | Updating reflection should upsert (create or update) |
| **User Isolation** | ALL endpoints check that user owns the data |
| **Task Links** | Can include deleted tasks (don't cascade delete) |

---

## Authentication & Authorization

✅ **Required**: Bearer token in `Authorization` header on ALL requests  
✅ **Required**: Check authenticated user ID matches resource owner  
✅ **Required**: Return 401 if token missing or invalid  
✅ **Required**: Return 403 if user tries to access another user's data

Example header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## How to Use These Documents

### Phase 1: Planning (30 mins)
1. Read **API_REFERENCE.md** thoroughly
2. Review **CHECKLIST.md** database schema section
3. Estimate timeline based on your team

### Phase 2: Database Setup (30 mins - 1 hour)
1. Create tables from CHECKLIST.md
2. Set up foreign key relationships
3. Add validation constraints

### Phase 3: API Implementation (2-4 hours)
1. Implement endpoints in order from CHECKLIST.md
2. Use API_EXAMPLES.md to validate request/response format
3. Use API_REFERENCE.md for exact field specifications

### Phase 4: Testing (1-2 hours)
1. Test with curl commands from API_EXAMPLES.md
2. Test all 11 scenarios in CHECKLIST.md testing section
3. Verify error responses match API_REFERENCE.md

### Phase 5: Integration (30 mins)
1. Ensure all endpoints return correct HTTP status codes
2. Verify user isolation (no user can access other user's data)
3. Test with frontend at localhost:4200

---

## Frontend Integration Details

**Angular Service**: `MonthlyPlanningService`  
**Location**: `src/app/services/monthly-planning.service.ts`  
**Component**: `MonthlyPlanningComponent`  
**Location**: `src/app/pages/planner2/calendar/monthly-planning/`  
**Integration Point**: Monthly view of calendar shows "Monthly Plan" button  
**Modal**: Opens full-screen modal with monthly planning interface

---

## Testing the API

Once implemented, test with any of these tools:

**Postman**: Import the endpoints from API_EXAMPLES.md (copy each curl command)  
**cURL**: Use commands directly from API_EXAMPLES.md  
**curl**: Copy-paste examples from API_EXAMPLES.md  
**Frontend**: Click "Monthly Plan" button in monthly view at localhost:4200

---

## Questions About the API?

All questions should be answerable from these 3 files:
1. **API_REFERENCE.md** - "What does this endpoint do?"
2. **API_EXAMPLES.md** - "What does the JSON look like?"
3. **CHECKLIST.md** - "What validations do I need?"

If something is unclear, ask the frontend team to clarify.

---

## Frontend Status Report

✅ **Monthly Planning Component**: Complete (450+ lines)  
✅ **Component Integration**: Integrated into calendar monthly view  
✅ **UI/UX**: Full modal interface with form validation  
✅ **Service Layer**: Ready to call your API endpoints  
✅ **Build**: Passing (0 errors)  
✅ **Routing**: Accessible from monthly view of planner

**Frontend is ready and waiting for your API implementation.**

---

## Database Hint

Create these tables (see CHECKLIST.md for exact schemas):

1. `MonthlyEntries` - Main entry table
2. `MonthlyGoals` - Goals per entry
3. `MonthlyReflections` - Reflections per entry
4. `GoalTaskLinks` - Relationship table between goals and planner tasks

All tables should have:
- Primary key (id UUID)
- UserId (for user isolation)
- CreatedAt, UpdatedAt timestamps
- Foreign keys as needed

---

**Good luck! 🚀**

Questions? Ask the frontend team.


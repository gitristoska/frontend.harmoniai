# Monthly Planning View - Implementation Guide

## Overview

The Monthly Planning View is a dedicated component for planning, goal-setting, and reflecting on monthly progress. It complements the existing calendar and task management system without duplicating task functionality.

**Key Principle**: This view is for **planning and reflection**, not task execution. Tasks remain managed in the main calendar/task views.

---

## Component Architecture

### Component Structure

```
src/app/pages/planner2/calendar/monthly-planning/
├── monthly-planning.component.ts       # Component logic
├── monthly-planning.component.html     # Template
├── monthly-planning.component.scss     # Styling
```

### Service Layer

```
src/app/services/
├── monthly-planning.service.ts         # API calls for monthly plans
```

### Data Models

```
src/app/models/api.d.ts
├── MonthlyFocus                        # Focus/intentions for the month
├── MonthlyGoal                         # Individual goal (3 max)
├── MonthlyReflection                   # Month reflection
├── MonthlyPlan                         # Complete monthly plan container
├── MonthlyPlanCreateDto                # DTO for creation
├── MonthlyPlanUpdateDto                # DTO for updates
```

---

## Data Models

### MonthlyFocus
Represents the monthly focus/intentions section.

```typescript
export interface MonthlyFocus {
  id?: string;
  monthDate: string;                    // ISO date (first day of month, e.g., "2026-01-01")
  intentions: string;                   // Multiline text for monthly intentions
  wordsOrMood?: string;                 // Short tags for vibe/mood/energy
  notes?: string;                       // Additional notes
  createdAt?: string;
  updatedAt?: string;
}
```

**Example:**
```json
{
  "monthDate": "2026-01-01",
  "intentions": "Launch new feature\nImprove health routine\nDeepen relationships",
  "wordsOrMood": "Energetic, Focused, Grateful",
  "notes": "Q1 focus: product and wellness"
}
```

---

### MonthlyGoal
Represents a single monthly goal. Exactly 3 goals per month.

```typescript
export interface MonthlyGoal {
  id?: string;
  title: string;                        // Goal title (required)
  description?: string;                 // Optional description
  progress: number;                     // 0-100 progress indicator
  linkedTaskIds?: string[];             // References to PlannerTask IDs (read-only linking)
  position: number;                     // Fixed position: 0, 1, or 2
  createdAt?: string;
  updatedAt?: string;
}
```

**Rules:**
- Always exactly 3 goals per month (positions 0, 1, 2)
- Progress is manually entered (not calculated from tasks)
- `linkedTaskIds` are read-only references—no task editing from this view
- Goals survive even if linked tasks are deleted

**Example:**
```json
{
  "position": 0,
  "title": "Launch Product Feature",
  "description": "Complete API integration and frontend UI",
  "progress": 65,
  "linkedTaskIds": ["task-123", "task-456"]
}
```

---

### MonthlyReflection
Represents the reflection/review section completed at end of month.

```typescript
export interface MonthlyReflection {
  id?: string;
  monthDate: string;                    // ISO date matching the month
  overallRating: number;                // 1-10 rating
  wins: string;                         // Multiline: achievements and wins
  challenges: string;                   // Multiline: obstacles and challenges
  lessonsLearned: string;               // Multiline: key takeaways
  focusForNextMonth: string;            // Multiline: focus areas for next month
  createdAt?: string;
  updatedAt?: string;
}
```

**Example:**
```json
{
  "monthDate": "2026-01-01",
  "overallRating": 8,
  "wins": "- Launched feature on time\n- Completed 5 gym sessions\n- Had meaningful conversations with family",
  "challenges": "- Unexpected bugs in staging\n- Time management during busy week",
  "lessonsLearned": "- Breaking tasks into smaller chunks helps\n- Regular check-ins prevent bottlenecks",
  "focusForNextMonth": "- Automate test suite\n- Build workout routine consistency\n- Read 2 books"
}
```

---

### MonthlyPlan
Container that groups all monthly planning data.

```typescript
export interface MonthlyPlan {
  id?: string;
  monthDate: string;                    // ISO date (first day of month)
  focus: MonthlyFocus;                  // Always present
  goals: MonthlyGoal[];                 // Always 3 items
  reflection?: MonthlyReflection;       // Optional (filled at end of month)
  createdAt?: string;
  updatedAt?: string;
}
```

---

### DTOs (Data Transfer Objects)

#### MonthlyPlanCreateDto
Used when creating a new monthly plan.

```typescript
export interface MonthlyPlanCreateDto {
  monthDate: string;
  focus: {
    intentions: string;
    wordsOrMood?: string;
    notes?: string;
  };
  goals: {
    title: string;
    description?: string;
    progress?: number;                  // Defaults to 0
    linkedTaskIds?: string[];
    position: number;                   // 0, 1, or 2
  }[];
}
```

#### MonthlyPlanUpdateDto
Used when updating an existing plan. All fields optional.

```typescript
export interface MonthlyPlanUpdateDto {
  focus?: {
    intentions?: string;
    wordsOrMood?: string;
    notes?: string;
  };
  goals?: {
    id?: string;
    title?: string;
    description?: string;
    progress?: number;
    linkedTaskIds?: string[];
    position?: number;
  }[];
  reflection?: {
    overallRating?: number;
    wins?: string;
    challenges?: string;
    lessonsLearned?: string;
    focusForNextMonth?: string;
  };
}
```

---

## API Contracts

### Backend Endpoints

All endpoints follow RESTful conventions. Base URL: `https://localhost:44304/api/monthly-plans`

#### 1. Get or Create Monthly Plan
```
GET /api/monthly-plans/{monthDate}

Path Parameters:
  monthDate: ISO date string (e.g., "2026-01-01")

Response: 200 OK
  MonthlyPlan

Error Responses:
  404 Not Found - Plan doesn't exist yet (initialize empty plan)
  401 Unauthorized - User not authenticated
```

#### 2. Create New Monthly Plan
```
POST /api/monthly-plans

Request Body:
  MonthlyPlanCreateDto

Response: 201 Created
  MonthlyPlan

Error Responses:
  400 Bad Request - Invalid data
  401 Unauthorized
```

#### 3. Update Entire Monthly Plan
```
PUT /api/monthly-plans/{monthDate}

Path Parameters:
  monthDate: ISO date string

Request Body:
  MonthlyPlanUpdateDto

Response: 200 OK
  MonthlyPlan

Error Responses:
  400 Bad Request
  401 Unauthorized
  404 Not Found
```

#### 4. Update Focus Section Only
```
PATCH /api/monthly-plans/{monthDate}/focus

Request Body:
  {
    "intentions"?: string;
    "wordsOrMood"?: string;
    "notes"?: string;
  }

Response: 200 OK
  MonthlyFocus

Error Responses:
  400 Bad Request
  401 Unauthorized
  404 Not Found
```

#### 5. Update Specific Goal
```
PATCH /api/monthly-plans/{monthDate}/goals/{position}

Path Parameters:
  monthDate: ISO date string
  position: Goal position (0, 1, or 2)

Request Body:
  {
    "title"?: string;
    "description"?: string;
    "progress"?: number;
    "linkedTaskIds"?: string[];
  }

Response: 200 OK
  MonthlyGoal

Error Responses:
  400 Bad Request
  401 Unauthorized
  404 Not Found
```

#### 6. Update Reflection Section
```
PATCH /api/monthly-plans/{monthDate}/reflection

Request Body:
  {
    "overallRating"?: number;
    "wins"?: string;
    "challenges"?: string;
    "lessonsLearned"?: string;
    "focusForNextMonth"?: string;
  }

Response: 200 OK
  MonthlyReflection

Error Responses:
  400 Bad Request
  401 Unauthorized
  404 Not Found
```

#### 7. Link Task to Goal
```
POST /api/monthly-plans/{monthDate}/goals/{position}/link-task

Path Parameters:
  monthDate: ISO date string
  position: Goal position (0, 1, or 2)

Request Body:
  {
    "taskId": string
  }

Response: 200 OK
  MonthlyGoal (with updated linkedTaskIds)

Error Responses:
  400 Bad Request - Task doesn't exist
  401 Unauthorized
  404 Not Found - Plan or goal not found
```

#### 8. Unlink Task from Goal
```
POST /api/monthly-plans/{monthDate}/goals/{position}/unlink-task

Path Parameters:
  monthDate: ISO date string
  position: Goal position

Request Body:
  {
    "taskId": string
  }

Response: 200 OK
  MonthlyGoal (with updated linkedTaskIds)

Error Responses:
  400 Bad Request
  401 Unauthorized
  404 Not Found
```

#### 9. Get Available Tasks for Month
```
GET /api/monthly-plans/{monthDate}/available-tasks

Path Parameters:
  monthDate: ISO date string

Response: 200 OK
  PlannerTask[]

Notes:
  - Returns all tasks for the month (based on startDate/endDate)
  - Used for populating the task selector modal
  - Does NOT filter out already-linked tasks (UI handles selection)

Error Responses:
  401 Unauthorized
  404 Not Found
```

#### 10. Delete Monthly Plan
```
DELETE /api/monthly-plans/{monthDate}

Path Parameters:
  monthDate: ISO date string

Response: 204 No Content

Error Responses:
  401 Unauthorized
  404 Not Found
```

---

## Component State Management

The component uses Angular signals for state management:

```typescript
// Data
monthlyPlan = signal<MonthlyPlan | null>(null);
availableTasks = signal<PlannerTask[]>([]);

// UI State
isLoading = signal(false);
isSaving = signal(false);
error = signal<string | null>(null);

// Edit Mode Flags
editingFocus = signal(false);
editingGoals = signal(false);
editingReflection = signal(false);
selectedGoalIndex = signal<number | null>(null);
showTaskSelector = signal(false);
selectedGoalForTasks = signal<number | null>(null);

// Form Data
focusForm = signal({ intentions: '', wordsOrMood: '', notes: '' });
goalsForm = signal<Partial<MonthlyGoal>[]>([...]);
reflectionForm = signal({ overallRating: 5, wins: '', ... });
```

---

## Integration Points

### 1. Calendar Navigation
The component accepts `currentDate` as input and auto-loads the plan for that month:

```typescript
currentDate = input<Date>(new Date());

// Effect automatically loads plan when date changes
effect(() => {
  const monthDate = this.getMonthStartDate(this.currentDate());
  this.loadMonthlyPlan(monthDate);
});
```

### 2. Task Linking (Read-Only)
Tasks are displayed in a modal selector. Users can:
- View all tasks for the month
- Check/uncheck to link/unlink tasks
- See task titles and due dates
- But **cannot** create, edit, or delete tasks from this view

### 3. Empty Plan Initialization
If no plan exists for a month, an empty plan is created automatically:
- Focus: all fields empty
- Goals: 3 empty slots
- Reflection: undefined until filled

---

## Constraints & Rules

1. **Always 3 Goals**: Goals are fixed at 3 slots. Empty slots are allowed.
2. **No Task Duplication**: Tasks appear in task list view and linked references only.
3. **Read-Only Task Linking**: Tasks cannot be edited from monthly view.
4. **Month-Based**: Plan is keyed by first day of month (e.g., "2026-01-01").
5. **Separate Planning & Execution**: Monthly view is about **planning**, actual task execution happens in calendar/task views.
6. **No Cascading Deletes**: Deleting a task doesn't delete goal links; links just become orphaned.

---

## Usage Example

### Basic Integration
```typescript
// In parent component
<app-monthly-planning 
  [currentDate]="currentDate">
</app-monthly-planning>
```

### Service Usage
```typescript
constructor(private monthlyPlanningService: MonthlyPlanningService) {}

// Load a plan
this.monthlyPlanningService.getMonthlyPlan('2026-01-01').subscribe(plan => {
  console.log(plan);
});

// Update focus
this.monthlyPlanningService.updateMonthlyFocus('2026-01-01', {
  intentions: 'New intentions text'
}).subscribe(focus => {
  // Handle response
});

// Link a task
this.monthlyPlanningService.linkTaskToGoal('2026-01-01', 0, 'task-123').subscribe(goal => {
  // Goal now contains task-123 in linkedTaskIds
});
```

---

## Error Handling

The component handles:
- Network errors
- Invalid data
- Missing plans (auto-creates empty)
- Missing tasks (gracefully handles orphaned links)

All errors display in an error banner at the top of the component.

---

## Accessibility & UX Notes

- Form fields use Material design for consistency
- Modal overlay for task selection
- Clear section headers with icons
- Color-coded reflection items (green for wins, red for challenges, etc.)
- Responsive grid layouts for mobile/tablet
- All states have loading indicators

---

## Future Enhancements

1. **Archive completed months** - Store past monthly plans for reference
2. **Monthly templates** - Reuse structure from previous months
3. **Goal progress calculation** - Auto-calculate from linked task completion
4. **Monthly review reports** - Export/print monthly plans and reflections
5. **Goal tracking** - Visual progress over time (multiple months)
6. **Integration with AI** - Get suggestions based on past reflections


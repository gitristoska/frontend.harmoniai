# Monthly Planning Module

A comprehensive monthly planning and reflection view for the HarmoniAI planner application.

## Quick Start

### What's Included

- **Component**: Standalone Angular component with 3 main sections
  - Monthly Focus (intentions, mood, notes)
  - Top 3 Monthly Goals (with progress and task linking)
  - Monthly Reflection (rating, wins, challenges, lessons, next month focus)

- **Service**: API integration service with 10 REST endpoints

- **Data Models**: TypeScript interfaces for all data structures

- **Documentation**: Complete implementation guides and API contracts

### File Structure

```
monthly-planning/
├── monthly-planning.component.ts       # Component logic (signals, effects, form handling)
├── monthly-planning.component.html     # Template (3 sections, modal for tasks)
├── monthly-planning.component.scss     # Responsive styling
├── MONTHLY_PLANNING_GUIDE.md          # Full API documentation
├── IMPLEMENTATION_SUMMARY.md          # Quick reference
├── API_EXAMPLES.md                    # Example JSON payloads
└── CHECKLIST.md                       # Implementation checklist
```

## Key Features

✨ **Planning-Focused**: Separates goal planning from task execution
📌 **3 Fixed Goal Slots**: Prevents analysis paralysis
🔗 **Read-Only Task Linking**: Link tasks without editing them
📊 **Progress Tracking**: Manual progress indicator (0-100%)
💭 **Monthly Reflection**: Optional end-of-month review
📱 **Responsive Design**: Works on mobile, tablet, desktop
⚡ **Signal-Based State**: Modern Angular 17+ patterns
🎨 **Material Design**: Consistent with app styling

## Usage

### Basic Integration

```typescript
// Import in your component
import { MonthlyPlanningComponent } from './monthly-planning/monthly-planning.component';

// Use as a standalone component
@Component({
  imports: [MonthlyPlanningComponent]
})
export class MyComponent {
  currentDate = new Date();
}
```

```html
<app-monthly-planning [currentDate]="currentDate"></app-monthly-planning>
```

### Service Usage

```typescript
constructor(private monthlyPlanningService: MonthlyPlanningService) {}

// Get a monthly plan
this.monthlyPlanningService.getMonthlyPlan('2026-01-01').subscribe(plan => {
  console.log(plan);
});

// Update focus
this.monthlyPlanningService.updateMonthlyFocus('2026-01-01', {
  intentions: 'New intentions'
}).subscribe();

// Link a task to a goal
this.monthlyPlanningService.linkTaskToGoal('2026-01-01', 0, 'task-123').subscribe();
```

## Data Models

### MonthlyFocus
- Intentions (multiline text)
- Words/Mood/Energy (tags)
- Notes (multiline text)

### MonthlyGoal (×3)
- Title (required)
- Description (optional)
- Progress (0-100)
- Linked Task IDs (read-only)

### MonthlyReflection
- Overall Rating (1-10)
- Wins & Achievements
- Challenges & Obstacles
- Lessons Learned
- Focus for Next Month

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/monthly-plans/{monthDate}` | Load or create plan |
| POST | `/api/monthly-plans` | Create new plan |
| PUT | `/api/monthly-plans/{monthDate}` | Update entire plan |
| PATCH | `/api/monthly-plans/{monthDate}/focus` | Update focus |
| PATCH | `/api/monthly-plans/{monthDate}/goals/{pos}` | Update goal |
| PATCH | `/api/monthly-plans/{monthDate}/reflection` | Update reflection |
| POST | `/api/monthly-plans/{monthDate}/goals/{pos}/link-task` | Link task |
| POST | `/api/monthly-plans/{monthDate}/goals/{pos}/unlink-task` | Unlink task |
| GET | `/api/monthly-plans/{monthDate}/available-tasks` | Get month's tasks |
| DELETE | `/api/monthly-plans/{monthDate}` | Delete plan |

## State Management

Uses Angular signals for reactive state:

```typescript
// Data
monthlyPlan = signal<MonthlyPlan | null>(null);
availableTasks = signal<PlannerTask[]>([]);

// UI State
isLoading = signal(false);
isSaving = signal(false);
error = signal<string | null>(null);

// Form Data
focusForm = signal({ intentions: '', wordsOrMood: '', notes: '' });
goalsForm = signal<Partial<MonthlyGoal>[]>([...]);
reflectionForm = signal({ overallRating: 5, ... });
```

## Styling

- **Modern gradient backgrounds** for visual depth
- **Color-coded sections** (focus: blue, goals: light blue, reflection: varied)
- **Responsive grid layouts** that adapt to screen size
- **Material Design components** for consistency
- **Smooth animations** for interactions

## Responsive Breakpoints

- **Desktop**: Full 2-column grid for goals
- **Tablet**: Single column with stacked sections
- **Mobile**: Compact layout with all sections stacked

## Error Handling

- Network errors display in error banner
- Gracefully handles missing data
- Auto-creates empty plan if not found
- Orphaned task links handled gracefully

## Constraints

1. **Always 3 Goals**: Fixed slots (empty allowed)
2. **No Task Duplication**: Tasks linked as read-only references
3. **No Task CRUD**: Cannot create/edit/delete tasks from this view
4. **Month-Based**: Plans keyed by first day of month
5. **User Isolated**: All data filtered by user ID

## Dependencies

- Angular 17+
- Angular Material
- RxJS
- TypeScript

## Documentation

- **MONTHLY_PLANNING_GUIDE.md** - Complete API contracts and data models
- **IMPLEMENTATION_SUMMARY.md** - Quick reference for integration
- **API_EXAMPLES.md** - JSON payload examples for testing
- **CHECKLIST.md** - Backend implementation checklist

## Backend Status

Backend implementation is **TODO**. See `CHECKLIST.md` for:
- Database schema
- Endpoint specifications
- Validation rules
- Testing checklist

## Support

For questions:
1. Check the relevant documentation file
2. Review component code comments
3. See `API_EXAMPLES.md` for request/response formats

---

**Status**: ✅ Frontend Complete | 🚀 Backend TODO
**Last Updated**: January 2026

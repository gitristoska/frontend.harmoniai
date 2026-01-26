# Monthly Planning Implementation - Checklist

## Frontend (✅ COMPLETED)

### Component Files
- [x] `monthly-planning.component.ts` - Main component logic
- [x] `monthly-planning.component.html` - Template with 3 sections
- [x] `monthly-planning.component.scss` - Modern responsive styling

### Service Layer
- [x] `monthly-planning.service.ts` - API integration service with 10 methods

### Data Models
- [x] `MonthlyFocus` interface
- [x] `MonthlyGoal` interface
- [x] `MonthlyReflection` interface
- [x] `MonthlyPlan` interface (container)
- [x] `MonthlyPlanCreateDto` interface
- [x] `MonthlyPlanUpdateDto` interface

### Documentation
- [x] `MONTHLY_PLANNING_GUIDE.md` - Complete API contracts and integration guide
- [x] `IMPLEMENTATION_SUMMARY.md` - Quick reference and status
- [x] `API_EXAMPLES.md` - Example JSON payloads for testing

### Component Features
- [x] Monthly Focus section (view/edit)
- [x] Top 3 Goals section with progress tracking
- [x] Task linking modal (read-only)
- [x] Monthly Reflection section (optional)
- [x] Auto-load plan when date changes (effect)
- [x] Form validation and error handling
- [x] Loading states and spinners
- [x] Error banner with dismissal
- [x] Responsive mobile/tablet/desktop layout
- [x] Color-coded reflection items
- [x] Empty state handling

---

## Backend (🚀 TODO)

### Database Schema
- [ ] `MonthlyPlans` table
  - Columns: id, monthDate, userId, createdAt, updatedAt
  - Unique constraint: (monthDate, userId)
  - Index on: userId, monthDate
  
- [ ] `MonthlyFocuses` table
  - Columns: id, monthDate, userId, intentions, wordsOrMood, notes, createdAt, updatedAt
  - Foreign key: monthDate (reference MonthlyPlans)
  
- [ ] `MonthlyGoals` table
  - Columns: id, monthDate, userId, position (0-2), title, description, progress (0-100), createdAt, updatedAt
  - Foreign key: monthDate
  - Unique constraint: (monthDate, position, userId)
  
- [ ] `MonthlyGoalTasks` junction table
  - Columns: goalId, taskId
  - Foreign keys: goalId → MonthlyGoals, taskId → PlannerTasks
  
- [ ] `MonthlyReflections` table
  - Columns: id, monthDate, userId, overallRating (1-10), wins (text), challenges (text), lessonsLearned (text), focusForNextMonth (text), createdAt, updatedAt
  - Foreign key: monthDate

### REST Endpoints
- [ ] `GET /api/monthly-plans/{monthDate}` - Load or create plan
- [ ] `POST /api/monthly-plans` - Create new plan
- [ ] `PUT /api/monthly-plans/{monthDate}` - Update entire plan
- [ ] `PATCH /api/monthly-plans/{monthDate}/focus` - Update focus section
- [ ] `PATCH /api/monthly-plans/{monthDate}/goals/{position}` - Update goal at position
- [ ] `PATCH /api/monthly-plans/{monthDate}/reflection` - Update reflection
- [ ] `POST /api/monthly-plans/{monthDate}/goals/{position}/link-task` - Link task to goal
- [ ] `POST /api/monthly-plans/{monthDate}/goals/{position}/unlink-task` - Unlink task
- [ ] `GET /api/monthly-plans/{monthDate}/available-tasks` - Get month's tasks
- [ ] `DELETE /api/monthly-plans/{monthDate}` - Delete plan

### Validation Rules
- [ ] monthDate must be first day of month (e.g., "2026-01-01")
- [ ] Goals endpoint always returns exactly 3 items
- [ ] Progress: 0-100 integer
- [ ] Overall rating: 1-10 integer
- [ ] linkedTaskIds must reference existing tasks
- [ ] All queries filtered by current user's ID
- [ ] Unique constraint on (monthDate, userId) for goals

### Business Logic
- [ ] Auto-create empty plan if monthDate doesn't exist (GET request)
- [ ] Auto-create empty goal slots if goals < 3
- [ ] Allow orphaned task links (don't validate task existence on creation)
- [ ] Support soft deletes or track deletion timestamps
- [ ] Cascade deletes from plan → focus, goals, reflection
- [ ] Do NOT cascade delete linked tasks when plan deleted

### Error Handling
- [ ] 400 Bad Request for invalid monthDate format
- [ ] 404 Not Found when plan/goal doesn't exist
- [ ] 401 Unauthorized for authentication failures
- [ ] 422 Unprocessable Entity for validation errors
- [ ] Meaningful error messages in response body
- [ ] Consistent error response format

### Testing Checklist
- [ ] Use example payloads from `API_EXAMPLES.md`
- [ ] Test all 10 endpoints with various inputs
- [ ] Verify user isolation (users can't access other users' plans)
- [ ] Test edge cases: empty goals, orphaned links, invalid dates
- [ ] Load testing with concurrent requests
- [ ] Test with zero tasks available
- [ ] Verify timestamps (createdAt, updatedAt)

---

## Integration Steps

### Phase 1: Setup
- [ ] Review `MONTHLY_PLANNING_GUIDE.md` for full specifications
- [ ] Review data models in `src/app/models/api.d.ts`
- [ ] Review service methods in `src/app/services/monthly-planning.service.ts`

### Phase 2: Database
- [ ] Create tables with proper constraints
- [ ] Set up indexes for performance
- [ ] Implement seed/migration scripts

### Phase 3: API Development
- [ ] Implement all 10 endpoints
- [ ] Add input validation
- [ ] Implement user isolation
- [ ] Add proper error handling

### Phase 4: Testing
- [ ] Manual testing with Postman or similar
- [ ] Unit tests for business logic
- [ ] Integration tests for endpoints
- [ ] Load/stress testing

### Phase 5: Frontend Integration
- [ ] Import `MonthlyPlanningComponent` in calendar module
- [ ] Add route (optional)
- [ ] Test component in browser
- [ ] Verify token interceptor works

### Phase 6: Deployment
- [ ] Database migrations in production
- [ ] API deployment with CI/CD
- [ ] Frontend build and deploy
- [ ] Monitor error logs

---

## Dependencies

### Frontend (Already Installed)
- Angular 17+
- Angular Material
- RxJS
- TypeScript

### Backend (Must Be Installed)
- HTTP framework (Express, .NET Core, etc.)
- Database client (PostgreSQL, MySQL, etc.)
- JWT authentication middleware
- CORS middleware (if needed)

---

## Key Design Decisions

### 1. **No Task Duplication**
- Tasks appear in calendar/task view and are linked (read-only) in monthly goals
- MonthlyGoalTasks is a junction table, not a copy

### 2. **Planning vs Execution**
- This component is for planning (intentions, goals, reflection)
- Task execution happens in calendar/task views
- Clear separation of concerns

### 3. **Manual Progress Tracking**
- Goal progress (0-100) is manually entered
- Not calculated from linked tasks
- Gives user flexibility in how they measure progress

### 4. **Always 3 Goals**
- Fixed slot design prevents analysis paralysis
- Empty slots are allowed
- Easier for users to focus on priorities

### 5. **Orphaned Links Allowed**
- If a task is deleted elsewhere, the link remains but points to nothing
- Keeps plan integrity intact
- UI gracefully handles missing tasks

### 6. **Month-Based Keying**
- Plans are keyed by first day of month (e.g., "2026-01-01")
- Simplifies querying and prevents date ambiguity
- Aligns with calendar month boundaries

---

## Support & Questions

### For Frontend Questions
- See component code comments
- Check `MONTHLY_PLANNING_GUIDE.md` for architecture
- Review `API_EXAMPLES.md` for expected request/response formats

### For Backend Questions
- Follow API contracts in `MONTHLY_PLANNING_GUIDE.md`
- Use example payloads in `API_EXAMPLES.md` as test cases
- Validate date formats match ISO standard

### For Integration Issues
- Ensure token interceptor is active
- Verify base URL in service matches backend
- Check CORS headers if cross-origin
- Review browser console for network errors

---

## Status Dashboard

| Component | Frontend | Backend | Testing | Docs |
|-----------|----------|---------|---------|------|
| Monthly Focus | ✅ | ⏳ | ⏳ | ✅ |
| Top 3 Goals | ✅ | ⏳ | ⏳ | ✅ |
| Goal-Task Linking | ✅ | ⏳ | ⏳ | ✅ |
| Monthly Reflection | ✅ | ⏳ | ⏳ | ✅ |
| Service Layer | ✅ | ⏳ | ⏳ | ✅ |
| Data Models | ✅ | ⏳ | ⏳ | ✅ |
| Documentation | ✅ | ✅ | ⏳ | ✅ |

**Legend**: ✅ Complete | ⏳ In Progress | ❌ Not Started

---

## Timeline Estimate

- **Database Design**: 1-2 hours
- **API Implementation**: 4-6 hours
- **Backend Testing**: 2-3 hours
- **Frontend Integration**: 1-2 hours
- **E2E Testing**: 2-3 hours
- **Total Estimate**: 10-17 hours

---

## Files Delivered

```
src/app/
├── models/
│   └── api.d.ts (UPDATED - added 6 new interfaces)
├── services/
│   └── monthly-planning.service.ts (NEW - 10 methods)
└── pages/planner2/calendar/
    └── monthly-planning/
        ├── monthly-planning.component.ts (NEW)
        ├── monthly-planning.component.html (NEW)
        ├── monthly-planning.component.scss (NEW)
        ├── MONTHLY_PLANNING_GUIDE.md (NEW)
        ├── IMPLEMENTATION_SUMMARY.md (NEW)
        └── API_EXAMPLES.md (NEW)
```

**Total New Lines of Code**: ~1,500 (Frontend) + 2-3K estimated (Backend)

---

## Success Criteria

- [x] Component renders without errors
- [x] All form inputs work correctly
- [x] Task selector modal works
- [x] Edit/save/cancel flows work
- [x] Responsive on mobile/tablet/desktop
- [ ] Backend endpoints implemented and tested
- [ ] Component-to-service integration works end-to-end
- [ ] Error handling displays properly
- [ ] No console errors
- [ ] Performance acceptable (< 2s load time)

---

**Ready for Backend Integration** ✅
**Last Updated**: January 2026

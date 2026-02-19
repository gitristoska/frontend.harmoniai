# HarmoniAI Planner - User Scenarios Documentation

## Overview
This document provides detailed user scenarios for the Planner module of the HarmoniAI application. Each scenario describes how users interact with the planner, what happens in the background, and includes guidance for screenshot documentation.

---

## SCENARIO 1: Creating a Single Task Manually

**Components used:**
- Planner Main Component
- Task Modal Dialog
- Task Service
- Angular Material Form Controls (Text Input, Date Picker, Select, Radio Buttons)

**Step-by-step process:**
1. User navigates to the Planner page and views today's schedule
2. Clicks on the **"Add Task"** floating action button (FAB) with the "+" icon in the top-right corner
3. Task creation modal opens with an empty form
4. User enters task details:
   - **Title** (required): e.g., "Finish Project Presentation"
   - **Description** (optional): e.g., "Complete slides and add speaker notes"
   - **Start Date**: Defaults to today; user can change via date picker
   - **Start Time** (optional): e.g., "14:30" for scheduled tasks
   - **Duration** (optional): e.g., "60" minutes
   - **Category**: Selects from dropdown (e.g., "Work", "Personal", "Health")
   - **Priority**: Selects via radio buttons (High, Medium, Low)
   - **Fixed Time**: Toggles checkbox if AI should not reschedule this task
5. User clicks **"Save"** button
6. Modal closes and task appears in the appropriate section of the planner

**Screenshot needed:** "Task Creation Modal - Empty Form"
- Shows the modal dialog with all form fields empty and ready for input
- Includes title field, description area, date/time pickers, category dropdown, priority radio buttons, and Fixed Time checkbox
- Save and Cancel buttons visible at the bottom

**Screenshot needed:** "Task Creation Modal - Filled Form"
- Shows the same modal with sample data filled in:
  - Title: "Finish Project Presentation"
  - Description: "Complete slides and add speaker notes"
  - Date picker showing today's date
  - Time: "14:30"
  - Duration: "60"
  - Category: "Work"
  - Priority: "High" selected
  - Fixed Time checkbox checked

**Background process:**
- Form validation triggers as user types (title is required, max 200 characters)
- Date picker initializes with current date
- When user clicks Save, form data is converted to API request format
- Task Service makes POST request to `/api/planner` with the converted task data
- API assigns unique UUID to the task and returns normalized task object
- Component performs optimistic update: task immediately appears in the UI
- API response confirms creation; snackbar displays "Task created" notification
- Task is added to the appropriate section based on start time (Scheduled or Anytime)
- Filters are re-applied in case new task matches active filters
- Component handles errors by reverting optimistic update and showing error message

---

## SCENARIO 2: Creating Multiple Tasks with AI Assistance

**Components used:**
- Planner Main Component
- Chat Planner Modal Dialog
- AI Insights Service
- Task Service
- Angular Material Form Controls (Textarea, Checkbox, Progress Bar)

**Step-by-step process:**
1. User is on the Planner page viewing today's schedule
2. Clicks on the **"Plan with AI"** button with the AI icon in the header
3. Chat Planner modal opens with a text area for natural language input
4. User describes their day in natural language:
   - Example: "Morning meeting at 9am, lunch with Sarah at noon, finish reports, gym at 6pm, prep for tomorrow"
5. User clicks **"Generate Plan"** button
6. Modal shows loading state with "✨ AI is planning your day..." message
7. AI service generates suggested tasks with:
   - Task title
   - Description
   - Suggested time/category/priority
   - Duration estimate
   - Is-Fixed-Time indicator
8. Suggested tasks appear as selectable cards
9. User reviews suggestions and toggles checkboxes to select which tasks to add
10. User sees AI recommendations section with tips (e.g., "Consider a 15-minute buffer between tasks")
11. User clicks **"Add X Task(s)"** button to confirm selection
12. Modal closes and tasks are added to the planner

**Screenshot needed:** "Chat Planner Modal - Empty State"
- Shows the modal with title "💬 Plan Your Day with AI"
- Empty textarea with placeholder text
- "Generate Plan" button ready to be clicked
- Character count indicator (0/500)

**Screenshot needed:** "Chat Planner Modal - User Input"
- Shows the same modal with user's natural language input filled in:
  - Example text: "Morning meeting at 9am, lunch with Sarah at noon, finish reports, gym at 6pm"
- Character counter shows progress (e.g., 78/500)

**Screenshot needed:** "Chat Planner Modal - Loading State"
- Shows loading progress bar
- "✨ AI is planning your day..." text centered
- Buttons disabled during generation

**Screenshot needed:** "Chat Planner Modal - Suggested Tasks"
- Shows the modal with generated task suggestions
- Multiple task cards displayed with:
  - Title (e.g., "Morning Meeting")
  - Description (e.g., "Sync with team on project status")
  - Badges showing: WORK category, HIGH priority, ⏰ 09:00, 60min duration
  - Checkbox on the left (some checked, some unchecked)
- Summary section showing AI's interpretation
- Recommendations section with tips
- "Add X Task(s)" button at bottom showing number of selected tasks

**Background process:**
- Form validation checks textarea is not empty
- User input is sent to Task Service's `generatePlanFromChat()` method
- API call: POST to `/api/planner/chat/suggest` with userInput and current date
- Backend uses AI (OpenAI API) to parse natural language and generate task suggestions
- Service processes response and formats task suggestions
- Component displays suggestions with status tracking (selected/not selected)
- User selection state is tracked in component signals
- When user confirms, `addMultipleTasks()` is called for each selected task
- Each task makes individual POST request to `/api/planner`
- Tasks are added sequentially; snackbar shows success count when all complete
- If individual task creation fails, error is logged but process continues for other tasks
- Calendar view refreshes to display all newly created tasks
- Filter state is preserved; new tasks may appear if they match active filters

---

## SCENARIO 3: Editing an Existing Task

**Components used:**
- Planner Main Component
- Task Modal Dialog (in edit mode)
- Task Service
- Angular Material Form Controls

**Step-by-step process:**
1. User is viewing the planner with several tasks displayed
2. Identifies a task that needs modification (e.g., "Team Meeting")
3. Clicks **"Edit"** icon button (pencil icon) on the task card
4. Task Modal opens pre-populated with existing task data:
   - Title: "Team Meeting"
   - Description: "Quarterly review with department heads"
   - Start Date: Currently set date
   - Start Time: "14:00"
   - Duration: "60" minutes
   - Category: "Work"
   - Priority: "High"
   - Fixed Time: Checked
5. User modifies fields as needed:
   - Changes title to "Team Meeting - Q4 Review"
   - Updates start time from "14:00" to "15:00"
   - Changes priority from "High" to "Medium"
6. User clicks **"Save"** button
7. Modal closes and task updates appear immediately in the planner
8. Updated timestamp is recorded

**Screenshot needed:** "Task Edit Modal - Pre-populated Form"
- Shows the modal with all fields filled with existing task data
- Title: "Team Meeting"
- Description visible
- Date and time fields populated
- Category and Priority showing current values
- Fixed Time checkbox status preserved
- Save and Cancel buttons visible

**Screenshot needed:** "Task Card After Edit"
- Shows the updated task in the planner list view
- Displays updated value: "Team Meeting - Q4 Review"
- Time updated to "15:00"
- Priority badge changed to Medium (🟡)
- Other details unchanged

**Background process:**
- Modal opens with `data.task` object containing existing task details
- Form fields are pre-populated using `patchValue()`
- Form validation still applies during editing
- When user clicks Save, form data is converted to update DTO
- `plannerService.updateTask(taskId, updateData)` is called
- API makes PUT request to `/api/planner/{taskId}` with modified fields
- Component performs optimistic update: task is immediately updated in the UI
- `updatedAt` timestamp is set to current time
- If update is successful, snackbar shows "Task updated" notification
- If error occurs, original task data is restored from previous state
- Filters remain active; edited task may move between sections if time/status changed
- View switches back to updated task's new location in the list

---

## SCENARIO 4: Marking a Task as Completed

**Components used:**
- Planner Main Component
- Task Service
- Angular Material Icon Buttons

**Step-by-step process:**
1. User views the planner with multiple tasks in different statuses
2. Sees a task that is complete: "Finish Project Presentation"
3. Currently displays with status indicator "⭕ (Todo)"
4. Clicks on the status indicator button to cycle status
5. Task status changes to "🔄 (In Progress)"
6. User clicks the status indicator again
7. Task status changes to "✅ (Done)"
8. Task automatically moves to the "Done" section at the bottom
9. Task displays as grayed out/completed styling
10. Completion timestamp is recorded
11. Progress bar at top updates (e.g., "3/5 tasks" → "4/5 tasks")

**Alternative workflow - Multi-click completion:**
1. Task starts in Scheduled section with "⭕ Todo" status
2. First click: Status becomes "🔄 In Progress" (stays in Scheduled section)
3. Second click: Status becomes "✅ Done" (moves to Done section)
4. Third click (optional): Status cycles back to "⭕ Todo" (returns to original section)

**Screenshot needed:** "Task Status Cycling - Todo State"
- Shows a task card with:
  - Status button showing "⭕" (open circle)
  - Full task details visible
  - Tooltip on hover: "Click to cycle: To Do → Next"

**Screenshot needed:** "Task Status Cycling - In Progress State"
- Same task card with:
  - Status button showing "🔄" (circular arrows)
  - Task appears slightly highlighted/active
  - Tooltip: "Click to cycle: In Progress → Next"

**Screenshot needed:** "Task Status Cycling - Done State"
- Task card with:
  - Status button showing "✅" (checkmark)
  - Task text grayed out or with strikethrough effect
  - Card has reduced opacity or "completed" styling
  - Tooltip: "Click to cycle: Done → Next"

**Screenshot needed:** "Progress Bar Update"
- Header section showing task statistics
- "4/5 tasks" indicator
- Progress bar filled to 80%
- Color intensity or animation showing update

**Background process:**
- User clicks the status button which calls `toggleTaskStatus(task)`
- Component determines current status (Todo → InProgress → Done → Todo cycle)
- Optimistic update immediately reflects new status in UI
- For "Done" status, `completedAt` timestamp is auto-set to current time
- API call: PUT to `/api/planner/{taskId}` with new status
- Status is converted to string format ("Todo", "InProgress", "Done") for API
- Task moves to appropriate section:
  - Stays in "Scheduled" or "Anytime" if still Todo/InProgress
  - Moves to Done section if completed
  - Cycles back to original section if reverted to Todo
- Completion percentage recalculated: `(done_count / total_count) * 100`
- Snackbar displays status update message (e.g., "Task marked as Done")
- If API error occurs, status reverts to previous state and error message shown
- Task history updated with `TaskEvent` object (action: "statusChanged", timestamp)
- Task reschedule count may be incremented if status change affects scheduling

---

## SCENARIO 5: Deleting a Task

**Components used:**
- Planner Main Component
- Task Service
- Browser Confirm Dialog
- Angular Material Snackbar

**Step-by-step process:**
1. User views the planner with multiple tasks
2. Identifies a task to delete: "Old task to remove"
3. Clicks **"Delete"** icon button (trash icon) on the task card
4. Browser confirmation dialog appears: "Are you sure you want to delete this task?"
5. User clicks **"OK"** to confirm deletion
6. Task is immediately removed from the planner
7. Snackbar notification appears: "Task deleted"
8. If no tasks remain in a section, that section disappears
9. Task statistics update (e.g., "3/4 tasks" → "3/3 tasks")
10. If task filters were active, list is refreshed accordingly

**Alternative - Cancel deletion:**
1. User clicks Delete button
2. Confirmation dialog appears
3. User clicks **"Cancel"**
4. Dialog closes and task remains unchanged

**Screenshot needed:** "Task Before Deletion"
- Shows task card with all details:
  - Title: "Old task to remove"
  - Status, priority, category visible
  - Delete button (trash icon) in the top-right of task actions

**Screenshot needed:** "Delete Confirmation Dialog"
- Browser standard confirmation dialog box
- Message: "Are you sure you want to delete this task?"
- "OK" and "Cancel" buttons

**Screenshot needed:** "Task After Deletion"
- Planner view with the task no longer present
- Task count updated in statistics
- Snackbar notification visible: "Task deleted"

**Background process:**
- User clicks Delete button which calls `deleteTask(taskId)`
- Browser `confirm()` dialog is displayed
- If user confirms (returns true):
  - Component optimistically removes task from signal array: `tasks.filter(t => t.id !== taskId)`
  - API call: DELETE to `/api/planner/{taskId}`
  - Backend deletes task record from database
  - Snackbar shows success message "Task deleted"
- If user cancels (returns false):
  - No further action; dialog closes
  - Task remains in planner
- Upon successful deletion:
  - Filtered task list is recalculated
  - Sections are redrawn (empty sections not displayed)
  - Task statistics updated
  - Progress percentage recalculated
- If API error occurs:
  - Task is restored to task list (error handling)
  - Error snackbar displayed: "Failed to delete task"
  - UI remains unchanged for user retry

---

## SCENARIO 6: Viewing All Tasks - List View (Default)

**Components used:**
- Planner Main Component
- Task List Template
- Angular Material Icons and Typography

**Step-by-step process:**
1. User navigates to the Planner page
2. View defaults to **List View** (saved in session storage from last visit, or defaults to list)
3. User sees tasks organized in two main sections:
   - **⏲️ Scheduled** section at top: Tasks with specific start times (sorted chronologically)
   - **📋 Anytime** section below: Tasks without specific times (no time constraints)
4. Each section displays multiple task cards showing:
   - Time badge (only for scheduled tasks)
   - Status indicator icon (⭕/🔄/✅)
   - Task title
   - Fixed Time or Flexible badge
   - Description (if available)
   - Metadata: Category badge, Priority level, Status, Duration
   - Action buttons: Edit and Delete
5. If no tasks exist, empty state card appears with "Your day is clear" message
6. Header shows task completion statistics (e.g., "2/5 tasks (filtered)")
7. Progress bar visualizes completion percentage

**Screenshot needed:** "Planner List View - Full Day"
- Shows complete planner view with header
- Header displays: Current date, navigation buttons, "Plan with AI" button, "Add Task" button
- Statistics showing task count and progress bar
- Scheduled section with 2-3 example tasks with times (09:00, 14:30)
- Anytime section with 2-3 tasks without specific times
- Each task displays with icons, badges, and action buttons
- Clean, organized layout with visual hierarchy

**Screenshot needed:** "Planner List View - Scheduled Task Card Details"
- Close-up of a single scheduled task card showing:
  - Time badge on left: "14:30"
  - Status button: "⭕"
  - Title: "Team Meeting"
  - Badges: "📌 FIXED TIME" or "⏰ FLEXIBLE"
  - Description text visible
  - Metadata badges: "Work", "High", "To Do", "60min"
  - Edit and Delete buttons on right

**Screenshot needed:** "Planner List View - Anytime Task Card"
- Close-up of an anytime task (no specific time) showing:
  - No time badge (empty state)
  - Status button: "🔄" (in progress example)
  - Title: "Project Research"
  - Flexible badge: "⏰ FLEXIBLE"
  - Category: "Work"
  - Priority: "Medium"
  - Status: "In Progress"

**Screenshot needed:** "Planner List View - Empty State"
- Shows the empty state when no tasks exist
- Emoji: "✨"
- Text: "Your day is clear"
- Subtitle: "Start planning your day with AI or create tasks manually"
- Two action buttons: "Plan with AI" and "Add Task"

**Background process:**
- Component initializes with default view mode from session storage
- On page load, `loadPlannerData()` fetches tasks for current day from API
- GET request: `/api/planner/day?date={YYYY-MM-DD}`
- API returns array of tasks for the day
- Tasks are normalized (status converted to consistent format)
- Component calculates filtered task list based on active filters
- Tasks are split into two groups using helper methods:
  - `getFixedTimeTasks()`: Tasks with `startTime` property, sorted chronologically
  - `getFlexibleTasks()`: Tasks without `startTime`, no sorting requirement
- Statistics are calculated:
  - Total task count
  - Completed task count
  - Completion percentage
  - Filtered count if filters active
- If zero tasks, empty state template is displayed instead of task lists
- Progress bar width is calculated as percentage
- View mode is saved to session storage for next visit

---

## SCENARIO 7: Viewing All Tasks - Kanban Board View

**Components used:**
- Planner Main Component
- Kanban Board Template
- Kanban Column Components
- Kanban Task Cards

**Step-by-step process:**
1. User is viewing the planner in List View
2. Clicks on the **View Mode** menu button (icon with three horizontal lines/dashboard)
3. Dropdown menu appears with three view options:
   - List View (checked indicator)
   - Kanban Board
   - Agenda (Timeline)
4. User clicks **"Kanban Board"**
5. View switches to Kanban layout showing three columns:
   - **📝 To Do** (left): All tasks with "Todo" status
   - **🔄 In Progress** (middle): All tasks with "InProgress" status
   - **✅ Done** (right): All tasks with "Done" status
6. Each card displays:
   - Task title
   - Description (if available)
   - Metadata badges: Category, Priority, Time, Duration
   - Delete button
   - Move button (Forward button: moves to next column)
7. Cards are interactive:
   - Click card to open edit modal
   - Cards are color-coded or have visual distinction by priority
   - Completed cards appear grayed out or styled differently
8. User clicks move button on a "To Do" card
9. Card moves to "In Progress" column (status cycles)
10. Next click moves it to "Done" column

**Screenshot needed:** "Kanban Board View - Full Layout"
- Shows three columns side by side
- **To Do column** (left) with 2-3 example tasks in white/standard styling
- **In Progress column** (middle) with 1-2 example tasks potentially highlighted
- **Done column** (right) with completed tasks in grayed-out styling
- Each column has header with status icon and name
- Tasks displayed as cards with full metadata
- Clear visual separation between columns

**Screenshot needed:** "Kanban Card - To Do Status"
- Individual task card in unfilled state showing:
  - Title: "Finish Presentation"
  - Description: "Add speaker notes and transitions"
  - Badges: "Work", "High" (🔴), "⏰ 14:30", "60min"
  - Delete button (X) in top-right corner
  - Move button (→) at bottom-right in primary color

**Screenshot needed:** "Kanban Card - In Progress Status"
- Task card in In Progress column:
  - Same information as above
  - Potentially with highlighted/active styling
  - Move button changed to checkmark (✓) for moving to Done
  - Accent color button

**Screenshot needed:** "Kanban Card - Done Status"
- Task card in Done column:
  - Title and text might be grayed out or have strikethrough
  - Card opacity reduced or background color different
  - Delete button still available
  - No move button (end of workflow)

**Background process:**
- When user selects Kanban view, `changeViewMode('kanban')` is called
- View mode is saved to session storage: `sessionStorage.setItem('plannerViewMode', 'kanban')`
- Kanban view template is activated via `*ngSwitchCase="'kanban'"`
- Component prepares task data using `getTasksByStatus(status)` helper:
  - Filters tasks to get only those matching the status ("Todo", "InProgress", "Done")
  - Sorts by priority (descending) then by start time
- Three columns are rendered with tasks distributed accordingly
- Move button click calls `toggleTaskStatus(task)` with `$event.stopPropagation()` to prevent modal opening
- Task transitions:
  - To Do → In Progress: First status increment
  - In Progress → Done: Second status increment (completedAt timestamp added)
  - Done cards cannot cycle forward (no move button)
- If user clicks card (not button), `openTaskModal(task)` is called for editing
- Delete button calls `deleteTask(taskId)` with stop propagation
- View persists across page navigation via session storage

---

## SCENARIO 8: Viewing All Tasks - Agenda/Timeline View

**Components used:**
- Planner Main Component
- Agenda Timeline Template
- Time Slot Components
- Flexible Tasks Sidebar

**Step-by-step process:**
1. User is viewing planner in List or Kanban view
2. Clicks on the **View Mode** menu button
3. Dropdown menu appears
4. User selects **"Agenda (Timeline)"**
5. View switches to timeline layout showing:
   - **⏲️ Scheduled Tasks** section: Hourly timeline from 8:00 AM to 11:00 PM (16 hours)
   - **📋 Flexible Tasks** sidebar on the right: Tasks without specific times
6. Each hour slot shows:
   - Time label (e.g., "08:00", "09:00", etc.)
   - Tasks scheduled for that hour (if any)
   - Status indicator and task details
7. Hour slots with tasks are visually highlighted (different background color)
8. Each task card in a time slot shows:
   - Exact start time
   - Task title
   - Status button
   - Description
   - Metadata badges: Category, Priority, Duration
   - Delete button
9. Tasks with exact times appear in their respective hour slots
10. Flexible tasks appear in the right sidebar without specific times
11. User can:
    - Click task to edit
    - Click status button to cycle status (moves task within/out of timeline)
    - Delete task
    - View full timeline of the entire day in a glance

**Screenshot needed:** "Agenda View - Full Timeline"
- Shows hourly timeline from 8:00 AM to 11:00 PM
- Multiple hour slots visible (8:00, 9:00, 10:00, etc.)
- Some hour slots contain task cards (highlighted background)
- Task cards visible for scheduled items with exact times
- Right sidebar showing "📋 Flexible Tasks" section with 2-3 anytime tasks
- Clean hourly grid layout
- Scrollable view for better visibility of all hours

**Screenshot needed:** "Agenda View - Hour Slot with Tasks"
- Close-up of a time slot containing a task, e.g., 14:00
- Time label on left: "14:00"
- Task card showing:
  - Status button: "⭕"
  - Exact time: "14:30"
  - Task title: "Team Meeting"
  - Description visible
  - Badges: "Work", "High" (🔴), "60min"
  - Delete button
  - Slot background highlighted to indicate occupied slot

**Screenshot needed:** "Agenda View - Empty Hour Slot"
- Time slot without tasks, e.g., 11:00
- Time label on left: "11:00"
- "Slot Tasks" area is empty
- Background is standard color (not highlighted)

**Screenshot needed:** "Agenda View - Flexible Tasks Sidebar"
- Right sidebar showing "📋 Flexible Tasks" heading
- Multiple task entries without specific times:
  - Task 1: Status "⭕", Title: "Project Research", Priority "🟡" (Medium)
  - Task 2: Status "🔄", Title: "Report Writing", Priority "🔴" (High)
- Compact layout with status button, title, and priority
- Clickable for opening edit modal

**Background process:**
- User selects Agenda view, `changeViewMode('agenda')` is called
- View mode saved to session storage: `sessionStorage.setItem('plannerViewMode', 'agenda')`
- Agenda template activated via `*ngSwitchCase="'agenda'"`
- Component generates hour slots array: `getHourSlots()` returns [8, 9, 10, ..., 23]
- For each hour slot, `getTasksForHour(hour)` is called:
  - Filters fixed-time tasks where `startTime.split(':')[0]` matches hour
  - Returns tasks sorted by priority and start time
- Hour slots with tasks are styled with `[class.has-tasks]="..."` directive
- Flexible tasks are retrieved via `getFlexibleTasks()` (tasks with no startTime)
- Timeline markup creates 16 individual time slot divs (8 AM to 11 PM hourly)
- All status changes and deletions work the same as in other views
- Toggling status may move task between timeline and flexible sidebar:
  - Add startTime → Task moves from sidebar into timeline
  - Remove startTime → Task moves from timeline into sidebar
- Clicking task opens edit modal with full edit capabilities
- Progress bar at top updates dynamically as task statuses change

---

## SCENARIO 9: Filtering Tasks by Category

**Components used:**
- Planner Main Component
- Search/Filter Section
- Category Filter Buttons
- Task Service (filtering logic)

**Step-by-step process:**
1. User is viewing the planner with multiple tasks across different categories (Work, Personal, Health, etc.)
2. Sees filter section below the task statistics with:
   - Search field
   - Category buttons: "Work", "Personal", "Health", etc. (dynamically generated)
   - Priority buttons: "🟢 Low", "🟡 Medium", "🔴 High"
3. User clicks on **"Work"** category button
4. Button gets active/highlighted styling
5. Task list immediately filters to show only Work tasks
6. Statistics update: "2/5 tasks (filtered)" showing only Work task count
7. User sees:
   - All Work-related tasks in both Scheduled and Anytime sections
   - Non-Work tasks are hidden
   - Progress bar shows completion of Work tasks only
8. User adds another filter by clicking **"High"** priority button
9. Task list now shows only Work + High Priority tasks (combined filter)
10. If only 1 task matches, statistics show "1/5 tasks (filtered)"
11. User clicks **"Work"** again to toggle off the category filter
12. All tasks reappear and list expands back to full view
13. Priority filter remains active (only showing all High priority tasks now)

**Screenshot needed:** "Planner with Filter Section Visible"
- Shows the search-filters-section fully expanded
- Search field with placeholder: "Search tasks..."
- Category filter buttons showing available categories: Work, Personal, Health, etc.
- Priority filter buttons: 🟢 Low, 🟡 Medium, 🔴 High
- Clear filters button visible (only if filters active)
- Task list below showing all tasks before filtering

**Screenshot needed:** "Filter Active - Work Category Selected"
- Same view with:
  - Work category button highlighted/active (different styling/color)
  - Task list showing only Work category tasks (2 tasks visible)
  - Statistics showing "2/5 tasks (filtered)" with [filtered] indicator
  - Progress bar showing completion of work tasks
  - Other categories' tasks hidden from view

**Screenshot needed:** "Multiple Filters Active"
- Filter section showing:
  - Work category button highlighted
  - High priority button (🔴) highlighted
  - Both filters active simultaneously
- Task list showing combined filter results (e.g., "Work AND High")
- Statistics: "1/5 tasks (filtered)"
- Clear filters button prominent

**Screenshot needed:** "Clear Filters Button"
- Close-up of the X button to clear all filters
- Located at the end of the filter section
- Tooltip: "Clear all filters"
- Only visible when filters are active

**Background process:**
- Filter section loads with unique categories extracted from current tasks via `getUniqueCategoriesFromTasks()`
- Category list is sorted alphabetically
- Active filter state is tracked in signals: `selectedCategory`, `selectedPriority`, `selectedStatus`
- When user clicks category button, `toggleCategoryFilter(category)` is called
- Filter toggle saves selection to session storage: `sessionStorage.setItem('plannerCategoryFilter', category)`
- `getFilteredTasks()` method applies all active filters:
  - If `selectedCategory` is set, filters by matching category (case-insensitive)
  - If `selectedPriority` is set, filters by matching priority level
  - Filters are combined with AND logic (all must match)
- Task list immediately re-renders with filtered results
- Task statistics are recalculated:
  - `getFilteredTasks().length` for filtered count
  - Completion percentage calculated only for filtered tasks
  - Statistics show "[filtered]" indicator if any filter is active
- Clicking the same filter again toggles it off: `selectedCategory.set(null)`
- Session storage is cleared when filter is deactivated
- Multiple filters can be stacked; only tasks matching ALL active filters display
- Empty state appears if no tasks match combined filters
- Filters persist across page navigation via session storage restoration in `ngOnInit()`

---

## SCENARIO 10: Filtering Tasks by Priority

**Components used:**
- Planner Main Component
- Priority Filter Buttons
- Task Service (filtering logic)
- Angular Material Buttons

**Step-by-step process:**
1. User views the planner and sees all tasks displayed without filters
2. Focuses on high-priority items for the day
3. Clicks on **"🔴 High"** priority filter button
4. Button becomes highlighted/active
5. Task list immediately shows only High priority tasks
6. Low and Medium priority tasks disappear from view
7. Task statistics update to show filtered count (e.g., "3/8 tasks (filtered)")
8. Progress bar shows completion rate for High priority tasks only
9. User wants to also see Medium priority items
10. User clicks **"🟡 Medium"** button while High is still active
11. Filter status toggles: If only one priority can be selected, this replaces High
    - OR if multiple selections allowed, now shows both High AND Medium
12. Task list updates accordingly
13. User clicks **"🔴 High"** again to toggle it off
14. User can click **"Clear filters"** button (X icon) to reset all filters

**Screenshot needed:** "Priority Filter Buttons - No Selection"
- Filter section showing three priority buttons:
  - 🟢 Low (standard styling)
  - 🟡 Medium (standard styling)
  - 🔴 High (standard styling)
- All buttons in non-active state
- Task list shows all tasks mixed from all priorities

**Screenshot needed:** "Priority Filter Buttons - High Selected"
- Same section with:
  - 🔴 High button highlighted/active (different background/border color)
  - 🟢 Low and 🟡 Medium in standard state
- Task list below shows only High priority tasks (those with priority === 2)
- Statistics: "3/8 tasks (filtered)"

**Screenshot needed:** "Task List Filtered by High Priority"
- Task cards visible, each showing:
  - Priority badge: "🔴 High" on all displayed tasks
  - Status indicators and other metadata
  - Mix of To Do, In Progress, and Done tasks (all High priority)
  - Low and Medium priority tasks completely hidden

**Background process:**
- Priority filter buttons are static (Low, Medium, High) - unlike categories which are dynamic
- Buttons represent the three priority levels: Low (0), Medium (1), High (2)
- Clicking a priority button calls `togglePriorityFilter(priority)`
- Selected priority is saved to signal: `selectedPriority.set(priority)`
- Selection is persisted to session storage: `sessionStorage.setItem('plannerPriorityFilter', priority.toString())`
- `getFilteredTasks()` checks if `selectedPriority() !== null`
- If priority filter active, only tasks with `task.priority === selectedPriority()` pass filter
- Task list immediately re-renders with filtered results
- Task statistics recalculate:
  - Count only filtered tasks
  - Completion percentage based on filtered tasks only
  - Show "[filtered]" indicator
- Clicking the same priority button again toggles filter off: `selectedPriority.set(null)`
- Session storage entry is removed
- If multiple filters were active (category + priority), only priority changes; category remains
- Empty state appears if no tasks match all active filters
- Filter state persists across navigation via session storage restoration

---

## SCENARIO 11: Searching Tasks by Title or Description

**Components used:**
- Planner Main Component
- Search Form Field
- Task Service (filtering logic)
- Angular Material Form Field with Text Input

**Step-by-step process:**
1. User is viewing the planner with multiple tasks
2. Remembers a task title partially: "...presentation..."
3. Clicks in the **Search** field in the filter section
4. Placeholder text visible: "Search tasks..."
5. User types: "presentation"
6. As user types, task list filters in real-time (live search)
7. Only tasks with "presentation" in title OR description appear
8. Example matching tasks:
   - "Finish Project Presentation" (match in title)
   - "Complete slides and transitions presentation" (match in description)
9. Non-matching tasks immediately disappear
10. Search statistics update: "2/5 tasks (filtered)" showing only matching tasks
11. User continues typing: "project"
12. List narrows further to show only "Finish Project Presentation"
13. User clears search field by pressing Backspace multiple times
14. Or user presses Ctrl+A and Delete to clear all
15. Task list expands back to show all tasks (if no other filters active)
16. User can click search field again to enter different search term

**Screenshot needed:** "Search Field - Empty State"
- Filter section with search field empty
- Placeholder text visible: "Search tasks..."
- Search icon on the right side of field
- Task list below showing all tasks unfiltered

**Screenshot needed:** "Search Field - Typing 'presentation'"
- Search field with user input: "presentation"
- Character count or cursor blinking
- Search icon visible
- Task list below showing 2 filtered tasks with matching titles/descriptions

**Screenshot needed:** "Search Field - Typing 'project presentation'"
- Search field with longer search term: "project presentation"
- Task list further filtered to 1 matching result: "Finish Project Presentation"
- Other tasks hidden

**Screenshot needed:** "Search Results - Matching Tasks"
- Task list section showing only filtered tasks
- Title highlighting or indication of why task matched (for better UX)
- Statistics showing: "1/5 tasks (filtered)"
- Clear filters option visible to reset search

**Background process:**
- Search field binds to `searchTerm` signal via `[(ngModel)]="searchTerm()"`
- `(keyup)` event triggers `updateSearchTerm($event.target.value)`
- Component updates `searchTerm` signal with current input value
- `getFilteredTasks()` method immediately applies search filter:
  - Converts search term to lowercase
  - For each task, checks if lowercase title contains search term
  - If not found in title, checks if description contains search term
  - Both title and description searches are case-insensitive
  - Returns tasks that match either criteria (OR logic)
- Task list re-renders instantly with each keystroke (live filtering)
- If search term is empty, this filter doesn't reduce results
- Search combines with other active filters (AND logic with category/priority)
- Example: Search "report" + Category "Work" filter shows only Work-category tasks with "report"
- Clear filters button will also clear search term if user clicks it
- Search state is NOT persisted to session storage (only category and priority filters are)
- Empty state appears if search matches no tasks

---

## SCENARIO 12: Navigating Between Days

**Components used:**
- Planner Main Component
- Date Navigation Controls
- Task Service
- Angular Material Buttons

**Step-by-step process:**
1. User is viewing the planner for today (e.g., February 19, 2026)
2. Header displays current date: "Wednesday, February 19, 2026"
3. Below date are three navigation buttons:
   - Left arrow button: "Yesterday"
   - "Today" button
   - Right arrow button: "Tomorrow"
4. User clicks the **Left arrow** button
5. Date changes to previous day (February 18, 2026)
6. Header title updates to show new date
7. Task list clears and reloads with tasks for February 18
8. Filters are preserved from previous day (or cleared - depends on implementation)
9. User clicks the **Right arrow** button twice
10. Date progresses to February 19 (today), then February 20 (tomorrow)
11. Content updates with tasks for February 20
12. User realizes they went too far and clicks **"Today"** button
13. Date snaps back to today (February 19, 2026)
14. If already on today, "Today" button is disabled (greyed out)

**Screenshot needed:** "Date Navigation - Today's Date"
- Header showing: "Wednesday, February 19, 2026"
- Navigation buttons:
  - Left arrow (enabled): "Yesterday"
  - "Today" button (disabled/greyed out, showing current date)
  - Right arrow (enabled): "Tomorrow"
- Task list below showing today's tasks

**Screenshot needed:** "Date Navigation - Previous Day"
- Header showing: "Tuesday, February 18, 2026"
- Navigation buttons:
  - Left arrow (enabled): "Yesterday"
  - "Today" button (enabled): Shows "Today"
  - Right arrow (enabled): "Tomorrow"
- Task list showing previous day's tasks

**Screenshot needed:** "Date Navigation - Future Date"
- Header showing: "Thursday, February 20, 2026"
- Navigation buttons all enabled
- Task list showing tasks for February 20 (may be empty if no tasks scheduled)

**Background process:**
- Component initializes with `currentDate` signal set to `new Date()` (today)
- Header displays using `formatDateForDisplay(currentDate())` function
- Date format: "weekday, month day, year" (e.g., "Wednesday, February 19, 2026")
- "Yesterday" button calls `previousDay()`:
  - Creates new Date object
  - Sets date to previous day: `newDate.setDate(newDate.getDate() - 1)`
  - Updates `currentDate` signal
  - Calls `loadPlannerData()`
- "Tomorrow" button calls `nextDay()`:
  - Similar logic but increments date: `getDate() + 1`
  - Updates signal and reloads data
- "Today" button calls `goToToday()`:
  - Sets `currentDate` to new Date() (current date)
  - Calls `loadPlannerData()`
- "Today" button is disabled when: `isToday()` returns true
  - Checks if current date string matches today's date string
- `loadPlannerData()` triggers task reload:
  - Converts `currentDate` to API format: "YYYY-MM-DD"
  - Calls `getTasksForDay(dateStr)`
  - API request: GET `/api/planner/day?date={YYYY-MM-DD}`
  - Backend returns tasks scheduled for that specific day
  - Component updates task list
- Going to past/future dates doesn't clear filters (filters persist)
- If new date has no tasks, empty state is displayed
- Progress bar shows 0% if no tasks for that day
- Active session filters (category, priority, search) remain in effect

---

## SCENARIO 13: Toggling Filter Visibility

**Components used:**
- Planner Main Component
- Filter Section Toggle Button
- Angular Material Icon Button

**Step-by-step process:**
1. User is viewing the planner with filter section expanded and visible
2. Filter buttons for Category, Priority are all visible
3. User sees the filter section takes up vertical space
4. User clicks the **"Toggle Filters"** button (arrow icon that points up/down)
5. Filter section collapses (slides up)
6. Category and Priority filter buttons disappear from view
7. Search field also hides
8. Task list expands to fill the space
9. Toggle button icon changes direction (now pointing down)
10. User clicks the toggle button again
11. Filter section expands (slides down)
12. Category, Priority buttons, and Search field reappear
13. Filters maintain their active state during toggle (if High was selected, it's still selected after toggle)

**Screenshot needed:** "Planner with Filters Expanded"
- Shows filter section in full view
- Search field visible
- Category buttons visible: Work, Personal, Health, Learning, etc.
- Priority buttons visible: 🟢 Low, 🟡 Medium, 🔴 High
- Toggle button showing up arrow (expand_less icon)
- Task list takes lower portion of screen

**Screenshot needed:** "Planner with Filters Collapsed"
- Filter section is hidden/collapsed
- Search field not visible
- Category and Priority buttons hidden
- More vertical space allocated to task list
- Toggle button showing down arrow (expand_more icon) to indicate expandable
- Task list expanded to fill more screen space

**Background process:**
- Filter visibility state tracked in `filtersVisible` signal (boolean)
- Toggle button calls `toggleFiltersVisibility()`
- Function updates signal: `filtersVisible.update(v => !v)`
- Toggle state is NOT persisted (resets on page refresh)
- Filter section has conditional CSS class: `[class.collapsed]="!filtersVisible()"`
- When collapsed, CSS hides filters section (display: none or similar)
- When expanded, CSS displays filters section (display: block or similar)
- Filter state (active selections) is preserved during visibility toggle
- Animations may be added for smooth expand/collapse effect (CSS transitions)
- Toggle button icon changes based on state: `filtersVisible() ? 'expand_less' : 'expand_more'`
- User can still apply/remove filters even when collapsed:
  - Must expand section first to see/click filter buttons
  - After selecting filter, section can be collapsed while filter remains active

---

## SCENARIO 14: Task Completion Flow - Complete Overview

**Components used:**
- Planner Main Component
- Task Modal (for details)
- Task Service
- Status Indicator Buttons

**Step-by-step process:**
1. User creates a new task: "Complete quarterly report analysis"
2. Task appears in Scheduled section with time 10:00 AM
3. Status shows "⭕ To Do"
4. User begins working on it at 9:55 AM
5. User clicks status button to mark "In Progress"
6. Task status changes to "🔄 In Progress"
7. Task styling subtly changes (might be highlighted or have different border)
8. User opens task for quick edit to add notes about progress
9. User returns to planner
10. After finishing at 10:45 AM, user clicks status button again
11. Status changes to "✅ Done"
12. Task moves to Done section at bottom
13. Task styling changes: text grayed out, lower opacity
14. Completion timestamp recorded: `completedAt: 2026-02-19T10:45:00Z`
15. Progress bar updates: "3/4 tasks" → "4/4 tasks" (100%)
16. Snackbar shows "Task marked as Done"

**Alternative - Task Reversal:**
1. User realizes task wasn't fully complete
2. Clicks the Done status button
3. Status cycles back to "To Do"
4. Task moves back to Scheduled section
5. Style returns to normal appearance

**Screenshot needed:** "Task Completion Journey - Step 1 Todo"
- Task card showing:
  - Time: "10:00"
  - Status: "⭕ To Do"
  - Title: "Complete quarterly report analysis"
  - Full styling and normal opacity

**Screenshot needed:** "Task Completion Journey - Step 2 In Progress"
- Same task after first status click:
  - Status indicator: "🔄 In Progress"
  - Potential highlight or active styling
  - Still in Scheduled section
  - Progress bar updated

**Screenshot needed:** "Task Completion Journey - Step 3 Done"
- Task card after second status click:
  - Status indicator: "✅ Done"
  - Text grayed out or with strikethrough
  - Lower opacity styling
  - Moved to Done section at bottom of planner
  - Progress bar: "4/4 tasks" (100%)

**Background process:**
- First status click triggers: Todo → InProgress
  - `updateData.status = 'InProgress'`
  - Optimistic update: task appears in InProgress state immediately
  - API PUT request: `/api/planner/{taskId}` with `status: 'InProgress'`
  - Task stays in current section (Scheduled)
  - Task history: TaskEvent created with action "statusChanged"
- Second status click triggers: InProgress → Done
  - `updateData.status = 'Done'`
  - `updateData.completedAt = new Date().toISOString()`
  - Optimistic update: task appears done with grayed styling
  - API PUT request: `/api/planner/{taskId}` with `status: 'Done'` and timestamp
  - Component detects status is Done, moves task to Done section
  - Task no longer appears in To Do or In Progress sections
  - Task history updated with completion event
  - Completion percentage recalculated: (4 / 4) * 100 = 100%
- Third status click (if user reverts): Done → Todo
  - `updateData.status = 'Todo'`
  - `completedAt` may be cleared or kept for historical record
  - Task returns to its original section (Scheduled) with original time
  - Task styling returns to normal appearance
  - Completion percentage recalculated: (3 / 4) * 75%
- Each status change triggers snackbar notification
- If any API error occurs, status reverts to previous state

---

## SCENARIO 15: Empty State Handling

**Components used:**
- Planner Main Component
- Empty State Container
- Action Buttons

**Step-by-step process:**
1. User is on the Planner page with no tasks created for today
2. Instead of empty Lists, an empty state card is displayed
3. Card contains:
   - Large emoji icon: "✨"
   - Main message: "Your day is clear"
   - Subtitle: "Start planning your day with AI or create tasks manually"
4. Two prominent action buttons are displayed:
   - **"Plan with AI"** button with AI icon (primary action)
   - **"Add Task"** button with plus icon (secondary action)
5. User chooses to use AI assistance
6. Clicks **"Plan with AI"** button
7. Chat Planner modal opens (same as Scenario 2)
8. User completes the AI planning flow
9. Modal closes and first task appears
10. Empty state disappears
11. Planner now shows tasks in appropriate sections

**Alternative - Manual task creation:**
1. User is in empty state
2. Clicks **"Add Task"** button
3. Task Modal opens (empty form)
4. User fills in task details and saves
5. Empty state replaced with new task displayed
6. Task appears in appropriate section (Scheduled or Anytime)

**Screenshot needed:** "Empty State - No Tasks"
- Full planner view showing:
  - Header with date navigation
  - Empty state container centered in main area
  - Large emoji: "✨"
  - Heading: "Your day is clear"
  - Subtitle text: "Start planning your day with AI or create tasks manually"
  - Two action buttons prominently displayed:
    - "Plan with AI" (primary/accent color)
    - "Add Task" (secondary/outlined style)
  - No task sections visible

**Background process:**
- Component checks task array length: `this.tasks().length === 0`
- If zero tasks, conditional template displays: `*ngIf="tasks().length === 0"`
- Empty state UI replaces the entire task list section
- Empty state buttons call the same functions as header buttons:
  - "Plan with AI" calls `openChatPlanner()`
  - "Add Task" calls `openTaskModal()`
- After AI planning or manual task creation, tasks array is populated
- Component re-renders and empty state is replaced with task sections
- Filtered view can also show empty state if no tasks match all active filters
- Loading spinner is shown while tasks are being fetched (before empty state)

---

## SCENARIO 16: Task Duration and Time Allocation

**Components used:**
- Planner Main Component
- Task Form (Duration field)
- Task Service
- Duration Display

**Step-by-step process:**
1. User creates a new task: "Design database schema"
2. Opens Task Modal
3. Fills in task details:
   - Title: "Design database schema"
   - Category: "Work"
   - Priority: "High"
   - Start Time: "09:00"
   - **Duration**: "120" (minutes)
4. Saves the task
5. Task appears in Scheduled section with:
   - Time badge: "09:00"
   - Duration badge: "⏱ 120min"
6. User views the same task in different views:
   - **List View**: Sees "⏱ 120min" badge below metadata
   - **Kanban View**: Sees "120min" in task card
   - **Agenda View**: Shows task occupies 120 minutes in timeline (potentially spanning multiple hour slots visually)
7. User can edit task to change duration
8. Opens Edit Modal for the task
9. Modifies Duration field from 120 to 90
10. Saves the change
11. Duration badge updates: "⏱ 120min" → "⏱ 90min"
12. In Agenda view, timeline representation adjusts accordingly

**Screenshot needed:** "Task Creation Form - Duration Field"
- Task Modal showing:
  - Duration field with number input
  - Placeholder or label: "Duration (minutes)"
  - Value entered: "120"
  - Spinner controls (+ and - buttons)
  - Example shown in minutes unit

**Screenshot needed:** "Task Card - Duration Display"
- Task card in List View showing:
  - Title: "Design database schema"
  - Time: "09:00"
  - All metadata badges including:
    - Category: "Work"
    - Priority: "🔴 High"
    - Duration: "⏱ 120min"
  - Shows task has 2 hours allocated

**Screenshot needed:** "Agenda View - Long Duration Task"
- Task displayed in Agenda timeline:
  - Starts at 09:00
  - Occupies space spanning 2 hours (9:00 AM to 11:00 AM visually)
  - Task card shows "⏱ 120min" badge
  - Card height or layout reflects duration (if visual timeline is used)

**Background process:**
- Task form includes Duration field (optional)
- Duration is stored as integer representing minutes
- When task is created/edited, duration is included in payload
- API accepts `duration: 120` (minutes)
- Backend validates duration is positive integer
- Duration is displayed in UI as "⏱ {duration}min" format
- In Agenda view, duration could be used to:
  - Calculate visual height of task card (if timeline is proportional)
  - Show end time: `startTime + duration minutes`
  - Display availability windows for scheduling
- Duration helps with:
  - Time blocking on calendar
  - Identifying available time slots for new tasks
  - Understanding workload for the day
- Duration does not affect task priority, status, or category
- Optional field: tasks without duration are still valid

---

## SCENARIO 17: Fixed vs. Flexible Task Types

**Components used:**
- Planner Main Component
- Task Form (isFixedTime checkbox)
- AI Chat Planner (for task classification)
- Task Service

**Step-by-step process:**
1. User is creating a task that has a specific time requirement
2. Opens Task Modal
3. Enters: Title "Morning Interview with Client"
4. Sets Start Time to "10:00"
5. Checks the **"Fixed Time"** checkbox
6. Badge appears: "📌 FIXED TIME"
7. Tooltip explains: "AI cannot reschedule this task"
8. Saves the task
9. Task appears in Scheduled section with "📌 FIXED TIME" badge
10. Later, user creates another task: "Project Research"
11. Sets Start Time "14:00" but leaves **"Fixed Time"** unchecked
12. Badge shows: "⏰ FLEXIBLE"
13. Tooltip explains: "AI can reschedule this task"
14. Saves the task
15. Both tasks appear in Scheduled section, but with different badges
16. User uses Chat Planner to generate tasks
17. AI classifies generated tasks based on description:
    - "Morning meeting at 9am" → Marked as Fixed Time
    - "Work on report sometime afternoon" → Marked as Flexible
18. User accepts suggestions with AI-assigned classifications

**Screenshot needed:** "Task Form - Fixed Time Checkbox"
- Task Modal showing:
  - Checkbox labeled "Fixed Time" (unchecked initially)
  - OR checkbox labeled "Mark as fixed time - AI cannot reschedule"
  - Checkbox next to other form fields
  - Optional description or tooltip

**Screenshot needed:** "Fixed Time Task Card"
- Task in List View showing:
  - Badge: "📌 FIXED TIME"
  - Tooltip on hover: "AI cannot reschedule this task"
  - Task: "Morning Interview with Client"
  - Time: "10:00"
  - Category, Priority, Duration metadata

**Screenshot needed:** "Flexible Task Card"
- Different task in List View showing:
  - Badge: "⏰ FLEXIBLE"
  - Tooltip on hover: "AI can reschedule this task"
  - Task: "Project Research"
  - Time: "14:00"
  - Similar metadata layout

**Screenshot needed:** "AI Generated Tasks - Mixed Fixed and Flexible"
- Chat Planner suggestion view showing:
  - Task 1: "Morning Meeting" with "📌 FIXED TIME" badge
  - Task 2: "Report Writing" with "⏰ FLEXIBLE" badge
  - Shows AI's classification in suggestions

**Background process:**
- Task form includes `isFixedTime` boolean field (checkbox)
- Defaults to `false` (flexible)
- When user toggles checkbox: `isFixedTime` updates
- In task creation payload: `{ isFixedTime: true/false }`
- API stores this flag in task record
- Component checks flag when displaying task badges
- Badge conditional: `*ngIf="task.isFixedTime"` shows "📌 FIXED TIME"
- Badge conditional: `*ngIf="!task.isFixedTime"` shows "⏰ FLEXIBLE"
- Fixed time tasks are flagged in backend for AI planning module:
  - AI rescheduling algorithm respects this flag
  - When AI generates new plan, fixed tasks don't get moved
  - Flexible tasks can be rescheduled around fixed tasks
- In Chat Planner, AI generates task suggestions with `isFixedTime` classification:
  - Specific times (e.g., "9am meeting") → isFixedTime: true
  - Flexible descriptions (e.g., "sometime afternoon") → isFixedTime: false
- Component displays both types in unified list view
- Filter doesn't distinguish between fixed/flexible (both shown together)
- Both types behave identically in UI; only backend planning respects the flag

---

## SCENARIO 18: Error Handling and Recovery

**Components used:**
- Planner Main Component
- Task Service
- Angular Material Snackbar
- Error Banner

**Step-by-step process:**
1. User is working in the planner when network connectivity drops
2. User clicks "Add Task" to create a new task
3. Task Modal opens normally (offline doesn't affect UI)
4. User fills in task details and clicks Save
5. Task Service attempts POST request to `/api/planner`
6. Network error occurs (no server response)
7. Error callback is triggered
8. Snackbar displays red error message: "Failed to save task"
9. Modal remains open with user's data still in form
10. User can:
    - Fix the data and try again
    - Cancel and discard the form
11. Or, user can navigate back to main planner view
12. Error banner appears at top of planner: "Failed to load tasks"
13. Error shows alongside X button to dismiss
14. User can click "X" to dismiss banner
15. Or wait for auto-retry logic (if implemented)

**Alternative - Task update fails:**
1. User edits existing task and clicks Save
2. API error occurs during update
3. Snackbar shows: "Failed to update task"
4. Task reverts to previous state in UI (optimistic update rollback)
5. Modal can be closed and retried

**Alternative - Task deletion fails:**
1. User clicks Delete on a task
2. Confirmation dialog appears
3. User confirms deletion
4. API error occurs during delete
5. Snackbar shows: "Failed to delete task"
6. Task remains on screen (deletion didn't complete)
7. User can retry deletion

**Screenshot needed:** "Error Snackbar - Failed Save"
- Snackbar notification at bottom of screen:
  - Background color: Red or error color
  - Icon: Error symbol (!)
  - Message: "Failed to save task"
  - Duration: Visible for ~5 seconds

**Screenshot needed:** "Error Banner - Failed to Load"
- Error banner at top of planner content:
  - Red/error background color
  - Icon: "error_outline" 
  - Message: "Failed to load tasks"
  - Close button (X) on the right
  - Clear, prominent display

**Screenshot needed:** "Task Modal with Error Message"
- Modal showing:
  - User's form data still filled in
  - Error message below or in form field
  - Unable to clear/recover from error state
  - Buttons enabled for retry/cancel

**Background process:**
- All API calls to Task Service include error handlers
- `subscribe()` includes error callback
- Error callback checks error type:
  - Validation errors: Display specific field error
  - API errors (500, 404, etc.): Display generic "Failed to..." message
  - Network errors: Display network-specific message
- For create/update operations:
  - Optimistic update is applied immediately
  - If error occurs, optimistic update is reverted
  - Previous state is restored
- For delete operations:
  - Task remains until confirmed deleted by API
  - No optimistic delete to avoid accidental loss
- Error messages are displayed via `MatSnackBar`:
  - `this.snackBar.open(message, 'Close', { duration: 5000, panelClass: ['error-snackbar'] })`
  - Panel class applies error styling
- Load errors display error banner component
- Console logs error details for debugging (`console.error()`)
- User can:
  - Retry operation (retry logic not shown but possible)
  - Cancel and try again later
  - Contact support if error persists

---

## SCENARIO 19: Session Persistence and Page Reload

**Components used:**
- Planner Main Component
- Session Storage
- Angular Signals

**Step-by-step process:**
1. User navigates to Planner page
2. Switches view to "Kanban Board"
3. Selects "Work" category filter
4. Selects "High" priority filter
5. User navigates away to another page (e.g., Habits)
6. User returns to Planner page
7. View mode still showing "Kanban Board" (not reset to List)
8. Category filter still active: "Work"
9. Priority filter still active: "High"
10. Task list shows filtered results from saved filters
11. User refreshes browser page (F5 or Ctrl+R)
12. Page reloads and component reinitializes
13. Previous view mode "Kanban" is restored from session storage
14. Previous filters "Work" + "High" are restored
15. User sees same view as before refresh

**Alternative - New session/Incognito window:**
1. User opens new incognito/private window
2. Navigates to Planner page
3. View defaults to "List View" (no previous session data)
4. No category filter selected
5. No priority filter selected
6. All tasks displayed (no filters)

**Screenshot needed:** "Session State Restored - View Mode"
- Planner showing Kanban board after navigation
- View mode selector showing active state: "Kanban Board"
- Proof that view was restored from session

**Screenshot needed:** "Session State Restored - Filters"
- Planner showing filtered results
- Category filter "Work" highlighted/active
- Priority filter "High" highlighted/active
- Task count showing "2/5 tasks (filtered)"
- Statistics clearly showing filters active

**Background process:**
- Component uses `sessionStorage` to persist user preferences
- Session storage is cleared when user closes browser tab/window
- On component initialization (`ngOnInit`):
  - Retrieve saved view mode: `sessionStorage.getItem('plannerViewMode')`
  - If found, set `viewMode.set(savedViewMode)`
  - Retrieve saved category filter: `sessionStorage.getItem('plannerCategoryFilter')`
  - Retrieve saved priority filter: `sessionStorage.getItem('plannerPriorityFilter')`
  - If found, parse and set signal values
- When user changes view mode:
  - `sessionStorage.setItem('plannerViewMode', mode)`
- When user applies category filter:
  - `sessionStorage.setItem('plannerCategoryFilter', category)`
- When user applies priority filter:
  - `sessionStorage.setItem('plannerPriorityFilter', priority.toString())`
- Session storage persists across:
  - Page navigation within app (routing)
  - Page refresh (F5)
  - Tab switch if using same window
- Session storage is cleared when:
  - User closes browser tab/window
  - User clears browser data
  - Session expires (browser-dependent)
- Search term is NOT persisted (resets on navigation)
- Task data (list of tasks) is NOT persisted; always fetched fresh from API

---

## SCENARIO 20: Loading States and Spinner

**Components used:**
- Planner Main Component
- Task Service
- Angular Material Progress Bar
- Loading Indicator

**Step-by-step process:**
1. User navigates to Planner page
2. Component `ngOnInit()` triggers
3. `loadPlannerData()` is called
4. Progress bar spinner appears at top of planner
5. Spinner is indeterminate (animated horizontal line)
6. Task list area may show placeholder or becomes disabled
7. Snackbar may display (depending on implementation)
8. After ~1-3 seconds, API returns task list
9. Spinner disappears
10. Task list populates with returned data
11. User clicks "Next Day" button
12. Navigation clears previous tasks
13. Spinner appears again
14. New date's tasks load from API
15. Spinner disappears when new tasks arrive
16. If user rapidly clicks navigation buttons:
    - Only the most recent request is processed
    - Previous requests may be cancelled
    - Spinner remains until latest request completes

**Screenshot needed:** "Loading State - Progress Bar"
- Planner page showing:
  - Header with date and buttons
  - Indeterminate progress bar at top of content area
  - Animated horizontal line moving back and forth
  - Task list area below (maybe empty or placeholder)

**Screenshot needed:** "Loading Complete - Tasks Populated"
- Same view after loading completes:
  - Progress bar gone
  - Task list populated with tasks
  - All sections visible with task data

**Background process:**
- Component initializes `isLoading` signal as `false`
- `loadPlannerData()` method:
  - Sets `isLoading.set(true)`
  - Calls `loadDailyTasks(dateStr)`
- `loadDailyTasks()` calls `plannerService.getTasksForDay()`
- Service makes HTTP GET request to `/api/planner/day?date={date}`
- While request is pending:
  - `isLoading` signal is `true`
  - Template shows: `*ngIf="isLoading()"` progress bar
- When response arrives (subscribe next):
  - Tasks are normalized and set to signal
  - `isLoading.set(false)`
  - Progress bar is removed from DOM
- If error occurs:
  - `isLoading.set(false)`
  - Error banner displayed instead of spinner
  - Task list remains empty or shows empty state
- Navigation changes (previous/next/today):
  - Update `currentDate` signal
  - Call `loadPlannerData()` again
  - Triggers spinner again
- Loading state prevents:
  - API race conditions (new request waits for previous response)
  - UI jank from rapid successive updates
  - User confusion about data freshness

---

## Summary of Core Planner Functionalities

| # | Functionality | Main Components | Key Actions |
|---|---|---|---|
| 1 | Create Single Task | Task Modal, Form | Fill form → Save → Task created |
| 2 | Create Multiple Tasks (AI) | Chat Planner Modal, AI Service | Describe day → Generate → Select → Add |
| 3 | Edit Task | Task Modal (edit mode), Form | Click Edit → Modify fields → Save |
| 4 | Mark Complete | Task Status Button | Click status button → Cycle through statuses |
| 5 | Delete Task | Delete Button, Confirmation | Click Delete → Confirm → Task removed |
| 6 | View - List | List View Template | Default view, sorted by time/flexible |
| 7 | View - Kanban | Kanban Board Template | Three columns (To Do, In Progress, Done) |
| 8 | View - Agenda | Agenda Timeline Template | Hourly timeline (8am-11pm) + flexible sidebar |
| 9 | Filter by Category | Category Buttons, Filter Logic | Click category → Filter applied |
| 10 | Filter by Priority | Priority Buttons, Filter Logic | Click priority → Filter applied |
| 11 | Search | Search Input, Filter Logic | Type → Live filter on title/description |
| 12 | Navigate Days | Navigation Buttons | Click prev/next/today → Load new day |
| 13 | Toggle Filters | Toggle Button | Click toggle → Filters expand/collapse |
| 14 | Task Completion | Status Workflow | Todo → InProgress → Done → Todo cycle |
| 15 | Empty State | Empty State UI | Show when no tasks; provide quick actions |
| 16 | Duration | Duration Field, Display | Set in minutes, show in UI |
| 17 | Fixed vs Flexible | isFixedTime Flag, Badges | Mark for AI scheduling flexibility |
| 18 | Error Handling | Error Banner, Snackbar | Show errors, allow recovery |
| 19 | Session Persistence | Session Storage | Remember view mode, filters across pages |
| 20 | Loading States | Progress Bar, Loading Signal | Show spinner during data fetch |

---

## Key Screenshots Checklist

Essential screenshots for complete documentation:

### Core Task Operations
- [ ] Empty Planner State
- [ ] Task Creation Modal (Empty)
- [ ] Task Creation Modal (Filled)
- [ ] Task Edit Modal
- [ ] Task Deletion Confirmation

### View Modes
- [ ] List View - Full Layout
- [ ] List View - Scheduled Task Card
- [ ] List View - Anytime Task Card
- [ ] Kanban View - Full Board
- [ ] Kanban Board - To Do Column
- [ ] Kanban Board - In Progress Column
- [ ] Kanban Board - Done Column
- [ ] Agenda View - Full Timeline
- [ ] Agenda View - Hour Slot with Tasks
- [ ] Agenda View - Empty Hour Slot
- [ ] Agenda View - Flexible Tasks Sidebar

### Filtering & Search
- [ ] Filters Section - Expanded
- [ ] Filters Section - Collapsed
- [ ] Category Filter - Active
- [ ] Priority Filter - Active
- [ ] Multiple Filters Active
- [ ] Search Field - Active Search
- [ ] Search Results

### Status & Completion
- [ ] Task Status - To Do Icon
- [ ] Task Status - In Progress Icon
- [ ] Task Status - Done Icon
- [ ] Progress Bar - Full
- [ ] Progress Bar - Partial

### AI Planning
- [ ] Chat Planner Modal - Empty
- [ ] Chat Planner Modal - User Input
- [ ] Chat Planner Modal - Loading
- [ ] Chat Planner Modal - Suggestions
- [ ] Chat Planner - Recommended Tasks

### Navigation & State
- [ ] Date Navigation - Today
- [ ] Date Navigation - Previous Day
- [ ] Date Navigation - Future Date
- [ ] Loading Spinner
- [ ] Error Banner
- [ ] Error Snackbar

### Advanced Features
- [ ] Fixed Time Badge
- [ ] Flexible Time Badge
- [ ] Duration Display
- [ ] View Mode Selector
- [ ] Statistics Bar

---

## End of Document

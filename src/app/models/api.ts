// src/app/models/api.ts

// ===========================
// TASK STATUS ENUM & HELPERS
// ===========================

export enum TaskStatus {
  Todo = 0,
  InProgress = 1,
  Done = 2
}

/**
 * Convert backend string status to frontend enum
 */
export function stringToTaskStatus(status: string | TaskStatus): TaskStatus {
  if (typeof status === 'number') {
    return status;
  }
  
  switch (status?.toLowerCase()) {
    case 'todo':
      return TaskStatus.Todo;
    case 'inprogress':
      return TaskStatus.InProgress;
    case 'done':
    case 'completed':
      return TaskStatus.Done;
    default:
      return TaskStatus.Todo;
  }
}

/**
 * Convert frontend enum to backend string
 */
export function taskStatusToString(status: TaskStatus | number | string): string {
  // Handle string input
  if (typeof status === 'string') {
    const lower = status.toLowerCase();
    if (lower === 'inprogress' || lower === 'in progress') return 'InProgress';
    if (lower === 'done') return 'Done';
    return status; // Return as-is if already a valid string
  }
  
  // Handle enum/number input
  switch (status) {
    case TaskStatus.Todo:
      return 'Todo';
    case TaskStatus.InProgress:
      return 'InProgress';
    case TaskStatus.Done:
      return 'Done';
    default:
      return 'Todo';
  }
}

// ===========================
// PLANNER TASK MODELS
// ===========================

export interface PlannerTask {
  id: string;
  title: string;
  description?: string;
  startDate?: string;           // ISO date string: "2026-02-18"
  endDate?: string;             // ISO date string
  startTime?: string;           // HH:mm format: "09:00"
  duration?: number;            // Minutes
  deadline?: string;            // ISO date string
  priority: number;             // 0-3 (0=low, 1=high, 2=medium, 3=urgent)
  status: string;               // "Todo" | "InProgress" | "Done"
  category: string;             // "work" | "personal" | "health" | "other"
  isFixedTime: boolean;         // ✅ NEW: Whether time can be rescheduled by AI
  completedAt?: string;         // ✅ NEW: ISO timestamp when marked Done
  createdAt: string;
  updatedAt: string;
}

export interface PlannerTaskCreateDto {
  title: string;
  description?: string;
  startDate?: string;           // ISO date: "2026-02-18"
  endDate?: string;
  startTime?: string;           // HH:mm: "14:30"
  duration?: number;            // Minutes
  deadline?: string;
  priority?: number;            // 0-3
  status?: TaskStatus | string;              // "Todo" | "InProgress" | "Done"
  category?: string;            // Default: "personal"
  isFixedTime?: boolean;        // ✅ NEW: Default: false
}

export interface PlannerTaskUpdateDto {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  duration?: number;
  deadline?: string;
  priority?: number;
  status?: TaskStatus | string;              // "Todo" | "InProgress" | "Done"
  category?: string;
  isFixedTime?: boolean;        // ✅ NEW
  completedAt?: string;         // ✅ NEW: Auto-set when status="Done"
}

// ===========================
// CHAT PLANNER MODELS
// ===========================

export interface ChatPlannerRequest {
  userInput: string;            // Natural language: "I need to clean the house..."
  date?: string;                // Optional: "2026-02-18" (defaults to today)
}

export interface SuggestedTask {
  title: string;
  description?: string;
  category: string;             // "work" | "personal" | "health" | "other"
  priority: number;             // 1=High, 2=Medium, 3=Low
  startTime?: string;           // "09:00"
  duration?: number;            // Minutes
  isFixedTime: boolean;         // Whether AI suggested fixed time
}

export interface ChatPlannerResponse {
  summary: string;              // "You have 4 tasks planned..."
  suggestedTasks: SuggestedTask[];
  recommendations?: string;     // "Consider adding breaks..."
  generatedAt: string;          // ISO timestamp
}

// ===========================
// DAILY VIEW RESPONSE
// ===========================

export interface DailyTasksResponse {
  date: string;                 // "2026-02-18"
  tasks: PlannerTask[];
  taskCount: number;
  completedCount: number;
  message?: string;             // "No tasks for this day..."
}

// ===========================
// WEEKLY VIEW RESPONSE
// ===========================

export interface WeeklyTasksResponse {
  weekStart: string;            // "2026-02-17"
  weekEnd: string;              // "2026-02-23"
  tasksByDay: { [date: string]: PlannerTask[] };
  totalTasks: number;
  completedTasks: number;
  completionRate: number;       // Percentage
  message?: string;
}

// ===========================
// TASK STATISTICS
// ===========================

export interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  completionRate: number;       // Percentage
  tasksByCategory: { [category: string]: number };
  tasksByPriority: { [priority: string]: number };
}

// ===========================
// SETTINGS MODELS
// ===========================

export interface SettingsUpdateDto {
  id?: string;
  userId?: string;
  displayName?: string;
  weekStartsOn?: 'Monday' | 'Sunday';
  aiConsent?: boolean;
  modulesJson?: string;
  enableNotifications?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ===========================
// REMOVED ENTITIES
// ===========================
// ❌ DailyEntry - Removed (too complex)
// ❌ CallAndEmailItem - Removed
// ❌ LifeBalanceItem - Removed
// ❌ TaskHistoryEvent - Removed (simplified to CompletedAt)
// ❌ WeeklyInspiration - Not in backend
// ❌ MonthlyEntry - Not implemented yet
// ❌ MonthlyGoal - Not implemented yet
// ❌ MonthlyReflection - Not implemented yet

// ===========================
// HELPER FUNCTIONS
// ===========================

/**
 * Convert PlannerTask from API to display format
 */
export function mapTaskFromApi(task: any): PlannerTask {
  return {
    ...task,
    status: task.status || 'Todo', // Keep as string
  };
}

/**
 * Convert CreateTaskDto for API submission
 */
export function mapTaskForApi(task: PlannerTaskCreateDto): any {
  return {
    ...task,
    status: typeof task.status === 'number' 
      ? taskStatusToString(task.status) 
      : task.status || 'Todo',
    isFixedTime: task.isFixedTime ?? false,
  };
}

/**
 * Convert UpdateTaskDto for API submission
 */
export function mapTaskUpdateForApi(task: PlannerTaskUpdateDto): any {
  const payload: any = {};
  
  if (task.title !== undefined) payload.title = task.title;
  if (task.description !== undefined) payload.description = task.description;
  if (task.startDate !== undefined) payload.startDate = task.startDate;
  if (task.endDate !== undefined) payload.endDate = task.endDate;
  if (task.startTime !== undefined) payload.startTime = task.startTime;
  if (task.duration !== undefined) payload.duration = task.duration;
  if (task.deadline !== undefined) payload.deadline = task.deadline;
  if (task.priority !== undefined) payload.priority = task.priority;
  if (task.category !== undefined) payload.category = task.category;
  if (task.isFixedTime !== undefined) payload.isFixedTime = task.isFixedTime;
  
  // Convert status to string
  if (task.status !== undefined) {
    payload.status = typeof task.status === 'number' 
      ? taskStatusToString(task.status as TaskStatus)
      : task.status;
  }
  
  // Don't manually set completedAt - backend handles it
  
  return payload;
}
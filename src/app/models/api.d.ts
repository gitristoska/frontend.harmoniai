// src/app/models/api.ts
export enum TaskStatus {
  NotStarted = 0,
  InProgress = 1,
  Completed = 2,
  OnHold = 3,
  Cancelled = 4
}

export interface PlannerTask {
  id?: string | number;
  title: string;
  description?: string;
  startDate?: string;        // ISO string
  endDate?: string;          // ISO string
  priority: number;          // 0 = low, 1 = medium, 2 = high
  status: TaskStatus;        // Task status
  category?: string;
  isDone?: boolean;
  createdAt?: string;
  updatedAt?: string;
  accountId?: string;
  dayPlanId?: string | null;
  dayPlan?: any;
}

export interface PlannerTaskCreateDto {
  title?: string;
  description?: string;
  startDate?: string;        // ISO string
  endDate?: string;          // ISO string
  priority?: number;         // 0 = low, 1 = medium, 2 = high
  status?: TaskStatus;       // Task status
  category?: string;
}

export interface PlannerTaskUpdateDto {
  title?: string;
  description?: string;
  startDate?: string;        // ISO string
  endDate?: string;          // ISO string
  priority?: number;         // 0 = low, 1 = medium, 2 = high
  status?: TaskStatus;       // Task status
  category?: string;
}

export interface SettingsUpdateDto {
  id?: string;
  userId?: string;
  displayName?: string;
  weekStartsOn?: 'Monday' | 'Sunday';
  aiConsent?: boolean;
  modulesJson?: string; // JSON string like '{"planner": true, "journal": true, "habits": true}'
  enableNotifications?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
export interface CallAndEmailItem {
  id?: string;
  text?: string;
  isDone: boolean;
}

export interface LifeBalanceItem {
  id?: string;
  category?: string;
  text?: string;
  isDone: boolean;
}

export interface Rating {
  productivity: number; // 1-5
  mood: number;         // 1-5
  health: number;       // 1-5
}

export interface DailyEntry {
  id: string;
  date: string;
  gratefulFor?: string;
  inspirationOrMotivation?: string;
  personalNotes?: string;
  notesForTomorrow?: string;
  lifeBalanceToDoList?: LifeBalanceItem[];
  callsAndEmailsChecklist?: CallAndEmailItem[];
  rating: Rating;
}

export interface DailyEntryCreateDto {
  date: string;
  gratefulFor?: string;
  inspirationOrMotivation?: string;
  personalNotes?: string;
  notesForTomorrow?: string;
  lifeBalanceToDoList?: LifeBalanceItem[];
  callsAndEmailsChecklist?: CallAndEmailItem[];
  rating: Rating;
}

export interface DailyEntryUpdateDto {
  gratefulFor?: string;
  inspirationOrMotivation?: string;
  personalNotes?: string;
  notesForTomorrow?: string;
  lifeBalanceToDoList?: LifeBalanceItem[];
  callsAndEmailsChecklist?: CallAndEmailItem[];
  rating?: Rating;
}

export interface WeeklyInspiration {
  id?: string;
  weekStartDate: string;          // ISO date of Monday of that week
  weekEndDate: string;            // ISO date of Sunday of that week
  inspiration: string;            // The motivational text for the week
  createdAt?: string;
  updatedAt?: string;
  accountId?: string;
}

export interface WeeklyInspirationCreateDto {
  inspiration: string;
}

// Monthly Planning Models
/**
 * MonthlyEntry: Container for all monthly planning data
 * Includes focus, goals, and optional reflection
 */
export interface MonthlyEntry {
  id: string;
  month: string;                  // Format: YYYY-MM (e.g., "2025-01")
  userId: string;
  intentions: string;             // Focus intentions
  moodWords: string;              // Mood or vibe words
  notes: string;                  // General notes
  goals: MonthlyGoal[];           // 0-3 goals
  reflection?: MonthlyReflection;  // Optional reflection
  createdAt?: string;
  updatedAt?: string;
}

/**
 * MonthlyGoal: Individual goal within a monthly entry
 */
export interface MonthlyGoal {
  id: string;
  entryId: string;
  title: string;
  description: string;
  progress: number;               // 0-100
  order: number;                  // Sort order (0, 1, 2, etc.)
  taskLinks: { taskId: string; taskTitle: string }[];  // Linked tasks
  createdAt?: string;
  updatedAt?: string;
}

/**
 * MonthlyReflection: Monthly reflection and learnings
 */
export interface MonthlyReflection {
  id: string;
  entryId: string;
  rating: number;                 // 1-10
  wins: string;                   // Multiline text
  challenges: string;             // Multiline text
  lessons: string;                // Multiline text
  nextMonthFocus: string;         // Focus for next month
  createdAt?: string;
  updatedAt?: string;
}

/**
 * DTOs for creating/updating monthly planning data
 */
export interface MonthlyEntryCreateDto {
  month: string;                  // Format: YYYY-MM
  intentions: string;
  moodWords: string;
  notes: string;
}

export interface MonthlyGoalCreateDto {
  title: string;
  description: string;
  order: number;
}

export interface MonthlyGoalUpdateDto {
  title?: string;
  description?: string;
  progress?: number;
  order?: number;
}

export interface MonthlyReflectionDto {
  rating: number;                 // 1-10
  wins: string;
  challenges: string;
  lessons: string;
  nextMonthFocus: string;
}
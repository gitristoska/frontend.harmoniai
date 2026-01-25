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
  defaultPlanner?: string | null;
  modulesJson?: string | null;
  enableNotifications?: boolean | null;
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

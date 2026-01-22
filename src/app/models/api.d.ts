// src/app/models/api.ts
export interface PlannerTask {
  id?: string | number;
  title: string;
  description?: string;
  scheduledAt: string;       // ISO string: YYYY-MM-DDTHH:MM:SSZ
  priority: number;          // 0 = low, 1 = medium, 2 = high
  category?: string;
  isDone?: boolean;
  createdAt?: string;
  updatedAt?: string;
  accountId?: string;
  dayPlanId?: string | null;
  dayPlan?: any;
}

export interface PlannerTaskCreateDto {
  title: string;
  description: string;
  scheduledAt: string;       // ISO string
  priority: number;          // 0 = low, 1 = medium, 2 = high
  category: string;
}

export interface PlannerTaskUpdateDto {
  title?: string;
  description?: string;
  scheduledAt?: string;      // ISO string
  priority?: number;         // 0 = low, 1 = medium, 2 = high
  category?: string;
  isDone?: boolean;
}

export interface SettingsUpdateDto {
  defaultPlanner?: string | null;
  modulesJson?: string | null;
  enableNotifications?: boolean | null;
}

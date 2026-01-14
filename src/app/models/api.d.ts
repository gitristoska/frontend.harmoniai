export interface PlannerTask {
  id?: string | number;
  title: string;
  time?: string;
  date?: string;
  priority: number; // 0 = low, 1 = medium, 2 = high
  isDone?: boolean;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
  accountId?: string;
  dayPlanId?: string | null;
  dayPlan?: any;
}
export interface PlannerTaskResponse {
  plannerTasks: PlannerTask[];
}
export interface PlannerTaskCreateDto {
  title: string;
  time: string;// in format HH:MM
  date: string;// in format YYYY-MM-DD
  priority: number; // 0 = low, 1 = medium, 2 = high
  done: boolean;
  category: string;
}

export interface PlannerTaskUpdateDto {
  title?: string;
  time?: string;
  priority?: 'low' | 'medium' | 'high';
  done?: boolean;
  category?: string;
}


export interface SettingsUpdateDto {
  defaultPlanner?: string | null;
  modulesJson?: string | null;
  enableNotifications?: boolean | null;
}
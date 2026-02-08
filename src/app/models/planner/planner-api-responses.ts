import {
  DailyPlannerReflection,
  UpdateDailyReflectionDto
} from './daily-planner-reflection.model';
import { CallAndEmailItem, CallAndEmailItemResponse } from './call-email-item.model';
import { PlannerTask } from './planner-task.model';

// ==================== REFLECTION ENDPOINTS ====================
export interface GetDailyReflectionResponse extends DailyPlannerReflection {}

export interface SaveDailyReflectionRequest extends UpdateDailyReflectionDto {}
export interface SaveDailyReflectionResponse extends DailyPlannerReflection {}

// ==================== CALL/EMAIL ENDPOINTS ====================
export interface AddCallOrEmailRequest extends CallAndEmailItem {}
export interface AddCallOrEmailResponse extends CallAndEmailItemResponse {}

export interface UpdateCallOrEmailRequest extends CallAndEmailItem {}
export interface UpdateCallOrEmailResponse extends CallAndEmailItemResponse {}

// ==================== TASK ENDPOINTS ====================
export interface GetDailyTasksResponse {
  date: Date;
  tasks: PlannerTask[];
  taskCount: number;
  completedCount: number;
  message?: string;
}

export interface GetWeeklyTasksResponse {
  weekStart: Date;
  weekEnd: Date;
  tasksByDay: { [key: string]: PlannerTask[] };
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  message?: string;
}

import { TaskStatus, TaskPriority, TaskAction } from './planner-enums';

// ==================== TASK EVENT ====================
export interface TaskEvent {
  id: string; // UUID
  action: TaskAction;
  description: string;
  timestamp: Date;
}

// ==================== PLANNER TASK ====================
export interface PlannerTask {
  id: string; // UUID
  title: string;
  description?: string;
  category: string; // e.g., "Work", "Personal", "Health"
  priority: TaskPriority; // 1=High, 2=Medium, 3=Low
  status: TaskStatus; // 0=Todo, 1=InProgress, 2=Done
  startDate?: Date;
  endDate?: Date;
  startTime?: string; // HH:MM format
  duration?: number; // in minutes
  deadline?: Date;
  rescheduleCount: number;
  taskHistory: TaskEvent[];
  createdAt: Date;
  updatedAt: Date;
}

// ==================== CREATE/UPDATE DTOs ====================
export interface CreatePlannerTaskDto {
  title: string; // Required
  description?: string;
  category?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  startDate?: Date;
  endDate?: Date;
  startTime?: string;
  duration?: number;
  deadline?: Date;
}

export interface UpdatePlannerTaskDto {
  title?: string;
  description?: string;
  category?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  startDate?: Date;
  endDate?: Date;
  startTime?: string;
  duration?: number;
  deadline?: Date;
}

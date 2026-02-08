import { PlannerTask } from './planner-task.model';
import { CallAndEmailItemResponse } from './call-email-item.model';

// ==================== RATINGS ====================
export interface DailyRatings {
  productivityRating?: number; // 1-10
  moodRating?: number; // 1-10
  healthRating?: number; // 1-10
}

// ==================== DAILY REFLECTION ====================
export interface DailyPlannerReflection {
  // Metadata
  date: Date;
  createdAt: Date;
  updatedAt: Date;

  // ==================== TASKS ====================
  tasks: PlannerTask[];
  taskCount: number;
  completedTaskCount: number;
  taskCompletionRate: number; // 0-100%

  // ==================== CALLS & EMAILS ====================
  callsAndEmails: CallAndEmailItemResponse[];
  totalCallsAndEmails: number;
  completedCallsAndEmails: number;

  // ==================== DAILY RATINGS ====================
  productivityRating?: number; // 1-10
  moodRating?: number; // 1-10
  healthRating?: number; // 1-10

  // ==================== REFLECTION NOTES ====================
  gratefulFor?: string; // "What I'm grateful for"
  inspirationOrMotivation?: string; // "What inspired me"
  personalNotes?: string; // Free-form reflection
  notesForTomorrow?: string; // Tomorrow's focus
}

// ==================== UPDATE DTO ====================
export interface UpdateDailyReflectionDto {
  // Calls & Emails (can replace all)
  callsAndEmails?: CallAndEmailItemResponse[];

  // Ratings (optional, only update if provided)
  productivityRating?: number;
  moodRating?: number;
  healthRating?: number;

  // Reflection Notes (optional, only update if provided)
  gratefulFor?: string;
  inspirationOrMotivation?: string;
  personalNotes?: string;
  notesForTomorrow?: string;
}

// ==================== SUMMARY (for quick display) ====================
export interface DailyReflectionSummary {
  date: Date;
  taskCompletion: number; // %
  callsEmailsCompletion: number; // count
  moodRating: number; // 1-10
  hasReflection: boolean; // any notes filled
}

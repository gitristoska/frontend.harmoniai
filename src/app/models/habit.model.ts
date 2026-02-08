export interface Habit {
  id: string;
  name: string;
  weekStart: string; // ISO date string for the week start
  scheduledDays: boolean[]; // Which days (0-6) the habit is scheduled
  completionStatus: (boolean | null)[]; // Completion status per day (null = not scheduled)
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  aiSuggestions?: string; // AI suggestions for improving the habit
  aiSuggestionsGeneratedAt?: string; // When AI suggestions were generated
}

export interface HabitCreateDto {
  name: string;
  scheduledDays: boolean[];
  weekStart: string; // ISO date string (YYYY-MM-DD) for the week the habit is being created in
}

export interface HabitUpdateDto {
  name?: string;
  scheduledDays?: boolean[];
}

export interface HabitCompletionDto {
  dayOfWeek: number;
  completionStatus: boolean;
}

export interface WeeklyAiSuggestions {
  habitId: string;
  habitName: string;
  suggestion: string;
}

export interface WeeklyStats {
  weekStart: string;
  habitCount: number;
  totalScheduledDays: number;
  totalCompletedDays: number;
  completionRate: number; // Percentage (0-100)
}

export interface HabitHistoryWeek {
  weekStart: string;
  scheduledDays: number;
  completedDays: number;
  completionRate: number;
}

export interface HabitHistory {
  habitId: string;
  habitName: string;
  weeksTracked: number;
  totalCompleted: number;
  totalScheduled: number;
  overallCompletionRate: number;
  weeklyBreakdown: HabitHistoryWeek[];
}

export interface HabitsWithSuggestions {
  habits: Habit[];
  weeklyAiSuggestions: string; // Newline-separated suggestions ("1. ...\n2. ...\n3. ...")
  weeklySuggestionsGeneratedAt: string; // ISO timestamp when suggestions were generated
  weekStart: string;
}

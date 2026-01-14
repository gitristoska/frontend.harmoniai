// OpenAI Request/Response Models

export interface OpenAIRequest {
  message: string;
  context?: string; // Optional context (e.g., user preferences, current tasks)
  conversationHistory?: Message[]; // Previous messages in conversation
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface OpenAIResponse {
  response: string;
  suggestions?: string[]; // Optional suggestions for follow-up actions
  confidence?: number; // Confidence level of the response
}

export interface AIGenerateTaskRequest {
  description: string;
  context?: string;
}

export interface AIGenerateTaskResponse {
  title: string;
  description: string;
  priority?: number;
  estimatedTime?: number; // in minutes
}

export interface AIAnalyzeHabitRequest {
  habitName: string;
  recentData: HabitDataPoint[];
  timeFrame?: string; // e.g., "7days", "30days"
}

export interface HabitDataPoint {
  date: string;
  completed: boolean;
  notes?: string;
}

export interface AIAnalyzeHabitResponse {
  summary: string;
  insights: string[];
  suggestions: string[];
  trend: 'improving' | 'declining' | 'stable';
}

export interface AISuggestScheduleRequest {
  tasks: TaskForScheduling[];
  availableHours?: number;
  preferences?: string;
}

export interface TaskForScheduling {
  title: string;
  estimatedTime: number; // in minutes
  priority: number;
  category?: string;
}

export interface AISuggestScheduleResponse {
  schedule: ScheduledTask[];
  reasoning: string;
}

export interface ScheduledTask {
  title: string;
  suggestedTime: string; // HH:mm format
  duration: number; // in minutes
}

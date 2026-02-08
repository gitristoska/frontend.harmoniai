/**
 * Journal Entry API Models
 */

export interface JournalEntryCreateDto {
  date: string; // yyyy-MM-dd format
  text: string; // 10-10,000 characters
  enableAiAnalysis: boolean; // default: true
}

export interface JournalEntryUpdateDto {
  text?: string; // Optional, 10-10,000 characters if provided
  enableAiAnalysis?: boolean;
}

export interface JournalEntryResponseDto {
  id: string; // UUID
  date: string; // ISO datetime
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
  text: string;
  sentiment: string | null; // happy, sad, anxious, angry, hopeful, neutral, mixed
  aiAnalysis: string | null;
  emotionalPatterns: string | null; // comma-separated with counts, e.g., "anxiety_spike(5x),work_stress(4x)"
  suggestedActivities: string | null; // comma-separated, e.g., "exercise,meditation,rest"
  keyThemes: string | null; // comma-separated, e.g., "work,deadline,family"
  mentalHealthFlags: string | null; // comma-separated flags or null if none
  hasAiAnalysis: boolean;
}

export interface JournalEntryListDto {
  id: string; // UUID
  date: string; // ISO datetime
  createdAt: string; // ISO datetime
  textPreview: string; // First 200 characters
  sentiment: string | null;
  keyThemes: string | null;
  mentalHealthFlags: string | null;
  hasAiAnalysis: boolean;
}

export interface JournalDateRangeResponse {
  entries: JournalEntryListDto[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

// Mental Health Flags Enum
export enum MentalHealthFlag {
  BURNOUT_RISK = 'burnout_risk',
  ANXIETY_SPIKE = 'anxiety_spike',
  DEPRESSION_INDICATORS = 'depression_indicators',
  SLEEP_DEPRIVATION = 'sleep_deprivation',
  SOCIAL_ISOLATION = 'social_isolation',
  SUBSTANCE_USE = 'substance_use',
  SELF_HARM_THOUGHTS = 'self_harm_thoughts',
  EXTREME_MOOD_SWINGS = 'extreme_mood_swings',
  PERFECTIONISM_SPIRAL = 'perfectionism_spiral'
}

// Sentiment Types
export enum Sentiment {
  HAPPY = 'happy',
  SAD = 'sad',
  ANXIOUS = 'anxious',
  ANGRY = 'angry',
  HOPEFUL = 'hopeful',
  NEUTRAL = 'neutral',
  MIXED = 'mixed'
}

// Suggested Activities
export const SUGGESTED_ACTIVITIES = [
  'exercise',
  'meditation',
  'rest',
  'talk_to_friend',
  'walk_outside',
  'journaling',
  'creative_activity',
  'hobby',
  'social_time',
  'nature_time',
  'music',
  'breathing_exercise'
];

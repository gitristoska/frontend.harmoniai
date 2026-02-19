import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Metrics {
  totalTasks: number;
  completedTasks: number;
  totalHabits: number;
  completedHabitsToday: number;
  journalEntries: number;
}

export interface Insight {
  priority: number;
  title: string;
  description: string;
  category: string;
}

export interface QuickWin {
  title: string;
  description: string;
  icon: string;
}

export interface DailyInsights {
  metrics: Metrics;
  focusInsights: Insight[];
  energyInsights: Insight[];
  progressInsights: Insight[];
  patternInsights: Insight[];
  warningInsights: Insight[];
  quickWin: QuickWin;
}

// Daily Recommendations
export interface Recommendation {
  title: string;
  description: string;
  icon: string;
}

export interface DailyRecommendationsResponse {
  recommendations: Recommendation[];
  generatedAt: string;
}

// Daily & Weekly Reflections
export interface Reflection {
  id: string;
  date: string;
  type: 'daily' | 'weekly';
  summary: string;
  highlights: string;
  improvements: string;
  tomorrowAdvice: string;
  tasksCompleted: number;
  tasksTotal: number;
  habitsCompleted: number;
  habitsTotal: number;
  moodTrend: string;
  generatedAt: string;
}

export interface ReflectionResponse {
  exists: boolean;
  reflection?: Reflection;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AiInsightsService {
  private apiBaseUrl = 'https://localhost:44304/api/ai-insights';

  constructor(private http: HttpClient) {}

  getDailyInsights(): Observable<DailyInsights> {
    return this.http.get<DailyInsights>(`https://localhost:44304/api/v1/ai-insights/daily`);
  }

  // NEW ENDPOINTS

  /**
   * Get daily recommendations (live, not stored)
   */
  getDailyRecommendations(date?: string): Observable<DailyRecommendationsResponse> {
    const params = date ? `?date=${date}` : '';
    return this.http.get<DailyRecommendationsResponse>(
      `${this.apiBaseUrl}/recommendations/daily${params}`
    );
  }

  /**
   * Get daily reflection (stored in DB)
   */
  getDailyReflection(date?: string): Observable<ReflectionResponse> {
    const params = date ? `?date=${date}` : '';
    return this.http.get<ReflectionResponse>(
      `${this.apiBaseUrl}/reflections/daily${params}`
    );
  }

  /**
   * Generate/regenerate daily reflection (POST)
   */
  generateDailyReflection(date?: string): Observable<ReflectionResponse> {
    const params = date ? `?date=${date}` : '';
    return this.http.post<ReflectionResponse>(
      `${this.apiBaseUrl}/reflections/daily${params}`,
      {}
    );
  }

  /**
   * Get weekly reflection (stored in DB)
   */
  getWeeklyReflection(date?: string): Observable<ReflectionResponse> {
    const params = date ? `?date=${date}` : '';
    return this.http.get<ReflectionResponse>(
      `${this.apiBaseUrl}/reflections/weekly${params}`
    );
  }

  /**
   * Generate/regenerate weekly reflection (POST)
   */
  generateWeeklyReflection(date?: string): Observable<ReflectionResponse> {
    const params = date ? `?date=${date}` : '';
    return this.http.post<ReflectionResponse>(
      `${this.apiBaseUrl}/reflections/weekly${params}`,
      {}
    );
  }
}

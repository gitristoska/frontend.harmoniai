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

@Injectable({
  providedIn: 'root'
})
export class AiInsightsService {
  private apiBaseUrl = 'https://localhost:44304/api/v1/ai-insights';

  constructor(private http: HttpClient) {}

  getDailyInsights(): Observable<DailyInsights> {
    return this.http.get<DailyInsights>(`${this.apiBaseUrl}/daily`);
  }
}

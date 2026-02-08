import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  DailyEntry,
  DailyEntryCreateDto,
  DailyEntryUpdateDto,
  WellnessInsights,
  MoodTrends,
  BalanceAnalysis,
  WellnessWarnings
} from '../models/api';

@Injectable({ providedIn: 'root' })
export class DailyEntryService {
  private readonly baseApiUrl = 'https://localhost:44304/api/daily-entries';

  constructor(private http: HttpClient) {}

  // ============================
  // DAILY ENTRY CRUD
  // ============================

  getEntryForDate(date: string): Observable<DailyEntry> {
    return this.http.get<DailyEntry>(`${this.baseApiUrl}/date/${date}`);
  }

  getEntryById(id: string): Observable<DailyEntry> {
    return this.http.get<DailyEntry>(`${this.baseApiUrl}/${id}`);
  }

  getEntriesInRange(startDate: string, endDate: string): Observable<DailyEntry[]> {
    return this.http.get<DailyEntry[]>(`${this.baseApiUrl}/range`, {
      params: { startDate, endDate }
    });
  }

  createEntry(entry: DailyEntryCreateDto): Observable<DailyEntry> {
    return this.http.post<DailyEntry>(`${this.baseApiUrl}`, entry);
  }

  updateEntry(id: string, entry: DailyEntryUpdateDto): Observable<DailyEntry> {
    return this.http.put<DailyEntry>(`${this.baseApiUrl}/${id}`, entry);
  }

  deleteEntry(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseApiUrl}/${id}`);
  }

  // ============================
  // WELLNESS & AI INSIGHTS
  // ============================

  getWellnessInsights(): Observable<WellnessInsights> {
    return this.http.get<WellnessInsights>(`${this.baseApiUrl}/insights/wellness`);
  }

  getMoodTrends(daysBack: number = 30): Observable<MoodTrends> {
    return this.http.get<MoodTrends>(`${this.baseApiUrl}/insights/mood-trends`, {
      params: { daysBack: daysBack.toString() }
    });
  }

  getWorkLifeBalance(daysBack: number = 30): Observable<BalanceAnalysis> {
    return this.http.get<BalanceAnalysis>(`${this.baseApiUrl}/insights/balance`, {
      params: { daysBack: daysBack.toString() }
    });
  }

  checkWellnessWarnings(daysBack: number = 14): Observable<WellnessWarnings> {
    return this.http.get<WellnessWarnings>(`${this.baseApiUrl}/insights/wellness-warnings`, {
      params: { daysBack: daysBack.toString() }
    });
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DailyEntryService {
  private readonly baseApiUrl = 'https://localhost:44304/api/daily-entries';

  constructor(private http: HttpClient) {}

  // ============================
  // DAILY ENTRY CRUD
  // ============================

  getEntryForDate(date: string): Observable<any> {
    return this.http.get<any>(`${this.baseApiUrl}/date/${date}`);
  }

  getEntryById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseApiUrl}/${id}`);
  }

  getEntriesInRange(startDate: string, endDate: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseApiUrl}/range`, {
      params: { startDate, endDate }
    });
  }

  createEntry(entry: any): Observable<any> {
    return this.http.post<any>(`${this.baseApiUrl}`, entry);
  }

  updateEntry(id: string, entry: any): Observable<any> {
    return this.http.put<any>(`${this.baseApiUrl}/${id}`, entry);
  }

  deleteEntry(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseApiUrl}/${id}`);
  }

  // ============================
  // WELLNESS & AI INSIGHTS
  // ============================

  getWellnessInsights(): Observable<any> {
    return this.http.get<any>(`${this.baseApiUrl}/insights/wellness`);
  }

  getMoodTrends(daysBack: number = 30): Observable<any> {
    return this.http.get<any>(`${this.baseApiUrl}/insights/mood-trends`, {
      params: { daysBack: daysBack.toString() }
    });
  }

  getWorkLifeBalance(daysBack: number = 30): Observable<any> {
    return this.http.get<any>(`${this.baseApiUrl}/insights/balance`, {
      params: { daysBack: daysBack.toString() }
    });
  }

  checkWellnessWarnings(daysBack: number = 14): Observable<any> {
    return this.http.get<any>(`${this.baseApiUrl}/insights/wellness-warnings`, {
      params: { daysBack: daysBack.toString() }
    });
  }
}

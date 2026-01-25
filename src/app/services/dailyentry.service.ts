import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  DailyEntry,
  DailyEntryCreateDto,
  DailyEntryUpdateDto,
  WeeklyInspiration,
  WeeklyInspirationCreateDto
} from '../models/api';

@Injectable({ providedIn: 'root' })
export class DailyEntryService {
  private readonly baseApiUrl = 'https://localhost:44304/api/daily-entry';

  constructor(private http: HttpClient) {}

  // ============================
  // GET
  // ============================

  getByDate(date: string): Observable<DailyEntry> {
    return this.http.get<DailyEntry>(`${this.baseApiUrl}/date/${date}`);
  }

  getById(id: string): Observable<DailyEntry> {
    return this.http.get<DailyEntry>(`${this.baseApiUrl}/${id}`);
  }

  getRange(startDate: string, endDate: string): Observable<DailyEntry[]> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<DailyEntry[]>(`${this.baseApiUrl}/range`, { params });
  }

  // ============================
  // CREATE / UPDATE / DELETE
  // ============================

  create(entry: DailyEntryCreateDto): Observable<DailyEntry> {
    return this.http.post<DailyEntry>(`${this.baseApiUrl}`, entry);
  }

  update(id: string, entry: DailyEntryUpdateDto): Observable<void> {
    return this.http.put<void>(`${this.baseApiUrl}/${id}`, entry);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseApiUrl}/${id}`);
  }

  // ============================
  // WEEKLY INSPIRATION
  // ============================

  getWeeklyInspiration(date: string): Observable<WeeklyInspiration> {
    // Pass a date within the desired week, backend will calculate week boundaries
    const params = new HttpParams().set('date', date);
    return this.http.get<WeeklyInspiration>(
      `${this.baseApiUrl}/weekly-inspiration`,
      { params }
    );
  }

  createOrUpdateWeeklyInspiration(
    inspiration: WeeklyInspirationCreateDto
  ): Observable<WeeklyInspiration> {
    return this.http.post<WeeklyInspiration>(
      `${this.baseApiUrl}/weekly-inspiration`,
      inspiration
    );
  }
}

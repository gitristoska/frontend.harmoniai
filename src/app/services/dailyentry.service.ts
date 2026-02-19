import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DailyEntryService {
  private readonly baseApiUrl = 'https://localhost:44304/api/daily-entry';

  constructor(private http: HttpClient) {}

  // ============================
  // GET
  // ============================

  getByDate(date: string): Observable<any> {
    return this.http.get<any>(`${this.baseApiUrl}/date/${date}`);
  }

  getById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseApiUrl}/${id}`);
  }

  getRange(startDate: string, endDate: string): Observable<any[]> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<any[]>(`${this.baseApiUrl}/range`, { params });
  }

  // ============================
  // CREATE / UPDATE / DELETE
  // ============================

  create(entry: any): Observable<any> {
    return this.http.post<any>(`${this.baseApiUrl}`, entry);
  }

  update(id: string, entry: any): Observable<void> {
    return this.http.put<void>(`${this.baseApiUrl}/${id}`, entry);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseApiUrl}/${id}`);
  }

  // ============================
  // WEEKLY INSPIRATION
  // ============================

  getWeeklyInspiration(date: string): Observable<any> {
    // Pass a date within the desired week, backend will calculate week boundaries
    const params = new HttpParams().set('date', date);
    return this.http.get<any>(
      `${this.baseApiUrl}/weekly-inspiration`,
      { params }
    );
  }

  createOrUpdateWeeklyInspiration(
    inspiration: any
  ): Observable<any> {
    return this.http.post<any>(
      `${this.baseApiUrl}/weekly-inspiration`,
      inspiration
    );
  }
}

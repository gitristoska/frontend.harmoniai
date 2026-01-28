import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface JournalEntry {
  id: number;
  userId: number;
  date: string;
  text: string;
  sentiment?: 'Positive' | 'Neutral' | 'Negative';
  aiAnalysis?: string;
}

@Injectable({ providedIn: 'root' })
export class JournalService {
  private http = inject(HttpClient);
  private baseUrl = 'https://localhost:44304/api/Journal'; // backend endpoint

//   getEntries(): Observable<JournalEntry[]> {
//     return this.http.get<JournalEntry[]>(`${this.baseUrl}`);
//   }

  getEntries(userId: string): Observable<JournalEntry[]> {
  return this.http.get<JournalEntry[]>(`${this.baseUrl}?userId=${userId}`);
  }


  createEntry(entry: { text: string; useAi: boolean }): Observable<JournalEntry> {
   // debugger
    return this.http.post<JournalEntry>(`${this.baseUrl}`, entry);
  }

  updateEntry(id: number, entry: Partial<JournalEntry>): Observable<JournalEntry> {
    return this.http.put<JournalEntry>(`${this.baseUrl}/${id}`, entry);
  }

  deleteEntry(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Habit, HabitCreateDto, HabitUpdateDto } from '../models/habit.model';

@Injectable({
  providedIn: 'root'
})
export class HabitService {

  private apiUrl = 'https://localhost:44304/api/habits';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Habit[]> {
    return this.http.get<Habit[]>(this.apiUrl);
  }

  getById(id: string): Observable<Habit> {
    return this.http.get<Habit>(`${this.apiUrl}/${id}`);
  }

  create(dto: HabitCreateDto): Observable<Habit> {
    return this.http.post<Habit>(this.apiUrl, dto);
  }

  update(id: string, dto: HabitUpdateDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

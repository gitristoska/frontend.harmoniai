import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  Habit, 
  HabitCreateDto, 
  HabitUpdateDto,
  WeeklyStats,
  HabitHistory,
  HabitsWithSuggestions
} from '../models/habit.model';

@Injectable({
  providedIn: 'root'
})
export class HabitService {

  private apiUrl = 'https://localhost:44304/api/habits';

  constructor(private http: HttpClient) {}

  /**
   * Calculate week end date from week start date
   * @param weekStart Start date of the week
   * @returns Date object representing the last day of the week (start + 6 days)
   */
  static getWeekEnd(weekStart: Date): Date {
    return new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
  }

  private formatDateToISO(date: Date | string): string {
    if (typeof date === 'string') return date;
    return date.toISOString().split('T')[0];
  }

  /**
   * Get all habits with full data (scheduledDays + completionStatus)
   */
  getAll(): Observable<Habit[]> {
    return this.http.get<Habit[]>(this.apiUrl);
  }

  /**
   * Get habits for a specific week using weekStart date
   * @param weekStartDate ISO date string (YYYY-MM-DD) or Date object
   */
  getByWeek(weekStartDate: Date | string): Observable<Habit[]> {
    const dateStr = this.formatDateToISO(weekStartDate);
    return this.http.get<Habit[]>(`${this.apiUrl}/week?date=${dateStr}`);
  }

  /**
   * Get habits for a week WITH AI suggestions
   * @param weekStartDate ISO date string (YYYY-MM-DD) or Date object
   * @param includeAiSuggestions Whether to include AI suggestions
   */
  getHabitsForWeek(weekStartDate: Date | string, includeAiSuggestions: boolean = false): Observable<HabitsWithSuggestions> {
    const dateStr = this.formatDateToISO(weekStartDate);
    return this.http.get<HabitsWithSuggestions>(
      `${this.apiUrl}/week?date=${dateStr}&includeAiSuggestions=${includeAiSuggestions}`
    );
  }

  /**
   * Get single habit for a specific week
   * @param id Habit ID
   * @param weekStartDate ISO date string (YYYY-MM-DD) or Date object
   */
  getByIdAndWeek(id: string, weekStartDate: Date | string): Observable<Habit> {
    const dateStr = this.formatDateToISO(weekStartDate);
    return this.http.get<Habit>(`${this.apiUrl}/${id}/week?date=${dateStr}`);
  }

  /**
   * Get weekly completion statistics
   * @param weekStartDate ISO date string (YYYY-MM-DD) or Date object
   */
  getWeeklyStats(weekStartDate: Date | string): Observable<WeeklyStats> {
    const dateStr = this.formatDateToISO(weekStartDate);
    return this.http.get<WeeklyStats>(`${this.apiUrl}/stats/week?date=${dateStr}`);
  }

  /**
   * Get habit history for specified number of weeks
   * @param habitId ID of the habit
   * @param weeksBack Number of weeks to track back (default: 4)
   */
  getHabitHistory(habitId: string, weeksBack: number = 4): Observable<HabitHistory> {
    return this.http.get<HabitHistory>(`${this.apiUrl}/${habitId}/stats/history?weeksBack=${weeksBack}`);
  }

  /**
   * Refresh AI suggestions for the week
   * @param weekStartDate ISO date string (YYYY-MM-DD) or Date object
   */
  refreshAiSuggestions(weekStartDate: Date | string): Observable<{ weekStart: string; weeklyAiSuggestions: string; generatedAt: string }> {
    const dateStr = this.formatDateToISO(weekStartDate);
    return this.http.post<{ weekStart: string; weeklyAiSuggestions: string; generatedAt: string }>(
      `${this.apiUrl}/week/ai-suggestions/refresh?date=${dateStr}`,
      {}
    );
  }

  /**
   * Create new habit with scheduled days
   */
  create(dto: HabitCreateDto): Observable<Habit> {
    return this.http.post<Habit>(this.apiUrl, dto);
  }

  /**
   * Update habit name and/or scheduled days
   */
  update(id: string, dto: HabitUpdateDto): Observable<Habit> {
    return this.http.put<Habit>(`${this.apiUrl}/${id}`, dto);
  }

  /**
   * Mark a specific day as complete or incomplete
   * @param id Habit ID
   * @param dayOfWeek 0=Monday, 6=Sunday
   * @param completed true = completed, false = incomplete
   */
  markDayComplete(id: string, dayOfWeek: number, completed: boolean): Observable<Habit> {
    return this.http.patch<Habit>(`${this.apiUrl}/${id}/completion/${dayOfWeek}`, completed);
  }

  /**
   * Delete habit
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

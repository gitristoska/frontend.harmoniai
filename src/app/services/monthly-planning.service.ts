import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  MonthlyEntry,
  MonthlyGoal,
  MonthlyReflection,
  MonthlyEntryCreateDto,
  MonthlyGoalCreateDto,
  MonthlyGoalUpdateDto,
  MonthlyReflectionDto,
  PlannerTask
} from '../models/api';

@Injectable({
  providedIn: 'root'
})
export class MonthlyPlanningService {
  private baseUrl = 'https://localhost:44304/api/monthly';

  constructor(private http: HttpClient) {}

  // ===== ENTRIES =====

  /**
   * Create a new monthly entry
   * POST /
   */
  createEntry(entry: MonthlyEntryCreateDto): Observable<MonthlyEntry> {
    return this.http.post<MonthlyEntry>(this.baseUrl, entry);
  }

  /**
   * Get a monthly entry with all goals and reflection
   * GET /{month}
   * @param month Format: YYYY-MM (e.g., "2025-01")
   */
  getEntry(month: string): Observable<MonthlyEntry> {
    return this.http.get<MonthlyEntry>(`${this.baseUrl}/${month}`);
  }

  /**
   * Update a monthly entry (focus section)
   * PUT /{entryId}
   */
  updateEntry(entryId: string, data: Partial<MonthlyEntryCreateDto>): Observable<MonthlyEntry> {
    return this.http.put<MonthlyEntry>(`${this.baseUrl}/${entryId}`, data);
  }

  /**
   * Delete a monthly entry
   * DELETE /{entryId}
   */
  deleteEntry(entryId: string): Observable<boolean> {
    return this.http.delete<boolean>(`${this.baseUrl}/${entryId}`);
  }

  /**
   * Get complete view with everything in one request
   * GET /{month}
   * @param month Format: YYYY-MM (e.g., "2025-01")
   */
  getFullView(month: string): Observable<MonthlyEntry> {
    return this.http.get<MonthlyEntry>(`${this.baseUrl}/${month}`);
  }

  // ===== GOALS =====

  /**
   * Create a new goal under an entry
   * POST /{entryId}/goals
   * Max 3 goals per entry
   */
  createGoal(entryId: string, goal: MonthlyGoalCreateDto): Observable<MonthlyGoal> {
    return this.http.post<MonthlyGoal>(`${this.baseUrl}/${entryId}/goals`, goal);
  }

  /**
   * Update an existing goal
   * PUT /goals/{goalId}
   */
  updateGoal(goalId: string, data: Partial<MonthlyGoalUpdateDto>): Observable<MonthlyGoal> {
    return this.http.put<MonthlyGoal>(`https://localhost:44304/api/monthly/goals/${goalId}`, data);
  }

  /**
   * Delete a goal
   * DELETE /goals/{goalId}
   */
  deleteGoal(goalId: string): Observable<boolean> {
    return this.http.delete<boolean>(`https://localhost:44304/api/monthly/goals/${goalId}`);
  }

  // ===== TASK LINKING =====

  /**
   * Link a task to a goal
   * POST /goals/{goalId}/tasks/{taskId}
   * Each task can only link to ONE goal
   */
  linkTaskToGoal(goalId: string, taskId: string): Observable<any> {
    return this.http.post(`https://localhost:44304/api/monthly/goals/${goalId}/tasks/${taskId}`, {});
  }

  /**
   * Unlink a task from a goal
   * DELETE /goals/{goalId}/tasks/{taskId}
   */
  unlinkTaskFromGoal(goalId: string, taskId: string): Observable<boolean> {
    return this.http.delete<boolean>(`https://localhost:44304/api/monthly/goals/${goalId}/tasks/${taskId}`);
  }

  // ===== REFLECTION =====

  /**
   * Save or update reflection for an entry
   * POST /{entryId}/reflection
   * One reflection per entry (auto-updates if exists)
   */
  saveReflection(entryId: string, reflection: MonthlyReflectionDto): Observable<MonthlyReflection> {
    return this.http.post<MonthlyReflection>(`${this.baseUrl}/${entryId}/reflection`, reflection);
  }

  /**
   * Update an existing reflection
   * PUT /reflection/{reflectionId}
   */
  updateReflection(reflectionId: string, data: Partial<MonthlyReflectionDto>): Observable<MonthlyReflection> {
    return this.http.put<MonthlyReflection>(`https://localhost:44304/api/monthly/reflection/${reflectionId}`, data);
  }
}

// src/app/services/planner.service.ts
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import {
  PlannerTask,
  PlannerTaskCreateDto,
  PlannerTaskUpdateDto
} from "../models/api";
import { Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
export class PlannerService {
  private readonly baseApiUrl = 'https://localhost:44304/api/planner';

  constructor(private http: HttpClient) {}

  // ============================
  // DAILY / WEEKLY / MONTHLY
  // ============================

  getTasksForDay(date: string): Observable<PlannerTask[]> {
    return this.http.get<PlannerTask[]>(`${this.baseApiUrl}/tasks/daily/${date}`);
  }

  getTasksForWeek(startDate: string): Observable<PlannerTask[]> {
    return this.http.get<PlannerTask[]>(`${this.baseApiUrl}/tasks/weekly/${startDate}`);
  }

  getTasksForMonth(year: number, month: number): Observable<PlannerTask[]> {
    return this.http.get<PlannerTask[]>(`${this.baseApiUrl}/tasks/monthly/${year}/${month}`);
  }

  // ============================
  // CREATE / UPDATE / DELETE
  // ============================

  addTask(task: PlannerTaskCreateDto): Observable<PlannerTask> {
    return this.http.post<PlannerTask>(`${this.baseApiUrl}/task`, task);
  }

  updateTask(id: string | number, task: PlannerTaskUpdateDto): Observable<void> {
    return this.http.put<void>(`${this.baseApiUrl}/task/${id}`, task);
  }

  deleteTask(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.baseApiUrl}/task/${id}`);
  }
}

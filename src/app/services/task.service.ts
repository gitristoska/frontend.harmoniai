// src/app/services/planner.service.ts
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import {
  PlannerTask,
  PlannerTaskCreateDto,
  PlannerTaskUpdateDto,
  taskStatusToString
} from "../models/api";
import {
  DailyPlannerReflection,
  UpdateDailyReflectionDto,
  DailyReflectionSummary
} from "../models/planner/daily-planner-reflection.model";
import {
  CallAndEmailItem,
  CallAndEmailItemResponse
} from "../models/planner/call-email-item.model";
import {
  DailyPlanningAdvice,
  DailyWellnessInsight,
  ProductivityInsight,
  PlannerInsightsResponse,
  ProcrastinationRiskResponse
} from "../models/planner/planner-insights.model";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Injectable({ providedIn: 'root' })
export class PlannerService {
  private readonly baseApiUrl = 'https://localhost:44304/api/planner';

  constructor(private http: HttpClient) {}

  // ============================
  // HELPER METHODS
  // ============================

  private convertStatusToString(status: any): string {
    return taskStatusToString(status);
  }

  private normalizeTask(task: any): PlannerTask {
    return {
      ...task,
      status: task.status as string, // Keep status as string from API response
      priority: typeof task.priority === 'string' ? parseInt(task.priority) : task.priority
    } as PlannerTask;
  }

  // ============================
  // DAILY REFLECTION ENDPOINTS
  // ============================

  getDailyReflection(date?: string): Observable<DailyPlannerReflection> {
    const queryParam = date ? `?date=${date}` : '';
    return this.http.get<DailyPlannerReflection>(
      `${this.baseApiUrl}/reflection${queryParam}`
    );
  }

  saveDailyReflection(
    dto: UpdateDailyReflectionDto,
    date?: string
  ): Observable<DailyPlannerReflection> {
    const queryParam = date ? `?date=${date}` : '';
    return this.http.post<DailyPlannerReflection>(
      `${this.baseApiUrl}/reflection${queryParam}`,
      dto
    );
  }

  updateDailyReflection(
    dto: UpdateDailyReflectionDto,
    date?: string
  ): Observable<DailyPlannerReflection> {
    const queryParam = date ? `?date=${date}` : '';
    return this.http.put<DailyPlannerReflection>(
      `${this.baseApiUrl}/reflection${queryParam}`,
      dto
    );
  }

  // ============================
  // CALLS & EMAILS ENDPOINTS
  // ============================

  addCallOrEmail(
    item: CallAndEmailItem,
    date?: string
  ): Observable<CallAndEmailItemResponse> {
    const queryParam = date ? `?date=${date}` : '';
    return this.http.post<CallAndEmailItemResponse>(
      `${this.baseApiUrl}/reflection/call-email${queryParam}`,
      item
    );
  }

  updateCallOrEmail(
    itemId: string,
    item: CallAndEmailItem
  ): Observable<CallAndEmailItemResponse> {
    return this.http.put<CallAndEmailItemResponse>(
      `${this.baseApiUrl}/reflection/call-email/${itemId}`,
      item
    );
  }

  deleteCallOrEmail(itemId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.baseApiUrl}/reflection/call-email/${itemId}`
    );
  }

  // ============================
  // CHAT PLANNING
  // ============================

  generatePlanFromChat(userInput: string, date?: string): Observable<any> {
    return this.http.post<any>(`${this.baseApiUrl}/chat/suggest`, {
      userInput,
      date: date || new Date().toISOString().split('T')[0]
    });
  }

  // ============================
  // TASK MANAGEMENT
  // ============================

  getTasksForDay(date: string): Observable<PlannerTask[]> {
    return this.http.get<any>(`${this.baseApiUrl}/day?date=${date}`).pipe(
      map((response: any) => {
        let tasks: any[] = [];
        if (Array.isArray(response)) {
          tasks = response;
        } else if (response && response.tasks && Array.isArray(response.tasks)) {
          tasks = response.tasks;
        }
        // Normalize tasks: convert string status to enum
        return tasks.map(task => this.normalizeTask(task));
      })
    );
  }

  getTasksForWeek(startDate: string): Observable<PlannerTask[]> {
    return this.http.get<any>(`${this.baseApiUrl}/week?startDate=${startDate}`).pipe(
      map((response: any) => {
        let tasks: any[] = [];
        if (Array.isArray(response)) {
          tasks = response;
        } else if (response && response.tasksByDay) {
          Object.values(response.tasksByDay).forEach((dayTasks: any) => {
            if (Array.isArray(dayTasks)) {
              tasks.push(...dayTasks);
            }
          });
        }
        // Normalize tasks: convert string status to enum
        return tasks.map(task => this.normalizeTask(task));
      })
    );
  }

  getTaskById(id: string): Observable<PlannerTask> {
    return this.http.get<any>(`${this.baseApiUrl}/${id}`).pipe(
      map(task => this.normalizeTask(task))
    );
  }

  addTask(task: PlannerTaskCreateDto): Observable<PlannerTask> {
    const payload = {
      ...task,
      status: this.convertStatusToString(task.status)
    };
    return this.http.post<any>(`${this.baseApiUrl}`, payload).pipe(
      map(response => this.normalizeTask(response))
    );
  }

  updateTask(id: string | number, task: PlannerTaskUpdateDto): Observable<PlannerTask> {
    const payload = {
      ...task,
      status: task.status !== undefined ? this.convertStatusToString(task.status) : undefined
    };
    return this.http.put<any>(`${this.baseApiUrl}/${id}`, payload).pipe(
      map(response => this.normalizeTask(response))
    );
  }

  deleteTask(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.baseApiUrl}/${id}`);
  }

  // ============================
  // TASK COMPLETION & RESCHEDULING (Legacy)
  // ============================

  completeTask(id: string | number, request: any): Observable<PlannerTask> {
    return this.http.patch<any>(`${this.baseApiUrl}/tasks/${id}/complete`, request).pipe(
      map(response => this.normalizeTask(response))
    );
  }

  rescheduleTask(id: string | number, request: any): Observable<PlannerTask> {
    return this.http.patch<any>(`${this.baseApiUrl}/tasks/${id}/reschedule`, request).pipe(
      map(response => this.normalizeTask(response))
    );
  }

  // ============================
  // DAILY REFLECTION (Legacy)
  // ============================

  getDailyEntry(date: string): Observable<any> {
    return this.http.get<any>(`${this.baseApiUrl}/daily-entry?date=${date}`);
  }

  createDailyEntry(entry: any): Observable<any> {
    return this.http.post<any>(`${this.baseApiUrl}/daily-entry`, entry);
  }

  updateDailyEntry(date: string, entry: any): Observable<any> {
    return this.http.put<any>(`${this.baseApiUrl}/daily-entry/${date}`, entry);
  }

  addLifeBalanceItem(entryId: string, item: any): Observable<any> {
    return this.http.post<any>(`${this.baseApiUrl}/daily-entry/${entryId}/life-balance`, item);
  }

  addCallAndEmailItem(entryId: string, item: any): Observable<any> {
    return this.http.post<any>(`${this.baseApiUrl}/daily-entry/${entryId}/calls-emails`, item);
  }

  // ============================
  // AI INSIGHTS ENDPOINTS
  // ============================

  getDailyPlanningAdvice(date?: string): Observable<DailyPlanningAdvice> {
    const queryParam = date ? `?date=${date}` : '';
    return this.http.get<DailyPlanningAdvice>(
      `${this.baseApiUrl}/insights/daily${queryParam}`
    );
  }

  getProductivityInsights(): Observable<ProductivityInsight> {
    return this.http.get<ProductivityInsight>(
      `${this.baseApiUrl}/insights/productivity`
    );
  }

  getDailyWellnessInsights(date?: string): Observable<DailyWellnessInsight> {
    const queryParam = date ? `?date=${date}` : '';
    return this.http.get<DailyWellnessInsight>(
      `${this.baseApiUrl}/insights/daily-wellness${queryParam}`
    );
  }

  checkProcrastinationRisk(taskId: string): Observable<ProcrastinationRiskResponse> {
    return this.http.get<ProcrastinationRiskResponse>(
      `${this.baseApiUrl}/procrastination-risk/${taskId}`
    );
  }

  // ============================
  // LEGACY AI INSIGHTS
  // ============================

  getDailyInsights(date: string): Observable<any> {
    return this.http.get<any>(`${this.baseApiUrl}/insights/daily?date=${date}`);
  }

  getProductivityAnalysis(): Observable<any> {
    return this.http.get<any>(`${this.baseApiUrl}/insights/productivity`);
  }

  getProcrastinationRisk(taskId: string): Observable<any> {
    return this.http.get<any>(`${this.baseApiUrl}/insights/procrastination/${taskId}`);
  }
}

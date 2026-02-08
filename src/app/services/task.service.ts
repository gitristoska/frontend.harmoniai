// src/app/services/planner.service.ts
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import {
  PlannerTask,
  PlannerTaskCreateDto,
  PlannerTaskUpdateDto,
  DailyEntry,
  DailyEntryCreateDto,
  DailyEntryUpdateDto,
  DailyInsights,
  ProductivityAnalysis,
  ProcrastinationIndicator,
  TaskCompleteRequest,
  TaskRescheduleRequest,
  ProcrastinationRisk as ApiProcrastinationRisk
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
  // TASK MANAGEMENT
  // ============================

  getTasksForDay(date: string): Observable<PlannerTask[]> {
    return this.http.get<any>(`${this.baseApiUrl}/day?date=${date}`).pipe(
      // Handle both array response and object response with tasks property
      map((response: any) => {
        if (Array.isArray(response)) {
          return response;
        } else if (response && response.tasks && Array.isArray(response.tasks)) {
          return response.tasks;
        }
        return [];
      })
    );
  }

  getTasksForWeek(startDate: string): Observable<PlannerTask[]> {
    return this.http.get<any>(`${this.baseApiUrl}/week?startDate=${startDate}`).pipe(
      map((response: any) => {
        if (Array.isArray(response)) {
          return response;
        } else if (response && response.tasksByDay) {
          // Flatten tasksByDay object into array
          const tasks: PlannerTask[] = [];
          Object.values(response.tasksByDay).forEach((dayTasks: any) => {
            if (Array.isArray(dayTasks)) {
              tasks.push(...dayTasks);
            }
          });
          return tasks;
        }
        return [];
      })
    );
  }

  getTaskById(id: string): Observable<PlannerTask> {
    return this.http.get<PlannerTask>(`${this.baseApiUrl}/${id}`);
  }

  addTask(task: PlannerTaskCreateDto): Observable<PlannerTask> {
    return this.http.post<PlannerTask>(`${this.baseApiUrl}`, task);
  }

  updateTask(id: string | number, task: PlannerTaskUpdateDto): Observable<PlannerTask> {
    return this.http.put<PlannerTask>(`${this.baseApiUrl}/${id}`, task);
  }

  deleteTask(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.baseApiUrl}/${id}`);
  }

  // ============================
  // TASK COMPLETION & RESCHEDULING (Legacy)
  // ============================

  completeTask(id: string | number, request: TaskCompleteRequest): Observable<PlannerTask> {
    return this.http.patch<PlannerTask>(`${this.baseApiUrl}/tasks/${id}/complete`, request);
  }

  rescheduleTask(id: string | number, request: TaskRescheduleRequest): Observable<PlannerTask> {
    return this.http.patch<PlannerTask>(`${this.baseApiUrl}/tasks/${id}/reschedule`, request);
  }

  // ============================
  // DAILY REFLECTION (Legacy)
  // ============================

  getDailyEntry(date: string): Observable<DailyEntry> {
    return this.http.get<DailyEntry>(`${this.baseApiUrl}/daily-entry?date=${date}`);
  }

  createDailyEntry(entry: DailyEntryCreateDto): Observable<DailyEntry> {
    return this.http.post<DailyEntry>(`${this.baseApiUrl}/daily-entry`, entry);
  }

  updateDailyEntry(date: string, entry: DailyEntryUpdateDto): Observable<DailyEntry> {
    return this.http.put<DailyEntry>(`${this.baseApiUrl}/daily-entry/${date}`, entry);
  }

  addLifeBalanceItem(entryId: string, item: any): Observable<DailyEntry> {
    return this.http.post<DailyEntry>(`${this.baseApiUrl}/daily-entry/${entryId}/life-balance`, item);
  }

  addCallAndEmailItem(entryId: string, item: any): Observable<DailyEntry> {
    return this.http.post<DailyEntry>(`${this.baseApiUrl}/daily-entry/${entryId}/calls-emails`, item);
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

  getDailyInsights(date: string): Observable<DailyInsights> {
    return this.http.get<DailyInsights>(`${this.baseApiUrl}/insights/daily?date=${date}`);
  }

  getProductivityAnalysis(): Observable<ProductivityAnalysis> {
    return this.http.get<ProductivityAnalysis>(`${this.baseApiUrl}/insights/productivity`);
  }

  getProcrastinationRisk(taskId: string): Observable<ProcrastinationIndicator> {
    return this.http.get<ProcrastinationIndicator>(`${this.baseApiUrl}/insights/procrastination/${taskId}`);
  }
}

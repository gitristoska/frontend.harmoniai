import { Injectable } from "@angular/core";
import { PlannerTask, PlannerTaskCreateDto, PlannerTaskResponse, PlannerTaskUpdateDto } from "../models/api";
import { HttpClient } from "@angular/common/http";

@Injectable({ providedIn: 'root' })
export class PlannerService {
  private readonly apiUrl = 'https://localhost:44304/api/planner/task';

  constructor(private http: HttpClient) {}

  getTasksForDay(date: string) {
    return this.http.get<PlannerTask[]>(`${this.apiUrl}/${date}`);
  }
  getTasks() {
    return this.http.get<PlannerTaskResponse>(`${this.apiUrl}s`);
  }
  addTask(task: PlannerTaskCreateDto) {
    return this.http.post<PlannerTask>(this.apiUrl, task);
  }

  updateTask(id: number, task: PlannerTaskUpdateDto) {
    return this.http.put<void>(`${this.apiUrl}/${id}`, task);
  }

  deleteTask(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

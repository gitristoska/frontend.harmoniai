import { Component, input, Output, EventEmitter, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { PlannerTask } from '../../models/api';
import { PlannerService } from '../../services/task.service';

@Component({
  selector: 'app-calendar-center',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatProgressBarModule, MatTooltipModule, MatInputModule, MatFormFieldModule, MatCheckboxModule, MatSelectModule, FormsModule],
  template: `
    <div class="calendar-center">
      <!-- Header -->
      <div class="header">
        <button mat-icon-button class="nav-btn" (click)="previousDay()" matTooltip="Previous day">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div class="header-content">
          <h2 class="date-display">{{ currentDate() | date: 'EEEE' }}</h2>
          <p class="date-subtext">{{ currentDate() | date: 'MMMM d, yyyy' }}</p>
        </div>
        <button mat-icon-button class="nav-btn" (click)="nextDay()" matTooltip="Next day">
          <mat-icon>arrow_forward</mat-icon>
        </button>
      </div>

      <!-- Summary Stats -->
      <div class="summary-bar">
        <div class="stat">
          <span class="stat-label">Total</span>
          <span class="stat-value">{{ getTaskCount() }}</span>
        </div>
        <div class="stat completed">
          <span class="stat-label">Completed</span>
          <span class="stat-value">{{ getCompletedCount() }}</span>
        </div>
        <div class="progress-container">
          <mat-progress-bar mode="determinate" [value]="getCompletionPercentage()"></mat-progress-bar>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <button mat-stroked-button (click)="goToToday()" size="small">
          <mat-icon>today</mat-icon>
          Today
        </button>
      </div>

      <!-- Search & Filters -->
      <div class="filter-bar">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search tasks</mat-label>
          <input matInput [(ngModel)]="searchText" placeholder="Title, description, category...">
          <button mat-icon-button matSuffix (click)="searchText = ''" *ngIf="searchText">
            <mat-icon>close</mat-icon>
          </button>
        </mat-form-field>

        <div class="filter-group">
          <div class="filter-section">
            <label class="filter-label">Status:</label>
            <div class="checkbox-group">
              <mat-checkbox [(ngModel)]="filterStatus.todo" color="accent">To Do</mat-checkbox>
              <mat-checkbox [(ngModel)]="filterStatus.inProgress" color="accent">In Progress</mat-checkbox>
              <mat-checkbox [(ngModel)]="filterStatus.done" color="accent">Done</mat-checkbox>
            </div>
          </div>

          <div class="filter-section">
            <label class="filter-label">Priority:</label>
            <div class="checkbox-group">
              <mat-checkbox [(ngModel)]="filterPriority.high" color="accent">
                <span class="priority-indicator high"></span> High
              </mat-checkbox>
              <mat-checkbox [(ngModel)]="filterPriority.medium" color="accent">
                <span class="priority-indicator medium"></span> Medium
              </mat-checkbox>
              <mat-checkbox [(ngModel)]="filterPriority.low" color="accent">
                <span class="priority-indicator low"></span> Low
              </mat-checkbox>
            </div>
          </div>

          <div class="filter-section">
            <mat-form-field appearance="outline" class="category-select">
              <mat-label>Category</mat-label>
              <mat-select [(ngModel)]="filterCategory">
                <mat-option value="">All Categories</mat-option>
                <mat-option *ngFor="let cat of getAvailableCategories()" [value]="cat">
                  {{ cat }}
                </mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <button mat-stroked-button (click)="resetFilters()" size="small" class="reset-btn">
            <mat-icon>restart_alt</mat-icon>
            Reset
          </button>
        </div>
      </div>

      <!-- Status Sections -->
      <div class="status-sections">
        <!-- TODO Section -->
        <div class="status-section">
          <div class="section-header">
            <mat-icon class="status-icon todo">radio_button_unchecked</mat-icon>
            <h3>To Do</h3>
            <span class="task-count">{{ getTasksByStatus(0).length }}</span>
          </div>
          <div class="tasks-list">
            <div class="task-card" *ngFor="let task of getTasksByStatus(0)" 
                 [class.high-priority]="task.priority === 2"
                 [class.medium-priority]="task.priority === 1"
                 (click)="dateSelected.emit(task)">
              <div class="task-header">
                <span class="task-title">{{ task.title }}</span>
                <button mat-icon-button (click)="quickStatusChange(task, 1); $event.stopPropagation()" 
                        class="status-btn" matTooltip="Mark in progress">
                  <mat-icon>play_arrow</mat-icon>
                </button>
              </div>
              <div class="task-meta">
                <span class="time" *ngIf="task.startTime">
                  <mat-icon>schedule</mat-icon> {{ task.startTime }}
                </span>
                <span class="category-badge" [style.background]="getCategoryColor(task.category)">
                  {{ task.category }}
                </span>
                <span class="duration" *ngIf="task.duration">
                  <mat-icon>timer</mat-icon> {{ task.duration }}m
                </span>
              </div>
              <p class="description" *ngIf="task.description">
                {{ task.description | slice: 0:60 }}{{ task.description.length > 60 ? '...' : '' }}
              </p>
              <div class="task-footer" *ngIf="(task.rescheduleCount ?? 0) > 3">
                <mat-icon class="warning-icon">warning</mat-icon>
                <span class="warning-text">Rescheduled {{ task.rescheduleCount }} times</span>
              </div>
            </div>
            <div class="empty-state" *ngIf="getTasksByStatus(0).length === 0">
              <mat-icon>inbox</mat-icon>
              <p>No tasks to do</p>
            </div>
          </div>
        </div>

        <!-- IN PROGRESS Section -->
        <div class="status-section">
          <div class="section-header">
            <mat-icon class="status-icon in-progress">schedule</mat-icon>
            <h3>In Progress</h3>
            <span class="task-count">{{ getTasksByStatus(1).length }}</span>
          </div>
          <div class="tasks-list">
            <div class="task-card in-progress-card" *ngFor="let task of getTasksByStatus(1)" 
                 [class.high-priority]="task.priority === 2"
                 [class.medium-priority]="task.priority === 1"
                 (click)="dateSelected.emit(task)">
              <div class="task-header">
                <span class="task-title">{{ task.title }}</span>
                <div class="status-buttons">
                  <button mat-icon-button (click)="quickStatusChange(task, 0); $event.stopPropagation()" 
                          class="status-btn" matTooltip="Move to todo">
                    <mat-icon>arrow_back</mat-icon>
                  </button>
                  <button mat-icon-button (click)="quickStatusChange(task, 2); $event.stopPropagation()" 
                          class="status-btn complete-btn" matTooltip="Mark complete">
                    <mat-icon>check</mat-icon>
                  </button>
                </div>
              </div>
              <div class="task-meta">
                <span class="time" *ngIf="task.startTime">
                  <mat-icon>schedule</mat-icon> {{ task.startTime }}
                </span>
                <span class="category-badge" [style.background]="getCategoryColor(task.category)">
                  {{ task.category }}
                </span>
                <span class="duration" *ngIf="task.duration">
                  <mat-icon>timer</mat-icon> {{ task.duration }}m
                </span>
              </div>
              <p class="description" *ngIf="task.description">
                {{ task.description | slice: 0:60 }}{{ task.description.length > 60 ? '...' : '' }}
              </p>
            </div>
            <div class="empty-state" *ngIf="getTasksByStatus(1).length === 0">
              <mat-icon>done_outline</mat-icon>
              <p>No tasks in progress</p>
            </div>
          </div>
        </div>

        <!-- DONE Section -->
        <div class="status-section">
          <div class="section-header">
            <mat-icon class="status-icon done">check_circle</mat-icon>
            <h3>Done</h3>
            <span class="task-count">{{ getTasksByStatus(2).length }}</span>
          </div>
          <div class="tasks-list">
            <div class="task-card done-card" *ngFor="let task of getTasksByStatus(2)" 
                 [class.high-priority]="task.priority === 2"
                 [class.medium-priority]="task.priority === 1"
                 (click)="dateSelected.emit(task)">
              <div class="task-header">
                <span class="task-title">{{ task.title }}</span>
                <button mat-icon-button (click)="quickStatusChange(task, 1); $event.stopPropagation()" 
                        class="status-btn" matTooltip="Move back to in progress">
                  <mat-icon>undo</mat-icon>
                </button>
              </div>
              <div class="task-meta">
                <span class="time" *ngIf="task.startTime">
                  <mat-icon>schedule</mat-icon> {{ task.startTime }}
                </span>
                <span class="category-badge" [style.background]="getCategoryColor(task.category)">
                  {{ task.category }}
                </span>
              </div>
            </div>
            <div class="empty-state" *ngIf="getTasksByStatus(2).length === 0">
              <mat-icon>celebration</mat-icon>
              <p>All done! Great job!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .calendar-center {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      overflow: hidden;
    }

    /* Header */
    .header {
      padding: 24px 20px;
      background: white;
      border-bottom: 2px solid #e8e8e8;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    }

    .nav-btn {
      color: #1976d2;
      transition: all 0.3s ease;
    }

    .nav-btn:hover {
      background: #f0f7ff !important;
      transform: scale(1.1);
    }

    .header-content {
      flex: 1;
      text-align: center;
    }

    .date-display {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: #1a1a1a;
      letter-spacing: -0.5px;
    }

    .date-subtext {
      margin: 4px 0 0;
      font-size: 13px;
      color: #999;
      font-weight: 500;
    }

    /* Summary Stats */
    .summary-bar {
      padding: 12px 20px;
      background: white;
      border-bottom: 1px solid #f0f0f0;
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }

    .stat-label {
      font-size: 11px;
      color: #999;
      font-weight: 500;
      text-transform: uppercase;
    }

    .stat-value {
      font-size: 18px;
      font-weight: 600;
      color: #1976d2;
    }

    .stat.completed .stat-value {
      color: #4caf50;
    }

    .progress-container {
      flex: 1;
      max-width: 200px;
      height: 6px;
      border-radius: 3px;
      overflow: hidden;
      background: #f0f0f0;
    }

    ::ng-deep .progress-container .mdc-linear-progress__bar-inner {
      background-color: #4caf50 !important;
    }

    /* Quick Actions */
    .quick-actions {
      padding: 12px 20px;
      background: white;
      border-bottom: 1px solid #f0f0f0;
      display: flex;
      gap: 8px;
    }

    /* Filter Bar */
    .filter-bar {
      padding: 16px 20px;
      background: white;
      border-bottom: 1px solid #f0f0f0;
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-height: 200px;
      overflow-y: auto;
    }

    .search-field {
      width: 100%;
    }

    .filter-group {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      align-items: flex-end;
    }

    .filter-section {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .filter-label {
      font-size: 12px;
      font-weight: 600;
      color: #666;
      text-transform: uppercase;
    }

    .checkbox-group {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .priority-indicator {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-right: 4px;
    }

    .priority-indicator.high {
      background: #d32f2f;
    }

    .priority-indicator.medium {
      background: #f57c00;
    }

    .priority-indicator.low {
      background: #757575;
    }

    .category-select {
      min-width: 150px;
    }

    .reset-btn {
      align-self: flex-end;
    }

    /* Status Sections */
    .status-sections {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .status-section {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }

    .section-header {
      padding: 16px 20px;
      background: #fafafa;
      border-bottom: 2px solid #f0f0f0;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .status-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .status-icon.todo {
      color: #9e9e9e;
    }

    .status-icon.in-progress {
      color: #2196f3;
    }

    .status-icon.done {
      color: #4caf50;
    }

    .section-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #1a1a1a;
      flex: 1;
    }

    .task-count {
      font-size: 12px;
      font-weight: 600;
      background: #f0f0f0;
      padding: 4px 8px;
      border-radius: 12px;
      color: #666;
    }

    .tasks-list {
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .task-card {
      padding: 12px;
      border-left: 4px solid #1976d2;
      border-radius: 6px;
      background: #fafafa;
      cursor: pointer;
      transition: all 0.3s ease;
      border: 1px solid #f0f0f0;
    }

    .task-card:hover {
      background: white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }

    .task-card.high-priority {
      border-left-color: #d32f2f;
      background: rgba(211, 47, 47, 0.02);
    }

    .task-card.medium-priority {
      border-left-color: #f57c00;
      background: rgba(245, 124, 0, 0.02);
    }

    .task-card.in-progress-card {
      background: rgba(33, 150, 243, 0.02);
    }

    .task-card.done-card {
      opacity: 0.7;
      background: rgba(76, 175, 80, 0.02);
    }

    .task-card.done-card .task-title {
      text-decoration: line-through;
      color: #999;
    }

    .task-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 8px;
    }

    .task-title {
      font-weight: 600;
      font-size: 14px;
      color: #1a1a1a;
      flex: 1;
      word-break: break-word;
    }

    .status-buttons {
      display: flex;
      gap: 4px;
    }

    .status-btn {
      width: 32px;
      height: 32px;
      padding: 0;
      opacity: 0.5;
      transition: all 0.2s ease;
    }

    .status-btn:hover {
      opacity: 1;
      background: #f0f0f0 !important;
    }

    .status-btn.complete-btn:hover {
      color: #4caf50;
    }

    .task-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      margin-bottom: 8px;
      flex-wrap: wrap;
    }

    .time {
      display: flex;
      align-items: center;
      gap: 2px;
      color: #666;
      font-weight: 500;
    }

    .time mat-icon {
      font-size: 12px;
      width: 12px;
      height: 12px;
    }

    .category-badge {
      padding: 2px 8px;
      border-radius: 4px;
      color: white;
      font-weight: 500;
      font-size: 11px;
    }

    .duration {
      display: flex;
      align-items: center;
      gap: 2px;
      color: #1976d2;
      font-weight: 500;
    }

    .duration mat-icon {
      font-size: 12px;
      width: 12px;
      height: 12px;
    }

    .description {
      margin: 0;
      font-size: 12px;
      color: #666;
      line-height: 1.4;
      margin-bottom: 8px;
    }

    .task-footer {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 8px;
      background: #fff3e0;
      border-radius: 4px;
      font-size: 11px;
      color: #e65100;
    }

    .warning-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    .warning-text {
      font-weight: 500;
    }

    .empty-state {
      padding: 24px;
      text-align: center;
      color: #999;
    }

    .empty-state mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      opacity: 0.3;
      margin-bottom: 8px;
    }

    .empty-state p {
      margin: 0;
      font-size: 14px;
    }

    /* Scrollbar */
    .status-sections::-webkit-scrollbar {
      width: 8px;
    }

    .status-sections::-webkit-scrollbar-track {
      background: transparent;
    }

    .status-sections::-webkit-scrollbar-thumb {
      background: #ccc;
      border-radius: 4px;
    }

    .status-sections::-webkit-scrollbar-thumb:hover {
      background: #999;
    }

    @media (max-width: 768px) {
      .header {
        padding: 16px 12px;
      }

      .date-display {
        font-size: 20px;
      }

      .summary-bar {
        gap: 16px;
      }

      .status-sections {
        padding: 12px;
        gap: 16px;
      }
    }
  `]
})
export class CalendarCenterComponent {
  selectedDate = input<Date | null>(null);
  tasks = input<PlannerTask[]>([]);
  @Output() dateSelected = new EventEmitter<any>();
  @Output() taskStatusChanged = new EventEmitter<PlannerTask>();

  private plannerService = inject(PlannerService);
  currentDate = signal(new Date());

  // Filter state
  searchText = '';
  filterStatus = { todo: true, inProgress: true, done: true };
  filterPriority = { high: true, medium: true, low: true };
  filterCategory = '';

  // Computed filtered tasks
  filteredTasks = computed(() => {
    const tasksList = this.tasks();
    if (!Array.isArray(tasksList)) return [];

    return tasksList.filter(task => {
      // Search filter
      if (this.searchText.trim()) {
        const search = this.searchText.toLowerCase();
        const matchesSearch = 
          task.title?.toLowerCase().includes(search) ||
          task.description?.toLowerCase().includes(search) ||
          task.category?.toLowerCase().includes(search);
        if (!matchesSearch) return false;
      }

      // Status filter
      const statusOk = 
        (task.status === 0 && this.filterStatus.todo) ||
        (task.status === 1 && this.filterStatus.inProgress) ||
        (task.status === 2 && this.filterStatus.done);
      if (!statusOk) return false;

      // Priority filter (1=High, 2=Medium, 0=Low in API, but UI shows 2=High, 1=Medium, 0=Low)
      const priorityOk = 
        (task.priority === 2 && this.filterPriority.high) ||
        (task.priority === 1 && this.filterPriority.medium) ||
        (task.priority === 0 && this.filterPriority.low);
      if (!priorityOk) return false;

      // Category filter
      if (this.filterCategory && task.category !== this.filterCategory) return false;

      return true;
    });
  });

  previousDay() {
    const date = new Date(this.currentDate());
    date.setDate(date.getDate() - 1);
    this.currentDate.set(date);
  }

  nextDay() {
    const date = new Date(this.currentDate());
    date.setDate(date.getDate() + 1);
    this.currentDate.set(date);
  }

  goToToday() {
    this.currentDate.set(new Date());
  }

  getTaskCount(): number {
    const tasksList = this.tasks();
    return Array.isArray(tasksList) ? tasksList.length : 0;
  }

  getCompletedCount(): number {
    const tasksList = this.tasks();
    if (!Array.isArray(tasksList)) return 0;
    return tasksList.filter(t => t.status === 2).length;
  }

  getCompletionPercentage(): number {
    const total = this.getTaskCount();
    if (total === 0) return 0;
    return (this.getCompletedCount() / total) * 100;
  }

  getTasksByStatus(status: number): PlannerTask[] {
    return this.filteredTasks()
      .filter(t => t.status === status)
      .sort((a, b) => {
        // Sort by start time
        if (a.startTime && b.startTime) {
          return a.startTime.localeCompare(b.startTime);
        }
        if (a.startTime) return -1;
        if (b.startTime) return 1;
        return 0;
      });
  }

  getAvailableCategories(): string[] {
    const tasksList = this.tasks();
    if (!Array.isArray(tasksList)) return [];
    const categories = new Set(tasksList.map(t => t.category).filter((c): c is string => !!c));
    return Array.from(categories).sort();
  }

  resetFilters() {
    this.searchText = '';
    this.filterStatus = { todo: true, inProgress: true, done: true };
    this.filterPriority = { high: true, medium: true, low: true };
    this.filterCategory = '';
  }

  getCategoryColor(category: string | undefined): string {
    const colors: { [key: string]: string } = {
      'study': '#1976d2',
      'work': '#ff6f00',
      'personal': '#d32f2f',
      'health': '#388e3c',
      'shopping': '#7b1fa2',
      'default': '#757575'
    };
    const key = category?.toLowerCase() || 'default';
    return colors[key] || colors['default'];
  }

  quickStatusChange(task: PlannerTask, newStatus: number) {
    const updatedTask = { ...task, status: newStatus };
    this.plannerService.updateTask(task.id as string, updatedTask).subscribe({
      next: (result) => {
        this.taskStatusChanged.emit(result);
      },
      error: (err) => {
        console.error('Failed to update task status:', err);
      }
    });
  }
}

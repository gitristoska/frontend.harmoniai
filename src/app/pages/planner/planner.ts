import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogRef } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { Router } from '@angular/router';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { Inject, Optional } from '@angular/core';

import { PlannerService } from '../../services/task.service';
import { PlannerTask, TaskStatus } from '../../models/api';

@Component({
  selector: 'app-planner',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatMenuModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatSnackBarModule
  ],
  templateUrl: './planner.html',
  styleUrl: './planner.scss'
})
export class PlannerComponent implements OnInit {
  // ==================== STATE ====================
  currentDate = signal<Date>(new Date());
  tasks = signal<PlannerTask[]>([]);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Task filters
  selectedPriority = signal<number | null>(null);
  selectedStatus = signal<TaskStatus | null>(null);
  selectedCategory = signal<string | null>(null);
  searchTerm = signal<string>('');

  // View modes
  viewMode = signal<'list' | 'kanban' | 'agenda'>('list');

  // Filter UI state
  filtersVisible = signal<boolean>(true);

  constructor(
    private plannerService: PlannerService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private router: Router
  ) {
    // Load saved view mode from sessionStorage
    const savedViewMode = sessionStorage.getItem('plannerViewMode') as 'list' | 'kanban' | 'agenda' | null;
    if (savedViewMode) {
      this.viewMode.set(savedViewMode);
    }
  }

  ngOnInit(): void {
    // Load saved filters from sessionStorage
    const savedCategory = sessionStorage.getItem('plannerCategoryFilter');
    if (savedCategory) {
      this.selectedCategory.set(savedCategory);
    }

    const savedPriority = sessionStorage.getItem('plannerPriorityFilter');
    if (savedPriority) {
      this.selectedPriority.set(parseInt(savedPriority));
    }

    this.loadPlannerData();
  }

  // ==================== DATA LOADING ====================
  loadPlannerData(): void {
    this.isLoading.set(true);
    const dateStr = this.formatDateForApi(this.currentDate());
    this.loadDailyTasks(dateStr);
  }

  private loadDailyTasks(dateStr: string): void {
    this.plannerService.getTasksForDay(dateStr).subscribe({
      next: (tasksData: any) => {
        const tasksList = Array.isArray(tasksData) ? tasksData : (tasksData?.tasks || []);
        this.tasks.set(tasksList as PlannerTask[]);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load tasks:', err);
        this.error.set('Failed to load tasks');
        this.isLoading.set(false);
      }
    });
  }

  // ==================== TASK MANAGEMENT ====================
  toggleTaskStatus(task: PlannerTask): void {
    if (!task.id) return;
    
    // Workflow: Todo → InProgress → Done → Todo
    let newStatus: string;
    const updateData: any = {};
    
    const currentStatus = typeof task.status === 'string' ? task.status.toLowerCase() : 
                          task.status === TaskStatus.InProgress || task.status === 1 ? 'inprogress' :
                          task.status === TaskStatus.Done || task.status === 2 ? 'done' :
                          'todo';
    
    switch (currentStatus) {
      case 'todo':
        newStatus = 'InProgress';
        break;
      case 'inprogress':
        newStatus = 'Done';
        updateData.completedAt = new Date().toISOString(); // Auto-set when done
        break;
      case 'done':
      default:
        newStatus = 'Todo';
        break;
    }
    
    updateData.status = newStatus;
    
    // Optimistic update
    this.tasks.update(tasks =>
      tasks.map(t => t.id === task.id 
        ? { 
            ...t, 
            status: newStatus,
            updatedAt: new Date().toISOString(),
            ...(newStatus === 'Done' && { completedAt: new Date().toISOString() })
          } 
        : t)
    );

    // API call
    this.plannerService.updateTask(task.id, updateData).subscribe({
      next: () => {
        const statusLabel = newStatus === 'Todo' ? 'To Do'
                          : newStatus === 'InProgress' ? 'In Progress'
                          : 'Done';
        this.showSuccess(`Task marked as ${statusLabel}`);
      },
      error: (err) => {
        this.showError('Failed to update task');
        // Revert
        this.tasks.update(tasks =>
          tasks.map(t => t.id === task.id ? { ...t, status: task.status } : t)
        );
      }
    });
  }

  deleteTask(taskId: string | number | undefined): void {
    if (!taskId) {
      this.showError('Invalid task ID');
      return;
    }
    if (!confirm('Are you sure you want to delete this task?')) return;

    this.plannerService.deleteTask(taskId).subscribe({
      next: () => {
        this.tasks.update(tasks => tasks.filter(t => t.id !== taskId));
        this.showSuccess('Task deleted');
      },
      error: (err) => {
        this.showError('Failed to delete task');
      }
    });
  }

  openTaskModal(task?: PlannerTask): void {
    const dialogRef = this.dialog.open(TaskModalComponent, {
      width: '95vw',
      maxWidth: '1200px',
      maxHeight: '90vh',
      data: { task: task || null, currentDate: this.currentDate() }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Task created/updated, reload
        this.loadPlannerData();
      }
    });
  }

  // ==================== CALLS & EMAILS ====================
  // Feature removed - focus on tasks only

  // ==================== DAILY REFLECTION ====================
  // Feature removed - focus on tasks only

  // ==================== DATE NAVIGATION ====================
  previousDay(): void {
    const newDate = new Date(this.currentDate());
    newDate.setDate(newDate.getDate() - 1);
    this.currentDate.set(newDate);
    this.loadPlannerData();
  }

  nextDay(): void {
    const newDate = new Date(this.currentDate());
    newDate.setDate(newDate.getDate() + 1);
    this.currentDate.set(newDate);
    this.loadPlannerData();
  }

  goToToday(): void {
    this.currentDate.set(new Date());
    this.loadPlannerData();
  }

  // ==================== FILTERING & DISPLAY ====================
  getFilteredTasks(): PlannerTask[] {
    return this.tasks().filter(task => {
      // Priority filter
      if (this.selectedPriority() !== null && task.priority !== this.selectedPriority()) {
        return false;
      }

      // Status filter
      if (this.selectedStatus() !== null) {
        const selectedStatusStr = this.statusEnumToString(this.selectedStatus());
        const taskStatusStr = typeof task.status === 'string' ? task.status : 
                              task.status === TaskStatus.InProgress || task.status === 1 ? 'InProgress' :
                              task.status === TaskStatus.Done || task.status === 2 ? 'Done' : 'Todo';
        if (taskStatusStr !== selectedStatusStr) {
          return false;
        }
      }

      // Category filter
      if (this.selectedCategory() !== null && task.category?.toLowerCase() !== this.selectedCategory()?.toLowerCase()) {
        return false;
      }

      // Search term (check both title and description)
      const searchLower = this.searchTerm().toLowerCase();
      if (searchLower) {
        const titleMatch = task.title.toLowerCase().includes(searchLower);
        const descMatch = task.description && task.description.toLowerCase().includes(searchLower);
        if (!titleMatch && !descMatch) {
          return false;
        }
      }

      return true;
    });
  }

  getTasksByPriority(priority: number): PlannerTask[] {
    return this.getFilteredTasks().filter(t => t.priority === priority).sort((a, b) => {
      const timeA = a.startTime ? parseInt(a.startTime.replace(':', '')) : 0;
      const timeB = b.startTime ? parseInt(b.startTime.replace(':', '')) : 0;
      return timeA - timeB;
    });
  }

  getCompletedTasksCount(): number {
    return this.tasks().filter(t => this.isTaskDone(t.status)).length;
  }

  getRemainingTasksCount(): number {
    return this.tasks().filter(t => !this.isTaskDone(t.status)).length;
  }

  getCompletionPercentage(): number {
    if (this.tasks().length === 0) return 0;
    const completed = this.getCompletedTasksCount();
    return Math.round((completed / this.tasks().length) * 100);
  }

  getPriorityLabel(priority: number): string {
    switch (priority) {
      case 0: return 'Low';
      case 1: return 'Medium';
      case 2: return 'High';
      default: return 'Unknown';
    }
  }

  getPriorityIcon(priority: number): string {
    switch (priority) {
      case 0: return '🟢';
      case 1: return '🟡';
      case 2: return '🔴';
      default: return '';
    }
  }

  getStatusLabel(status: TaskStatus | string | number): string {
    // Normalize to string for comparison
    const statusStr = typeof status === 'string' ? status.toLowerCase() : 
                      status === TaskStatus.Done || status === 2 ? 'done' :
                      status === TaskStatus.InProgress || status === 1 ? 'inprogress' :
                      'todo';
    
    switch (statusStr) {
      case 'todo':
      case 'Todo':
        return 'To Do';
      case 'inprogress':
      case 'inProgress':
      case 'InProgress':
        return 'In Progress';
      case 'done':
      case 'Done':
        return 'Done';
      default:
        return 'Unknown';
    }
  }

  getStatusIcon(status: TaskStatus | string | number): string {
    // Normalize to string for comparison
    const statusStr = typeof status === 'string' ? status.toLowerCase() : 
                      status === TaskStatus.Done || status === 2 ? 'done' :
                      status === TaskStatus.InProgress || status === 1 ? 'inprogress' :
                      'todo';
    
    switch (statusStr) {
      case 'todo':
      case 'Todo':
        return '⭕';
      case 'inprogress':
      case 'inProgress':
      case 'InProgress':
        return '🔄';
      case 'done':
      case 'Done':
        return '✅';
      default:
        return '';
    }
  }

  isTaskDone(status: TaskStatus | string | number): boolean {
    if (typeof status === 'string') {
      return status.toLowerCase() === 'done';
    }
    return status === TaskStatus.Done || status === 2;
  }

  isTaskInProgress(status: TaskStatus | string | number): boolean {
    if (typeof status === 'string') {
      return status.toLowerCase() === 'inprogress' || status.toLowerCase() === 'in progress';
    }
    return status === TaskStatus.InProgress || status === 1;
  }

  private statusEnumToString(status: TaskStatus | null): string {
    if (status === null) return '';
    switch (status) {
      case TaskStatus.Todo:
        return 'Todo';
      case TaskStatus.InProgress:
        return 'InProgress';
      case TaskStatus.Done:
        return 'Done';
      default:
        return 'Todo';
    }
  }

  isToday(): boolean {
    const today = new Date();
    const current = this.currentDate();
    return today.toDateString() === current.toDateString();
  }

  // ==================== VIEW MODE ====================
  changeViewMode(mode: 'list' | 'kanban' | 'agenda'): void {
    this.viewMode.set(mode);
    sessionStorage.setItem('plannerViewMode', mode);
  }

  viewModeIcon(): string {
    switch (this.viewMode()) {
      case 'list': return 'view_list';
      case 'kanban': return 'dashboard';
      case 'agenda': return 'schedule';
      default: return 'view_list';
    }
  }

  // ==================== UTILITIES ====================
  formatDateForApi(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  formatDateForDisplay(date: Date): string {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }

  formatTimeForDisplay(timeStr?: string): string {
    if (!timeStr) return '';
    return timeStr; // Already in HH:MM format
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 3000 });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
  }

  // ==================== CHAT PLANNER ====================
  openChatPlanner(): void {
    const dialogRef = this.dialog.open(ChatPlannerModalComponent, {
      width: '600px',
      data: { currentDate: this.currentDate() }
    });

    dialogRef.afterClosed().subscribe((selectedTasks) => {
      if (selectedTasks && selectedTasks.length > 0) {
        this.addMultipleTasks(selectedTasks);
      }
    });
  }

  private addMultipleTasks(tasksToAdd: any[]): void {
    const dateStr = this.formatDateForApi(this.currentDate());
    let successCount = 0;

    tasksToAdd.forEach((task) => {
      const taskData = {
        title: task.title,
        description: task.description || undefined,
        startDate: dateStr,
        startTime: task.startTime || undefined,
        duration: task.duration ? parseInt(task.duration) : undefined,
        category: task.category || 'Work',
        priority: task.priority !== undefined ? parseInt(task.priority) : 1,
        status: TaskStatus.Todo,
        isFixedTime: task.isFixedTime ?? false
      };

      this.plannerService.addTask(taskData).subscribe({
        next: () => {
          successCount++;
          if (successCount === tasksToAdd.length) {
            this.showSuccess(`${successCount} task(s) added successfully`);
            this.loadPlannerData();
          }
        },
        error: (err) => {
          this.showError('Failed to add some tasks');
        }
      });
    });
  }

  // ==================== TRACKING & UTILITIES ====================
  trackByTaskId(index: number, task: PlannerTask): any {
    return task.id;
  }

  trackByIndex(index: number): number {
    return index;
  }

  // Task filtering helpers for template
  getCompletedTaskCount(): number {
    return this.getFilteredTasks().filter(t => this.isTaskDone(t.status)).length;
  }

  getFixedTimeTasks(): PlannerTask[] {
    return this.getFilteredTasks()
      .filter(t => t.startTime)
      .sort((a, b) => {
        const timeA = parseInt(a.startTime!.replace(':', ''));
        const timeB = parseInt(b.startTime!.replace(':', ''));
        return timeA - timeB;
      });
  }

  getFlexibleTasks(): PlannerTask[] {
    return this.getFilteredTasks().filter(t => !t.startTime);
  }

  // Kanban view helper
  getTasksByStatus(status: string): PlannerTask[] {
    return this.getFilteredTasks()
      .filter(t => {
        const taskStatus = typeof t.status === 'string' ? t.status : 
                          t.status === 1 ? 'InProgress' : 
                          t.status === 2 ? 'Done' : 'Todo';
        return taskStatus === status;
      })
      .sort((a, b) => {
        const priorityDiff = (b.priority || 1) - (a.priority || 1);
        if (priorityDiff !== 0) return priorityDiff;
        return (a.startTime || '').localeCompare(b.startTime || '');
      });
  }

  // Agenda view helpers
  getHourSlots(): number[] {
    return Array.from({ length: 16 }, (_, i) => i + 8); // 8 AM to 11 PM
  }

  getTasksForHour(hour: number): PlannerTask[] {
    return this.getFixedTimeTasks().filter(task => {
      if (!task.startTime) return false;
      const taskHour = parseInt(task.startTime.split(':')[0]);
      return taskHour === hour;
    });
  }

  getUniqueCategoriesFromTasks(): string[] {
    const categories = new Set(
      this.tasks()
        .map(t => t.category)
        .filter(c => c)
        .map(c => c?.toLowerCase())
    );
    return Array.from(categories).sort();
  }

  toggleCategoryFilter(category: string): void {
    const current = this.selectedCategory()?.toLowerCase();
    if (current === category.toLowerCase()) {
      this.selectedCategory.set(null);
      sessionStorage.removeItem('plannerCategoryFilter');
    } else {
      this.selectedCategory.set(category);
      sessionStorage.setItem('plannerCategoryFilter', category);
    }
  }

  togglePriorityFilter(priority: number): void {
    if (this.selectedPriority() === priority) {
      this.selectedPriority.set(null);
      sessionStorage.removeItem('plannerPriorityFilter');
    } else {
      this.selectedPriority.set(priority);
      sessionStorage.setItem('plannerPriorityFilter', priority.toString());
    }
  }

  updateSearchTerm(term: string): void {
    this.searchTerm.set(term);
  }

  clearAllFilters(): void {
    this.searchTerm.set('');
    this.selectedCategory.set(null);
    this.selectedPriority.set(null);
    sessionStorage.removeItem('plannerCategoryFilter');
    sessionStorage.removeItem('plannerPriorityFilter');
  }

  hasActiveFilters(): boolean {
    return !!this.searchTerm() || this.selectedCategory() !== null || this.selectedPriority() !== null;
  }

  getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      'health': '#FF6B6B',
      'work': '#4ECDC4',
      'personal': '#95E1D3',
      'other': '#FFB366',
      'learning': '#5B7CFF',
      'fitness': '#FFA07A',
      'finance': '#98D8C8',
      'social': '#F7B731'
    };
    return colors[category.toLowerCase()] || '#667eea';
  }

  toggleFiltersVisibility(): void {
    this.filtersVisible.update(v => !v);
  }
}

// ==================== TASK MODAL COMPONENT ====================
@Component({
  selector: 'app-task-modal',
  template: `
    <h2 mat-dialog-title>{{ data.task ? 'Edit Task' : 'Create Task' }}</h2>
    <mat-dialog-content class="compact-form">
      <form [formGroup]="form" class="form-grid">
        <!-- Title (Required) - Full width -->
        <mat-form-field appearance="outline" class="grid-col-2">
          <mat-label>Title *</mat-label>
          <input matInput formControlName="title" placeholder="Task name" maxlength="200">
          <mat-hint align="end">{{ form.get('title')?.value?.length || 0 }}/200</mat-hint>
          <mat-error>Title is required</mat-error>
        </mat-form-field>

        <!-- Description - Full width -->
        <mat-form-field appearance="outline" class="grid-col-2">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="2" 
            placeholder="Brief description (optional)" maxlength="1000"></textarea>
          <mat-hint align="end">{{ form.get('description')?.value?.length || 0 }}/1000</mat-hint>
        </mat-form-field>

        <!-- Category - 1 column -->
        <mat-form-field appearance="outline" class="grid-col-1">
          <mat-label>Category</mat-label>
          <mat-select formControlName="category">
            <mat-option value="work">💼 Work</mat-option>
            <mat-option value="personal">👤 Personal</mat-option>
            <mat-option value="health">🏥 Health</mat-option>
            <mat-option value="finance">💰 Finance</mat-option>
            <mat-option value="social">👥 Social</mat-option>
            <mat-option value="other">📌 Other</mat-option>
          </mat-select>
        </mat-form-field>

        <!-- Start Date - 1 column -->
        <mat-form-field appearance="outline" class="grid-col-1">
          <mat-label>Start Date *</mat-label>
          <input matInput [matDatepicker]="datePicker" formControlName="startDate" required readonly>
          <mat-datepicker-toggle matIconSuffix [for]="datePicker"></mat-datepicker-toggle>
          <mat-datepicker #datePicker></mat-datepicker>
        </mat-form-field>

        <!-- Start Time - 1 column -->
        <mat-form-field appearance="outline" class="grid-col-1">
          <mat-label>Start Time</mat-label>
          <input matInput type="time" formControlName="startTime" placeholder="09:00">
          <mat-hint>Optional</mat-hint>
        </mat-form-field>

        <!-- Duration - 1 column -->
        <mat-form-field appearance="outline" class="grid-col-1">
          <mat-label>Duration (min)</mat-label>
          <input matInput type="number" formControlName="duration" placeholder="60" min="1" max="1440">
        </mat-form-field>

        <!-- Priority - Full width horizontal -->
        <div class="priority-group grid-col-2">
          <label class="group-label">Priority:</label>
          <mat-radio-group formControlName="priority" class="radio-group-horizontal">
            <label class="radio-option">
              <mat-radio-button value="1"></mat-radio-button>
              <span>🔴 High</span>
            </label>
            <label class="radio-option">
              <mat-radio-button value="2"></mat-radio-button>
              <span>🟡 Medium</span>
            </label>
            <label class="radio-option">
              <mat-radio-button value="3"></mat-radio-button>
              <span>🟢 Low</span>
            </label>
          </mat-radio-group>
        </div>

        <!-- Fixed Time Checkbox - Full width -->
        <div class="checkbox-group grid-col-2">
          <mat-checkbox formControlName="isFixedTime" class="checkbox-inline">
            <span class="checkbox-label">📌 Fixed time (can't be rescheduled by AI)</span>
          </mat-checkbox>
        </div>

        <!-- Status (Edit mode only) - 1 column -->
        <mat-form-field appearance="outline" class="grid-col-1" *ngIf="data.task">
          <mat-label>Status</mat-label>
          <mat-select formControlName="status">
            <mat-option value="Todo">⭕ To Do</mat-option>
            <mat-option value="InProgress">🔄 In Progress</mat-option>
            <mat-option value="Done">✅ Done</mat-option>
          </mat-select>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Cancel</button>
      <button mat-raised-button color="primary" (click)="saveTask()" [disabled]="form.invalid">
        {{ data.task ? 'Update Task' : 'Create Task' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .compact-form {
      max-height: calc(90vh - 200px);
      overflow-y: auto;
      padding: 12px 16px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }

    .grid-col-1 {
      grid-column: span 1;
    }

    .grid-col-2 {
      grid-column: span 2;
    }

    mat-form-field {
      width: 100%;
      margin-bottom: 4px;
    }

    .priority-group {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 0;
    }

    .group-label {
      font-weight: 600;
      color: #333;
      font-size: 13px;
      min-width: 60px;
      margin: 0;
      flex-shrink: 0;
    }

    .radio-group-horizontal {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      flex: 1;
    }

    .radio-option {
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      font-size: 13px;
      
      &:hover {
        color: #667eea;
      }
    }

    .checkbox-group {
      display: flex;
      align-items: center;
      padding: 8px 0;
      gap: 8px;
    }

    .checkbox-inline {
      margin: 0 !important;
    }

    .checkbox-label {
      font-size: 13px;
      color: #333;
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .form-grid {
        grid-template-columns: 1fr;
      }

      .grid-col-2 {
        grid-column: span 1;
      }
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatCheckboxModule,
    MatRadioModule
  ]
})
export class TaskModalComponent {
  form: FormGroup;

  constructor(
    public dialogRef: DialogRef<any>,
    @Optional() @Inject(DIALOG_DATA) public data: any,
    private plannerService: PlannerService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      description: ['', [Validators.maxLength(1000)]],
      startDate: [this.data.currentDate || new Date(), [Validators.required]],
      startTime: [''],
      duration: [''],
      category: ['personal'], // Default: personal
      priority: ['2'], // Default: '2' (medium) - string to match radio button values
      isFixedTime: [false], // Default: false
      status: ['Todo'] // For edit mode
    });

    if (this.data.task) {
      this.form.patchValue({
        title: this.data.task.title,
        description: this.data.task.description,
        startDate: new Date(this.data.task.startDate),
        startTime: this.data.task.startTime,
        duration: this.data.task.duration,
        category: this.data.task.category?.toLowerCase() || 'personal',
        priority: String(this.data.task.priority), // Convert to string for radio button binding
        isFixedTime: this.data.task.isFixedTime || false,
        status: this.data.task.status || 'Todo'
      });
    }
  }

  saveTask(): void {
    if (this.form.invalid) return;

    const formValue = this.form.value;
    const taskData = {
      title: formValue.title,
      description: formValue.description || undefined,
      startDate: formValue.startDate instanceof Date 
        ? formValue.startDate.toISOString().split('T')[0]
        : formValue.startDate,
      startTime: formValue.startTime || undefined,
      duration: formValue.duration ? parseInt(formValue.duration) : undefined,
      category: formValue.category,
      priority: parseInt(formValue.priority), // Priority is stored as string in form, convert to number
      isFixedTime: formValue.isFixedTime,
      status: this.data.task ? formValue.status : 'Todo'
    };

    const operation = this.data.task
      ? this.plannerService.updateTask(this.data.task.id, taskData)
      : this.plannerService.addTask(taskData);

    operation.subscribe({
      next: () => {
        this.snackBar.open(this.data.task ? 'Task updated' : 'Task created', 'Close', { duration: 2000 });
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.snackBar.open('Failed to save task', 'Close', { duration: 3000, panelClass: ['error-snackbar'] });
      }
    });
  }
}

// ==================== CHAT PLANNER MODAL ====================
@Component({
  selector: 'app-chat-planner-modal',
  template: `
    <h2 mat-dialog-title>💬 Plan Your Day with AI</h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Describe your day...</mat-label>
          <textarea 
            matInput 
            formControlName="userInput" 
            rows="6"
            placeholder="E.g., 'Finish presentation, gym at 6pm, call mom, lunch meeting at noon'"
            required>
          </textarea>
          <mat-hint align="end">{{ form.get('userInput')?.value?.length || 0 }}/500</mat-hint>
        </mat-form-field>

        <div *ngIf="isGenerating()" class="loading-state">
          <mat-progress-bar mode="indeterminate"></mat-progress-bar>
          <p>✨ AI is planning your day...</p>
        </div>

        <div *ngIf="suggestedTasks().length > 0" class="suggestions">
          <h3>📋 Suggested Tasks:</h3>
          <p class="summary">{{ summary }}</p>
          
          <div class="task-suggestions">
            <div *ngFor="let task of suggestedTasks(); let i = index" 
              class="suggestion-card"
              [class.selected]="isTaskSelected(i)"
              (click)="toggleTaskSelection(i)">
              
              <div class="selection-checkbox">
                <mat-checkbox [checked]="isTaskSelected(i)" (click)="$event.stopPropagation()"></mat-checkbox>
              </div>
              
              <div class="suggestion-content">
                <h4>{{ task.title }}</h4>
                <p class="description">{{ task.description }}</p>
                <div class="task-meta">
                  <span class="badge category">{{ task.category | uppercase }}</span>
                  <span class="badge priority" [ngClass]="'priority-' + task.priority">
                    {{ getPriorityLabel(task.priority) }}
                  </span>
                  <span *ngIf="task.startTime" class="badge time">⏰ {{ task.startTime }}</span>
                  <span *ngIf="task.duration" class="badge duration">{{ task.duration }}min</span>
                </div>
              </div>
            </div>
          </div>

          <div *ngIf="recommendations" class="recommendations">
            <h4>💡 Recommendations:</h4>
            <p>{{ recommendations }}</p>
          </div>
        </div>

        <div *ngIf="error()" class="error-message">
          <mat-icon>error</mat-icon>
          {{ error() }}
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Cancel</button>
      <button mat-raised-button color="primary" 
        (click)="generatePlan()" 
        [disabled]="form.invalid || isGenerating()">
        ✨ Generate Plan
      </button>
      <button mat-raised-button color="accent" 
        (click)="confirmSelection()"
        [disabled]="selectedTasks().length === 0 || isGenerating()">
        ✓ Add {{ selectedTasks().length }} Task(s)
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width { width: 100%; }
    
    .loading-state {
      margin: 20px 0;
      text-align: center;
      
      p {
        margin-top: 12px;
        color: #666;
      }
    }
    
    .suggestions {
      margin-top: 20px;
      
      h3 {
        margin-bottom: 8px;
        color: #333;
        font-size: 16px;
      }
    }
    
    .summary {
      background: #f5f5f5;
      padding: 12px;
      border-radius: 4px;
      margin-bottom: 16px;
      font-size: 14px;
      color: #666;
    }
    
    .task-suggestions {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 16px;
    }
    
    .suggestion-card {
      display: flex;
      gap: 12px;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      background: white;
      
      &:hover {
        background: #f9f9f9;
        border-color: #bbb;
      }
      
      &.selected {
        background: #e3f2fd;
        border-color: #1976d2;
      }
    }
    
    .selection-checkbox {
      display: flex;
      align-items: flex-start;
      pt: 4px;
    }
    
    .suggestion-content {
      flex: 1;
      
      h4 {
        margin: 0 0 4px 0;
        font-size: 14px;
        font-weight: 600;
        color: #333;
      }
      
      .description {
        margin: 0 0 8px 0;
        font-size: 13px;
        color: #666;
      }
    }
    
    .task-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    
    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      
      &.category {
        background: #e0e0e0;
        color: #333;
      }
      
      &.priority {
        &.priority-0 {
          background: #c8e6c9;
          color: #2e7d32;
        }
        &.priority-1 {
          background: #fff9c4;
          color: #f57f17;
        }
        &.priority-2 {
          background: #ffcdd2;
          color: #c62828;
        }
      }
      
      &.time, &.duration, &.fixed {
        background: #bbdefb;
        color: #1565c0;
      }
    }
    
    .recommendations {
      background: #fff3cd;
      padding: 12px;
      border-radius: 4px;
      margin-bottom: 16px;
      
      h4 {
        margin: 0 0 8px 0;
        color: #856404;
        font-size: 14px;
      }
      
      p {
        margin: 0;
        color: #856404;
        font-size: 13px;
      }
    }
    
    .error-message {
      display: flex;
      gap: 8px;
      padding: 12px;
      background: #ffebee;
      color: #c62828;
      border-radius: 4px;
      margin: 16px 0;
      font-size: 13px;
      
      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressBarModule
  ]
})
export class ChatPlannerModalComponent {
  form: FormGroup;
  isGenerating = signal<boolean>(false);
  suggestedTasks = signal<any[]>([]);
  selectedTasks = signal<any[]>([]);
  summary: string = '';
  recommendations: string = '';
  error = signal<string | null>(null);

  constructor(
    public dialogRef: MatDialogRef<ChatPlannerModalComponent>,
    @Optional() @Inject(DIALOG_DATA) public data: any,
    private plannerService: PlannerService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      userInput: ['', [Validators.required, Validators.maxLength(500)]]
    });
  }

  generatePlan(): void {
    if (this.form.invalid) return;
    
    this.isGenerating.set(true);
    this.error.set(null);
    const userInput = this.form.get('userInput')?.value;
    const dateStr = this.data.currentDate.toISOString().split('T')[0];

    this.plannerService.generatePlanFromChat(userInput, dateStr).subscribe({
      next: (response) => {
        this.suggestedTasks.set(response.suggestedTasks || []);
        this.summary = response.summary || 'Plan generated from your input';
        this.recommendations = response.recommendations || '';
        this.isGenerating.set(false);
      },
      error: (err) => {
        console.error('Failed to generate plan:', err);
        this.error.set('Failed to generate plan. Please try again.');
        this.isGenerating.set(false);
      }
    });
  }

  toggleTaskSelection(index: number): void {
    const task = this.suggestedTasks()[index];
    const current = this.selectedTasks();
    const existingIndex = current.findIndex(t => t.title === task.title);
    
    if (existingIndex >= 0) {
      this.selectedTasks.set(current.filter((_, i) => i !== existingIndex));
    } else {
      this.selectedTasks.set([...current, task]);
    }
  }

  isTaskSelected(index: number): boolean {
    const task = this.suggestedTasks()[index];
    return this.selectedTasks().some(t => t.title === task.title);
  }

  confirmSelection(): void {
    if (this.selectedTasks().length === 0) return;
    this.dialogRef.close(this.selectedTasks());
  }

  getPriorityLabel(priority: number): string {
    switch(priority) {
      case 0: return 'Low';
      case 1: return 'Medium';
      case 2: return 'High';
      default: return 'Unknown';
    }
  }
}

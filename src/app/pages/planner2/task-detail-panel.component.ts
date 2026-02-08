import { Component, input, Output, EventEmitter, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { PlannerTask, TaskStatus } from '../../models/api';
import { PlannerService } from '../../services/task.service';

@Component({
  selector: 'app-task-detail-panel',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatCardModule,
    MatProgressBarModule
  ],
  template: `
    <div class="detail-panel" *ngIf="task(); else noSelection">
      <div class="panel-header">
        <h2>Task Details</h2>
      </div>

      <form [formGroup]="taskForm">
        <mat-accordion class="detail-sections">
          <!-- Basic Info -->
          <mat-expansion-panel expanded="true">
            <mat-expansion-panel-header>
              <mat-panel-title>
                <mat-icon>info</mat-icon>
                Basic Information
              </mat-panel-title>
            </mat-expansion-panel-header>

            <div class="form-group">
              <mat-form-field>
                <mat-label>Title</mat-label>
                <input matInput formControlName="title">
              </mat-form-field>
            </div>

            <div class="form-group">
              <mat-form-field>
                <mat-label>Description</mat-label>
                <textarea matInput formControlName="description" rows="4"></textarea>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field>
                <mat-label>Category</mat-label>
                <input matInput formControlName="category">
              </mat-form-field>
              <mat-form-field>
                <mat-label>Priority</mat-label>
                <mat-select formControlName="priority">
                  <mat-option value="0">Low</mat-option>
                  <mat-option value="1">Medium</mat-option>
                  <mat-option value="2">High</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
          </mat-expansion-panel>

          <!-- Schedule -->
          <mat-expansion-panel>
            <mat-expansion-panel-header>
              <mat-panel-title>
                <mat-icon>schedule</mat-icon>
                Schedule
              </mat-panel-title>
            </mat-expansion-panel-header>

            <div class="form-row">
              <mat-form-field>
                <mat-label>Start Date</mat-label>
                <input matInput [matDatepicker]="startDatePicker" formControlName="startDate">
                <mat-datepicker-toggle matSuffix [for]="startDatePicker"></mat-datepicker-toggle>
                <mat-datepicker #startDatePicker></mat-datepicker>
              </mat-form-field>
              <mat-form-field>
                <mat-label>Start Time</mat-label>
                <input matInput type="time" formControlName="startTime">
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field>
                <mat-label>Duration (hours)</mat-label>
                <input matInput type="number" formControlName="duration">
              </mat-form-field>
              <mat-form-field>
                <mat-label>Deadline</mat-label>
                <input matInput [matDatepicker]="deadlinePicker" formControlName="deadline">
                <mat-datepicker-toggle matSuffix [for]="deadlinePicker"></mat-datepicker-toggle>
                <mat-datepicker #deadlinePicker></mat-datepicker>
              </mat-form-field>
            </div>
          </mat-expansion-panel>

          <!-- Status -->
          <mat-expansion-panel>
            <mat-expansion-panel-header>
              <mat-panel-title>
                <mat-icon>check_circle</mat-icon>
                Status
              </mat-panel-title>
            </mat-expansion-panel-header>

            <div class="status-buttons">
              <button mat-stroked-button type="button"
                      [class.active]="getTaskStatus() === 0"
                      (click)="setStatus(0)">
                To Do
              </button>
              <button mat-stroked-button type="button"
                      [class.active]="getTaskStatus() === 1"
                      (click)="setStatus(1)">
                In Progress
              </button>
              <button mat-stroked-button type="button"
                      [class.active]="getTaskStatus() === 2"
                      (click)="setStatus(2)">
                Done
              </button>
            </div>

            <div *ngIf="showProcrastinationAlert()"
                 class="procrastination-alert">
              <mat-icon>warning</mat-icon>
              <span>This high-priority task has been rescheduled {{ getTaskRescheduleCount() }} times. Consider completing it today!</span>
            </div>
          </mat-expansion-panel>

          <!-- History -->
          <mat-expansion-panel *ngIf="hasHistory()">
            <mat-expansion-panel-header>
              <mat-panel-title>
                <mat-icon>history</mat-icon>
                Task History
              </mat-panel-title>
            </mat-expansion-panel-header>

            <div class="history-list">
              <div class="history-item" *ngFor="let event of getTaskHistory()">
                <div class="history-time">{{ event.timestamp | date: 'short' }}</div>
                <div class="history-action">{{ event.action }}</div>
                <div class="history-description">{{ event.description }}</div>
              </div>
            </div>
          </mat-expansion-panel>
        </mat-accordion>
      </form>

      <div class="panel-actions">
        <button mat-raised-button color="primary" (click)="onSave()" [disabled]="isLoading()">
          {{ isLoading() ? 'Saving...' : 'Save' }}
        </button>
        <button mat-stroked-button (click)="cancelEdit.emit()">Cancel</button>
        <button mat-stroked-button color="warn" (click)="onDelete()">Delete</button>
      </div>
    </div>

    <ng-template #noSelection>
      <div class="no-selection">
        <mat-icon>description</mat-icon>
        <p>Select a task to view details</p>
      </div>
    </ng-template>
  `,
  styles: [`
    .detail-panel {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: white;
      border-left: 1px solid #e0e0e0;
    }

    .panel-header {
      padding: 16px;
      border-bottom: 1px solid #e0e0e0;
    }

    .panel-header h2 {
      margin: 0;
      font-size: 18px;
    }

    form {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
    }

    .detail-sections {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    mat-expansion-panel-header {
      background: #fafafa;
    }

    .form-group {
      margin-bottom: 12px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 12px;
    }

    mat-form-field {
      width: 100%;
    }

    .status-buttons {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin: 12px 0;
    }

    button.active {
      color: white;
      background: #1976d2;
    }

    .procrastination-alert {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #fff3e0;
      border-left: 4px solid #ff6f00;
      margin-top: 12px;
      color: #e65100;
    }

    .history-list {
      max-height: 300px;
      overflow-y: auto;
      position: relative;
      padding-left: 32px;

      &::before {
        content: '';
        position: absolute;
        left: 12px;
        top: 24px;
        bottom: 0;
        width: 2px;
        background: linear-gradient(to bottom, #1976d2, #ff9800, #4caf50);
      }
    }

    .history-item {
      padding: 12px 0 12px 16px;
      border-bottom: none;
      font-size: 12px;
      position: relative;
      margin-left: -32px;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 16px;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: white;
        border: 3px solid #1976d2;
        box-shadow: 0 0 0 2px white;
      }

      &.status-changed::before {
        border-color: #1976d2;
        background: #1976d2;
      }

      &.rescheduled::before {
        border-color: #ff9800;
        background: #ff9800;
      }

      &.created::before {
        border-color: #4caf50;
        background: #4caf50;
      }

      &.deleted::before {
        border-color: #f44336;
        background: #f44336;
      }
    }

    .history-time {
      font-weight: 500;
      color: #666;
      font-size: 11px;
      display: block;
      margin-bottom: 4px;
    }

    .history-action {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #1976d2;
      font-weight: 500;
      margin-bottom: 4px;

      mat-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
      }
    }

    .history-description {
      color: #999;
      font-size: 11px;
      line-height: 1.4;
    }

    .panel-actions {
      padding: 16px;
      border-top: 1px solid #e0e0e0;
      display: flex;
      gap: 8px;
    }

    .no-selection {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #999;
    }

    .no-selection mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      opacity: 0.5;
      margin-bottom: 12px;
    }
  `]
})
export class TaskDetailPanelComponent implements OnInit {
  task = input<PlannerTask | null>(null);
  @Output() taskUpdated = new EventEmitter<PlannerTask>();
  @Output() taskDeleted = new EventEmitter<PlannerTask>();
  @Output() cancelEdit = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private plannerService = inject(PlannerService);

  isLoading = signal(false);
  taskForm: FormGroup;

  constructor() {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      category: [''],
      priority: [0],
      startDate: [''],
      startTime: [''],
      duration: [0],
      deadline: ['']
    });
  }

  ngOnInit() {
    const task = this.task();
    if (task) {
      this.updateFormFromTask(task);
    }
  }

  private updateFormFromTask(task: PlannerTask) {
    this.taskForm.patchValue({
      title: task.title,
      description: task.description,
      category: task.category,
      priority: task.priority,
      startDate: task.startDate ? new Date(task.startDate) : '',
      startTime: task.startTime,
      duration: task.duration,
      deadline: task.deadline ? new Date(task.deadline) : '',
      status: task.status
    }, { emitEvent: false });
  }

  hasHistory(): boolean {
    const task = this.task();
    return !!(task && task.taskHistory && task.taskHistory.length > 0);
  }

  getTaskHistory() {
    const task = this.task();
    return task?.taskHistory || [];
  }

  getTaskStatus(): number {
    return this.task()?.status ?? 0;
  }

  getTaskRescheduleCount(): number {
    return this.task()?.rescheduleCount ?? 0;
  }

  showProcrastinationAlert(): boolean {
    const task = this.task();
    if (!task) return false;
    return (task.rescheduleCount ?? 0) >= 3 && task.priority === 2;
  }

  setStatus(status: number) {
    this.taskForm.patchValue({ status });
  }

  onSave() {
    if (this.taskForm.valid && this.task()) {
      this.isLoading.set(true);
      const task = this.task()!;
      const formValue = this.taskForm.value;
      
      const updatedTask: PlannerTask = {
        ...task,
        title: formValue.title,
        description: formValue.description,
        category: formValue.category,
        priority: Number(formValue.priority),
        status: formValue.status,
        startDate: formValue.startDate ? new Date(formValue.startDate).toISOString().split('T')[0] : task.startDate,
        startTime: formValue.startTime,
        duration: formValue.duration ? Number(formValue.duration) : task.duration,
        deadline: formValue.deadline ? new Date(formValue.deadline).toISOString().split('T')[0] : task.deadline
      };

      this.plannerService.updateTask(task.id as string, updatedTask).subscribe({
        next: (updated) => {
          this.taskUpdated.emit(updated);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Failed to update task:', err);
          this.isLoading.set(false);
        }
      });
    }
  }

  onDelete() {
    const task = this.task();
    if (!task) return;

    if (confirm('Are you sure you want to delete this task?')) {
      this.isLoading.set(true);
      this.plannerService.deleteTask(task.id as string).subscribe({
        next: () => {
          this.taskDeleted.emit(task);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Failed to delete task:', err);
          this.isLoading.set(false);
        }
      });
    }
  }
}

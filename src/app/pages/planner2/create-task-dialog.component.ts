import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { PlannerService } from '../../services/task.service';
import { PlannerTaskCreateDto, TaskStatus } from '../../models/api';

@Component({
  selector: 'app-create-task-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule
  ],
  template: `
    <div class="create-task-dialog">
      <!-- Header -->
      <div class="dialog-header">
        <h2>➕ Create New Task</h2>
        <button mat-icon-button (click)="dialogRef.close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Loading bar -->
      <mat-progress-bar *ngIf="isLoading()" mode="indeterminate"></mat-progress-bar>

      <!-- Form -->
      <form [formGroup]="taskForm" (ngSubmit)="onSubmit()" class="task-form">
        <!-- Title -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Task Title</mat-label>
          <input matInput formControlName="title" placeholder="What needs to be done?">
          <mat-error *ngIf="taskForm.get('title')?.hasError('required')">
            Title is required
          </mat-error>
        </mat-form-field>

        <!-- Description -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="3" placeholder="Add details..."></textarea>
        </mat-form-field>

        <!-- Row: Category + Priority -->
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Category</mat-label>
            <mat-select formControlName="category">
              <mat-option value="Work">Work</mat-option>
              <mat-option value="Personal">Personal</mat-option>
              <mat-option value="Health">Health</mat-option>
              <mat-option value="Finance">Finance</mat-option>
              <mat-option value="Shopping">Shopping</mat-option>
              <mat-option value="General">General</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Priority</mat-label>
            <mat-select formControlName="priority">
              <mat-option [value]="1">
                <span class="priority-label high">🔴 High</span>
              </mat-option>
              <mat-option [value]="2">
                <span class="priority-label medium">🟡 Medium</span>
              </mat-option>
              <mat-option [value]="3">
                <span class="priority-label low">🟢 Low</span>
              </mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <!-- Row: Date + Time -->
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Start Date</mat-label>
            <input matInput [matDatepicker]="picker" formControlName="startDate">
            <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Time (HH:MM)</mat-label>
            <input matInput type="time" formControlName="startTime" placeholder="09:00">
          </mat-form-field>
        </div>

        <!-- Row: Duration -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Estimated Duration (minutes)</mat-label>
          <input matInput type="number" formControlName="duration" placeholder="60" min="5" step="5">
        </mat-form-field>

        <!-- Duration Suggestion Buttons -->
        <div class="duration-suggestions">
          <span>Quick duration:</span>
          <button type="button" mat-stroked-button (click)="setDuration(15)">15 min</button>
          <button type="button" mat-stroked-button (click)="setDuration(30)">30 min</button>
          <button type="button" mat-stroked-button (click)="setDuration(60)">1 hour</button>
          <button type="button" mat-stroked-button (click)="setDuration(120)">2 hours</button>
        </div>

        <!-- Actions -->
        <div class="dialog-actions">
          <button type="button" mat-stroked-button (click)="dialogRef.close()">
            Cancel
          </button>
          <button type="submit" mat-raised-button color="primary" [disabled]="!taskForm.valid || isLoading()">
            <mat-icon>add</mat-icon>
            Create Task
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .create-task-dialog {
      width: 500px;
      max-height: 90vh;
      overflow-y: auto;
      padding: 0;

      @media (max-width: 600px) {
        width: 100%;
        max-width: calc(100vw - 32px);
      }
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px;
      background: linear-gradient(90deg, #1e90ff, #2aa6ff);
      color: white;
      margin: -16px -16px 0 -16px;
      border-bottom: 2px solid #bfdbfe;

      h2 {
        font-size: 1.5rem;
        font-weight: 700;
        margin: 0;
      }

      button {
        color: white;
      }
    }

    mat-progress-bar {
      margin: -16px -16px 0 -16px;
      width: calc(100% + 32px);
    }

    .task-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 24px;

      mat-form-field {
        width: 100%;
      }

      .full-width {
        width: 100%;
      }
    }

    .form-row {
      display: flex;
      gap: 12px;
      width: 100%;

      mat-form-field {
        flex: 1;
      }

      @media (max-width: 600px) {
        flex-direction: column;
        gap: 16px;

        mat-form-field {
          width: 100%;
        }
      }
    }

    .duration-suggestions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      padding: 12px;
      background: #f0f7ff;
      border-radius: 8px;
      border: 1px solid #bfdbfe;

      span {
        font-size: 0.9rem;
        color: #666;
        font-weight: 600;
        flex-basis: 100%;
      }

      button {
        font-size: 0.85rem;
        height: 32px;
        border-color: #2aa6ff;
        color: #2aa6ff;

        &:hover {
          background: #2aa6ff;
          color: white;
        }
      }
    }

    .priority-label {
      display: flex;
      align-items: center;
      gap: 8px;

      &.high { color: #ef4444; }
      &.medium { color: #f59e0b; }
      &.low { color: #10b981; }
    }

    .dialog-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      padding-top: 12px;
      border-top: 1px solid #e5e7eb;
      margin-top: 12px;

      button {
        min-width: 100px;
      }
    }
  `]
})
export class CreateTaskDialogComponent implements OnInit {
  dialogRef = inject(MatDialogRef<CreateTaskDialogComponent>);
  private plannerService = inject(PlannerService);
  private fb = inject(FormBuilder);

  taskForm!: FormGroup;
  isLoading = signal(false);

  ngOnInit() {
    this.initializeForm();
  }

  private initializeForm() {
    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      category: ['Work'],
      priority: [2], // Default to medium
      startDate: [today, Validators.required],
      startTime: [currentTime],
      duration: [60] // Default 1 hour
    });
  }

  setDuration(minutes: number) {
    this.taskForm.patchValue({ duration: minutes });
  }

  onSubmit() {
    if (!this.taskForm.valid) return;

    this.isLoading.set(true);
    const formValue = this.taskForm.value;

    const taskDto: PlannerTaskCreateDto = {
      title: formValue.title,
      description: formValue.description || undefined,
      category: formValue.category,
      priority: formValue.priority,
      startDate: formValue.startDate,
      startTime: formValue.startTime,
      duration: formValue.duration,
      status: TaskStatus.NotStarted
    };

    this.plannerService.addTask(taskDto).subscribe({
      next: (task) => {
        this.isLoading.set(false);
        this.dialogRef.close(task);
      },
      error: (err) => {
        console.error('Failed to create task', err);
        this.isLoading.set(false);
      }
    });
  }
}

import { Component, input, output, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TimePickerDialogComponent } from './time-picker/time-picker.component';
import { PlannerService } from '../../../../services/task.service';

enum TaskStatus {
  NotStarted = 0,
  InProgress = 1,
  Completed = 2,
  OnHold = 3,
  Cancelled = 4
}

export interface NewTaskData {
  title: string;
  description?: string;
  startDate?: string;        // Calendar day picker
  endDate?: string;          // Calendar day picker
  startTime?: string;        // Time picker HH:mm format
  duration?: number;         // Minutes
  priority?: number;
  status?: TaskStatus;
  category: string;
}

@Component({
  selector: 'app-add-task-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatDialogModule
  ],
  templateUrl: './add-task-form.component.html',
  styleUrls: ['./add-task-form.component.scss']
})
export class AddTaskFormComponent implements OnInit {
  private dialog = inject(MatDialog);
  private dialogData = inject(MAT_DIALOG_DATA, { optional: true });
  private dialogRef = inject(MatDialogRef<AddTaskFormComponent>, { optional: true });
  private plannerService = inject(PlannerService);

  selectedDate = input<Date | null>(null);
  categories = input<Array<{id: string; name: string; color: string}>>([]);
  
  // Default categories
  defaultCategories: Array<{id: string; name: string; color: string}> = [
    { id: 'study', name: 'Study', color: '#1976D2' },
    { id: 'work', name: 'Work', color: '#FF6F00' },
    { id: 'personal', name: 'Personal', color: '#D32F2F' },
    { id: 'health', name: 'Health', color: '#388E3C' },
    { id: 'shopping', name: 'Shopping', color: '#7B1FA2' }
  ];
  
  // Signal to hold dialog data's date if passed via MAT_DIALOG_DATA
  dialogDateSignal = signal<Date | null>(null);
  isRescheduleMode = signal(false);
  rescheduleTaskId: string | null = null;
  
  taskSave = output<NewTaskData>();
  taskCancel = output<void>();

  newTaskTitle = '';
  newTaskDescription = '';
  newTaskPriority = 1;
  newTaskStatus: TaskStatus = TaskStatus.NotStarted;
  newTaskCategory = 'study';
  newTaskStartDateObj: Date | null = null;  // Date object for Material datepicker
  newTaskEndDateObj: Date | null = null;    // Date object for Material datepicker
  newTaskStartDate = '';                     // ISO string for emit
  newTaskEndDate = '';                       // ISO string for emit
  newTaskStartTime = '09:00';                // Time picker (HH:mm)
  newTaskDuration = 60;                      // Default 60 minutes
  hasTime = true;                            // Whether task has a specific time

  ngOnInit() {
    // If dialog data is provided, use it to set the selected date or load task for reschedule
    if (this.dialogData) {
      if (this.dialogData.mode === 'reschedule' && this.dialogData.task) {
        // Load task data for rescheduling
        this.isRescheduleMode.set(true);
        this.rescheduleTaskId = this.dialogData.task.id;
        this.loadTaskForReschedule(this.dialogData.task);
      } else if (this.dialogData.date) {
        // New task mode
        this.dialogDateSignal.set(this.dialogData.date);
        this.newTaskStartDateObj = new Date(this.dialogData.date);
        this.newTaskEndDateObj = new Date(this.dialogData.date);
      }
    }
  }

  private loadTaskForReschedule(task: any) {
    // Populate form with existing task data for rescheduling
    this.newTaskTitle = task.title || '';
    this.newTaskDescription = task.description || '';
    this.newTaskPriority = task.priority ?? 1;
    this.newTaskStatus = task.status ?? 0;
    this.newTaskCategory = task.category || 'study';
    
    // Properly convert date strings to Date objects
    if (task.startDate) {
      this.newTaskStartDateObj = new Date(task.startDate);
      this.newTaskStartDate = task.startDate;
    }
    
    if (task.endDate) {
      this.newTaskEndDateObj = new Date(task.endDate);
      this.newTaskEndDate = task.endDate;
    } else {
      this.newTaskEndDateObj = null;
      this.newTaskEndDate = '';
    }
    
    this.newTaskStartTime = task.startTime || '09:00';
    this.newTaskDuration = task.duration ?? 60;
    this.hasTime = !!task.startTime;
  }

  getSelectedDate(): Date | null {
    return this.selectedDate() ?? this.dialogDateSignal();
  }

  getCategories(): Array<{id: string; name: string; color: string}> {
    const cats = this.categories();
    return cats && cats.length > 0 ? cats : this.defaultCategories;
  }

  taskStatusOptions = [
    { value: TaskStatus.NotStarted, label: 'Not Started' },
    { value: TaskStatus.InProgress, label: 'In Progress' },
    { value: TaskStatus.Completed, label: 'Completed' },
    { value: TaskStatus.OnHold, label: 'On Hold' },
    { value: TaskStatus.Cancelled, label: 'Cancelled' }
  ];

  onSave() {
    if (!this.newTaskTitle.trim()) return;
    
    // Convert Date objects to ISO strings
    if (this.newTaskStartDateObj) {
      this.newTaskStartDate = this.newTaskStartDateObj.toISOString().split('T')[0];
    }
    if (this.newTaskEndDateObj) {
      this.newTaskEndDate = this.newTaskEndDateObj.toISOString().split('T')[0];
    }
    
    const taskData = {
      title: this.newTaskTitle,
      description: this.newTaskDescription,
      priority: Number(this.newTaskPriority),
      status: this.newTaskStatus,
      category: this.newTaskCategory,
      startDate: this.newTaskStartDate || undefined,
      endDate: this.newTaskEndDate || undefined,
      startTime: this.hasTime ? this.newTaskStartTime : undefined,
      duration: this.hasTime ? Number(this.newTaskDuration) : undefined
    };

    if (this.isRescheduleMode() && this.rescheduleTaskId) {
      // Update existing task (reschedule)
      this.plannerService.updateTask(this.rescheduleTaskId, taskData).subscribe({
        next: (updatedTask: any) => {
          this.taskSave.emit(taskData);
          if (this.dialogRef) {
            this.dialogRef.close(taskData);
          }
          this.resetForm();
        },
        error: (error: any) => {
          console.error('Failed to reschedule task:', error);
          this.taskSave.emit(taskData);
          if (this.dialogRef) {
            this.dialogRef.close(taskData);
          }
        }
      });
    } else {
      // Create new task
      this.plannerService.addTask(taskData).subscribe({
        next: (createdTask: any) => {
          this.taskSave.emit(taskData);
          if (this.dialogRef) {
            this.dialogRef.close(taskData);
          }
          this.resetForm();
        },
        error: (error: any) => {
          console.error('Failed to create task:', error);
          this.taskSave.emit(taskData);
          if (this.dialogRef) {
            this.dialogRef.close(taskData);
          }
        }
      });
    }
  }

  onCancel() {
    this.resetForm();
    this.taskCancel.emit();
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }

  openTimePicker() {
    const dialogRef = this.dialog.open(TimePickerDialogComponent, {
      width: '320px',
      disableClose: false
    });

    dialogRef.componentInstance.onConfirm.subscribe((time: {hour: number, minute: number}) => {
      const hour = time.hour.toString().padStart(2, '0');
      const minute = time.minute.toString().padStart(2, '0');
      this.newTaskStartTime = `${hour}:${minute}`;
      dialogRef.close();
    });

    dialogRef.componentInstance.onCancel.subscribe(() => {
      dialogRef.close();
    });
  }

  private resetForm() {
    this.newTaskTitle = '';
    this.newTaskDescription = '';
    this.newTaskPriority = 1;
    this.newTaskStatus = TaskStatus.NotStarted;
    this.newTaskCategory = 'study';
    this.newTaskStartDateObj = null;
    this.newTaskEndDateObj = null;
    this.newTaskStartDate = '';
    this.newTaskEndDate = '';
    this.newTaskStartTime = '09:00';
    this.newTaskDuration = 60;
    this.hasTime = true;
  }
}

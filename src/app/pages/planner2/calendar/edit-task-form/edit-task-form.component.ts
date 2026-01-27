import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

enum TaskStatus {
  NotStarted = 0,
  InProgress = 1,
  Completed = 2,
  OnHold = 3,
  Cancelled = 4
}

export interface EditTaskData {
  id: string | number;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  time: string;
  priority?: number;
  status?: TaskStatus;
  category: string;
}

@Component({
  selector: 'app-edit-task-form',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatIconModule, MatDatepickerModule, MatNativeDateModule],
  templateUrl: './edit-task-form.component.html',
  styleUrls: ['./edit-task-form.component.scss']
})
export class EditTaskFormComponent {
  dialogRef = inject(MatDialogRef<EditTaskFormComponent>);
  data = inject(MAT_DIALOG_DATA);
  
  task: EditTaskData = this.data?.task || {};
  categories = this.data?.categories || [];

  taskTitle = '';
  taskDescription = '';
  taskTime = '09:00';
  taskPriority = 1;
  taskStatus: TaskStatus = TaskStatus.NotStarted;
  taskCategory = 'study';
  taskStartDate = '';
  taskEndDate = '';
  taskStartDateObj: Date | null = null;
  taskEndDateObj: Date | null = null;

  taskStatusOptions = [
    { value: TaskStatus.NotStarted, label: 'Not Started' },
    { value: TaskStatus.InProgress, label: 'In Progress' },
    { value: TaskStatus.Completed, label: 'Completed' },
    { value: TaskStatus.OnHold, label: 'On Hold' },
    { value: TaskStatus.Cancelled, label: 'Cancelled' }
  ];

  constructor() {
    if (this.task) {
      this.taskTitle = this.task.title || '';
      this.taskDescription = this.task.description || '';
      this.taskTime = this.task.time || '09:00';
      this.taskPriority = this.task.priority ?? 1;
      this.taskStatus = this.task.status ?? TaskStatus.NotStarted;
      this.taskCategory = this.task.category || '';
      // Convert ISO date to Date object for datepicker
      this.taskStartDateObj = this.task.startDate ? new Date(this.task.startDate) : null;
      this.taskEndDateObj = this.task.endDate ? new Date(this.task.endDate) : null;
      this.taskStartDate = this.task.startDate || '';
      this.taskEndDate = this.task.endDate || '';
    }
  }

  onStartDateChange() {
    if (this.taskStartDateObj) {
      this.taskStartDate = this.taskStartDateObj.toISOString();
    }
  }

  onEndDateChange() {
    if (this.taskEndDateObj) {
      this.taskEndDate = this.taskEndDateObj.toISOString();
    }
  }

  formatDateForInput(isoDate: string): string {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatDateForApi(dateString: string): string | undefined {
    if (!dateString) return undefined;
    const date = new Date(dateString);
    return date.toISOString();
  }

  onUpdate() {
    if (!this.taskTitle.trim()) return;
    
    // Convert dates to ISO format if they exist
    let startDateIso: string | undefined;
    let endDateIso: string | undefined;
    
    if (this.taskStartDateObj) {
      startDateIso = this.taskStartDateObj.toISOString();
    }
    if (this.taskEndDateObj) {
      endDateIso = this.taskEndDateObj.toISOString();
    }
    
    this.dialogRef.close({
      updated: true,
      data: {
        id: this.task.id,
        title: this.taskTitle,
        description: this.taskDescription,
        time: this.taskTime,
        priority: this.taskPriority,
        status: this.taskStatus,
        category: this.taskCategory,
        startDate: startDateIso,
        endDate: endDateIso
      }
    });
  }

  onDelete() {
    if (confirm('Are you sure you want to delete this task?')) {
      this.dialogRef.close({ deleted: true });
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}

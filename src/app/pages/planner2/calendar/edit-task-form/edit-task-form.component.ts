import { Component, input, output, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

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
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatIconModule],
  templateUrl: './edit-task-form.component.html',
  styleUrls: ['./edit-task-form.component.scss']
})
export class EditTaskFormComponent {
  task = input.required<EditTaskData>();
  categories = input.required<Array<{id: string; name: string; color: string}>>();
  
  taskUpdate = output<EditTaskData>();
  taskDelete = output<string | number>();
  taskCancel = output<void>();

  taskTitle = '';
  taskDescription = '';
  taskTime = '09:00';
  taskPriority = 1;
  taskStatus: TaskStatus = TaskStatus.NotStarted;
  taskCategory = 'study';
  taskStartDate = '';
  taskEndDate = '';

  taskStatusOptions = [
    { value: TaskStatus.NotStarted, label: 'Not Started' },
    { value: TaskStatus.InProgress, label: 'In Progress' },
    { value: TaskStatus.Completed, label: 'Completed' },
    { value: TaskStatus.OnHold, label: 'On Hold' },
    { value: TaskStatus.Cancelled, label: 'Cancelled' }
  ];

  constructor() {
    effect(() => {
      const taskData = this.task();
      this.taskTitle = taskData.title;
      this.taskDescription = taskData.description || '';
      this.taskTime = taskData.time;
      this.taskPriority = taskData.priority ?? 1;
      this.taskStatus = taskData.status ?? TaskStatus.NotStarted;
      this.taskCategory = taskData.category;
      this.taskStartDate = taskData.startDate || '';
      this.taskEndDate = taskData.endDate || '';
    });
  }

  onUpdate() {
    if (!this.taskTitle.trim()) return;
    
    this.taskUpdate.emit({
      id: this.task().id,
      title: this.taskTitle,
      description: this.taskDescription,
      time: this.taskTime,
      priority: this.taskPriority,
      status: this.taskStatus,
      category: this.taskCategory,
      startDate: this.taskStartDate || undefined,
      endDate: this.taskEndDate || undefined
    });
  }

  onDelete() {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskDelete.emit(this.task().id);
    }
  }

  onCancel() {
    this.taskCancel.emit();
  }
}

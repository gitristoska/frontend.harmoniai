import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

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
  startDate?: string;
  endDate?: string;
  time: string;
  priority?: number;
  status?: TaskStatus;
  category: string;
}

@Component({
  selector: 'app-add-task-form',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  templateUrl: './add-task-form.component.html',
  styleUrls: ['./add-task-form.component.scss']
})
export class AddTaskFormComponent {
  selectedDate = input.required<Date>();
  categories = input.required<Array<{id: string; name: string; color: string}>>();
  
  taskSave = output<NewTaskData>();
  taskCancel = output<void>();

  newTaskTitle = '';
  newTaskDescription = '';
  newTaskTime = '09:00';
  newTaskPriority = 1;
  newTaskStatus: TaskStatus = TaskStatus.NotStarted;
  newTaskCategory = 'study';
  newTaskStartDate = '';
  newTaskEndDate = '';

  taskStatusOptions = [
    { value: TaskStatus.NotStarted, label: 'Not Started' },
    { value: TaskStatus.InProgress, label: 'In Progress' },
    { value: TaskStatus.Completed, label: 'Completed' },
    { value: TaskStatus.OnHold, label: 'On Hold' },
    { value: TaskStatus.Cancelled, label: 'Cancelled' }
  ];

  onSave() {
    if (!this.newTaskTitle.trim()) return;
    
    this.taskSave.emit({
      title: this.newTaskTitle,
      description: this.newTaskDescription,
      time: this.newTaskTime,
      priority: this.newTaskPriority,
      status: this.newTaskStatus,
      category: this.newTaskCategory,
      startDate: this.newTaskStartDate || undefined,
      endDate: this.newTaskEndDate || undefined
    });

    // Reset form
    this.resetForm();
  }

  onCancel() {
    this.resetForm();
    this.taskCancel.emit();
  }

  private resetForm() {
    this.newTaskTitle = '';
    this.newTaskDescription = '';
    this.newTaskTime = '09:00';
    this.newTaskPriority = 1;
    this.newTaskStatus = TaskStatus.NotStarted;
    this.newTaskCategory = 'study';
    this.newTaskStartDate = '';
    this.newTaskEndDate = '';
  }
}

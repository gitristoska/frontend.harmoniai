// tasks2.component.ts
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { HttpErrorResponse } from '@angular/common/http';

import { PlannerService } from '../../../services/task.service';
import { PlannerTask, PlannerTaskCreateDto } from '../../../models/api';

@Component({
  selector: 'app-tasks2',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './tasks2.component.html',
  styleUrls: ['./tasks2.component.scss'],
  providers: [PlannerService]
})
export class Tasks2Component {
  heading = signal('Task Manager');
  subtitle = signal('Manage your tasks with login functionality');

  tasks = signal<PlannerTask[]>([]);

  showAddTaskForm = false;
  newTaskTitle = '';
  newTaskTime = '09:00';
  newTaskCategory = 'study';
  newTaskDescription = '';

  categories = [
    { id: 'all', name: 'All Categories', color: '#e5e7eb' },
    { id: 'study', name: 'Study', color: '#3b82f6' },
    { id: 'work', name: 'Work', color: '#a855f7' },
    { id: 'doctor', name: 'Doctor', color: '#ef4444' },
    { id: 'activities', name: 'Activities', color: '#10b981' },
    { id: 'budget', name: 'Budget', color: '#f59e0b' },
    { id: 'meals', name: 'Meals', color: '#f97316' }
  ];

  selectedDate = signal(new Date());

  constructor(private readonly plannerService: PlannerService) {
    this.loadTasks();
  }

  private loadTasks(): void {
    this.plannerService.getTasksForMonth(2026, 1).subscribe({
     next: (tasks) => {
       console.log('Loaded tasks (tasks2):', tasks);
       this.tasks.set(tasks);
     },
     error: (err) => console.error(err) });
  }

  login(): void {
    // Login logic - you can implement authentication here
    console.log('Login button clicked');
    // For now, just show an alert
    alert('Login functionality would be implemented here');
  }

  deleteTask(i: number): void {
    const t = this.tasks();
    const task = t[i];
    if (!task.id) return;

    this.plannerService.deleteTask(task.id).subscribe({
      next: () => {
        t.splice(i, 1);
        this.tasks.set([...t]);
      },
      error: (err: HttpErrorResponse) => console.error('Error deleting task:', err)
    });
  }

  saveNewTask(): void {
    if (!this.newTaskTitle?.trim()) return;

    const dateStr = this.selectedDate().toISOString().split('T')[0];
    const startDateTime = this.newTaskTime
      ? `${dateStr}T${this.newTaskTime}:00.000Z`
      : `${dateStr}T00:00:00.000Z`;

    const taskToAdd: PlannerTaskCreateDto = {
      title: this.newTaskTitle,
      description: this.newTaskDescription,
      startDate: startDateTime,
      priority: 1, // default
      category: this.newTaskCategory
    };

    this.plannerService.addTask(taskToAdd).subscribe({
      next: (response: PlannerTask) => {
        const t = this.tasks();
        t.push(response);
        this.tasks.set([...t]);
        this.cancelAddTask();
      },
      error: (err: HttpErrorResponse) => console.error('Error adding task:', err)
    });
  }

  cancelAddTask(): void {
    this.showAddTaskForm = false;
    this.newTaskTitle = '';
    this.newTaskTime = '09:00';
    this.newTaskCategory = 'study';
    this.newTaskDescription = '';
  }
}
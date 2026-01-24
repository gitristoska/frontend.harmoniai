// tasks.component.ts
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
  selector: 'app-tasks',
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
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss'],
  providers: [PlannerService] // <-- injection fixed
})
export class TasksComponent {
  heading = signal('Daily Planner');
  subtitle = signal('Organize and prioritize your tasks for maximum productivity');

  tasks = signal<PlannerTask[]>([]);

  showForm = false;
  newTask: { title: string; time: string; date: string; category: string; priority: number; description: string } = {
    title: '',
    time: '',
    date: '',
    category: 'work',
    description: '',
    priority: 1
  };

  constructor(private readonly plannerService: PlannerService) {
    this.loadTasks();
  }

  private loadTasks(): void {
    this.plannerService.getTasksForMonth(2026, 1).subscribe({
     next: (tasks) => {
       console.log('Loaded tasks:', tasks);
       this.tasks.set(tasks);
     },
     error: (err) => console.error(err) });
  }

  addNewTask(): void {
    this.showForm = true;
  }

  submitAddTask(): void {
    if (!this.newTask.title?.trim() || !this.newTask.date) return;

    const startDateTime = this.newTask.time
      ? `${this.newTask.date}T${this.newTask.time}:00.000Z`
      : `${this.newTask.date}T00:00:00.000Z`;

    const taskToAdd: PlannerTaskCreateDto = {
      title: this.newTask.title,
      description: this.newTask.description,
      startDate: startDateTime,
      priority: this.newTask.priority,
      category: this.newTask.category
    };

    this.plannerService.addTask(taskToAdd).subscribe({
      next: (response: PlannerTask) => {
        const t = this.tasks();
        t.push(response);
        this.tasks.set([...t]);
        this.resetForm();
      },
      error: (err: HttpErrorResponse) => console.error('Error adding task:', err)
    });
  }

  cancelNewTask(): void {
    this.resetForm();
  }

  private resetForm(): void {
    this.newTask = { title: '', time: '', date: '', category: 'work', priority: 1 , description: '' };
    this.showForm = false;
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
}

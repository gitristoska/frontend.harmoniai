import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { PlannerService } from '../../services/task.service';
import { PlannerTask, PlannerTaskCreateDto } from '../../models/api';

@Component({
  selector: 'app-planner',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './planner.html',
  styleUrls: ['./planner.scss']
})
export class Planner {
  protected readonly heading = signal('Daily Planner');
  protected readonly subtitle = signal('Organize and prioritize your tasks for maximum productivity');

  protected readonly aiSuggestion = signal({
    title: 'AI Schedule Optimization',
    desc: 'Based on your tasks, I recommend tackling high-priority items first thing in the morning when energy levels are highest.'
  });

  protected readonly tasks = signal<PlannerTask[]>([]);

  // New task form state
  showForm = false;
  newTask: {
    title: string;
    description: string;
    date: string;
    time: string;
    category: string;
    priority: 'low' | 'medium' | 'high';
  } = {
    title: '',
    description: '',
    date: '',
    time: '',
    category: 'work',
    priority: 'medium'
  };

  constructor(private plannerService: PlannerService) {
    this.loadTasks();
  }

  private loadTasks() {
    this.plannerService.getTasksForMonth(2026, 1).subscribe({
      next: (tasks) => this.tasks.set(tasks),
      error: (err) => console.error('Error loading tasks:', err)
    });
  }

  addNewTask() {
    this.showForm = true;
  }

  submitAddTask() {
    if (!this.newTask.title?.trim() || !this.newTask.date) return;

    const scheduledAt = this.newTask.time
      ? `${this.newTask.date}T${this.newTask.time}`
      : `${this.newTask.date}T00:00`;

    const taskToAdd: PlannerTaskCreateDto = {
      title: this.newTask.title,
      description: this.newTask.description,
      scheduledAt,
      priority: this.newTask.priority === 'low' ? 0 : this.newTask.priority === 'medium' ? 1 : 2,
      category: this.newTask.category
    };

    this.plannerService.addTask(taskToAdd).subscribe({
      next: (response) => {
        const t = this.tasks();
        t.push(response);
        this.tasks.set([...t]);
        this.resetForm();
      },
      error: (err) => console.error('Error adding task:', err)
    });
  }

  cancelNewTask() {
    this.resetForm();
  }

  private resetForm() {
    this.newTask = {
      title: '',
      description: '',
      date: '',
      time: '',
      category: 'work',
      priority: 'medium'
    };
    this.showForm = false;
  }

  deleteTask(i: number) {
    const t = this.tasks();
    const task = t[i];
    this.plannerService.deleteTask(task.id as number).subscribe({
      next: () => {
        t.splice(i, 1);
        this.tasks.set([...t]);
      },
      error: (err) => console.error('Error deleting task:', err)
    });
  }

  toggleDone(i: number) {
    const t = this.tasks();
    t[i].isDone = !t[i].isDone;
    this.tasks.set([...t]);
  }
}

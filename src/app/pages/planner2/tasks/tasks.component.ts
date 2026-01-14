import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
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
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent {
  protected readonly heading = signal('Daily Planner');
  protected readonly subtitle = signal('Organize and prioritize your tasks for maximum productivity');

  protected readonly aiSuggestion = signal({
    title: 'AI Schedule Optimization',
    desc: 'Based on your tasks, I recommend tackling high-priority items first thing in the morning when energy levels are highest.'
  });

  constructor(private plannerService: PlannerService) {
    this.loadTasks();
  }

  protected readonly tasks = signal<PlannerTask[]>([]);

  private loadTasks() {
    this.plannerService.getTasks().subscribe({
      next: (response) => {
        if (response && response.plannerTasks) {
          this.tasks.set(response.plannerTasks);
        }
      },
      error: (err) => console.error('Error loading tasks:', err)
    });
  }

  // New task form state
  showForm = false;
  newTask: any = { title: '', time: '', date: '', category: 'work', priority: 1, isDone: false };

  addNewTask() { this.showForm = true; }

  submitAddTask() {
    if (!this.newTask.title || !this.newTask.title.trim()) return;
    if (!this.newTask.date) return;
    
    const taskToAdd: PlannerTaskCreateDto = {
      title: this.newTask.title,
      time: this.newTask.time || '',
      date: this.newTask.date,
      category: this.newTask.category,
      priority: typeof this.newTask.priority === 'string' ? (this.newTask.priority === 'low' ? 0 : this.newTask.priority === 'medium' ? 1 : 2) : this.newTask.priority,
      done: false
    };
    
    this.plannerService.addTask(taskToAdd).subscribe({
      next: (response) => {
        const t = this.tasks();
        t.push({ ...this.newTask });
        this.tasks.set([...t]);
        this.resetForm();
      },
      error: (err) => console.error('Error adding task:', err)
    });
  }

  cancelNewTask() { this.resetForm(); }

  private resetForm() {
    this.newTask = { title: '', time: '', date: '', category: 'work', priority: 1, isDone: false };
    this.showForm = false;
  }

  deleteTask(i: number) {
    const t = this.tasks();
    t.splice(i, 1);
    this.tasks.set([...t]);
  }

  toggleDone(i: number) {
    const t = this.tasks();
    t[i].isDone = !t[i].isDone;
    this.tasks.set([...t]);
  }
}

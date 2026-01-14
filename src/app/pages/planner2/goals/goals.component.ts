import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

export interface Goal {
  title: string;
  category?: string;
  priority?: 'low'|'medium'|'high';
  deadline?: string;
  completed?: boolean;
}

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './goals.component.html',
  styleUrls: ['./goals.component.scss']
})
export class GoalsComponent {
  heading = signal('Your Goals');
  subtitle = signal('Track and achieve your personal or work objectives');

  goals = signal<Goal[]>([
    { title: 'Finish diploma project', category: 'Study', priority: 'high', deadline: '2025-12-31', completed: false },
    { title: 'Start workout plan', category: 'Health', priority: 'medium', deadline: '2025-12-15', completed: false }
  ]);

  showForm = false;
  newGoal: Goal = { title: '', category: 'Work', priority: 'medium', deadline: '', completed: false };

  addNewGoal() { this.showForm = true; }
  submitAddGoal() {
    if (!this.newGoal.title?.trim()) return;
    const g = this.goals();
    g.push({ ...this.newGoal });
    this.goals.set([...g]);
    this.resetForm();
  }
  cancelNewGoal() { this.resetForm(); }
  private resetForm() {
    this.newGoal = { title: '', category: 'Work', priority: 'medium', deadline: '', completed: false };
    this.showForm = false;
  }
  toggleCompleted(i: number) {
    const g = this.goals();
    g[i].completed = !g[i].completed;
    this.goals.set([...g]);
  }
  deleteGoal(i: number) {
    const g = this.goals();
    g.splice(i, 1);
    this.goals.set([...g]);
  }
}

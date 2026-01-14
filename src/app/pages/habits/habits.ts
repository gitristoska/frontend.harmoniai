import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { HabitService } from '../../services/habit.service';
import { Habit, HabitCreateDto, HabitUpdateDto } from '../../models/habit.model';

@Component({
  selector: 'app-habits',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule
  ],
  templateUrl: './habits.html',
  styleUrls: ['./habits.scss']
})
export class Habits implements OnInit {

  days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  habits: Habit[] = [];

  showForm = false;
  formName = '';
  editId: string | null = null;

  constructor(private habitService: HabitService) {}

  ngOnInit() {
    this.loadHabits();
  }

  // ===========================
  // BACKEND CALLS
  // ===========================

  loadHabits() {
    this.habitService.getAll().subscribe({
      next: (data) => this.habits = data,
      error: (err) => console.error('Failed to load habits', err)
    });
  }

  saveHabit() {
    const name = this.formName.trim();
    if (!name) return;

    if (this.editId) {
      // UPDATE
      const dto: HabitUpdateDto = {
        name,
        days: this.habits.find(h => h.id === this.editId)!.days
      };

      this.habitService.update(this.editId, dto).subscribe({
        next: () => this.loadHabits(),
        error: (err) => console.error('Update failed', err)
      });
    } else {
      // CREATE
      const dto: HabitCreateDto = {
        name,
        days: [false, false, false, false, false, false, false]
      };

      this.habitService.create(dto).subscribe({
        next: () => this.loadHabits(),
        error: (err) => console.error('Create failed', err)
      });
    }

    this.cancelForm();
  }

  deleteHabit(id: string) {
    this.habitService.delete(id).subscribe({
      next: () => {
        this.habits = this.habits.filter(h => h.id !== id);
      },
      error: (err) => console.error('Delete failed', err)
    });
  }

  // ===========================
  // UI LOGIC
  // ===========================

  toggleDay(habitIndex: number, dayIndex: number) {
    const h = this.habits[habitIndex];
    h.days[dayIndex] = !h.days[dayIndex];

    const dto: HabitUpdateDto = {
      name: h.name,
      days: [...h.days]
    };

    this.habitService.update(h.id, dto).subscribe({
      error: (err) => console.error('Toggle day failed', err)
    });
  }

  startAdd() {
    this.showForm = true;
    this.formName = '';
    this.editId = null;
  }

  startEdit(h: Habit) {
    this.showForm = true;
    this.formName = h.name;
    this.editId = h.id;
  }

  cancelForm() {
    this.showForm = false;
    this.formName = '';
    this.editId = null;
  }

  // Progress calculation
  habitCompletion(h: Habit) {
    const done = h.days.filter(Boolean).length;
    return done / 7;
  }

  daysDone(h: Habit) {
    return h.days.filter(Boolean).length;
  }

  weeklyCompletionPercent() {
    if (!this.habits.length) return 0;
    const sum = this.habits.reduce((acc, h) => acc + this.habitCompletion(h), 0);
    return Math.round((sum / this.habits.length) * 100);
  }
}

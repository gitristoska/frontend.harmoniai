import { Component, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { HabitService } from '../../../../services/habit.service';
import { Habit } from '../../../../models/habit.model';

interface HabitCompletion {
  habitId: string;
  habitName: string;
  days: { day: string; completed: boolean }[];
}

@Component({
  selector: 'app-weekly-habits-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatCheckboxModule,
    MatButtonModule
  ],
  templateUrl: './weekly-habits-card.component.html',
  styleUrls: ['./weekly-habits-card.component.scss']
})
export class WeeklyHabitsCardComponent {
  currentDate = input<Date>(new Date());

  habits = signal<Habit[]>([]);
  habitCompletions = signal<Map<string, boolean[]>>(new Map());
  isLoading = signal(false);
  dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  constructor(private habitService: HabitService) {
    this.loadHabits();
  }

  private loadHabits() {
    this.isLoading.set(true);
    this.habitService.getAll().subscribe({
      next: (data: Habit[]) => {
        this.habits.set(data);
        // Initialize completion map (all false for now - TODO: load actual completion data)
        const completions = new Map<string, boolean[]>();
        data.forEach((habit: Habit) => {
          completions.set(habit.id || '', Array(7).fill(false));
        });
        this.habitCompletions.set(completions);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error('Error loading habits:', err);
        this.isLoading.set(false);
      }
    });
  }

  toggleHabitDay(habitId: string, dayIndex: number) {
    const completions = this.habitCompletions();
    const habitCompletion = completions.get(habitId);
    if (habitCompletion) {
      habitCompletion[dayIndex] = !habitCompletion[dayIndex];
      completions.set(habitId, [...habitCompletion]);
      this.habitCompletions.set(completions);
      // TODO: Save completion state to backend
    }
  }

  getHabitCompletionForDay(habitId: string, dayIndex: number): boolean {
    return this.habitCompletions().get(habitId)?.[dayIndex] ?? false;
  }

  getCompletedDaysCount(habitId: string): number {
    return (this.habitCompletions().get(habitId) || []).filter(c => c).length;
  }
}

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HabitService } from '../../../../services/habit.service';
import { Habit, HabitUpdateDto } from '../../../../models/habit.model';

@Component({
  selector: 'app-weekly-habits-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
  templateUrl: './weekly-habits-card.component.html',
  styleUrls: ['./weekly-habits-card.component.scss']
})
export class WeeklyHabitsCardComponent implements OnInit {
  habits = signal<Habit[]>([]);
  isLoading = signal(false);
  dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  constructor(private habitService: HabitService) {}

  ngOnInit() {
    this.loadHabits();
  }

  loadHabits() {
    this.isLoading.set(true);
    this.habitService.getAll().subscribe({
      next: (data: Habit[]) => {
        this.habits.set(data);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error('Error loading habits:', err);
        this.isLoading.set(false);
      }
    });
  }

  toggleDay(habit: Habit, dayIndex: number) {
    const newDays = [...habit.days];
    newDays[dayIndex] = !newDays[dayIndex];

    const dto: HabitUpdateDto = {
      name: habit.name,
      days: newDays
    };

    this.habitService.update(habit.id, dto).subscribe({
      next: () => {
        // Update local state
        habit.days[dayIndex] = !habit.days[dayIndex];
        // Trigger signal update
        this.habits.set([...this.habits()]);
      },
      error: (err: any) => console.error('Toggle day failed', err)
    });
  }

  getCompletionPercent(habit: Habit): number {
    const done = habit.days.filter(Boolean).length;
    return Math.round((done / 7) * 100);
  }

  getWeeklyCompletion(): number {
    const allHabits = this.habits();
    if (!allHabits.length) return 0;
    const sum = allHabits.reduce((acc, h) => acc + this.getCompletionPercent(h), 0);
    return Math.round(sum / allHabits.length);
  }

  getDaysDone(habit: Habit): number {
    return habit.days.filter(Boolean).length;
  }
}

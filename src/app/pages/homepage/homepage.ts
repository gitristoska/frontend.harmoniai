import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';

interface TaskItem { title: string; time?: string; tag?: string; priority?: 'low'|'medium'|'high'; done?: boolean }
interface HabitItem { name: string; done?: boolean }
interface AiRec { title: string; desc: string; icon: string }

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatProgressBarModule, MatListModule],
  templateUrl: './homepage.html',
  styleUrls: ['./homepage.scss']
})
export class Homepage {
  protected readonly greeting = signal('Welcome back, User! 👋');

  protected readonly tasksToday = signal<TaskItem[]>([
    { title: 'Review quarterly budget', time: '09:00', tag: 'finance', priority: 'high', done: false },
    { title: 'Study React patterns', time: '14:00', tag: 'study', priority: 'medium', done: false }
  ]);

  protected readonly habits = signal<HabitItem[]>([
    { name: 'Morning Exercise', done: true },
    { name: 'Meditate', done: true },
    { name: 'Read 20 pages', done: false },
    { name: 'Drink 8 glasses of water', done: false }
  ]);

  protected readonly aiRecommendations = signal<AiRec[]>([
    { title: 'Schedule optimization', desc: 'Consider tackling high-priority tasks during your peak productivity hours (9-11 AM).', icon: 'psychology' },
    { title: 'Habit consistency', desc: "You're at 60% today. Keep up the momentum!", icon: 'local_fire_department' },
    { title: 'Balance reminder', desc: "You have several work tasks. Don't forget to schedule breaks and personal time.", icon: 'trending_up' }
  ]);

  get tasksCount() { return this.tasksToday().filter(t => !t.done).length }

  // overall habit completion percent (simple example)
  get habitCompletionPercent() {
    const h = this.habits();
    if (!h.length) return 0;
    const done = h.filter(x => x.done).length;
    return Math.round((done / h.length) * 100);
  }

  toggleTaskDone(i: number) {
    const list = this.tasksToday();
    list[i].done = !list[i].done;
    this.tasksToday.set([...list]);
  }

  toggleHabit(i: number) {
    const list = this.habits();
    list[i].done = !list[i].done;
    this.habits.set([...list]);
  }
}

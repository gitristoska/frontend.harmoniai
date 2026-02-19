import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { AiInsightsService, Recommendation, Reflection, ReflectionResponse } from '../../services/ai-insights.service';

interface DateNavigation {
  label: string;
  date: string;
  isToday: boolean;
}

@Component({
  selector: 'app-insights',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule,
    MatDividerModule
  ],
  templateUrl: './insights.html',
  styleUrls: ['./insights.scss']
})
export class InsightsComponent implements OnInit {
  // Navigation state
  protected readonly selectedTabIndex = signal<number>(0);
  protected readonly currentDate = signal<string>(this.getTodayDate());
  protected readonly currentWeekStart = signal<string>(this.getWeekStart(new Date()));

  // Daily data
  protected readonly dailyReflection = signal<Reflection | null>(null);
  protected readonly dailyReflectionLoading = signal(false);

  // Weekly data
  protected readonly weeklyReflection = signal<Reflection | null>(null);
  protected readonly weeklyReflectionLoading = signal(false);

  // Date navigation
  protected readonly dailyDates = signal<DateNavigation[]>([]);
  protected readonly weeklyDates = signal<DateNavigation[]>([]);

  // UI state
  protected readonly generatingDaily = signal(false);
  protected readonly generatingWeekly = signal(false);

  constructor(private aiInsightsService: AiInsightsService) {}

  ngOnInit(): void {
    this.initializeDateNavigation();
    this.loadDailyData(this.currentDate());
    this.loadWeeklyData(this.currentWeekStart());
  }

  private initializeDateNavigation(): void {
    // Daily dates: today - 6 days to today + 3 days
    const dailyDates: DateNavigation[] = [];
    for (let i = -6; i <= 3; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateStr = this.formatDate(date);
      dailyDates.push({
        label: this.getDateLabel(date),
        date: dateStr,
        isToday: i === 0
      });
    }
    this.dailyDates.set(dailyDates);

    // Weekly dates: 4 previous weeks, current week, 2 future weeks
    const weeklyDates: DateNavigation[] = [];
    for (let i = -4; i <= 2; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i * 7);
      const weekStart = this.getWeekStart(date);
      const weekEnd = this.getWeekEnd(date);
      weeklyDates.push({
        label: i === 0 ? 'This Week' : `Week ${this.formatDate(new Date(weekStart))}`,
        date: weekStart,
        isToday: i === 0
      });
    }
    this.weeklyDates.set(weeklyDates);
  }

  private getTodayDate(): string {
    return this.formatDate(new Date());
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private getDateLabel(date: Date): string {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dateStr = this.formatDate(date);
    const todayStr = this.formatDate(today);
    const yesterdayStr = this.formatDate(yesterday);
    const tomorrowStr = this.formatDate(tomorrow);

    if (dateStr === todayStr) return 'Today';
    if (dateStr === yesterdayStr) return 'Yesterday';
    if (dateStr === tomorrowStr) return 'Tomorrow';

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  private getWeekStart(date: Date): string {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
    return this.formatDate(new Date(d.setDate(diff)));
  }

  private getWeekEnd(date: Date): string {
    const d = new Date(this.getWeekStart(date));
    d.setDate(d.getDate() + 6);
    return this.formatDate(d);
  }

  protected selectDate(dateStr: string, type: 'daily' | 'weekly'): void {
    if (type === 'daily') {
      this.currentDate.set(dateStr);
      this.loadDailyData(dateStr);
    } else {
      this.currentWeekStart.set(dateStr);
      this.loadWeeklyData(dateStr);
    }
  }

  private loadDailyData(dateStr: string): void {
    this.dailyReflectionLoading.set(true);

    this.aiInsightsService.getDailyReflection(dateStr).subscribe({
      next: (response) => {
        if (response.exists && response.reflection) {
          this.dailyReflection.set(response.reflection);
        } else {
          this.dailyReflection.set(null);
        }
        this.dailyReflectionLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load daily reflection:', err);
        this.dailyReflection.set(null);
        this.dailyReflectionLoading.set(false);
      }
    });
  }

  private loadWeeklyData(weekStartStr: string): void {
    this.weeklyReflectionLoading.set(true);

    this.aiInsightsService.getWeeklyReflection(weekStartStr).subscribe({
      next: (response) => {
        if (response.exists && response.reflection) {
          this.weeklyReflection.set(response.reflection);
        } else {
          this.weeklyReflection.set(null);
        }
        this.weeklyReflectionLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load weekly reflection:', err);
        this.weeklyReflection.set(null);
        this.weeklyReflectionLoading.set(false);
      }
    });
  }

  protected generateDailyReflection(): void {
    this.generatingDaily.set(true);
    this.aiInsightsService.generateDailyReflection(this.currentDate()).subscribe({
      next: (response) => {
        if (response.exists && response.reflection) {
          this.dailyReflection.set(response.reflection);
        }
        this.generatingDaily.set(false);
      },
      error: (err) => {
        console.error('Failed to generate daily reflection:', err);
        this.generatingDaily.set(false);
      }
    });
  }

  protected generateWeeklyReflection(): void {
    this.generatingWeekly.set(true);
    this.aiInsightsService.generateWeeklyReflection(this.currentWeekStart()).subscribe({
      next: (response) => {
        if (response.exists && response.reflection) {
          this.weeklyReflection.set(response.reflection);
        }
        this.generatingWeekly.set(false);
      },
      error: (err) => {
        console.error('Failed to generate weekly reflection:', err);
        this.generatingWeekly.set(false);
      }
    });
  }

  protected getIcon(iconName: string): string {
    const iconMap: { [key: string]: string } = {
      psychology: '🧠',
      local_fire_department: '🔥',
      trending_up: '📈',
      mood: '😊',
      fitness_center: '💪',
      warning: '⚠️',
      self_improvement: '📚',
      schedule: '📅'
    };
    return iconMap[iconName] || '✨';
  }
}

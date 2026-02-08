import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { PlannerTask, TaskStatus } from '../../../models/api';

interface DayCell {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  tasksCount: number;
  completedCount: number;
}

interface WeekDay {
  date: Date;
  dayName: string;
  dayOfMonth: number;
  isToday: boolean;
  isSelected: boolean;
  tasks: PlannerTask[];
}

@Component({
  selector: 'app-calendar-center',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    MatTooltipModule,
    MatProgressBarModule
  ],
  templateUrl: './calendar-center.component.html',
  styleUrls: ['./calendar-center.component.scss']
})
export class CalendarCenterComponent implements OnInit {
  @Input() selectedDate: Date = new Date();
  @Input() tasks: PlannerTask[] = [];
  @Output() dateSelected = new EventEmitter<Date>();
  @Output() dayClicked = new EventEmitter<Date>();

  viewMode = signal<'day' | 'week' | 'month'>('day');
  currentDate = signal(new Date());
  tabIndex = signal(0);

  ngOnInit(): void {
    this.generateMonth();
  }

  // Month View
  monthDays = signal<DayCell[]>([]);

  generateMonth(): void {
    const year = this.currentDate().getFullYear();
    const month = this.currentDate().getMonth();

    // Get first day of month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: DayCell[] = [];

    // Previous month's days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        dayOfMonth: prevMonthLastDay - i,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        tasksCount: 0,
        completedCount: 0
      });
    }

    // Current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const tasksForDay = this.getTasksForDate(date);
      const completedCount = tasksForDay.filter(t => t.status === TaskStatus.Completed).length;

      days.push({
        date,
        dayOfMonth: i,
        isCurrentMonth: true,
        isToday: this.isSameDay(date, new Date()),
        isSelected: this.isSameDay(date, this.selectedDate),
        tasksCount: tasksForDay.length,
        completedCount
      });
    }

    // Next month's days
    const totalCells = days.length;
    const remainingCells = 42 - totalCells;
    for (let i = 1; i <= remainingCells; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        dayOfMonth: i,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        tasksCount: 0,
        completedCount: 0
      });
    }

    this.monthDays.set(days);
  }

  getWeekDays(): WeekDay[] {
    const startOfWeek = new Date(this.selectedDate);
    startOfWeek.setDate(this.selectedDate.getDate() - this.selectedDate.getDay());

    const days: WeekDay[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);

      days.push({
        date,
        dayName: dayNames[date.getDay()],
        dayOfMonth: date.getDate(),
        isToday: this.isSameDay(date, new Date()),
        isSelected: this.isSameDay(date, this.selectedDate),
        tasks: this.getTasksForDate(date)
      });
    }

    return days;
  }

  getDayTasks(): PlannerTask[] {
    return this.getTasksForDate(this.selectedDate);
  }

  getDayCompletedCount(): number {
    return this.getDayTasks().filter(t => t.status === TaskStatus.Completed).length;
  }

  getDayTimeSlots(): string[] {
    const slots: string[] = [];
    for (let i = 8; i < 23; i++) {
      slots.push(`${i.toString().padStart(2, '0')}:00`);
    }
    return slots;
  }

  getTasksForTimeSlot(hour: number): PlannerTask[] {
    return this.getDayTasks().filter(task => {
      if (!task.startTime) return false;
      const taskHour = parseInt(task.startTime.split(':')[0], 10);
      return taskHour === hour;
    });
  }

  private getTasksForDate(date: Date): PlannerTask[] {
    return this.tasks.filter(task => {
      if (!task.startDate) return false;
      const taskDate = new Date(task.startDate);
      return this.isSameDay(taskDate, date);
    });
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  onDateClick(date: Date): void {
    this.dateSelected.emit(date);
    if (this.viewMode() === 'month') {
      this.viewMode.set('day');
      this.tabIndex.set(0);
    }
  }

  previousMonth(): void {
    const current = this.currentDate();
    this.currentDate.set(new Date(current.getFullYear(), current.getMonth() - 1, 1));
    this.generateMonth();
  }

  nextMonth(): void {
    const current = this.currentDate();
    this.currentDate.set(new Date(current.getFullYear(), current.getMonth() + 1, 1));
    this.generateMonth();
  }

  toToday(): void {
    const today = new Date();
    this.dateSelected.emit(today);
    this.currentDate.set(new Date(today.getFullYear(), today.getMonth(), 1));
    this.generateMonth();
  }

  getCompletionPercentage(dayCell: DayCell): number {
    if (dayCell.tasksCount === 0) return 0;
    return (dayCell.completedCount / dayCell.tasksCount) * 100;
  }

  getStatusColor(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.NotStarted:
        return '#9E9E9E';
      case TaskStatus.InProgress:
        return '#2196F3';
      case TaskStatus.Completed:
        return '#4CAF50';
      default:
        return '#757575';
    }
  }
}

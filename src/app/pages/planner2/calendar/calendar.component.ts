import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

export interface CalendarEvent {
  title: string;
  time: string;
  date?: Date;
  category?: string;
}

export interface DayCell {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
}

export interface WeekDay {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, DragDropModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent {
  viewMode = signal<'daily' | 'weekly' | 'monthly'>('daily');
  currentDate = signal(new Date());
  selectedDate = signal(new Date());
  selectedCategory = signal('all');

  // Define categories with colors
  categories = [
    { id: 'all', name: 'All Categories', color: '#e5e7eb' },
    { id: 'study', name: 'Study', color: '#3b82f6' },
    { id: 'work', name: 'Work', color: '#a855f7' },
    { id: 'doctor', name: 'Doctor', color: '#ef4444' },
    { id: 'activities', name: 'Activities', color: '#10b981' },
    { id: 'budget', name: 'Budget', color: '#f59e0b' },
    { id: 'meals', name: 'Meals', color: '#f97316' }
  ];

  // Sample events with times and categories
  allEvents = signal<CalendarEvent[]>([
    { title: 'Morning meeting', time: '09:00', category: 'work' },
    { title: 'Lunch break', time: '12:30', category: 'meals' },
    { title: 'Project work', time: '14:00', category: 'work' },
    { title: 'Doctor appointment', time: '16:00', category: 'doctor' },
    { title: 'Gym session', time: '18:00', category: 'activities' },
    { title: 'Study time', time: '20:00', category: 'study' },
  ]);

  // Generate hourly time slots (00:00 to 23:00)
  timeSlots = computed(() => {
    const slots = [];
    for (let i = 0; i < 24; i++) {
      slots.push(String(i).padStart(2, '0') + ':00');
    }
    return slots;
  });

  // Filtered events based on selected category
  filteredEvents = computed(() => {
    const category = this.selectedCategory();
    if (category === 'all') {
      return this.allEvents();
    }
    return this.allEvents().filter(e => e.category === category);
  });

  // Today's events
  todaysEvents = computed(() => {
    return this.filteredEvents();
  });

  // Monthly view calendar grid
  calendarDays = computed(() => {
    const date = this.currentDate();
    const year = date.getFullYear();
    const month = date.getMonth();
    const today = new Date();
    const selected = this.selectedDate();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: DayCell[] = [];

    // Previous month trailing days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({
        date,
        dayOfMonth: date.getDate(),
        isCurrentMonth: false,
        isToday: this.isSameDay(date, today),
        isSelected: this.isSameDay(date, selected)
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      days.push({
        date,
        dayOfMonth: d,
        isCurrentMonth: true,
        isToday: this.isSameDay(date, today),
        isSelected: this.isSameDay(date, selected)
      });
    }

    // Next month leading days
    const remainingDays = 42 - days.length;
    for (let d = 1; d <= remainingDays; d++) {
      const date = new Date(year, month + 1, d);
      days.push({
        date,
        dayOfMonth: d,
        isCurrentMonth: false,
        isToday: this.isSameDay(date, today),
        isSelected: this.isSameDay(date, selected)
      });
    }

    return days;
  });

  // Weekly view
  weekDays = computed(() => {
    const selected = this.selectedDate();
    const dayOfWeek = selected.getDay();
    const startOfWeek = new Date(selected);
    startOfWeek.setDate(selected.getDate() - dayOfWeek);

    const days: WeekDay[] = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      days.push({
        date,
        dayOfMonth: date.getDate(),
        isCurrentMonth: date.getMonth() === new Date().getMonth(),
        isToday: this.isSameDay(date, today),
        isSelected: this.isSameDay(date, selected)
      });
    }

    return days;
  });

  monthYearLabel = computed(() => {
    const date = this.currentDate();
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  });

  // Helper methods
  private isSameDay(d1: Date, d2: Date): boolean {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  }

  getCategoryColor(categoryId: string | undefined): string {
    if (!categoryId) return '#e5e7eb';
    const cat = this.categories.find(c => c.id === categoryId);
    return cat ? cat.color : '#e5e7eb';
  }

  getCategoryName(categoryId: string | undefined): string {
    if (!categoryId) return '';
    const cat = this.categories.find(c => c.id === categoryId);
    return cat ? cat.name : '';
  }

  getEventTopPosition(time: string): number {
    const hour = parseInt(time.split(':')[0], 10);
    return (hour / 24) * 100;
  }

  selectDate(date: Date) {
    this.selectedDate.set(new Date(date));
  }

  selectCategory(categoryId: string) {
    this.selectedCategory.set(categoryId);
  }

  setViewMode(mode: 'daily' | 'weekly' | 'monthly') {
    this.viewMode.set(mode);
  }

  // Navigation methods
  previousDay() {
    const current = this.selectedDate();
    const newDate = new Date(current);
    newDate.setDate(current.getDate() - 1);
    this.selectedDate.set(newDate);
  }

  nextDay() {
    const current = this.selectedDate();
    const newDate = new Date(current);
    newDate.setDate(current.getDate() + 1);
    this.selectedDate.set(newDate);
  }

  previousWeek() {
    const current = this.selectedDate();
    const newDate = new Date(current);
    newDate.setDate(current.getDate() - 7);
    this.selectedDate.set(newDate);
  }

  nextWeek() {
    const current = this.selectedDate();
    const newDate = new Date(current);
    newDate.setDate(current.getDate() + 7);
    this.selectedDate.set(newDate);
  }

  previousMonth() {
    const current = this.currentDate();
    this.currentDate.set(new Date(current.getFullYear(), current.getMonth() - 1, 1));
  }

  nextMonth() {
    const current = this.currentDate();
    this.currentDate.set(new Date(current.getFullYear(), current.getMonth() + 1, 1));
  }

  goToToday() {
    const today = new Date();
    this.selectedDate.set(new Date(today));
    this.currentDate.set(new Date(today.getFullYear(), today.getMonth(), 1));
  }

  drop(event: CdkDragDrop<CalendarEvent[]>) {
    const arr = [...this.allEvents()];
    moveItemInArray(arr, event.previousIndex, event.currentIndex);
    this.allEvents.set(arr);
  }
}
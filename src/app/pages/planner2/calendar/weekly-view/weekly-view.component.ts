import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CalendarEvent, WeekDay } from '../calendar.component';

@Component({
  selector: 'app-calendar-weekly',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './weekly-view.component.html',
  styleUrls: ['./weekly-view.component.scss']
})
export class WeeklyViewComponent {
  weekDays = input.required<WeekDay[]>();
  categories = input.required<any[]>();
  events = input.required<CalendarEvent[]>();
  eventClick = output<CalendarEvent>();

  getCategoryColor(categoryId?: string): string {
    return this.categories().find(c => c.id === categoryId)?.color ?? '#e5e7eb';
  }

  getEventsByDay(day: WeekDay): CalendarEvent[] {
    return this.events().filter(event => 
      event.date && this.isSameDay(event.date, day.date)
    );
  }

  private isSameDay(d1: Date, d2: Date): boolean {
    return d1.getFullYear() === d2.getFullYear() && 
           d1.getMonth() === d2.getMonth() && 
           d1.getDate() === d2.getDate();
  }

  onEventClick(event: CalendarEvent) {
    this.eventClick.emit(event);
  }

  getWeekDays() {
    return this.weekDays();
  }

  countTotalEvents(): number {
    return this.events().length;
  }

  // ============================================
  // PHASE 4: CALENDAR INTEGRATION METHODS
  // ============================================

  /**
   * Calculates days remaining until deadline
   * Returns: -1 if overdue, 999 if no deadline
   */
  daysUntilDeadline(deadline?: string): number {
    if (!deadline) return 999;
    const deadlineDate = new Date(deadline);
    deadlineDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = deadlineDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Check if event is urgent (deadline within 24 hours)
   */
  isUrgent(event: CalendarEvent): boolean {
    if (!event.deadline) return false;
    const daysLeft = this.daysUntilDeadline(event.deadline);
    return daysLeft >= 0 && daysLeft <= 1;
  }

  /**
   * Check if event is overdue (deadline has passed)
   */
  isOverdue(event: CalendarEvent): boolean {
    if (!event.deadline) return false;
    return this.daysUntilDeadline(event.deadline) < 0;
  }

  /**
   * Get urgency label for task
   * Returns: "⚠️ Overdue" / "🔴 Due Today" / "🟠 Due Tomorrow" / ""
   */
  getUrgencyLabel(event: CalendarEvent): string {
    if (!event.deadline) return '';
    const daysLeft = this.daysUntilDeadline(event.deadline);
    if (daysLeft < 0) return '⚠️ Overdue';
    if (daysLeft === 0) return '🔴 Due Today';
    if (daysLeft === 1) return '🟠 Due Tomorrow';
    return '';
  }

  /**
   * Calculate end time from startTime + duration (HH:mm format)
   */
  getEndTime(event: CalendarEvent): string {
    if (!event.startTime || !event.duration) return '';
    const [hours, minutes] = event.startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + event.duration;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
  }

  /**
   * Format duration in minutes to human-readable format
   * Examples: "2h 30m", "45m", "2h"
   */
  formatDuration(minutes?: number): string {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${mins}m`;
    }
  }

  /**
   * Count urgent tasks for a specific day
   */
  countUrgentForDay(day: WeekDay): number {
    return this.getEventsByDay(day).filter(e => this.isUrgent(e)).length;
  }

  /**
   * Count overdue tasks for a specific day
   */
  countOverdueForDay(day: WeekDay): number {
    return this.getEventsByDay(day).filter(e => this.isOverdue(e)).length;
  }
}

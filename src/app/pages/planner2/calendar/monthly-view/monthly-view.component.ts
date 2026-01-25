import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CalendarEvent, DayCell } from '../calendar.component';

@Component({
  selector: 'app-calendar-monthly',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './monthly-view.component.html',
  styleUrls: ['./monthly-view.component.scss']
})
export class MonthlyViewComponent {
  calendarDays = input.required<DayCell[]>();
  categories = input.required<any[]>();
  events = input.required<CalendarEvent[]>();
  selectedDay = input<Date | null>(null);
  eventClick = output<CalendarEvent>();
  dayClick = output<Date>();

  getCategoryColor(categoryId?: string): string {
    return this.categories().find(c => c.id === categoryId)?.color ?? '#e5e7eb';
  }

  getEventsByDay(day: DayCell): CalendarEvent[] {
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

  onDayClick(day: DayCell) {
    this.dayClick.emit(day.date);
  }

  isDaySelected(day: DayCell): boolean {
    return this.selectedDay() !== null && this.isSameDay(day.date, this.selectedDay()!);
  }

  getCalendarDays() {
    return this.calendarDays();
  }
}

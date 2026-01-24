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
  eventClick = output<CalendarEvent>();

  getCategoryColor(categoryId?: string): string {
    return this.categories().find(c => c.id === categoryId)?.color ?? '#e5e7eb';
  }

  onEventClick(event: CalendarEvent) {
    this.eventClick.emit(event);
  }

  onDayClick(day: DayCell) {
    // Handle day selection if needed
  }

  getCalendarDays() {
    return this.calendarDays();
  }
}

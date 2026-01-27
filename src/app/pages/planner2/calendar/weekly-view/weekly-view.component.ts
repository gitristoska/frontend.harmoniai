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
}

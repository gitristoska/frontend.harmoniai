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
  eventClick = output<CalendarEvent>();

  getCategoryColor(categoryId?: string): string {
    return this.categories().find(c => c.id === categoryId)?.color ?? '#e5e7eb';
  }

  onEventClick(event: CalendarEvent) {
    this.eventClick.emit(event);
  }

  getWeekDays() {
    return this.weekDays();
  }
}

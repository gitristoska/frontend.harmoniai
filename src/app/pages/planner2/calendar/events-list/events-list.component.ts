import { Component, input, computed, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { CalendarEvent } from '../calendar.component';

@Component({
  selector: 'app-events-list',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './events-list.component.html',
  styleUrls: ['./events-list.component.scss']
})
export class EventsListComponent {
  viewMode = input.required<'daily' | 'weekly' | 'monthly'>();
  events = input.required<CalendarEvent[]>();
  categories = input.required<Array<{id: string; name: string; color: string}>>();
  
  @Output() eventClick = new EventEmitter<CalendarEvent>();

  headerTitle = computed(() => {
    const mode = this.viewMode();
    if (mode === 'daily') return "Today's Events";
    if (mode === 'weekly') return "This Week's Events";
    return "This Month's Events";
  });

  getCategoryColor(categoryId?: string): string {
    return this.categories().find(c => c.id === categoryId)?.color ?? '#e5e7eb';
  }

  getCategoryName(categoryId?: string): string {
    return this.categories().find(c => c.id === categoryId)?.name ?? '';
  }

  onEventClick(event: CalendarEvent) {
    this.eventClick.emit(event);
  }
}

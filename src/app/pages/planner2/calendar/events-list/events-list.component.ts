import { Component, input, computed, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { CalendarEvent } from '../calendar.component';

@Component({
  selector: 'app-events-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, DragDropModule],
  templateUrl: './events-list.component.html',
  styleUrls: ['./events-list.component.scss']
})
export class EventsListComponent implements OnInit, OnChanges {
  viewMode = input.required<'daily' | 'weekly' | 'monthly'>();
  events = input.required<CalendarEvent[]>();
  categories = input.required<Array<{id: string; name: string; color: string}>>();
  
  @Output() eventClick = new EventEmitter<CalendarEvent>();
  @Output() eventsReordered = new EventEmitter<CalendarEvent[]>();

  // Local events array for reordering
  localEvents: CalendarEvent[] = [];

  ngOnInit() {
    this.localEvents = [...this.events()];
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['events'] && !changes['events'].firstChange) {
      this.localEvents = [...this.events()];
    }
  }

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

  onDropWithinList(event: CdkDragDrop<CalendarEvent[]>) {
    // Reorder items within the list without changing time
    moveItemInArray(this.localEvents, event.previousIndex, event.currentIndex);
    this.eventsReordered.emit(this.localEvents);
  }
}

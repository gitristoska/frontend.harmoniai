import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { CalendarEvent } from '../calendar.component';

@Component({
  selector: 'app-must-get-done-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatCheckboxModule,
    MatButtonModule
  ],
  templateUrl: './must-get-done-card.component.html',
  styleUrls: ['./must-get-done-card.component.scss']
})
export class MustGetDoneCardComponent {
  @Input() highPriorityEvents: CalendarEvent[] = [];
  @Input() categories: any[] = [];

  onTaskToggle(event: CalendarEvent, completed: boolean) {
    // TODO: Implement task completion toggle
    // This would call the PlannerService to update task status
    console.log('Toggle task:', event.title, 'completed:', completed);
  }

  getCategoryColor(categoryId?: string): string {
    return this.categories.find(c => c.id === categoryId)?.color ?? '#e5e7eb';
  }
}

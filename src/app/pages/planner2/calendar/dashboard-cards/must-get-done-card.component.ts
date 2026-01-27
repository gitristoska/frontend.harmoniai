import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { CalendarEvent } from '../calendar.component';
import { PlannerService } from '../../../../services/task.service';

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

  private plannerService = inject(PlannerService);

  onTaskToggle(task: CalendarEvent, completed: boolean) {
    if (!task.id) return;

    // Toggle between NotStarted (0) and Completed (2)
    const newStatus = completed ? 2 : 0;

    const updateData = {
      title: task.title,
      description: task.description || '',
      time: task.time,
      category: task.category || '',
      status: newStatus
    };

    this.plannerService.updateTask(task.id, updateData).subscribe({
      next: () => {
        (task as any).status = newStatus;
      },
      error: (err: any) => console.error('Error updating task status:', err)
    });
  }

  getCategoryColor(categoryId?: string): string {
    return this.categories.find(c => c.id === categoryId)?.color ?? '#e5e7eb';
  }
}

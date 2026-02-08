import { Component, input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { CalendarEvent } from '../calendar.component';
import { TaskHistoryEvent } from '../../../../models/api';
import { PlannerTask } from '../../../../models/api';

export interface EventUpdateData {
  title: string;
  category: string;
  description?: string;
  priority?: number;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  duration?: number;
}

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTabsModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule
  ],
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.scss']
})
export class EventDetailComponent implements OnInit {
  private dialog = inject(MatDialog);

  event = input.required<CalendarEvent>();
  taskData = input<PlannerTask | null>(null);  // NEW: Full task data for history
  categories = input<Array<{id: string; name: string; color: string}>>([]);
  
  @Output() eventUpdate = new EventEmitter<EventUpdateData>();
  @Output() eventDelete = new EventEmitter<void>();
  @Output() eventClose = new EventEmitter<void>();

  isEditing = false;
  editTitle = '';
  editCategory = '';
  editDescription = '';
  editStartDateObj: Date | null = null;
  editEndDateObj: Date | null = null;
  editStartDate = '';
  editEndDate = '';
  editStartTime = '09:00';
  editDuration = 60;

  ngOnInit() {
    this.resetEditForm();
  }

  startEdit() {
    this.resetEditForm();
    this.isEditing = true;
  }

  cancelEdit() {
    this.isEditing = false;
    this.resetEditForm();
  }

  saveEdit() {
    if (!this.editTitle.trim()) return;

    // Convert Date objects to ISO strings
    if (this.editStartDateObj) {
      this.editStartDate = this.editStartDateObj.toISOString().split('T')[0];
    }
    if (this.editEndDateObj) {
      this.editEndDate = this.editEndDateObj.toISOString().split('T')[0];
    }

    this.eventUpdate.emit({
      title: this.editTitle,
      category: this.editCategory,
      description: this.editDescription,
      startDate: this.editStartDate || undefined,
      endDate: this.editEndDate || undefined,
      startTime: this.editStartTime || undefined,
      duration: this.editDuration || undefined
    });

    this.isEditing = false;
  }

  deleteEvent() {
    if (confirm('Are you sure you want to delete this event?')) {
      this.eventDelete.emit();
    }
  }

  close() {
    this.eventClose.emit();
  }

  getCategoryColor(categoryId?: string): string {
    return this.categories().find(c => c.id === categoryId)?.color ?? '#e5e7eb';
  }

  getCategoryName(categoryId?: string): string {
    return this.categories().find(c => c.id === categoryId)?.name ?? '';
  }

  // NEW: Format duration display (e.g., "~120 min" → "2h")
  formatDuration(minutes?: number): string {
    if (!minutes) return '';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }

  // NEW: Calculate days remaining until deadline
  daysUntilDeadline(deadline?: string): string {
    if (!deadline) return '';
    const deadlineDate = new Date(deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `${diffDays} days`;
  }

  // NEW: Format history event action for display
  getHistoryIcon(action: string): string {
    switch (action) {
      case 'created': return 'pin';
      case 'rescheduled': return 'schedule';
      case 'statusChanged': return 'check_circle';
      default: return 'info';
    }
  }

  // NEW: Get task history
  getTaskHistory(): TaskHistoryEvent[] {
    return this.taskData()?.taskHistory || [];
  }

  // NEW: Format timestamp to readable format
  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  resetEditForm() {
    const evt = this.event();
    const task = this.taskData();
    this.editTitle = evt.title;
    this.editCategory = evt.category || 'study';
    this.editDescription = evt.description || '';
    this.editStartDateObj = task?.startDate ? new Date(task.startDate) : null;
    this.editEndDateObj = task?.endDate ? new Date(task.endDate) : null;
    this.editStartDate = task?.startDate || '';
    this.editEndDate = task?.endDate || '';
    this.editStartTime = task?.startTime || '09:00';
    this.editDuration = task?.duration || 60;
  }

  // openTimePicker removed (Phase 4 feature)
}

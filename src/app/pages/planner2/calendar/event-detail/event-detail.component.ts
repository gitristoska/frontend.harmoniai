import { Component, input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CalendarEvent } from '../calendar.component';

export interface EventUpdateData {
  title: string;
  time: string;
  category: string;
    description?: string;
    priority?: number;
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
    MatSelectModule
  ],
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.scss']
})
export class EventDetailComponent implements OnInit {
  event = input.required<CalendarEvent>();
  categories = input.required<Array<{id: string; name: string; color: string}>>();
  
  @Output() eventUpdate = new EventEmitter<EventUpdateData>();
  @Output() eventDelete = new EventEmitter<void>();
  @Output() eventClose = new EventEmitter<void>();

  isEditing = false;
  editTitle = '';
  editTime = '';
  editCategory = '';
  editDescription = '';

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

    this.eventUpdate.emit({
      title: this.editTitle,
      time: this.editTime,
      category: this.editCategory,
      description: this.editDescription
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

  private resetEditForm() {
    const evt = this.event();
    this.editTitle = evt.title;
    this.editTime = evt.time;
    this.editCategory = evt.category || 'study';
    this.editDescription = evt.description || '';
  }
}

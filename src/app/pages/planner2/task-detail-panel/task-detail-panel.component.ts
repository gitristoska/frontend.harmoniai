import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  effect,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  PlannerTask,
  PlannerTaskUpdateDto,
  TaskStatus,
  TaskHistoryEvent
} from '../../../models/api';
import { PlannerService } from '../../../services/task.service';

@Component({
  selector: 'app-task-detail-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatExpansionModule,
    MatTooltipModule
  ],
  templateUrl: './task-detail-panel.component.html',
  styleUrls: ['./task-detail-panel.component.scss']
})
export class TaskDetailPanelComponent implements OnInit {
  @Input() task: PlannerTask | null = null;
  @Output() taskUpdated = new EventEmitter<PlannerTask>();
  @Output() taskDeleted = new EventEmitter<PlannerTask>();
  @Output() cancelEdit = new EventEmitter<void>();

  form!: FormGroup;
  isSaving = signal(false);
  isLoading = signal(false);

  TaskStatus = TaskStatus;
  statusOptions = [
    { value: TaskStatus.NotStarted, label: 'To Do' },
    { value: TaskStatus.InProgress, label: 'In Progress' },
    { value: TaskStatus.Completed, label: 'Done' },
    { value: TaskStatus.OnHold, label: 'On Hold' },
    { value: TaskStatus.Cancelled, label: 'Cancelled' }
  ];

  priorityOptions = [
    { value: 0, label: 'Low' },
    { value: 1, label: 'Medium' },
    { value: 2, label: 'High' }
  ];

  categoryOptions = [
    'Work',
    'Personal',
    'Health',
    'Study',
    'Family',
    'Finance',
    'Other'
  ];

  constructor(
    private fb: FormBuilder,
    private plannerService: PlannerService
  ) {
    this.form = this.createForm();
  }

  ngOnInit(): void {
    effect(() => {
      if (this.task) {
        this.populateForm(this.task);
      }
    });
  }

  private createForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      description: ['', Validators.maxLength(2000)],
      category: [''],
      priority: [0],
      status: [TaskStatus.NotStarted],
      startDate: [null],
      startTime: [''],
      duration: [null],
      deadline: [null]
    });
  }

  private populateForm(task: PlannerTask): void {
    this.form.patchValue({
      title: task.title,
      description: task.description || '',
      category: task.category || '',
      priority: task.priority || 0,
      status: task.status || TaskStatus.NotStarted,
      startDate: task.startDate ? new Date(task.startDate) : null,
      startTime: task.startTime || '',
      duration: task.duration || null,
      deadline: task.deadline ? new Date(task.deadline) : null
    });
  }

  onSave(): void {
    if (!this.form.valid || !this.task) return;

    this.isSaving.set(true);
    const updateData: PlannerTaskUpdateDto = {
      title: this.form.value.title,
      description: this.form.value.description,
      category: this.form.value.category,
      priority: this.form.value.priority,
      status: this.form.value.status,
      startDate: this.form.value.startDate
        ? new Date(this.form.value.startDate).toISOString().split('T')[0]
        : undefined,
      startTime: this.form.value.startTime,
      duration: this.form.value.duration,
      deadline: this.form.value.deadline
        ? new Date(this.form.value.deadline).toISOString()
        : undefined
    };

    this.plannerService.updateTask(this.task.id!, updateData).subscribe({
      next: (updated) => {
        this.taskUpdated.emit(updated);
        this.isSaving.set(false);
      },
      error: (err) => {
        console.error('Failed to update task', err);
        this.isSaving.set(false);
      }
    });
  }

  onDelete(): void {
    if (
      this.task &&
      confirm(`Delete task "${this.task.title}"? This cannot be undone.`)
    ) {
      this.isSaving.set(true);
      this.plannerService.deleteTask(this.task.id!).subscribe({
        next: () => {
          this.taskDeleted.emit(this.task!);
          this.isSaving.set(false);
        },
        error: (err) => {
          console.error('Failed to delete task', err);
          this.isSaving.set(false);
        }
      });
    }
  }

  onCancel(): void {
    this.cancelEdit.emit();
  }

  quickStatusChange(newStatus: TaskStatus): void {
    if (!this.task) return;
    this.form.patchValue({ status: newStatus });
    this.onSave();
  }

  getPriorityLabel(priority: number): string {
    const option = this.priorityOptions.find(p => p.value === priority);
    return option ? option.label : 'Unknown';
  }

  getStatusLabel(status: TaskStatus): string {
    const option = this.statusOptions.find(s => s.value === status);
    return option ? option.label : 'Unknown';
  }

  get charCount(): number {
    return (this.form.get('description')?.value || '').length;
  }

  get taskHistoryEvents(): TaskHistoryEvent[] {
    return this.task?.taskHistory || [];
  }

  get rescheduleCount(): number {
    return this.task?.rescheduleCount || 0;
  }

  isAtRisk(): boolean {
    return (
      this.task?.priority === 2 &&
      this.rescheduleCount >= 3 &&
      this.task?.deadline !== undefined
    );
  }

  formatDate(date: string | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  }

  formatTime(time: string | undefined): string {
    if (!time) return '';
    return time;
  }

  formatHistoryEvent(event: TaskHistoryEvent): string {
    return `${event.description} at ${new Date(event.timestamp).toLocaleTimeString()}`;
  }

  getRelativeTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }

  getActionLabel(action: string): string {
    const labels: { [key: string]: string } = {
      created: 'Created',
      rescheduled: 'Rescheduled',
      statusChanged: 'Status Changed'
    };
    return labels[action] || action;
  }
}

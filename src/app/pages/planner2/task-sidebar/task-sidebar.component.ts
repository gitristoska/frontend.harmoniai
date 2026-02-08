import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { PlannerTask, TaskStatus } from '../../../models/api';

@Component({
  selector: 'app-task-sidebar',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatBadgeModule, MatMenuModule, MatDividerModule],
  templateUrl: './task-sidebar.component.html',
  styleUrls: ['./task-sidebar.component.scss']
})
export class TaskSidebarComponent {
  @Input() tasks: PlannerTask[] = [];
  @Input() selectedTaskId: string | number | null = null;
  @Output() taskSelected = new EventEmitter<PlannerTask>();
  @Output() addTaskClicked = new EventEmitter<void>();
  @Output() taskReschedule = new EventEmitter<PlannerTask>();
  @Output() taskStatusChange = new EventEmitter<{task: PlannerTask, newStatus: TaskStatus}>();
  @Output() taskDelete = new EventEmitter<PlannerTask>();

  expandedStatus = signal<TaskStatus | null>(null);
  collapsedGroups = signal<Set<TaskStatus>>(new Set());

  // Task groups computed from tasks
  todoTasks = computed(() =>
    this.tasks.filter(t => t.status === TaskStatus.NotStarted)
  );

  inProgressTasks = computed(() =>
    this.tasks.filter(t => t.status === TaskStatus.InProgress)
  );

  doneTasks = computed(() =>
    this.tasks.filter(t => t.status === TaskStatus.Completed)
  );

  totalTaskCount = computed(() => this.tasks.length);
  completedCount = computed(() => this.doneTasks().length);

  getPriorityColor(priority: number): string {
    switch (priority) {
      case 2:
        return '#D32F2F'; // High - Red
      case 1:
        return '#F57C00'; // Medium - Orange
      default:
        return '#546E7A'; // Low - Blue-gray
    }
  }

  getStatusLabel(status: TaskStatus): string {
    const labels = {
      [TaskStatus.NotStarted]: 'To Do',
      [TaskStatus.InProgress]: 'In Progress',
      [TaskStatus.Completed]: 'Done',
      [TaskStatus.OnHold]: 'On Hold',
      [TaskStatus.Cancelled]: 'Cancelled'
    };
    return labels[status] || 'Unknown';
  }

  toggleGroup(status: TaskStatus): void {
    const groups = new Set(this.collapsedGroups());
    if (groups.has(status)) {
      groups.delete(status);
    } else {
      groups.add(status);
    }
    this.collapsedGroups.set(groups);
  }

  isGroupCollapsed(status: TaskStatus): boolean {
    return this.collapsedGroups().has(status);
  }

  onTaskClick(task: PlannerTask): void {
    this.taskSelected.emit(task);
  }

  onAddTaskClick(): void {
    this.addTaskClicked.emit();
  }

  onQuickStatusChange(task: PlannerTask, newStatus: TaskStatus, event: Event): void {
    event.stopPropagation();
    this.taskStatusChange.emit({ task, newStatus });
  }

  onReschedule(task: PlannerTask, event: Event): void {
    event.stopPropagation();
    this.taskReschedule.emit(task);
  }

  onDelete(task: PlannerTask, event: Event): void {
    event.stopPropagation();
    this.taskDelete.emit(task);
  }

  formatTime(time: string | undefined): string {
    if (!time) return '';
    // time is in HH:mm format
    return time;
  }

  formatDuration(duration: number | undefined): string {
    if (!duration) return '';
    if (duration >= 60) {
      const hours = Math.floor(duration / 60);
      const mins = duration % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${duration}m`;
  }
}

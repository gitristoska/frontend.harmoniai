import { Component, input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { PlannerTask, TaskStatus } from '../../models/api';

@Component({
  selector: 'app-task-sidebar',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatMenuModule, MatDividerModule],
  template: `
    <div class="sidebar-container">
      <div class="sidebar-header">
        <h2>Tasks</h2>
        <button mat-icon-button (click)="addTaskClicked.emit()" matTooltip="Add new task">
          <mat-icon>add</mat-icon>
        </button>
      </div>

      <div class="task-groups">
        <div class="task-group" *ngFor="let group of taskGroups()">
          <div class="group-header" 
               [class.collapsed]="!isGroupExpanded(group.status)"
               (click)="toggleGroup(group.status)">
            <mat-icon>{{ isGroupExpanded(group.status) ? 'expand_more' : 'chevron_right' }}</mat-icon>
            <span class="group-title">{{ getStatusLabel(group.status) }}</span>
            <span class="group-count">{{ group.tasks.length }}</span>
          </div>

          <div class="group-tasks" *ngIf="isGroupExpanded(group.status)">
            <div class="task-item" *ngFor="let task of group.tasks"
                 [class.selected]="task.id === selectedTaskId()"
                 (click)="taskSelected.emit(task)">
              <div class="task-priority" [style.background-color]="getPriorityColor(task.priority)"></div>
              <div class="task-info">
                <div class="task-title">{{ task.title }}</div>
                <div class="task-category" *ngIf="task.category">{{ task.category }}</div>
              </div>
              <button mat-icon-button [matMenuTriggerFor]="taskMenu" (click)="$event.stopPropagation()" class="task-menu">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #taskMenu="matMenu">
                <button mat-menu-item (click)="onTaskReschedule(task)">
                  <mat-icon>schedule</mat-icon>
                  <span>Reschedule</span>
                </button>
                <button mat-menu-item (click)="onTaskStatusChange(task)">
                  <mat-icon>check_circle</mat-icon>
                  <span>Mark Complete</span>
                </button>
                <button mat-menu-item (click)="onTaskDelete(task)">
                  <mat-icon>delete</mat-icon>
                  <span>Delete</span>
                </button>
              </mat-menu>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .sidebar-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: #f5f5f5;
      border-right: 1px solid #e0e0e0;
    }

    .sidebar-header {
      padding: 16px;
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .sidebar-header h2 {
      margin: 0;
      font-size: 18px;
    }

    .task-groups {
      flex: 1;
      overflow-y: auto;
      padding: 8px 0;
    }

    .task-group {
      margin-bottom: 8px;
    }

    .group-header {
      padding: 12px 16px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
      user-select: none;
      &:hover {
        background: #efefef;
      }
    }

    .group-title {
      flex: 1;
    }

    .group-tasks {
      padding: 4px 0;
    }

    .task-item {
      padding: 8px 12px;
      margin: 0 8px;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      &:hover {
        background: #efefef;
      }
      &.selected {
        background: #e3f2fd;
      }
    }

    .task-priority {
      width: 4px;
      height: 24px;
      border-radius: 2px;
    }

    .task-info {
      flex: 1;
      min-width: 0;
    }

    .task-title {
      font-size: 13px;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .task-category {
      font-size: 11px;
      color: #666;
    }

    .task-menu {
      width: 24px;
      height: 24px;
    }
  `]
})
export class TaskSidebarComponent {
  tasks = input<PlannerTask[]>([]);
  selectedTaskId = input<string | number | null>(null);
  @Output() taskSelected = new EventEmitter<PlannerTask>();
  @Output() addTaskClicked = new EventEmitter<void>();
  @Output() taskReschedule = new EventEmitter<PlannerTask>();
  @Output() taskStatusChange = new EventEmitter<PlannerTask>();
  @Output() taskDelete = new EventEmitter<PlannerTask>();

  expandedGroups = signal({ '0': true, '1': true, '2': true });

  taskGroups = computed(() => {
    const groups: { status: string; tasks: PlannerTask[] }[] = [
      { status: '0', tasks: [] },
      { status: '1', tasks: [] },
      { status: '2', tasks: [] }
    ];

    const tasksList = this.tasks();
    if (!tasksList || !Array.isArray(tasksList)) {
      return groups;
    }

    tasksList.forEach(task => {
      const groupIndex = task.status ?? 0;
      if (groups[groupIndex]) {
        groups[groupIndex].tasks.push(task);
      }
    });

    return groups;
  });

  isGroupExpanded(status: string): boolean {
    return (this.expandedGroups() as any)[status] ?? true;
  }

  toggleGroup(status: string) {
    const current = this.expandedGroups();
    this.expandedGroups.set({
      ...current,
      [status]: !current[status as keyof typeof current]
    });
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      '0': 'To Do',
      '1': 'In Progress',
      '2': 'Done'
    };
    return labels[status] || 'Unknown';
  }

  getPriorityColor(priority: number | undefined): string {
    const colors: { [key: number]: string } = {
      0: '#546E7A', // Low - Gray
      1: '#F57C00', // Medium - Orange
      2: '#D32F2F'  // High - Red
    };
    return colors[priority ?? 0] || '#546E7A';
  }

  onTaskReschedule(task: PlannerTask) {
    this.taskReschedule.emit(task);
  }

  onTaskStatusChange(task: PlannerTask) {
    this.taskStatusChange.emit(task);
  }

  onTaskDelete(task: PlannerTask) {
    this.taskDelete.emit(task);
  }
}

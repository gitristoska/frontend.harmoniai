import { Component, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-add-task-button',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  template: `
    <button mat-raised-button class="add-task-btn" (click)="addTaskClick.emit()">
      <mat-icon>add</mat-icon>
      <span>Add New Task</span>
    </button>
  `,
  styles: [`
    .add-task-btn {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
      border-radius: 12px;
      padding: 10px 20px;
      font-weight: 600;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      border: none;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
      cursor: pointer;
      white-space: nowrap;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(59, 130, 246, 0.35);
      }

      &:active {
        transform: translateY(0);
        box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
      }

      mat-icon {
        font-size: 1.25rem;
        width: 1.25rem;
        height: 1.25rem;
      }
    }
  `]
})
export class AddTaskButtonComponent {
  addTaskClick = output<void>();
}

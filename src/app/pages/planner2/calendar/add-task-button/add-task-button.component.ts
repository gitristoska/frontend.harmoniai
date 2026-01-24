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
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white;
      border-radius: 12px;
      padding: 0.75rem 1.5rem;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s ease;
      border: none;
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
      }

      mat-icon {
        font-size: 1.25rem;
      }
    }
  `]
})
export class AddTaskButtonComponent {
  addTaskClick = output<void>();
}

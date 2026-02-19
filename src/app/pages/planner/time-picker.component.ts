import { Component, Input, Output, EventEmitter, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-time-picker',
  template: `
    <div class="time-picker-container">
      <!-- Time Input -->
      <div class="time-input-wrapper">
        <label>Select Time</label>
        <input 
          type="time" 
          [(ngModel)]="timeValue"
          class="time-input">
      </div>

      <!-- Actions -->
      <div class="actions">
        <button mat-stroked-button (click)="clear()">Clear</button>
        <button mat-raised-button color="primary" (click)="confirm()">Done</button>
      </div>
    </div>
  `,
  styles: [`
    .time-picker-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 16px;
      background: #f5f5f5;
      border-radius: 8px;
    }

    .time-input-wrapper {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .time-input-wrapper label {
      font-weight: 600;
      color: #333;
      font-size: 14px;
    }

    .time-input {
      padding: 12px 16px;
      border: 2px solid #ddd;
      border-radius: 6px;
      font-size: 18px;
      font-weight: 600;
      font-family: 'Courier New', monospace;
      color: #333;
      background: white;
      cursor: pointer;
    }

    .time-input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }
  `],
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule]
})
export class TimePickerComponent implements OnInit {
  @Input() initialTime: string = ''; // Format: "HH:mm"
  @Output() timeSelected = new EventEmitter<string>();

  timeValue = signal<string>('');

  constructor() {}

  ngOnInit(): void {
    if (this.initialTime) {
      this.timeValue.set(this.initialTime);
    }
  }

  clear(): void {
    this.timeValue.set('');
    this.timeSelected.emit('');
  }

  confirm(): void {
    this.timeSelected.emit(this.timeValue());
  }
}

import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-time-picker-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule],
  template: `
    <div class="time-picker-dialog">
      <div class="header">
        <div class="time-display">
          <span class="hour" [class.active]="!showMinutes()">{{ padZero(hour()) }}</span>
          <span class="separator">:</span>
          <span class="minute" [class.active]="showMinutes()">{{ padZero(minute()) }}</span>
        </div>
      </div>

      <div class="clock-container" *ngIf="!showMinutes()">
        <div class="clock">
          <div class="center-dot"></div>
          <div *ngFor="let h of hours; let i = index" 
               class="hour-mark"
               [style.transform]="'rotate(' + (i * 30) + 'deg) translateY(-70px)'"
               [class.selected]="h === hour()"
               (click)="selectHour(h)">
            <span [style.transform]="'rotate(' + (-(i * 30)) + 'deg)'">{{ h }}</span>
          </div>
          <div class="hand hour-hand"
               [style.transform]="'rotate(' + ((hour() % 12) * 30 + 90) + 'deg)'"></div>
        </div>
      </div>

      <div class="clock-container" *ngIf="showMinutes()">
        <div class="clock">
          <div class="center-dot"></div>
          <div *ngFor="let m of minutes; let i = index" 
               class="minute-mark"
               [style.transform]="'rotate(' + (i * 6) + 'deg) translateY(-70px)'"
               [class.selected]="m === minute()"
               (click)="selectMinute(m)">
            <span *ngIf="i % 5 === 0" [style.transform]="'rotate(' + (-(i * 6)) + 'deg)'">{{ m }}</span>
          </div>
          <div class="hand minute-hand"
               [style.transform]="'rotate(' + (minute() * 6 + 90) + 'deg)'"></div>
        </div>
      </div>

      <div class="footer">
        <button mat-button (click)="cancel()">Cancel</button>
        <button mat-raised-button color="primary" (click)="confirm()">OK</button>
      </div>
    </div>
  `,
  styles: [`
    .time-picker-dialog {
      padding: 20px;
      width: 320px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 8px;
      padding: 30px 20px;
      width: 100%;
      margin-bottom: 30px;
    }

    .time-display {
      font-size: 48px;
      font-weight: 500;
      color: white;
      text-align: center;
      letter-spacing: 2px;
    }

    .hour, .minute {
      cursor: pointer;
      padding: 8px 12px;
      border-radius: 4px;
      opacity: 0.7;
      transition: opacity 0.2s;
    }

    .hour.active, .minute.active {
      opacity: 1;
      background: rgba(255, 255, 255, 0.3);
    }

    .separator {
      margin: 0 4px;
    }

    .clock-container {
      display: flex;
      justify-content: center;
      margin-bottom: 30px;
      height: 280px;
    }

    .clock {
      position: relative;
      width: 280px;
      height: 280px;
      border-radius: 50%;
      background: #f5f5f5;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .center-dot {
      position: absolute;
      width: 12px;
      height: 12px;
      background: #667eea;
      border-radius: 50%;
      z-index: 10;
    }

    .hour-mark, .minute-mark {
      position: absolute;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border-radius: 50%;
      font-size: 14px;
      font-weight: 500;
      color: #333;
      transition: background 0.2s, color 0.2s;
    }

    .hour-mark.selected, .minute-mark.selected {
      background: #667eea;
      color: white;
    }

    .hour-mark:hover, .minute-mark:hover {
      background: rgba(102, 126, 234, 0.2);
    }

    .hour-mark span, .minute-mark span {
      display: flex;
      width: 40px;
      height: 40px;
      align-items: center;
      justify-content: center;
    }

    .hand {
      position: absolute;
      bottom: 50%;
      left: 50%;
      transform-origin: bottom center;
      background: #667eea;
      border-radius: 4px 4px 0 0;
      margin-left: -2px;
    }

    .hour-hand {
      width: 4px;
      height: 60px;
    }

    .minute-hand {
      width: 4px;
      height: 80px;
    }

    .footer {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      width: 100%;
    }
  `]
})
export class TimePickerDialogComponent {
  hour = signal(9);
  minute = signal(0);
  showMinutes = signal(false);

  hours = Array.from({length: 12}, (_, i) => i === 0 ? 12 : i);
  minutes = Array.from({length: 60}, (_, i) => i);

  onConfirm = output<{hour: number, minute: number}>();
  onCancel = output<void>();

  selectHour(h: number) {
    this.hour.set(h);
    this.showMinutes.set(true);
  }

  selectMinute(m: number) {
    this.minute.set(m);
  }

  confirm() {
    this.onConfirm.emit({
      hour: this.hour(),
      minute: this.minute()
    });
  }

  cancel() {
    this.onCancel.emit();
  }

  padZero(value: number): string {
    return value.toString().padStart(2, '0');
  }
}

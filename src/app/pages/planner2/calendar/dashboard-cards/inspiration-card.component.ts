import { Component, signal, effect, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DailyEntryService } from '../../../../services/dailyentry.service';
import { WeeklyInspiration } from '../../../../models/api';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-inspiration-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule
  ],
  templateUrl: './inspiration-card.component.html',
  styleUrls: ['./inspiration-card.component.scss']
})
export class InspirationCardComponent {
  currentDate = input<Date>(new Date());

  inspiration = signal<WeeklyInspiration | null>(null);
  isEditing = signal(false);
  editText = signal('');
  isLoading = signal(false);
  error = signal('');

  constructor(private dailyEntryService: DailyEntryService) {
    effect(() => {
      this.loadInspiration();
    });
  }

  private loadInspiration() {
    this.isLoading.set(true);
    const dateStr = this.currentDate().toISOString().split('T')[0];
    
    this.dailyEntryService.getWeeklyInspiration(dateStr).subscribe({
      next: (data: WeeklyInspiration) => {
        this.inspiration.set(data);
        this.error.set('');
        this.isLoading.set(false);
        debugger;
      },
      error: (err: any) => {
        console.error('Error loading weekly inspiration:', err);
        this.error.set('');
        this.isLoading.set(false);
        // It's OK if no inspiration exists yet
        this.inspiration.set(null);
        debugger;
      }
    });
  }

  onEdit() {
    this.isEditing.set(true);
    this.editText.set(this.inspiration()?.inspiration || '');
  }

  onSave() {
    const text = this.editText().trim();
    if (!text) {
      this.error.set('Inspiration cannot be empty');
      return;
    }

    this.isLoading.set(true);
    this.dailyEntryService.createOrUpdateWeeklyInspiration({ inspiration: text }).subscribe({
      next: (data: WeeklyInspiration) => {
        this.inspiration.set(data);
        this.isEditing.set(false);
        this.editText.set('');
        this.error.set('');
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error('Error saving inspiration:', err);
        this.error.set('Failed to save inspiration');
        this.isLoading.set(false);
      }
    });
  }

  onCancel() {
    this.isEditing.set(false);
    this.editText.set('');
  }
}

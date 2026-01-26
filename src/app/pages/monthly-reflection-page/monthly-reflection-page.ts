import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import {
  MonthlyEntry,
  MonthlyReflection
} from '../../models/api';
import { MonthlyPlanningService } from '../../services/monthly-planning.service';

@Component({
  selector: 'app-monthly-reflection-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule
  ],
  templateUrl: './monthly-reflection-page.html',
  styleUrls: ['./monthly-reflection-page.scss']
})
export class MonthlyReflectionPage {
  currentDate = signal(new Date());
  
  // State signals
  monthlyEntry = signal<MonthlyEntry | null>(null);
  isLoading = signal(false);
  isSaving = signal(false);
  error = signal<string | null>(null);
  isEditing = signal(false);

  // Form data
  reflectionForm = signal({
    rating: 5,
    wins: '',
    challenges: '',
    lessons: '',
    nextMonthFocus: ''
  });

  constructor(
    private monthlyPlanningService: MonthlyPlanningService,
    private router: Router
  ) {
    this.loadMonthlyEntry();
  }

  /**
   * Load monthly entry for the current month
   */
  private loadMonthlyEntry() {
    this.isLoading.set(true);
    this.error.set(null);

    const monthStr = this.getMonthString(this.currentDate());
    this.monthlyPlanningService.getEntry(monthStr).subscribe({
      next: (entry: MonthlyEntry) => {
        this.monthlyEntry.set(entry);
        
        // Initialize form with reflection data if it exists
        if (entry.reflection) {
          this.reflectionForm.set({
            rating: entry.reflection.rating || 5,
            wins: entry.reflection.wins || '',
            challenges: entry.reflection.challenges || '',
            lessons: entry.reflection.lessons || '',
            nextMonthFocus: entry.reflection.nextMonthFocus || ''
          });
        }

        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error('Error loading monthly entry:', err);
        this.error.set('Failed to load monthly entry');
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Format month string as YYYY-MM
   */
  private getMonthString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  /**
   * Get display string for the current month
   */
  getMonthDisplay(): string {
    return this.currentDate().toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  }

  /**
   * Enter edit mode
   */
  onEditReflection() {
    this.isEditing.set(true);
  }

  /**
   * Save reflection
   */
  onSaveReflection() {
    this.isSaving.set(true);
    const entry = this.monthlyEntry();
    const formData = this.reflectionForm();

    if (!entry) {
      this.error.set('No entry loaded');
      this.isSaving.set(false);
      return;
    }

    const reflectionData = {
      rating: formData.rating,
      wins: formData.wins,
      challenges: formData.challenges,
      lessons: formData.lessons,
      nextMonthFocus: formData.nextMonthFocus
    };

    if (entry.reflection?.id) {
      // Update existing reflection
      this.monthlyPlanningService.updateReflection(entry.reflection.id, reflectionData).subscribe({
        next: () => {
          this.loadMonthlyEntry();
          this.isEditing.set(false);
          this.isSaving.set(false);
        },
        error: (err: any) => {
          console.error('Error saving reflection:', err);
          this.error.set('Failed to save reflection');
          this.isSaving.set(false);
        }
      });
    } else {
      // Create new reflection
      this.monthlyPlanningService.saveReflection(entry.id, reflectionData).subscribe({
        next: () => {
          this.loadMonthlyEntry();
          this.isEditing.set(false);
          this.isSaving.set(false);
        },
        error: (err: any) => {
          console.error('Error creating reflection:', err);
          this.error.set('Failed to save reflection');
          this.isSaving.set(false);
        }
      });
    }
  }

  /**
   * Cancel editing
   */
  onCancelReflection() {
    const entry = this.monthlyEntry();
    if (entry?.reflection) {
      this.reflectionForm.set({
        rating: entry.reflection.rating || 5,
        wins: entry.reflection.wins || '',
        challenges: entry.reflection.challenges || '',
        lessons: entry.reflection.lessons || '',
        nextMonthFocus: entry.reflection.nextMonthFocus || ''
      });
    }
    this.isEditing.set(false);
  }

  /**
   * Dismiss error message
   */
  dismissError() {
    this.error.set(null);
  }

  /**
   * Navigate back to monthly planning
   */
  goBack() {
    this.router.navigate(['/monthly-planning']);
  }
}

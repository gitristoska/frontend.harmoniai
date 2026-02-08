import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PlannerService } from '../../../../services/task.service';
import { DailyEntryService } from '../../../../services/daily-entry.service';
import { DailyEntry, LifeBalanceItem, CallAndEmailItem, DailyEntryUpdateDto } from '../../../../models/api';

@Component({
  selector: 'app-daily-reflection',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './daily-reflection.component.html',
  styleUrls: ['./daily-reflection.component.scss']
})
export class DailyReflectionComponent implements OnInit {
  @Input() selectedDate: Date = new Date();

  isExpanded = signal(false);
  isLoading = signal(false);
  isSaving = signal(false);

  dailyEntry: DailyEntry | null = null;

  // Form fields
  productivityRating = signal(0);
  moodRating = signal(0);
  healthRating = signal(0);
  gratefulFor = signal('');
  inspirationOrMotivation = signal('');
  personalNotes = signal('');
  notesForTomorrow = signal('');
  lifeBalanceItems = signal<LifeBalanceItem[]>([]);
  callsAndEmailsItems = signal<CallAndEmailItem[]>([]);

  // NEW: Wellness Insights
  wellnessInsights = signal('');
  wellnessWarnings = signal('');
  hasWellnessWarnings = signal(false);
  isLoadingInsights = signal(false);

  constructor(
    private plannerService: PlannerService,
    private dailyEntryService: DailyEntryService
  ) {}

  ngOnInit() {
    this.loadDailyEntry();
    // Load wellness insights asynchronously
    this.loadWellnessInsights();
    this.checkWellnessWarnings();
  }

  ngOnChanges() {
    this.loadDailyEntry();
  }

  loadDailyEntry() {
    if (!this.selectedDate) return;

    this.isLoading.set(true);
    const dateStr = this.formatDate(this.selectedDate);

    this.plannerService.getDailyEntry(dateStr).subscribe({
      next: (entry) => {
        this.dailyEntry = entry;
        this.productivityRating.set(entry.rating?.productivity || 0);
        this.moodRating.set(entry.rating?.mood || 0);
        this.healthRating.set(entry.rating?.health || 0);
        this.gratefulFor.set(entry.gratefulFor || '');
        this.inspirationOrMotivation.set(entry.inspirationOrMotivation || '');
        this.personalNotes.set(entry.personalNotes || '');
        this.notesForTomorrow.set(entry.notesForTomorrow || '');
        this.lifeBalanceItems.set(entry.lifeBalanceToDoList || []);
        this.callsAndEmailsItems.set(entry.callsAndEmailsChecklist || []);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load daily entry', err);
        this.isLoading.set(false);
      }
    });
  }

  saveDailyEntry() {
    if (!this.selectedDate) return;

    this.isSaving.set(true);
    const dateStr = this.formatDate(this.selectedDate);

    const entryData: DailyEntryUpdateDto = {
      gratefulFor: this.gratefulFor(),
      inspirationOrMotivation: this.inspirationOrMotivation(),
      personalNotes: this.personalNotes(),
      notesForTomorrow: this.notesForTomorrow()
    };

    this.plannerService.updateDailyEntry(dateStr, entryData).subscribe({
      next: (updated) => {
        this.dailyEntry = updated;
        this.isSaving.set(false);
      },
      error: (err) => {
        console.error('Failed to save daily entry', err);
        this.isSaving.set(false);
      }
    });
  }

  /**
   * Load wellness insights from API
   */
  loadWellnessInsights() {
    this.isLoadingInsights.set(true);
    this.dailyEntryService.getWellnessInsights().subscribe({
      next: (insights) => {
        this.wellnessInsights.set(insights.insights);
        this.isLoadingInsights.set(false);
      },
      error: (err) => {
        console.error('Failed to load wellness insights', err);
        this.isLoadingInsights.set(false);
      }
    });
  }

  /**
   * Check for wellness warnings
   */
  checkWellnessWarnings() {
    this.dailyEntryService.checkWellnessWarnings(14).subscribe({
      next: (warnings) => {
        this.hasWellnessWarnings.set(warnings.hasWarnings);
        if (warnings.hasWarnings) {
          this.wellnessWarnings.set(warnings.status);
        }
      },
      error: (err) => console.error('Failed to check wellness warnings', err)
    });
  }

  addLifeBalanceItem() {
    const newItem: LifeBalanceItem = {
      category: 'Work',
      text: '',
      isDone: false
    };
    this.lifeBalanceItems.set([...this.lifeBalanceItems(), newItem]);
  }

  addCallAndEmailItem() {
    const newItem: CallAndEmailItem = {
      text: '',
      isDone: false
    };
    this.callsAndEmailsItems.set([...this.callsAndEmailsItems(), newItem]);
  }

  removeLifeBalanceItem(index: number) {
    const items = this.lifeBalanceItems();
    items.splice(index, 1);
    this.lifeBalanceItems.set([...items]);
  }

  removeCallAndEmailItem(index: number) {
    const items = this.callsAndEmailsItems();
    items.splice(index, 1);
    this.callsAndEmailsItems.set([...items]);
  }

  toggleLifeBalanceItem(index: number) {
    const items = this.lifeBalanceItems();
    items[index].isDone = !items[index].isDone;
    this.lifeBalanceItems.set([...items]);
  }

  toggleCallAndEmailItem(index: number) {
    const items = this.callsAndEmailsItems();
    items[index].isDone = !items[index].isDone;
    this.callsAndEmailsItems.set([...items]);
  }

  setRating(type: 'productivity' | 'mood' | 'health', value: number) {
    if (type === 'productivity') this.productivityRating.set(value);
    else if (type === 'mood') this.moodRating.set(value);
    else if (type === 'health') this.healthRating.set(value);
  }

  getRatingStars(value: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i);
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  toggleExpand() {
    this.isExpanded.set(!this.isExpanded());
  }
}

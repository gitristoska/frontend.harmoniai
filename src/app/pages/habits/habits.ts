import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { HabitService } from '../../services/habit.service';
import { Habit, HabitCreateDto, HabitUpdateDto, WeeklyAiSuggestions, WeeklyStats, HabitHistory } from '../../models/habit.model';
import { WeekNavigationHelper } from '../../utils/week-navigation.helper';

@Component({
  selector: 'app-habits',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    FormsModule
  ],
  templateUrl: './habits.html',
  styleUrls: ['./habits.scss']
})
export class Habits implements OnInit {

  days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  habits: Habit[] = [];
  selectedWeekStart: Date = WeekNavigationHelper.getCurrentWeekStart();

  // NEW: AI Suggestions and Stats
  weeklyAiSuggestions: string = ''; // Newline-separated suggestions
  weeklySuggestionsGeneratedAt: string | null = null; // ISO timestamp
  weeklyStats: WeeklyStats | null = null;
  habitHistories: Map<string, HabitHistory> = new Map();
  habitsLoading = false; // Initial load of habits
  suggestionsLoading = false; // Refresh suggestions
  aiSuggestionsInitialLoading = false; // Initial load of AI suggestions
  loadingStats = false;
  loadingHistory: Set<string> = new Set();

  showForm = false;
  formName = '';
  editId: string | null = null;
  // Track which days are selected when creating/editing a habit
  selectedScheduledDays: boolean[] = [false, false, false, false, false, false, false];

  constructor(private habitService: HabitService) {}

  ngOnInit() {
    this.loadHabitsWithSuggestions();
    this.loadWeeklyStats();
  }

  // ===========================
  // BACKEND CALLS
  // ===========================

  /**
   * Load habits with AI suggestions
   */
  loadHabitsWithSuggestions() {
    this.habitsLoading = true;
    this.aiSuggestionsInitialLoading = true;
    this.habitService.getHabitsForWeek(this.selectedWeekStart, true).subscribe({
      next: (response) => {
        this.habits = response.habits;
        this.weeklyAiSuggestions = response.weeklyAiSuggestions || '';
        this.weeklySuggestionsGeneratedAt = response.weeklySuggestionsGeneratedAt || null;
        this.habitsLoading = false;
        this.aiSuggestionsInitialLoading = false;
      },
      error: (err) => {
        console.error('Failed to load habits', err);
        this.habitsLoading = false;
        this.aiSuggestionsInitialLoading = false;
      }
    });
  }

  /**
   * Refresh AI suggestions for the current week
   */
  refreshAiSuggestions() {
    this.suggestionsLoading = true;
    this.habitService.refreshAiSuggestions(this.selectedWeekStart).subscribe({
      next: (response) => {
        this.weeklyAiSuggestions = response.weeklyAiSuggestions;
        this.weeklySuggestionsGeneratedAt = response.generatedAt;
        this.suggestionsLoading = false;
      },
      error: (err) => {
        console.error('Failed to refresh suggestions', err);
        this.suggestionsLoading = false;
      }
    });
  }

  /**
   * Get relative time string (e.g., "2h ago")
   */
  getRelativeTime(isoDateString: string | null): string {
    if (!isoDateString) return 'never';
    
    const date = new Date(isoDateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }

  /**
   * Parse AI suggestions from JSON string and extract recommendations
   */
  getSuggestionsList(): string[] {
    if (!this.weeklyAiSuggestions) return [];
    
    try {
      const parsed = JSON.parse(this.weeklyAiSuggestions);
      if (parsed.recommendations && Array.isArray(parsed.recommendations)) {
        return parsed.recommendations.map((item: Record<string, string>) => {
          // Each item has a numbered key (e.g., "1", "2", "3")
          const key = Object.keys(item)[0];
          return item[key];
        });
      }
    } catch (e) {
      // If JSON parsing fails, try the old format (newline-separated)
      return this.weeklyAiSuggestions.split('\n').filter(s => s.trim());
    }
    
    return [];
  }

  /**
   * Load weekly stats
   */
  loadWeeklyStats() {
    this.loadingStats = true;
    this.habitService.getWeeklyStats(this.selectedWeekStart).subscribe({
      next: (stats) => {
        this.weeklyStats = stats;
        this.loadingStats = false;
      },
      error: (err) => {
        console.error('Failed to load stats', err);
        this.loadingStats = false;
      }
    });
  }

  /**
   * Load habit history (4 weeks)
   */
  loadHabitHistory(habitId: string) {
    if (this.habitHistories.has(habitId)) {
      return; // Already loaded
    }
    
    this.loadingHistory.add(habitId);
    this.habitService.getHabitHistory(habitId, 4).subscribe({
      next: (history) => {
        this.habitHistories.set(habitId, history);
        this.loadingHistory.delete(habitId);
      },
      error: (err) => {
        console.error('Failed to load habit history', err);
        this.loadingHistory.delete(habitId);
      }
    });
  }

  /**
   * Legacy method for backward compatibility
   */
  loadHabits() {
    this.loadHabitsWithSuggestions();
  }


  // ===========================
  // WEEK NAVIGATION
  // ===========================

  /**
   * Navigate to previous week
   */
  previousWeek() {
    const prevWeek = new Date(this.selectedWeekStart.getTime() - 7 * 24 * 60 * 60 * 1000);
    this.selectedWeekStart = WeekNavigationHelper.getWeekStart(prevWeek);
    this.habitHistories.clear(); // Clear history cache for new week
    this.loadHabitsWithSuggestions();
    this.loadWeeklyStats();
  }

  /**
   * Navigate to next week
   */
  nextWeek() {
    const nextWeek = new Date(this.selectedWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    this.selectedWeekStart = WeekNavigationHelper.getWeekStart(nextWeek);
    this.habitHistories.clear(); // Clear history cache for new week
    this.loadHabitsWithSuggestions();
    this.loadWeeklyStats();
  }

  /**
   * Go back to current week
   */
  goToCurrentWeek() {
    this.selectedWeekStart = WeekNavigationHelper.getCurrentWeekStart();
    this.habitHistories.clear(); // Clear history cache
    this.loadHabitsWithSuggestions();
    this.loadWeeklyStats();
  }

  /**
   * Get formatted week range for display (e.g., "Jan 27 - Feb 2, 2026")
   */
  getWeekRangeLabel(): string {
    return WeekNavigationHelper.getWeekRangeLabel(this.selectedWeekStart);
  }

  /**
   * Check if we're viewing the current week
   */
  isCurrentWeek(): boolean {
    return WeekNavigationHelper.isCurrentWeek(this.selectedWeekStart);
  }

  /**
   * Get Monday of the week for a given date
   */
  private getMonday(date: Date): Date {
    return WeekNavigationHelper.getWeekStart(date);
  }

  saveHabit() {
    const name = this.formName.trim();
    if (!name) return;

    if (this.editId) {
      // UPDATE - update name and/or scheduled days
      const habit = this.habits.find(h => h.id === this.editId);
      if (!habit) return;

      const dto: HabitUpdateDto = {
        name,
        scheduledDays: this.selectedScheduledDays
      };

      this.habitService.update(this.editId, dto).subscribe({
        next: () => {
          this.loadHabitsWithSuggestions();
          this.loadWeeklyStats();
        },
        error: (err) => console.error('Update failed', err)
      });
    } else {
      // CREATE - new habit with scheduled days
      const dto: HabitCreateDto = {
        name,
        scheduledDays: this.selectedScheduledDays,
        weekStart: this.selectedWeekStart.toISOString().split('T')[0]
      };

      this.habitService.create(dto).subscribe({
        next: () => {
          this.loadHabitsWithSuggestions();
          this.loadWeeklyStats();
        },
        error: (err) => console.error('Create failed', err)
      });
    }

    this.cancelForm();
  }

  deleteHabit(id: string) {
    this.habitService.delete(id).subscribe({
      next: () => {
        this.habits = this.habits.filter(h => h.id !== id);
        this.habitHistories.delete(id); // Clear history cache for deleted habit
        this.loadWeeklyStats(); // Refresh stats after deletion
      },
      error: (err) => console.error('Delete failed', err)
    });
  }

  // ===========================
  // UI LOGIC
  // ===========================

  /**
   * Toggle completion status for a specific day
   * Uses the new PATCH endpoint to update individual day completion
   */
  toggleDayCompletion(habit: Habit, dayIndex: number) {
    // Only allow toggling if the day is scheduled
    if (!habit.scheduledDays[dayIndex]) {
      return;
    }

    // Determine new completion status
    const currentStatus = habit.completionStatus[dayIndex];
    const newStatus = currentStatus === true ? false : true;

    // Call API to update completion status for this day
    this.habitService.markDayComplete(habit.id, dayIndex, newStatus).subscribe({
      next: (updatedHabit) => {
        // Update the local habit with the response from server
        const index = this.habits.findIndex(h => h.id === habit.id);
        if (index > -1) {
          this.habits[index] = updatedHabit;
        }
        // Refresh stats after completion toggle
        this.loadWeeklyStats();
      },
      error: (err) => console.error('Toggle day completion failed', err)
    });
  }

  /**
   * Toggle which days the habit is scheduled for
   * This updates the scheduledDays array
   */
  toggleScheduledDay(dayIndex: number) {
    this.selectedScheduledDays[dayIndex] = !this.selectedScheduledDays[dayIndex];
  }

  startAdd() {
    this.showForm = true;
    this.formName = '';
    this.editId = null;
    // Reset scheduled days to all false for new habit
    this.selectedScheduledDays = [false, false, false, false, false, false, false];
  }

  startEdit(h: Habit) {
    this.showForm = true;
    this.formName = h.name;
    this.editId = h.id;
    // Load the habit's current scheduled days
    this.selectedScheduledDays = [...h.scheduledDays];
  }

  cancelForm() {
    this.showForm = false;
    this.formName = '';
    this.editId = null;
    this.selectedScheduledDays = [false, false, false, false, false, false, false];
  }

  // ===========================
  // CALCULATION & DISPLAY
  // ===========================

  /**
   * Calculate completion percentage for a habit
   * Only counts scheduled days that are completed (ignores non-scheduled days)
   */
  habitCompletion(h: Habit): number {
    const scheduledCount = h.scheduledDays.filter(Boolean).length;
    if (scheduledCount === 0) return 0;

    const completedCount = h.completionStatus
      .filter((status, index) => h.scheduledDays[index] && status === true)
      .length;

    return completedCount / scheduledCount;
  }

  /**
   * Count how many scheduled days have been completed this week
   */
  daysDone(h: Habit): number {
    return h.completionStatus
      .filter((status, index) => h.scheduledDays[index] && status === true)
      .length;
  }

  /**
   * Count total scheduled days
   */
  daysScheduled(h: Habit): number {
    return h.scheduledDays.filter(Boolean).length;
  }

  /**
   * Calculate weekly completion percentage across all habits
   * Based on total scheduled days vs completed scheduled days
   */
  weeklyCompletionPercent(): number {
    let totalScheduledDays = 0;
    let totalCompletedDays = 0;

    for (const habit of this.habits) {
      const scheduledCount = habit.scheduledDays.filter(Boolean).length;
      const completedCount = habit.completionStatus
        .filter((status, index) => habit.scheduledDays[index] && status === true)
        .length;

      totalScheduledDays += scheduledCount;
      totalCompletedDays += completedCount;
    }

    if (totalScheduledDays === 0) return 0;
    return Math.round((totalCompletedDays / totalScheduledDays) * 100);
  }

  /**
   * Check if a day is scheduled for this habit
   */
  isDayScheduled(h: Habit, dayIndex: number): boolean {
    return h.scheduledDays[dayIndex];
  }

  /**
   * Check if a day is completed for this habit
   */
  isDayCompleted(h: Habit, dayIndex: number): boolean {
    return h.completionStatus[dayIndex] === true;
  }

  /**
   * Check if a day is not scheduled (gray out)
   */
  isDayNotScheduled(h: Habit, dayIndex: number): boolean {
    return !h.scheduledDays[dayIndex];
  }
}

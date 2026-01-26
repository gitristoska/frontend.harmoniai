import { Component, input, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatListModule } from '@angular/material/list';
import {
  MonthlyEntry,
  MonthlyGoal,
  MonthlyReflection,
  PlannerTask
} from '../../../../models/api';
import { MonthlyPlanningService } from '../../../../services/monthly-planning.service';
import { PlannerService } from '../../../../services/task.service';

@Component({
  selector: 'app-monthly-planning',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSliderModule,
    MatChipsModule,
    MatDialogModule,
    MatCheckboxModule,
    MatListModule
  ],
  templateUrl: './monthly-planning.component.html',
  styleUrls: ['./monthly-planning.component.scss']
})
export class MonthlyPlanningComponent {
  currentDate = input<Date>(new Date());
  
  // State signals
  monthlyEntry = signal<MonthlyEntry | null>(null);
  isLoading = signal(false);
  isSaving = signal(false);
  error = signal<string | null>(null);
  availableTasks = signal<PlannerTask[]>([]);

  // Edit mode flags
  editingFocus = signal(false);
  editingGoals = signal(false);
  selectedGoalId = signal<string | null>(null);
  showTaskSelector = signal(false);

  // Form data
  focusForm = signal({
    intentions: '',
    moodWords: '',
    notes: ''
  });

  goalsForm = signal<Array<{ id?: string; title: string; description: string; progress: number; order: number }>>([]);

  // Computed signal to ensure we always show 3 goal slots (even if empty)
  displayGoals = computed(() => {
    const entry = this.monthlyEntry();
    if (!entry?.goals || entry.goals.length === 0) {
      // Return 3 empty goal slots
      return [
        { id: 'new-0', title: '', description: '', progress: 0, order: 0 },
        { id: 'new-1', title: '', description: '', progress: 0, order: 1 },
        { id: 'new-2', title: '', description: '', progress: 0, order: 2 }
      ];
    }
    // Return existing goals (up to 3)
    return entry.goals.slice(0, 3);
  });

  constructor(
    private monthlyPlanningService: MonthlyPlanningService,
    private plannerService: PlannerService
  ) {
    // Auto-load entry when current date changes
    effect(() => {
      const monthStr = this.getMonthString(this.currentDate());
      this.loadMonthlyEntry(monthStr);
    });
  }

  /**
   * Load monthly entry for the given month
   */
  private loadMonthlyEntry(month: string) {
    this.isLoading.set(true);
    this.error.set(null);

    this.monthlyPlanningService.getEntry(month).subscribe({
      next: (entry) => {
        this.monthlyEntry.set(entry);
        this.initializeForms(entry);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load monthly entry:', err);
        this.error.set('Failed to load monthly entry');
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Initialize form fields from loaded entry
   */
  private initializeForms(entry: MonthlyEntry) {
    this.focusForm.set({
      intentions: entry.intentions || '',
      moodWords: entry.moodWords || '',
      notes: entry.notes || ''
    });

    if (entry.goals && entry.goals.length > 0) {
      this.goalsForm.set(
        entry.goals.map((g) => ({
          id: g.id,
          title: g.title,
          description: g.description || '',
          progress: g.progress || 0,
          order: g.order
        }))
      );
    } else {
      this.goalsForm.set([]);
    }
  }

  /**
   * Utility: Get month string (YYYY-MM) from a date
   */
  private getMonthString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  /**
   * SECTION: MONTHLY FOCUS
   */

  onEditFocus() {
    this.editingFocus.set(true);
  }

  onSaveFocus() {
    this.isSaving.set(true);
    const entry = this.monthlyEntry();
    if (!entry) {
      this.error.set('No entry loaded');
      this.isSaving.set(false);
      return;
    }

    this.monthlyPlanningService.updateEntry(entry.id, this.focusForm()).subscribe({
      next: (updated) => {
        this.monthlyEntry.set(updated);
        this.editingFocus.set(false);
        this.isSaving.set(false);
      },
      error: (err) => {
        console.error('Failed to save focus:', err);
        this.error.set('Failed to save focus');
        this.isSaving.set(false);
      }
    });
  }

  onCancelFocus() {
    const entry = this.monthlyEntry();
    if (entry) {
      this.focusForm.set({
        intentions: entry.intentions || '',
        moodWords: entry.moodWords || '',
        notes: entry.notes || ''
      });
    }
    this.editingFocus.set(false);
  }

  /**
   * SECTION: MONTHLY GOALS
   */

  onEditGoals() {
    this.editingGoals.set(true);
    
    // Initialize goalsForm with existing goals or 3 empty slots
    const entry = this.monthlyEntry();
    if (entry?.goals && entry.goals.length > 0) {
      this.goalsForm.set(
        entry.goals.map((g) => ({
          id: g.id,
          title: g.title,
          description: g.description || '',
          progress: g.progress || 0,
          order: g.order
        }))
      );
    } else {
      // Create 3 empty goal slots for new goals
      this.goalsForm.set([
        { title: '', description: '', progress: 0, order: 0 },
        { title: '', description: '', progress: 0, order: 1 },
        { title: '', description: '', progress: 0, order: 2 }
      ]);
    }
  }

  onSaveGoals() {
    this.isSaving.set(true);
    const entry = this.monthlyEntry();
    const goalsData = this.goalsForm();
    
    if (!entry) {
      this.error.set('No entry loaded');
      this.isSaving.set(false);
      return;
    }

    // Filter out empty goals and update/create the rest
    const updatePromises = goalsData
      .filter(goal => goal.title && goal.title.trim().length > 0) // Only save goals with titles
      .map((goal) => {
        if (goal.id && !goal.id.startsWith('new-')) {
          // Update existing goal
          return this.monthlyPlanningService.updateGoal(goal.id, {
            title: goal.title,
            description: goal.description,
            progress: goal.progress,
            order: goal.order
          }).toPromise();
        } else {
          // Create new goal
          return this.monthlyPlanningService.createGoal(entry.id, {
            title: goal.title,
            description: goal.description,
            order: goal.order
          }).toPromise();
        }
      });

    Promise.all(updatePromises)
      .then(() => {
        // Reload entry to get updated goals
        const monthStr = this.getMonthString(this.currentDate());
        this.loadMonthlyEntry(monthStr);
        this.editingGoals.set(false);
        this.isSaving.set(false);
      })
      .catch((err) => {
        console.error('Failed to save goals:', err);
        this.error.set('Failed to save goals');
        this.isSaving.set(false);
      });
  }

  onCancelGoals() {
    const entry = this.monthlyEntry();
    if (entry?.goals) {
      this.goalsForm.set(
        entry.goals.map((g) => ({
          id: g.id,
          title: g.title,
          description: g.description || '',
          progress: g.progress || 0,
          order: g.order
        }))
      );
    }
    this.editingGoals.set(false);
  }

  onOpenTaskSelector(goalId: string) {
    this.selectedGoalId.set(goalId);
    this.showTaskSelector.set(true);
    // Load available tasks if needed
    if (this.availableTasks().length === 0) {
      const date = this.currentDate();
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      this.plannerService.getTasksForMonth(year, month).subscribe({
        next: (tasks: PlannerTask[]) => {
          this.availableTasks.set(tasks);
        }
      });
    }
  }

  onToggleTask(goalId: string, taskId: string | number | undefined, isLinked: boolean) {
    if (!taskId) return;
    
    if (isLinked) {
      // Unlink task
      this.monthlyPlanningService.unlinkTaskFromGoal(goalId, taskId.toString()).subscribe({
        next: () => {
          // Reload entry
          const monthStr = this.getMonthString(this.currentDate());
          this.loadMonthlyEntry(monthStr);
        },
        error: (err) => {
          console.error('Failed to unlink task:', err);
          this.error.set('Failed to unlink task');
        }
      });
    } else {
      // Link task
      this.monthlyPlanningService.linkTaskToGoal(goalId, taskId.toString()).subscribe({
        next: () => {
          // Reload entry
          const monthStr = this.getMonthString(this.currentDate());
          this.loadMonthlyEntry(monthStr);
        },
        error: (err) => {
          console.error('Failed to link task:', err);
          this.error.set('Failed to link task');
        }
      });
    }
  }

  getGoalTaskCount(goalId: string): number {
    const goal = this.monthlyEntry()?.goals.find(g => g.id === goalId);
    return goal?.taskLinks?.length || 0;
  }

  /**
   * Utility: Format month display
   */
  getMonthDisplay(): string {
    const date = this.currentDate();
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  /**
   * Check if a task is linked to a specific goal
   */
  isTaskLinked(goalId: string, taskId: string | number | undefined): boolean {
    if (!taskId) return false;
    const goal = this.monthlyEntry()?.goals.find(g => g.id === goalId);
    return goal?.taskLinks?.some(t => t.taskId === taskId.toString()) ?? false;
  }

  /**
   * Get linked tasks for a goal
   */
  getLinkedTasks(goalId: string): { taskId: string; taskTitle: string }[] {
    const goal = this.monthlyEntry()?.goals.find(g => g.id === goalId);
    return goal?.taskLinks || [];
  }

  dismissError() {
    this.error.set(null);
  }
}

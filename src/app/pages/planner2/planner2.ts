import { Component, signal, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { PlannerService } from '../../services/task.service';
import { PlannerTask, TaskStatus } from '../../models/api';
import { CreateTaskDialogComponent } from './create-task-dialog.component';
import {
  DailyPlannerReflection,
  UpdateDailyReflectionDto
} from '../../models/planner/daily-planner-reflection.model';
import {
  CallAndEmailItem,
  CallAndEmailItemResponse
} from '../../models/planner/call-email-item.model';
import * as PlannerInsights from '../../models/planner/planner-insights.model';

@Component({
  selector: 'app-planner2',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatCardModule,
    MatBadgeModule,
    MatTooltipModule,
    MatDialogModule,
    FormsModule,
    MatCheckboxModule,
    MatInputModule,
    MatFormFieldModule
  ],
  templateUrl: './planner2.html',
  styleUrls: ['./planner2.scss'],
  providers: [PlannerService]
})
export class Planner2Component implements OnInit {
  private dialog = inject(MatDialog);
  private plannerService = inject(PlannerService);

  // Expose Object for template
  Object = Object;

  // ========== TASK STATE ==========
  tasks = signal<PlannerTask[]>([]);
  weeklyTasks = signal<{ [key: string]: PlannerTask[] }>({});
  selectedTask = signal<PlannerTask | null>(null);
  selectedDate = signal(new Date());
  activeTab = signal<number>(0);
  isLoading = signal(false);
  error = signal<string | null>(null);
  aiInsights = signal<string>('');
  productivityInsights = signal<string>('');

  // Separate loading states for each view
  dailyLoading = signal(false);
  weeklyLoading = signal(false);
  analyticsLoading = signal(false);

  // ========== REFLECTION STATE ==========
  dailyReflection = signal<DailyPlannerReflection | null>(null);
  callsAndEmails = signal<CallAndEmailItemResponse[]>([]);
  
  // Ratings
  moodRating = signal<number>(5);
  energyRating = signal<number>(5);
  healthRating = signal<number>(5);
  
  // Reflection notes
  gratefulFor = signal<string>('');
  inspirationOrMotivation = signal<string>('');
  personalNotes = signal<string>('');
  notesForTomorrow = signal<string>('');

  // New call/email input
  newCallEmailText = signal<string>('');

  // AI Advice
  dailyAdvice = signal<PlannerInsights.DailyPlanningAdvice | null>(null);
  dailyWellness = signal<PlannerInsights.DailyWellnessInsight | null>(null);

  reflectionLoading = signal(false);
  reflectionSaving = signal(false);

  // ========== COMPUTED METRICS ==========
  completedCount = computed(() => 
    this.tasks().filter(t => t.status === TaskStatus.Completed).length
  );

  totalCount = computed(() => this.tasks().length);

  completionRate = computed(() => {
    const total = this.totalCount();
    return total > 0 ? Math.round((this.completedCount() / total) * 100) : 0;
  });

  procrastinationRisks = computed(() =>
    this.tasks().filter(t => (t.rescheduleCount ?? 0) >= 3)
  );

  tasksForToday = computed(() =>
    this.tasks()
      .filter(t => this.isSameDay(t.startDate, this.selectedDate()))
      .sort((a, b) => {
        const timeA = a.startTime || '23:59';
        const timeB = b.startTime || '23:59';
        return timeA.localeCompare(timeB);
      })
  );

  completedCallsEmails = computed(() =>
    this.callsAndEmails().filter(item => item.isDone).length
  );

  totalCallsEmails = computed(() => this.callsAndEmails().length);


  ngOnInit(): void {
    const dateStr = this.selectedDate().toISOString().split('T')[0];
    this.loadTasksForDate(this.selectedDate());
    this.loadDailyReflection(dateStr);
    this.loadDailyAdvice(dateStr);
    this.loadDailyWellness(dateStr);
  }

  // ==========================================
  // DATA LOADING
  // ==========================================

  loadTasksForDate(date: Date): void {
    this.dailyLoading.set(true);
    this.error.set(null);
    const dateStr = date.toISOString().split('T')[0];

    this.plannerService.getTasksForDay(dateStr).subscribe({
      next: (tasks) => {
        this.tasks.set(tasks);
        this.dailyLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load tasks', err);
        this.error.set('Failed to load tasks');
        this.dailyLoading.set(false);
      }
    });
  }

  loadWeeklyTasks(): void {
    this.weeklyLoading.set(true);
    this.error.set(null);
    const weekStart = this.getWeekStart(this.selectedDate());
    const weekStartStr = weekStart.toISOString().split('T')[0];

    this.plannerService.getTasksForWeek(weekStartStr).subscribe({
      next: (tasks) => {
        // Group tasks by date
        const grouped: { [key: string]: PlannerTask[] } = {};
        tasks.forEach(task => {
          const date = task.startDate?.split('T')[0] || '';
          if (!grouped[date]) grouped[date] = [];
          grouped[date].push(task);
        });
        
        // Sort each day's tasks by time
        Object.keys(grouped).forEach(date => {
          grouped[date].sort((a, b) => {
            const timeA = a.startTime || '23:59';
            const timeB = b.startTime || '23:59';
            return timeA.localeCompare(timeB);
          });
        });
        
        this.weeklyTasks.set(grouped);
        this.weeklyLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load weekly tasks', err);
        this.error.set('Failed to load weekly tasks');
        this.weeklyLoading.set(false);
      }
    });
  }

  // ==========================================
  // DAILY REFLECTION LOADING
  // ==========================================

  loadDailyReflection(dateStr: string): void {
    this.reflectionLoading.set(true);
    this.plannerService.getDailyReflection(dateStr).subscribe({
      next: (reflection) => {
        this.dailyReflection.set(reflection);
        this.callsAndEmails.set(reflection.callsAndEmails || []);
        this.moodRating.set(reflection.moodRating || 5);
        this.energyRating.set(reflection.productivityRating || 5);
        this.healthRating.set(reflection.healthRating || 5);
        this.gratefulFor.set(reflection.gratefulFor || '');
        this.inspirationOrMotivation.set(reflection.inspirationOrMotivation || '');
        this.personalNotes.set(reflection.personalNotes || '');
        this.notesForTomorrow.set(reflection.notesForTomorrow || '');
        this.reflectionLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load daily reflection', err);
        this.reflectionLoading.set(false);
        // Initialize with empty reflection data
        this.callsAndEmails.set([]);
      }
    });
  }

  loadDailyAdvice(dateStr: string): void {
    this.plannerService.getDailyPlanningAdvice(dateStr).subscribe({
      next: (advice) => {
        this.dailyAdvice.set(advice);
      },
      error: (err) => {
        console.error('Failed to load daily advice', err);
      }
    });
  }

  loadDailyWellness(dateStr: string): void {
    this.plannerService.getDailyWellnessInsights(dateStr).subscribe({
      next: (wellness) => {
        this.dailyWellness.set(wellness);
      },
      error: (err) => {
        console.error('Failed to load daily wellness', err);
      }
    });
  }

  // ==========================================
  // REFLECTION SAVING
  // ==========================================

  saveDailyReflection(): void {
    this.reflectionSaving.set(true);
    const dateStr = this.selectedDate().toISOString().split('T')[0];
    
    const dto: UpdateDailyReflectionDto = {
      callsAndEmails: this.callsAndEmails(),
      productivityRating: this.energyRating(),
      moodRating: this.moodRating(),
      healthRating: this.healthRating(),
      gratefulFor: this.gratefulFor(),
      inspirationOrMotivation: this.inspirationOrMotivation(),
      personalNotes: this.personalNotes(),
      notesForTomorrow: this.notesForTomorrow()
    };

    this.plannerService.updateDailyReflection(dto, dateStr).subscribe({
      next: (updated) => {
        this.dailyReflection.set(updated);
        this.reflectionSaving.set(false);
        // Show success message (optional)
        console.log('Daily reflection saved successfully');
      },
      error: (err) => {
        console.error('Failed to save daily reflection', err);
        this.reflectionSaving.set(false);
      }
    });
  }

  // ==========================================
  // CALLS & EMAILS MANAGEMENT
  // ==========================================

  addCallOrEmail(): void {
    const text = this.newCallEmailText().trim();
    if (!text) return;

    const item: CallAndEmailItem = {
      text,
      isDone: false
    };

    const dateStr = this.selectedDate().toISOString().split('T')[0];
    
    this.plannerService.addCallOrEmail(item, dateStr).subscribe({
      next: (response) => {
        const items = this.callsAndEmails();
        items.push(response);
        this.callsAndEmails.set([...items]);
        this.newCallEmailText.set('');
      },
      error: (err) => {
        console.error('Failed to add call/email', err);
      }
    });
  }

  toggleCallOrEmail(item: CallAndEmailItemResponse): void {
    if (!item.id) return;

    const updated: CallAndEmailItem = {
      text: item.text,
      isDone: !item.isDone
    };

    this.plannerService.updateCallOrEmail(item.id, updated).subscribe({
      next: (response) => {
        const items = this.callsAndEmails();
        const index = items.findIndex(i => i.id === item.id);
        if (index !== -1) {
          items[index] = response;
          this.callsAndEmails.set([...items]);
        }
      },
      error: (err) => {
        console.error('Failed to update call/email', err);
      }
    });
  }

  deleteCallOrEmail(itemId: string): void {
    this.plannerService.deleteCallOrEmail(itemId).subscribe({
      next: () => {
        const items = this.callsAndEmails();
        this.callsAndEmails.set(items.filter(i => i.id !== itemId));
      },
      error: (err) => {
        console.error('Failed to delete call/email', err);
      }
    });
  }

  loadAiInsights(): void {
    this.analyticsLoading.set(true);
    const dateStr = this.selectedDate().toISOString().split('T')[0];

    // Simulate AI insights - in production, this would call your API
    const insights = `Based on your patterns today, you typically work best in the morning. 
Your ${this.totalCount()} tasks are well-distributed. 
Start with high-priority tasks between 9-12 AM when your focus is sharpest. 
You have ${this.procrastinationRisks().length} task(s) at procrastination risk - complete these by EOD.`;
    
    this.aiInsights.set(insights);
    this.analyticsLoading.set(false);
  }

  loadProductivityInsights(): void {
    this.analyticsLoading.set(true);

    // Simulate productivity analysis - in production, call your API
    const insights = `📊 Weekly Productivity Analysis

Duration Accuracy:
• Your estimates are 15% high on average
• Complex tasks: +23% overestimated
• Simple tasks: -18% underestimated

Best Times to Work:
• Peak productivity: 8-11 AM (78% completion)
• Afternoon slump: 2-3:30 PM (42% completion)
• Evening recovery: 6-8 PM (65% completion)

This Week:
• Total tasks: ${this.totalCount()}
• Completed: ${this.completedCount()}
• Completion rate: ${this.completionRate()}%

Recommendations:
1. Schedule critical work in morning slots
2. Batch meetings/emails for afternoon
3. Review deadlines weekly to prevent rush`;
    
    this.productivityInsights.set(insights);
    this.analyticsLoading.set(false);
  }

  // ==========================================
  // TASK MANAGEMENT
  // ==========================================

  openCreateTaskDialog(): void {
    const dialogRef = this.dialog.open(CreateTaskDialogComponent, {
      width: '500px',
      maxHeight: '90vh',
      disableClose: false
    });

    dialogRef.afterClosed().subscribe((newTask: PlannerTask) => {
      if (newTask) {
        // Add new task to list and refresh
        this.loadTasksForDate(this.selectedDate());
      }
    });
  }

  updateTaskStatus(task: PlannerTask, newStatus: TaskStatus): void {
    this.plannerService.updateTask(task.id!, { status: newStatus }).subscribe({
      next: (updated) => this.onTaskUpdated(updated),
      error: (err) => console.error('Failed to update task', err)
    });
  }

  deleteTask(task: PlannerTask): void {
    if (confirm('Delete this task?')) {
      this.plannerService.deleteTask(task.id!).subscribe({
        next: () => this.onTaskDeleted(task),
        error: (err) => console.error('Failed to delete task', err)
      });
    }
  }

  onTaskUpdated(task: PlannerTask): void {
    const index = this.tasks().findIndex(t => t.id === task.id);
    if (index !== -1) {
      const updated = [...this.tasks()];
      updated[index] = task;
      this.tasks.set(updated);
    }
    this.selectedTask.set(task);
  }

  onTaskDeleted(task: PlannerTask): void {
    this.tasks.set(this.tasks().filter(t => t.id !== task.id));
    this.selectedTask.set(null);
  }

  // ==========================================
  // HELPERS
  // ==========================================

  isSameDay(dateStr: string | undefined, date: Date): boolean {
    if (!dateStr) return false;
    const taskDate = new Date(dateStr);
    return (
      taskDate.getFullYear() === date.getFullYear() &&
      taskDate.getMonth() === date.getMonth() &&
      taskDate.getDate() === date.getDate()
    );
  }

  formatTime(time: string | undefined): string {
    if (!time) return 'No time';
    return time;
  }

  getStatusLabel(status: TaskStatus): string {
    const labels: Record<TaskStatus, string> = {
      [TaskStatus.NotStarted]: 'To Do',
      [TaskStatus.InProgress]: 'In Progress',
      [TaskStatus.Completed]: 'Done',
      [TaskStatus.OnHold]: 'On Hold',
      [TaskStatus.Cancelled]: 'Cancelled'
    };
    return labels[status] || 'Unknown';
  }

  getPriorityLabel(priority: number): string {
    const labels: Record<number, string> = {
      1: 'High',
      2: 'Medium',
      3: 'Low'
    };
    return labels[priority] || 'Normal';
  }

  getPriorityClass(priority: number): string {
    const classes: Record<number, string> = {
      1: 'priority-high',
      2: 'priority-medium',
      3: 'priority-low'
    };
    return classes[priority] || 'priority-medium';
  }

  onDateSelected(date: Date): void {
    this.selectedDate.set(date);
    this.selectedTask.set(null);
    this.loadTasksForDate(date);
  }

  previousDay(): void {
    const newDate = new Date(this.selectedDate());
    newDate.setDate(newDate.getDate() - 1);
    this.onDateSelected(newDate);
  }

  nextDay(): void {
    const newDate = new Date(this.selectedDate());
    newDate.setDate(newDate.getDate() + 1);
    this.onDateSelected(newDate);
  }

  todayClicked(): void {
    this.onDateSelected(new Date());
  }

  getDateLabel(date: Date): string {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (this.isSameDay(date.toISOString(), today)) {
      return 'Today';
    } else if (this.isSameDay(date.toISOString(), tomorrow)) {
      return 'Tomorrow';
    }
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }

  getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
  }

  getWeekDays(startDate: Date): Date[] {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  }

  getTasksForDay(dateStr: string): PlannerTask[] {
    return this.weeklyTasks()[dateStr] || [];
  }

  getWeeklyCompletionRate(): number {
    const allTasks = Object.values(this.weeklyTasks()).flat();
    const completed = allTasks.filter(t => t.status === TaskStatus.Completed).length;
    return allTasks.length > 0 ? Math.round((completed / allTasks.length) * 100) : 0;
  }

  getDayLabel(date: Date): string {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  onTabChange(index: number): void {
    this.activeTab.set(index);
    const dateStr = this.selectedDate().toISOString().split('T')[0];
    
    if (index === 0) {
      // Daily view - load reflection and advice
      this.loadDailyReflection(dateStr);
      this.loadDailyAdvice(dateStr);
      this.loadDailyWellness(dateStr);
    } else if (index === 1) {
      // Weekly view - load weekly tasks
      this.loadWeeklyTasks();
    } else if (index === 2) {
      // Analytics view - load productivity insights
      this.loadProductivityInsights();
      this.loadAiInsights();
    }
  }
}

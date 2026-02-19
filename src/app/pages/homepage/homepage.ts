import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { SettingsService } from '../../services/settings.service';
import { PlannerService } from '../../services/task.service';
import { TaskStatus } from '../../models/api';
import { HabitService } from '../../services/habit.service';
import { AuthService } from '../../services/auth.service';
import { AiInsightsService } from '../../services/ai-insights.service';
import type { Habit } from '../../models/habit.model';

interface TaskItem { 
  id?: string | number;
  title: string; 
  time?: string; 
  tag?: string; 
  priority?: 'low'|'medium'|'high'; 
  done?: boolean 
}
interface HabitItem { 
  id: string;
  name: string;
  done?: boolean;
  days: (boolean | null)[];
}
interface AiRec { title: string; description: string; icon: string }

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatProgressBarModule, MatListModule],
  templateUrl: './homepage.html',
  styleUrls: ['./homepage.scss']
})
export class Homepage implements OnInit {
  protected readonly greeting = signal('Welcome back, User! 👋');

  protected readonly todayDateString = signal<string>('');

  protected readonly tasksToday = signal<TaskItem[]>([]);

  protected readonly habits = signal<HabitItem[]>([]);

  protected readonly todayDayIndex = signal<number>(0);

  protected readonly productivityPercent = signal<number>(0);

  protected readonly productivityLabel = signal<string>('');

  protected readonly productivityDescription = signal<string>('');

  protected readonly aiRecommendations = signal<AiRec[]>([]);

  protected readonly aiRecommendationsLoading = signal(false);

  constructor(
    private settingsService: SettingsService,
    private plannerService: PlannerService,
    private habitService: HabitService,
    private authService: AuthService,
    private aiInsightsService: AiInsightsService
  ) {
    this.updateGreetingWithUserName();
  }

  private updateGreetingWithUserName(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.greeting.set(`Welcome back, ${currentUser.fullName}! 👋`);
    }
    this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.greeting.set(`Welcome back, ${user.fullName}! 👋`);
      }
    });
  }

  ngOnInit(): void {
    this.setTodayDayIndex();
    this.setTodayDateString();
    this.loadSettings();
    this.loadTodaysTasks();
    this.loadHabits();
    this.loadDailyRecommendations();
  }

  setTodayDayIndex() {
    // Convert JavaScript day (0=Sunday) to Monday-based index (0=Monday, 6=Sunday)
    const today = new Date().getDay();
    const mondayBasedIndex = (today + 6) % 7;
    this.todayDayIndex.set(mondayBasedIndex);
  }

  setTodayDateString() {
    const today = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    const dayName = days[today.getDay()];
    const monthName = months[today.getMonth()];
    const dayNum = today.getDate();
    
    this.todayDateString.set(`${dayName}, ${monthName} ${dayNum}`);
  }

  loadSettings() {
    this.settingsService.getSettings().subscribe({
      next: (settings) => {
        // Settings loaded successfully
      },
      error: (err) => {
        console.warn('Failed to load settings', err);
      }
    });
  }

  loadTodaysTasks() {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    this.plannerService.getTasksForDay(today).subscribe({
      next: (tasks) => {
        const taskItems: TaskItem[] = tasks.map(task => ({
          id: task.id,
          title: task.title || '',
          tag: task.category || undefined,
          priority: this.getPriorityLabel(task.priority),
          done: typeof task.status === 'string' ? task.status.toLowerCase() === 'done' : task.status === TaskStatus.Done || task.status === 2
        }));
        this.tasksToday.set(taskItems);
        
        // Calculate productivity
        const totalTasks = tasks.length;
        if (totalTasks > 0) {
          const completedTasks = tasks.filter(t => 
            typeof t.status === 'string' ? t.status.toLowerCase() === 'done' : t.status === TaskStatus.Done || t.status === 2
          ).length;
          const productivity = Math.round((completedTasks / totalTasks) * 100);
          this.productivityPercent.set(productivity);
          
          const { label, description } = this.getProductivityLabelAndDescription(productivity);
          this.productivityLabel.set(label);
          this.productivityDescription.set(description);
        } else {
          this.productivityPercent.set(0);
          this.productivityLabel.set('Slow Start');
          this.productivityDescription.set('No tasks for today');
        }
      },
      error: (err) => {
        console.warn('Failed to load today tasks', err);
        this.tasksToday.set([]);
        this.productivityPercent.set(0);
        this.productivityLabel.set('Slow Start');
        this.productivityDescription.set('Unable to load tasks');
      }
    });
  }

  loadHabits() {
    // Get current week start
    const today = new Date();
    const dayOfWeek = today.getDay() || 7; // Convert Sunday (0) to 7
    const diff = today.getDate() - dayOfWeek + 1; // Adjust to get Monday
    const weekStart = new Date(today.getFullYear(), today.getMonth(), diff);
    
    this.habitService.getHabitsForWeek(weekStart, false).subscribe({
      next: (response) => {
        // Use consistent Monday-based day index (0=Monday, 6=Sunday)
        const dayIndex = this.todayDayIndex();
        
        const habitItems: HabitItem[] = response.habits
          .filter(habit => habit.scheduledDays[dayIndex]) // Only show habits scheduled for today
          .map(habit => ({
            id: habit.id,
            name: habit.name,
            days: habit.completionStatus,
            done: habit.completionStatus[dayIndex] === true
          }));
        this.habits.set(habitItems);
      },
      error: (err) => {
        console.warn('Failed to load habits', err);
        this.habits.set([]);
      }
    });
  }

  loadDailyRecommendations() {
    this.aiRecommendationsLoading.set(true);
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    this.aiInsightsService.getDailyRecommendations(today).subscribe({
      next: (response) => {
        this.aiRecommendations.set(response.recommendations);
        this.aiRecommendationsLoading.set(false);
      },
      error: (err) => {
        console.warn('Failed to load daily recommendations', err);
        this.aiRecommendations.set([]);
        this.aiRecommendationsLoading.set(false);
      }
    });
  }

  getPriorityLabel(priority?: number): 'low' | 'medium' | 'high' {
    switch (priority) {
      case 2:
        return 'high';
      case 1:
        return 'medium';
      case 0:
      default:
        return 'low';
    }
  }

  getProductivityLabelAndDescription(percent: number): { label: string; description: string } {
    if (percent >= 81) {
      return {
        label: 'Excellent Flow',
        description: 'All or nearly all tasks completed, excellent productivity'
      };
    } else if (percent >= 61) {
      return {
        label: 'Good Momentum',
        description: 'Most tasks completed, good productivity'
      };
    } else if (percent >= 41) {
      return {
        label: 'Steady Progress',
        description: 'About half of tasks done, some progress'
      };
    } else if (percent >= 21) {
      return {
        label: 'Getting There',
        description: 'Few tasks completed, low progress'
      };
    } else {
      return {
        label: 'Slow Start',
        description: 'Almost nothing completed or many high-priority tasks missed'
      };
    }
  }

  toggleTaskDone(index: number) {
    const tasks = this.tasksToday();
    const task = tasks[index];
    
    if (task && task.id) {
      // Toggle locally first (optimistic update)
      task.done = !task.done;
      this.tasksToday.set([...tasks]);
      
      // Update via API
      const newStatus = task.done ? 2 : 0; // 2 = Completed, 0 = NotStarted
      this.plannerService.updateTask(task.id, {
        status: newStatus
      }).subscribe({
        next: () => {
          console.log('Task updated successfully');
          // Recalculate productivity after task update
          this.calculateProductivity();
        },
        error: (err) => {
          console.error('Failed to update task', err);
          // Revert on error
          task.done = !task.done;
          this.tasksToday.set([...tasks]);
        }
      });
    }
  }

  calculateProductivity() {
    const tasks = this.tasksToday();
    const totalTasks = tasks.length;
    if (totalTasks > 0) {
      const completedTasks = tasks.filter(t => t.done).length;
      const productivity = Math.round((completedTasks / totalTasks) * 100);
      this.productivityPercent.set(productivity);
      
      const { label, description } = this.getProductivityLabelAndDescription(productivity);
      this.productivityLabel.set(label);
      this.productivityDescription.set(description);
    }
  }

  toggleHabit(index: number) {
    const habits = this.habits();
    const habit = habits[index];
    
    if (habit) {
      const todayIndex = this.todayDayIndex();

      // Toggle today's completion status
      habit.done = !habit.done;
      habit.days[todayIndex] = habit.done ? true : false;
      
      // Update via API using the new PATCH endpoint
      this.habitService.markDayComplete(habit.id, todayIndex, habit.done).subscribe({
        next: () => {
          this.habits.set([...habits]);
          console.log('Habit updated successfully');
        },
        error: (err) => {
          console.error('Failed to update habit', err);
          // Revert on error
          habit.done = !habit.done;
          habit.days[todayIndex] = !habit.done ? true : false;
          this.habits.set([...habits]);
        }
      });
    }
  }

  get tasksCount(): number {
    return this.tasksToday().filter(t => !t.done).length;
  }

  get habitCompletionPercent(): number {
    const h = this.habits();
    if (!h.length) return 0;
    const done = h.filter(x => x.done).length;
    return Math.round((done / h.length) * 100);
  }

  getCompletedTasks(): number {
    return this.tasksToday().filter(t => t.done).length;
  }

  getCompletedHabits(): number {
    return this.habits().filter(h => h.done).length;
  }

  getIconEmoji(iconName: string): string {
    const iconMap: { [key: string]: string } = {
      psychology: '🧠',
      local_fire_department: '🔥',
      trending_up: '📈',
      mood: '😊',
      fitness_center: '💪',
      warning: '⚠️',
      self_improvement: '📚',
      schedule: '📅'
    };
    return iconMap[iconName] || '✨';
  }
}

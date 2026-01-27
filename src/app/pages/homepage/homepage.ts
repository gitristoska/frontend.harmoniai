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
import { HabitService } from '../../services/habit.service';
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
  days: boolean[];
}
interface AiRec { title: string; desc: string; icon: string }

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

  protected readonly aiRecommendations = signal<AiRec[]>([
    { title: 'Schedule optimization', desc: 'Consider tackling high-priority tasks during your peak productivity hours (9-11 AM).', icon: 'psychology' },
    { title: 'Habit consistency', desc: "You're at 60% today. Keep up the momentum!", icon: 'local_fire_department' },
    { title: 'Balance reminder', desc: "You have several work tasks. Don't forget to schedule breaks and personal time.", icon: 'trending_up' }
  ]);

  constructor(
    private settingsService: SettingsService,
    private plannerService: PlannerService,
    private habitService: HabitService
  ) {}

  ngOnInit(): void {
    this.setTodayDayIndex();
    this.setTodayDateString();
    this.loadSettings();
    this.loadTodaysTasks();
    this.loadHabits();
  }

  setTodayDayIndex() {
    // Get today's day of week (0 = Sunday, 1 = Monday, ... 6 = Saturday)
    const today = new Date().getDay();
    this.todayDayIndex.set(today);
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
        const displayName = settings.displayName || 'User';
        this.greeting.set(`Welcome back, ${displayName}! 👋`);
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
          done: task.status === 2 || task.isDone || false  // TaskStatus.Completed = 2
        }));
        this.tasksToday.set(taskItems);
        
        // Calculate productivity
        const totalTasks = tasks.length;
        if (totalTasks > 0) {
          const completedTasks = tasks.filter(t => t.status === 2 || t.isDone).length;
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
    this.habitService.getAll().subscribe({
      next: (habits) => {
        const todayIndex = this.todayDayIndex();
        const habitItems: HabitItem[] = habits.map(habit => ({
          id: habit.id,
          name: habit.name,
          days: habit.days,
          done: habit.days[todayIndex] || false
        }));
        this.habits.set(habitItems);
      },
      error: (err) => {
        console.warn('Failed to load habits', err);
        this.habits.set([]);
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
      // Toggle today's day
      habit.done = !habit.done;
      habit.days[todayIndex] = habit.done;
      
      // Update via API
      this.habitService.update(habit.id, {
        name: habit.name,
        days: habit.days
      }).subscribe({
        next: () => {
          this.habits.set([...habits]);
          console.log('Habit updated successfully');
        },
        error: (err) => {
          console.error('Failed to update habit', err);
          // Revert on error
          habit.done = !habit.done;
          habit.days[todayIndex] = habit.done;
          this.habits.set([...habits]);
        }
      });
    }
  }

  get tasksCount() { return this.tasksToday().filter(t => !t.done).length }

  // overall habit completion percent (simple example)
  get habitCompletionPercent() {
    const h = this.habits();
    if (!h.length) return 0;
    const done = h.filter(x => x.done).length;
    return Math.round((done / h.length) * 100);
  }
}

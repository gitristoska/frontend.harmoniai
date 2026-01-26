import { Component, signal, computed, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { PlannerService } from '../../../services/task.service';
import { MonthlyPlanningService } from '../../../services/monthly-planning.service';
import { PlannerTask, MonthlyEntry } from '../../../models/api';
import { Observable } from 'rxjs';
import { EventsListComponent } from './events-list/events-list.component';
import { ViewModeSelectorComponent } from './view-mode-selector/view-mode-selector.component';
import { CategorySelectorComponent } from './category-selector/category-selector.component';
import { AddTaskFormComponent, NewTaskData } from './add-task-form/add-task-form.component';
import { EditTaskFormComponent, EditTaskData } from './edit-task-form/edit-task-form.component';
import { AddTaskButtonComponent } from './add-task-button/add-task-button.component';
import { EventDetailComponent, EventUpdateData } from './event-detail/event-detail.component';
import { DailyViewComponent } from './daily-view/daily-view.component';
import { WeeklyViewComponent } from './weekly-view/weekly-view.component';
import { MonthlyViewComponent } from './monthly-view/monthly-view.component';
import { InspirationCardComponent } from './dashboard-cards/inspiration-card.component';
import { MustGetDoneCardComponent } from './dashboard-cards/must-get-done-card.component';
import { WeeklyHabitsCardComponent } from './dashboard-cards/weekly-habits-card.component';

export interface CalendarEvent {
  id?: string | number;
  title: string;
  time: string;
  date?: Date;
  category?: string;
  description?: string;
}

export interface DayCell {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
}

export interface WeekDay {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatIconModule, 
    MatButtonModule, 
    DragDropModule,
    EventsListComponent,
    ViewModeSelectorComponent,
    CategorySelectorComponent,
    AddTaskButtonComponent,
    AddTaskFormComponent,
    EditTaskFormComponent,
    EventDetailComponent,
    DailyViewComponent,
    WeeklyViewComponent,
    MonthlyViewComponent,
    InspirationCardComponent,
    MustGetDoneCardComponent,
    WeeklyHabitsCardComponent
  ],
  providers: [PlannerService, MonthlyPlanningService],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent {
  viewMode = signal<'daily' | 'weekly' | 'monthly'>('daily');
  currentDate = signal(new Date());
  selectedDate = signal(new Date());
  selectedCategory = signal('all');
  
  // For monthly view
  monthlyViewMode = signal<'month' | 'day'>('month');
  selectedMonthlyDay = signal<Date | null>(null);

  // Time range settings (hardcoded for now - 8 AM to 10 PM)
  startHour = 8;
  endHour = 22;

  // Add task form properties
  showAddTaskForm = signal(false);
  
  // Edit task form properties
  showEditTaskForm = signal(false);
  editingTask = signal<CalendarEvent | null>(null);
  
  // Selected event for detail view
  selectedEvent = signal<CalendarEvent | null>(null);

  categories = [
    { id: 'all', name: 'All Categories', color: '#e5e7eb' },
    { id: 'study', name: 'Study', color: '#3b82f6' },
    { id: 'work', name: 'Work', color: '#a855f7' },
    { id: 'doctor', name: 'Doctor', color: '#ef4444' },
    { id: 'activities', name: 'Activities', color: '#10b981' },
    { id: 'budget', name: 'Budget', color: '#f59e0b' },
    { id: 'meals', name: 'Meals', color: '#f97316' }
  ];

  allEvents = signal<CalendarEvent[]>([]);

  // Monthly reflection
  currentMonthlyReflection = signal<any>(null);

  constructor(private plannerService: PlannerService, private monthlyPlanningService: MonthlyPlanningService, private router: Router) {
    this.loadTasks();
    this.loadMonthlyReflection();
  }

  ngOnInit() {
    // No longer needed - events are computed from allEvents
  }

  private loadTasks() {
    const view = this.viewMode();
    let tasksObs: Observable<PlannerTask[]>;

    if (view === 'daily') {
      const dateStr = this.selectedDate().toISOString().split('T')[0];
      tasksObs = this.plannerService.getTasksForDay(dateStr);
    } else {
      // For weekly and monthly, load the full month to ensure all events are available
      const year = this.currentDate().getFullYear();
      const month = this.currentDate().getMonth() + 1;
      tasksObs = this.plannerService.getTasksForMonth(year, month);
    }

    tasksObs.subscribe({
      next: (tasks: PlannerTask[]) => {
        const events = tasks.map(t => {
          let timeStr = '00:00';
          let dateObj: Date | undefined;
          
          if (t.startDate) {
            // Extract time from ISO string (before the 'T')
            const timePart = t.startDate.split('T')[1];
            timeStr = timePart?.slice(0, 5) ?? '00:00';
            
            // Create date from ISO string
            dateObj = new Date(t.startDate);
            console.log('Task:', t.title, 'startDate:', t.startDate, 'extracted time:', timeStr, 'date:', dateObj);
          }
          
          return {
            id: t.id,
            title: t.title,
            time: timeStr,
            date: dateObj,
            category: t.category,
            description: t.description
          };
        });
        this.allEvents.set(events);
      },
      error: err => console.error('Error loading calendar tasks:', err)
    });
  }

  timeSlots = computed(() => {
    const slots = [];
    for (let i = this.startHour; i < this.endHour; i++) {
      slots.push(`${i.toString().padStart(2, '0')}:00`);
    }
    return slots;
  });

  // Events for the selected period (day/week/month)
  selectedPeriodEvents = computed(() => {
    const view = this.viewMode();
    const events = this.allEvents();
    
    if (view === 'daily') {
      return events.filter(e => e.date && this.isSameDay(e.date, this.selectedDate()));
    } else if (view === 'weekly') {
      const startOfWeek = new Date(this.selectedDate());
      startOfWeek.setDate(this.selectedDate().getDate() - this.selectedDate().getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return events.filter(e => e.date && e.date >= startOfWeek && e.date <= endOfWeek);
    } else if (view === 'monthly') {
      // Check if we're showing a specific day or the whole month
      if (this.monthlyViewMode() === 'day' && this.selectedMonthlyDay()) {
        return events.filter(e => e.date && this.isSameDay(e.date, this.selectedMonthlyDay()!));
      }
      // Show all month events
      return events.filter(e => e.date && e.date.getMonth() === this.currentDate().getMonth() && e.date.getFullYear() === this.currentDate().getFullYear());
    }
    return [];
  });

  topPriorities = computed(() => {
    // Get top 3 priority tasks from the selected period
    return this.selectedPeriodEvents()
      .sort((a: CalendarEvent, b: CalendarEvent) => {
        // Sort by time to show earliest tasks first
        const timeA = a.time || '23:59';
        const timeB = b.time || '23:59';
        return timeA.localeCompare(timeB);
      })
      .slice(0, 3);
  });

  // Get all high-priority events for the current week (for dashboard card)
  weeklyHighPriorityEvents = computed(() => {
    const startOfWeek = new Date(this.selectedDate());
    startOfWeek.setDate(this.selectedDate().getDate() - this.selectedDate().getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    return this.allEvents()
      .filter(e => e.date && e.date >= startOfWeek && e.date <= endOfWeek)
      .sort((a, b) => {
        const timeA = a.time || '23:59';
        const timeB = b.time || '23:59';
        return timeA.localeCompare(timeB);
      });
  });

  filteredEvents = computed(() => {
    const category = this.selectedCategory();
    const view = this.viewMode();
    let events = category === 'all' ? this.allEvents() : this.allEvents().filter(e => e.category === category);

    // Filter by date based on view mode
    if (view === 'daily') {
      events = events.filter(e => e.date && this.isSameDay(e.date, this.selectedDate()));
    } else if (view === 'weekly') {
      const startOfWeek = new Date(this.selectedDate());
      startOfWeek.setDate(this.selectedDate().getDate() - this.selectedDate().getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      events = events.filter(e => e.date && e.date >= startOfWeek && e.date <= endOfWeek);
    } else if (view === 'monthly') {
      events = events.filter(e => e.date && e.date.getMonth() === this.currentDate().getMonth() && e.date.getFullYear() === this.currentDate().getFullYear());
    }

    return events;
  });

  /** Events for daily, weekly, monthly */
  dailyEvents = (date: Date) => this.filteredEvents().filter(e => e.date && this.isSameDay(e.date, date));
  weeklyEvents = (day: WeekDay) => this.filteredEvents().filter(e => e.date && this.isSameDay(e.date, day.date));
  monthlyEvents = (day: DayCell) => this.filteredEvents().filter(e => e.date && this.isSameDay(e.date, day.date));

  calendarDays = computed(() => {
    const date = this.currentDate();
    const year = date.getFullYear();
    const month = date.getMonth();
    const today = new Date();
    const selected = this.selectedDate();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    const days: DayCell[] = [];

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({ date: d, dayOfMonth: d.getDate(), isCurrentMonth: false, isToday: this.isSameDay(d,today), isSelected: this.isSameDay(d,selected) });
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dayDate = new Date(year, month, d);
      days.push({ date: dayDate, dayOfMonth: d, isCurrentMonth: true, isToday: this.isSameDay(dayDate,today), isSelected: this.isSameDay(dayDate,selected) });
    }

    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      const dayDate = new Date(year, month + 1, d);
      days.push({ date: dayDate, dayOfMonth: d, isCurrentMonth: false, isToday: this.isSameDay(dayDate,today), isSelected: this.isSameDay(dayDate,selected) });
    }

    return days;
  });

  weekDays = computed(() => {
    const selected = this.selectedDate();
    const dayOfWeek = selected.getDay();
    const startOfWeek = new Date(selected);
    startOfWeek.setDate(selected.getDate() - dayOfWeek);
    const today = new Date();
    return Array.from({length:7}, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return {
        date,
        dayOfMonth: date.getDate(),
        isCurrentMonth: date.getMonth() === this.currentDate().getMonth(),
        isToday: this.isSameDay(date,today),
        isSelected: this.isSameDay(date,selected)
      };
    });
  });

  monthYearLabel = computed(() => this.currentDate().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));

  navigationLabel = computed(() => {
    const view = this.viewMode();
    const date = this.selectedDate();

    if (view === 'daily') {
      return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    } else if (view === 'weekly') {
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      const startStr = startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const endStr = endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return `${startStr} - ${endStr}`;
    } else {
      return this.currentDate().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
  });

  private isSameDay(d1: Date, d2: Date): boolean {
    return d1.getFullYear()===d2.getFullYear() && d1.getMonth()===d2.getMonth() && d1.getDate()===d2.getDate();
  }

  getCategoryColor(categoryId?: string): string {
    return this.categories.find(c=>c.id===categoryId)?.color ?? '#e5e7eb';
  }

  getCategoryName(categoryId?: string): string {
    return this.categories.find(c=>c.id===categoryId)?.name ?? '';
  }

  getEventTopPosition(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    return totalMinutes;
  }

  getEventHour(time: string): number {
    return parseInt(time.split(':')[0], 10);
  }

  selectDate(date: Date) { this.selectedDate.set(new Date(date)); this.loadTasks(); }
  selectCategory(categoryId: string) { this.selectedCategory.set(categoryId); }
  setViewMode(mode: 'daily' | 'weekly' | 'monthly') { this.viewMode.set(mode); this.loadTasks(); }

  selectMonthlyDay(date: Date) {
    this.selectedMonthlyDay.set(date);
    this.monthlyViewMode.set('day');
  }

  showAllMonth() {
    this.monthlyViewMode.set('month');
    this.selectedMonthlyDay.set(null);
  }

  previousDay() { const d=this.selectedDate(); d.setDate(d.getDate()-1); this.selectedDate.set(new Date(d)); this.updateCurrentDateIfNeeded(); this.loadTasks(); }
  nextDay() { const d=this.selectedDate(); d.setDate(d.getDate()+1); this.selectedDate.set(new Date(d)); this.updateCurrentDateIfNeeded(); this.loadTasks(); }
  previousWeek() { 
    const d = this.selectedDate(); 
    d.setDate(d.getDate() - 7); 
    this.selectedDate.set(new Date(d)); 
    this.updateCurrentDateIfNeeded();
    this.loadTasks(); 
  }
  nextWeek() { 
    const d = this.selectedDate(); 
    d.setDate(d.getDate() + 7); 
    this.selectedDate.set(new Date(d)); 
    this.updateCurrentDateIfNeeded();
    this.loadTasks(); 
  }
  previousMonth() { const d=this.currentDate(); this.currentDate.set(new Date(d.getFullYear(), d.getMonth()-1,1)); this.loadTasks(); }
  nextMonth() { const d=this.currentDate(); this.currentDate.set(new Date(d.getFullYear(), d.getMonth()+1,1)); this.loadTasks(); }
  goToToday() { const t=new Date(); this.selectedDate.set(t); this.currentDate.set(new Date(t.getFullYear(), t.getMonth(),1)); this.loadTasks(); }

  private updateCurrentDateIfNeeded() {
    const selected = this.selectedDate();
    const current = this.currentDate();
    if (selected.getFullYear() !== current.getFullYear() || selected.getMonth() !== current.getMonth()) {
      this.currentDate.set(new Date(selected.getFullYear(), selected.getMonth(), 1));
    }
  }

  drop(event: CdkDragDrop<CalendarEvent[]>) {
    const arr = [...this.allEvents()];
    moveItemInArray(arr, event.previousIndex, event.currentIndex);
    this.allEvents.set(arr);
  }

  // Add task methods
  onTaskSave(taskData: NewTaskData) {
    const taskDate = new Date(this.selectedDate());
    const [hours, minutes] = taskData.time.split(':');
    taskDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const newTask = {
      title: taskData.title.trim(),
      startDate: taskDate.toISOString(),
      category: taskData.category,
      description: taskData.description,
      priority: taskData.priority 
    };

    this.plannerService.addTask(newTask).subscribe({
      next: () => {
        this.loadTasks();
        this.showAddTaskForm.set(false);
      },
      error: (err: any) => console.error('Error creating task:', err)
    });
  }

  onTaskCancel() {
    this.showAddTaskForm.set(false);
  }

  onAddTaskClick() {
    this.showAddTaskForm.update(value => !value);
  }

  onTaskAdded(taskData: NewTaskData) {
    // Create a new task with the form data
    const taskDate = new Date(this.selectedDate());
    const [hours, minutes] = taskData.time.split(':');
    taskDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const newTask = {
      title: taskData.title.trim(),
      startDate: taskDate.toISOString(),
      category: taskData.category,
      description: taskData.description,
      priority: taskData.priority // medium priority
    };

    // Save to backend via service
    this.plannerService.addTask(newTask).subscribe({
      next: () => {
        // Reload tasks to reflect the new one
        this.loadTasks();
        this.showAddTaskForm.set(false);
      },
      error: (err: any) => console.error('Error creating task:', err)
    });
  }

  // Event detail methods
  onEventClick(event: CalendarEvent) {
    // Open edit form instead of detail view
    this.editingTask.set(event);
    this.showEditTaskForm.set(true);
  }

  onTaskUpdated(taskData: EditTaskData) {
    const taskDate = new Date(this.selectedDate());
    const [hours, minutes] = taskData.time.split(':');
    taskDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const updatePayload = {
      title: taskData.title,
      description: taskData.description,
      startDate: taskData.startDate || taskDate.toISOString(),
      endDate: taskData.endDate,
      priority: taskData.priority,
      status: taskData.status,
      category: taskData.category
    };

    this.plannerService.updateTask(taskData.id.toString(), updatePayload).subscribe({
      next: () => {
        this.loadTasks();
        this.showEditTaskForm.set(false);
        this.editingTask.set(null);
      },
      error: (err: any) => console.error('Error updating task:', err)
    });
  }

  onTaskDeleted(taskId: string | number) {
    this.plannerService.deleteTask(taskId.toString()).subscribe({
      next: () => {
        this.loadTasks();
        this.showEditTaskForm.set(false);
        this.editingTask.set(null);
      },
      error: (err: any) => console.error('Error deleting task:', err)
    });
  }

  onEditTaskCancel() {
    this.showEditTaskForm.set(false);
    this.editingTask.set(null);
  }

  onEventUpdate(updateData: EventUpdateData) {
    const event = this.selectedEvent();
    if (!event || !event.id) return;

    const taskDate = event.date ? new Date(event.date) : new Date();
    const [hours, minutes] = updateData.time.split(':');
    taskDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const updatedTask = {
      title: updateData.title,
      startDate: taskDate.toISOString(),
      category: updateData.category,
      description: updateData.description,
      priority: updateData.priority
    };

    this.plannerService.updateTask(event.id, updatedTask).subscribe({
      next: () => {
        this.loadTasks();
        this.selectedEvent.set(null);
      },
      error: (err) => console.error('Error updating task:', err)
    });
  }

  onEventDelete() {
    const event = this.selectedEvent();
    if (!event || !event.id) return;

    this.plannerService.deleteTask(event.id).subscribe({
      next: () => {
        this.loadTasks();
        this.selectedEvent.set(null);
      },
      error: (err) => console.error('Error deleting task:', err)
    });
  }

  onEventDetailClose() {
    this.selectedEvent.set(null);
  }

  /**
   * Navigate to the dedicated monthly planning page
   */
  navigateToMonthlyPlanning() {
    this.router.navigate(['/monthly-planning']);
  }

  /**
   * Navigate to the monthly reflection page
   */
  navigateToReflection() {
    this.router.navigate(['/monthly-reflection']);
  }

  /**
   * Load the monthly reflection for the current month
   */
  private loadMonthlyReflection() {
    const date = this.currentDate();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const monthStr = `${year}-${month}`;

    this.monthlyPlanningService.getEntry(monthStr).subscribe({
      next: (entry: MonthlyEntry) => {
        if (entry.reflection) {
          this.currentMonthlyReflection.set(entry.reflection);
        }
      },
      error: (err: any) => {
        console.error('Error loading monthly reflection:', err);
        this.currentMonthlyReflection.set(null);
      }
    });
  }
}

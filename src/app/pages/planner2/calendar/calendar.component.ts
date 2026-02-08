import { Component, signal, computed, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { PlannerService } from '../../../services/task.service';
import { PlannerTask } from '../../../models/api';
import { DailyViewComponent } from './daily-view/daily-view.component';
import { CategorySelectorComponent } from './category-selector/category-selector.component';
import { AddTaskFormComponent, NewTaskData } from './add-task-form/add-task-form.component';
import { AddTaskButtonComponent } from './add-task-button/add-task-button.component';
import { EditTaskFormComponent } from './edit-task-form/edit-task-form.component';
import { DailyReflectionComponent } from './daily-reflection/daily-reflection.component';

export interface CalendarEvent {
  id?: string | number;
  title: string;
  time: string;
  date?: Date;
  category?: string;
  description?: string;
  priority?: number; // 0=Low, 1=Medium, 2=High
  status?: number; // 0=NotStarted, 1=InProgress, 2=Completed, 3=OnHold, 4=Cancelled
  startDate?: string;
  endDate?: string;
  startTime?: string;        // HH:mm format (24-hour), e.g., "14:30" - PHASE 4
  duration?: number;         // Duration in minutes, e.g., 120 - PHASE 4
  deadline?: string;         // ISO 8601 DateTime, e.g., "2025-02-10T17:00:00Z" - PHASE 4
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
    MatDialogModule,
    DragDropModule,
    CategorySelectorComponent,
    AddTaskButtonComponent,
    AddTaskFormComponent,
    EditTaskFormComponent,
    DailyViewComponent,
    DailyReflectionComponent
  ],
  providers: [PlannerService],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent {
  currentDate = signal(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  selectedDate = signal(new Date());
  selectedCategory = signal('all');

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
  selectedTaskData = signal<PlannerTask | null>(null);  // NEW: Full task data

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
  allTaskData = signal<Map<string | number, PlannerTask>>(new Map());  // NEW: Map for task data by ID

  private dialog = inject(MatDialog);

  constructor(private plannerService: PlannerService, private router: Router) {
    this.loadTasks();
  }

  ngOnInit() {
    // No longer needed - events are computed from allEvents
  }

  private loadTasks() {
    const dateStr = this.selectedDate().toISOString().split('T')[0];
    const tasksObs = this.plannerService.getTasksForDay(dateStr);

    tasksObs.subscribe({
      next: (tasks: PlannerTask[]) => {
        const taskMap = new Map<string | number, PlannerTask>();  // NEW
        const events = tasks.map(t => {
          let timeStr = '';
          let dateObj: Date | undefined;
          
          if (t.startDate) {
            // Create date from ISO string
            dateObj = new Date(t.startDate);
          }
          
          // Use startTime if available (the actual scheduled time), otherwise extract from startDate
          if (t.startTime) {
            timeStr = t.startTime;
          } else if (t.startDate) {
            const timePart = t.startDate.split('T')[1];
            timeStr = timePart?.slice(0, 5) ?? '';
          }
          
          console.log('Task:', t.title, 'startDate:', t.startDate, 'startTime:', t.startTime, 'extracted time:', timeStr, 'date:', dateObj);
          
          // NEW: Store the full task data by ID
          if (t.id) {
            taskMap.set(t.id, t);
          }
          
          return {
            id: t.id,
            title: t.title,
            time: timeStr,
            startTime: t.startTime,
            date: dateObj,
            category: t.category,
            description: t.description,
            priority: t.priority,
            status: t.status
          };
        });
        this.allEvents.set(events);
        this.allTaskData.set(taskMap);  // NEW
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

  // Events for the selected date (daily only)
  selectedPeriodEvents = computed(() => {
    const events = this.allEvents();
    return events.filter(e => e.date && this.isSameDay(e.date, this.selectedDate()));
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
      .filter(e => e.date && e.date >= startOfWeek && e.date <= endOfWeek && e.priority === 2) // Only high priority
      .sort((a, b) => {
        const timeA = a.time || '23:59';
        const timeB = b.time || '23:59';
        return timeA.localeCompare(timeB);
      });
  });

  filteredEvents = computed(() => {
    const category = this.selectedCategory();
    let events = category === 'all' ? this.allEvents() : this.allEvents().filter(e => e.category === category);

    // Filter by selected date
    events = events.filter(e => e.date && this.isSameDay(e.date, this.selectedDate()));

    return events;
  });

  /** Events for daily and monthly views */
  dailyEvents = (date: Date) => this.filteredEvents().filter(e => e.date && this.isSameDay(e.date, date));
  monthlyEvents = (day: DayCell) => this.filteredEvents().filter(e => e.date && this.isSameDay(e.date, day.date));

  calendarDays = computed(() => {
    const date = this.currentDate();
    const year = date.getFullYear();
    const month = date.getMonth();
    const today = new Date();
    const selected = this.selectedDate();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday, 6 = Saturday
    const days: DayCell[] = [];

    // Add days from previous month to fill the first week
    if (startingDayOfWeek > 0) {
      const prevMonthLastDay = new Date(year, month, 0).getDate();
      for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        const d = new Date(year, month - 1, prevMonthLastDay - i);
        days.push({ date: d, dayOfMonth: d.getDate(), isCurrentMonth: false, isToday: this.isSameDay(d, today), isSelected: this.isSameDay(d, selected) });
      }
    }

    // Add all days of the current month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dayDate = new Date(year, month, d);
      days.push({ date: dayDate, dayOfMonth: d, isCurrentMonth: true, isToday: this.isSameDay(dayDate, today), isSelected: this.isSameDay(dayDate, selected) });
    }

    // Add days from next month to fill the last week
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      const dayDate = new Date(year, month + 1, d);
      days.push({ date: dayDate, dayOfMonth: d, isCurrentMonth: false, isToday: this.isSameDay(dayDate, today), isSelected: this.isSameDay(dayDate, selected) });
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
    const date = this.selectedDate();
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
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

  previousDay() { const d = new Date(this.selectedDate()); d.setDate(d.getDate()-1); this.selectedDate.set(d); this.loadTasks(); }
  nextDay() { const d = new Date(this.selectedDate()); d.setDate(d.getDate()+1); this.selectedDate.set(d); this.loadTasks(); }
  goToToday() { const t=new Date(); this.selectedDate.set(t); this.loadTasks(); }

  drop(event: CdkDragDrop<CalendarEvent[]>) {
    const arr = [...this.allEvents()];
    moveItemInArray(arr, event.previousIndex, event.currentIndex);
    this.allEvents.set(arr);
  }

  // Add task methods
  onTaskSave(taskData: NewTaskData) {
    const taskDate = new Date(this.selectedDate());
    const [hours, minutes] = taskData.startTime?.split(':') || ['09', '00'];
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
    const [hours, minutes] = taskData.startTime?.split(':') || ['09', '00'];
    taskDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const newTask: any = {
      title: taskData.title.trim(),
      startDate: taskDate.toISOString(),
      category: taskData.category,
      description: taskData.description,
      priority: taskData.priority,
      startTime: taskData.startTime || undefined,
      duration: taskData.duration || undefined,
      endDate: taskData.endDate || undefined
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
    if (!event.id) return;
    const taskData = this.allTaskData().get(event.id);
    
    const dialogRef = this.dialog.open(EditTaskFormComponent, {
      width: '600px',
      data: {
        task: {
          id: event.id,
          title: event.title,
          description: event.description || '',
          time: event.time,
          startTime: event.startTime,
          category: event.category || '',
          priority: event.priority,
          status: event.status,
          startDate: '',
          endDate: ''
        },
        categories: this.categories
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (result.deleted) {
          // Delete task
          this.plannerService.deleteTask(event.id!).subscribe({
            next: () => {
              this.onEventDelete();
            },
            error: (err) => console.error('Error deleting task:', err)
          });
        } else if (result.updated) {
          // Update task
          this.plannerService.updateTask(event.id!, result.data).subscribe({
            next: () => {
              // Reload events to reflect changes
              this.loadTasks();
            },
            error: (err) => console.error('Error updating task:', err)
          });
        }
      }
    });
  }

  onEditTaskCancel() {
    this.showEditTaskForm.set(false);
    this.editingTask.set(null);
  }

  onEventUpdate(updateData: any) {
    const event = this.selectedEvent();
    if (!event || !event.id) return;

    const updatedTask: any = {
      title: updateData.title,
      category: updateData.category,
      description: updateData.description,
      priority: updateData.priority,
      startDate: updateData.startDate || undefined,
      endDate: updateData.endDate || undefined,
      startTime: updateData.startTime || undefined,
      duration: updateData.duration || undefined
    };

    this.plannerService.updateTask(event.id, updatedTask).subscribe({
      next: () => {
        this.loadTasks();
        this.selectedEvent.set(null);
        this.selectedTaskData.set(null);
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
        this.selectedTaskData.set(null);
      },
      error: (err) => console.error('Error deleting task:', err)
    });
  }

  onEventDetailClose() {
    this.selectedEvent.set(null);
    this.selectedTaskData.set(null);
  }
}

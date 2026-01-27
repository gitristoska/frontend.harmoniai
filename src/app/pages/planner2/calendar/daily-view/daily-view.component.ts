import { Component, input, output, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { CalendarEvent } from '../calendar.component';
import { DailyEntryService } from '../../../../services/dailyentry.service';
import { PlannerService } from '../../../../services/task.service';
import { DailyEntry, LifeBalanceItem, CallAndEmailItem, Rating } from '../../../../models/api';
import { computed } from '@angular/core';
import { EditTaskFormComponent } from '../edit-task-form/edit-task-form.component';

interface NoteItem {
  id: string;
  title: string;
  completed?: boolean;
}

interface LifeBalanceCategory {
  id: string;
  name: string;
  items: NoteItem[];
}

interface Recommendation {
  id: string;
  text: string;
  added?: boolean;
}

interface DailyNotes {
  personalNotes: string;
  lifeBalance: LifeBalanceCategory[];
  callsEmails: NoteItem[];
  notesForTomorrow: string;
}

interface DayRating {
  productivity: number; // 1-5
  mood: number; // 1-5
  health: number; // 1-5
}

@Component({
  selector: 'app-calendar-daily',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatIconModule, MatCheckboxModule, MatButtonModule, MatDialogModule, DragDropModule],
  templateUrl: './daily-view.component.html',
  styleUrls: ['./daily-view.component.scss']
})
export class DailyViewComponent {
  selectedDate = input.required<Date>();
  events = input.required<CalendarEvent[]>();
  categories = input.required<any[]>();
  startHour = input<number>(8);
  endHour = input<number>(22);
  eventClick = output<CalendarEvent>();

  // Computed properties for today's tasks
  todayEvents = computed(() => {
    const today = this.selectedDate();
    return this.events().filter(e => {
      if (!e.date) return false;
      const eventDate = new Date(e.date);
      return eventDate.getFullYear() === today.getFullYear() &&
             eventDate.getMonth() === today.getMonth() &&
             eventDate.getDate() === today.getDate();
    });
  });

  topPriorities = computed(() => {
    // Get top 3 priority tasks sorted by time
    return this.todayEvents()
      .sort((a: CalendarEvent, b: CalendarEvent) => {
        const timeA = a.time || '23:59';
        const timeB = b.time || '23:59';
        return timeA.localeCompare(timeB);
      })
      .slice(0, 3);
  });

  selectedLifeBalanceCategory = 'health';

  // Signals for API data
  dailyEntry = signal<DailyEntry | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);

  constructor(private dailyEntryService: DailyEntryService, private plannerService: PlannerService, private dialog: MatDialog) {
    // Load daily entry when selected date changes
    effect(() => {
      this.loadDailyEntry(this.selectedDate());
    });
  }

  // Hardcoded daily notes for now
  dailyNotes: DailyNotes = {
    personalNotes: 'Remember to pick up dry cleaning after work\nCall mom this evening.',
    lifeBalance: [
      {
        id: 'health',
        name: 'Health & Fitness',
        items: [
          { id: '1', title: '1 hour Cardio', completed: false },
          { id: '2', title: 'Avoid Sugar', completed: false }
        ]
      },
      {
        id: 'family',
        name: 'Family & Friends',
        items: [
          { id: '3', title: 'Get together at 5', completed: false }
        ]
      },
      {
        id: 'fun',
        name: 'Fun & Creation',
        items: [
          { id: '4', title: 'Do mandala art', completed: false }
        ]
      },
      {
        id: 'spiritual',
        name: 'Spiritual',
        items: [
          { id: '5', title: 'Try to Learn mantras', completed: false }
        ]
      }
    ],
    callsEmails: [
      { id: '1', title: 'Follow up with John about contract', completed: false },
      { id: '2', title: 'Reply to Sarah\'s email', completed: true },
      { id: '3', title: 'Schedule meeting with design team', completed: false }
    ],
    notesForTomorrow: 'Prepare agenda for quarterly review.\nBring laptop charger to office.'
  };

  // Day rating (from API)
  dayRating = signal<Rating>({
    productivity: 1,
    mood: 1,
    health: 1
  });

  // AI Recommendations
  aiRecommendations = signal<Recommendation[]>([
    {
      id: '1',
      text: 'You have back-to-back meetings from 2-4 PM. Consider scheduling a 10-minute break',
      added: false
    },
    {
      id: '2',
      text: 'Based on your schedule, the best time for focused work is 10:11:30 AM.',
      added: false
    },
    {
      id: '3',
      text: 'You haven\'t completed Update documentation from yesterday. Move to today\'s priorities?',
      added: false
    }
  ]);

  private loadDailyEntry(date: Date) {
    const dateStr = date.toISOString().split('T')[0];
    this.isLoading.set(true);
    this.error.set(null);

    this.dailyEntryService.getByDate(dateStr).subscribe({
      next: (entry) => {
        this.dailyEntry.set(entry);
        if (entry.rating) {
          this.dayRating.set(entry.rating);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading daily entry:', err);
        this.error.set('Failed to load daily entry');
        this.isLoading.set(false);
      }
    });
  }

  getDailyNotes() {
    const entry = this.dailyEntry();
    return {
      personalNotes: entry?.personalNotes || '',
      lifeBalance: this.groupLifeBalanceByCategory(),
      callsEmails: entry?.callsAndEmailsChecklist || [],
      notesForTomorrow: entry?.notesForTomorrow || ''
    };
  }

  private getLifeBalanceCategoriesGrouped() {
    const entry = this.dailyEntry();
    const categoryLabels: Record<string, string> = {
      'health': 'Health & Fitness',
      'family': 'Family & Friends',
      'fun': 'Fun & Creation',
      'spiritual': 'Spiritual'
    };

    const result: Record<string, LifeBalanceItem[]> = {
      'Health & Fitness': [],
      'Family & Friends': [],
      'Fun & Creation': [],
      'Spiritual': []
    };

    (entry?.lifeBalanceToDoList || []).forEach(item => {
      const category = item.category as string;
      const displayLabel = categoryLabels[category] || category;
      if (result[displayLabel]) {
        result[displayLabel].push(item);
      }
    });

    return result;
  }

  groupLifeBalanceByCategory() {
    return this.getLifeBalanceCategoriesGrouped();
  }

  getCategoryKey(displayName: string): string {
    const keyMap: Record<string, string> = {
      'Health & Fitness': 'health',
      'Family & Friends': 'family',
      'Fun & Creation': 'fun',
      'Spiritual': 'spiritual'
    };
    return keyMap[displayName] || 'health';
  }

  getEventTopPosition(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  getEventHour(time: string): number {
    return parseInt(time.split(':')[0], 10);
  }

  getEventsByHour(hour: number): CalendarEvent[] {
    return this.events().filter(e => this.getEventHour(e.time) === hour);
  }

  getCategoryColor(categoryId?: string): string {
    return this.categories().find(c => c.id === categoryId)?.color ?? '#e5e7eb';
  }

  onEventClick(event: CalendarEvent) {
    this.eventClick.emit(event);
  }

  drop(event: CdkDragDrop<any>) {
    // Handle drops from the sidebar to calendar (different containers)
    // or drops within the calendar itself (time change)
    const droppedEvent = event.item.data as CalendarEvent;
    const targetHour = event.container.data as number;
    
    // Only process if we have valid event and target hour
    if (!droppedEvent || typeof targetHour !== 'number') {
      console.log('Invalid drop data:', droppedEvent, targetHour);
      return;
    }
    
    const newTime = `${targetHour.toString().padStart(2, '0')}:00`;
    
    // Update the event time
    droppedEvent.time = newTime;
    
    // Update via API
    if (droppedEvent.id) {
      const taskDate = new Date(this.selectedDate());
      taskDate.setHours(targetHour, 0, 0, 0);
      
      const updateData = {
        title: droppedEvent.title,
        category: droppedEvent.category,
        startDate: taskDate.toISOString()
      };
      
      this.plannerService.updateTask(droppedEvent.id.toString(), updateData).subscribe({
        next: () => {
          console.log('Task updated successfully');
        },
        error: (err: any) => console.error('Error updating task time:', err)
      });
    }
  }

  getTimeSlots() {
    const slots = [];
    for (let i = this.startHour(); i < this.endHour(); i++) {
      slots.push(`${i.toString().padStart(2, '0')}:00`);
    }
    return slots;
  }

  toggleNoteItem(item: LifeBalanceItem | CallAndEmailItem) {
    item.isDone = !item.isDone;
    this.saveDailyEntry();
  }

  addAndClearNoteItem(category: 'lifeBalance' | 'callsEmails', inputElement: HTMLInputElement, lifeBalanceCategory?: string) {
    const value = inputElement.value.trim();
    if (value) {
      this.addNoteItem(category, value, lifeBalanceCategory);
      inputElement.value = '';
    }
  }

  addNoteItem(category: 'lifeBalance' | 'callsEmails', title: string, lifeBalanceCategory?: string) {
    const entry = this.dailyEntry();
    if (!entry || !title.trim()) return;

    if (category === 'lifeBalance') {
      const newItem: LifeBalanceItem = {
        id: Date.now().toString(),
        text: title.trim(),
        category: lifeBalanceCategory || 'health',
        isDone: false
      };
      if (!entry.lifeBalanceToDoList) {
        entry.lifeBalanceToDoList = [];
      }
      entry.lifeBalanceToDoList.push(newItem);
      this.dailyEntry.set({ ...entry });
      this.saveDailyEntry();
    } else if (category === 'callsEmails') {
      const newItem: CallAndEmailItem = {
        id: Date.now().toString(),
        text: title.trim(),
        isDone: false
      };
      if (!entry.callsAndEmailsChecklist) {
        entry.callsAndEmailsChecklist = [];
      }
      entry.callsAndEmailsChecklist.push(newItem);
      this.dailyEntry.set({ ...entry });
      this.saveDailyEntry();
    }
  }

  saveDailyEntry() {
    const entry = this.dailyEntry();
    if (!entry?.id) return;

    // Prepare callsAndEmailsChecklist without id field
    const callsEmails = entry.callsAndEmailsChecklist?.map(item => ({
      text: item.text,
      isDone: item.isDone
    })) || [];

    // Prepare lifeBalanceToDoList - keep category field
    const lifeBalance = entry.lifeBalanceToDoList?.map(item => ({
      text: item.text,
      category: item.category,
      isDone: item.isDone
    })) || [];

    const updateDto = {
      date: entry.date,
      gratefulFor: entry.gratefulFor,
      inspirationOrMotivation: entry.inspirationOrMotivation,
      personalNotes: entry.personalNotes,
      notesForTomorrow: entry.notesForTomorrow,
      lifeBalanceToDoList: lifeBalance,
      callsAndEmailsChecklist: callsEmails,
      rating: entry.rating
    };

    this.dailyEntryService.update(entry.id, updateDto).subscribe({
      error: (err) => {
        console.error('Error saving daily entry:', err);
        this.error.set('Failed to save changes');
      }
    });
  }

  setProductivityRating(rating: number) {
    const entry = this.dailyEntry();
    if (!entry) return;
    if (!entry.rating) {
      entry.rating = { productivity: 1, mood: 1, health: 1 };
    }
    entry.rating.productivity = rating;
    this.dayRating.set(entry.rating);
    this.saveDailyEntry();
  }

  setMoodRating(rating: number) {
    const entry = this.dailyEntry();
    if (!entry) return;
    if (!entry.rating) {
      entry.rating = { productivity: 1, mood: 1, health: 1 };
    }
    entry.rating.mood = rating;
    this.dayRating.set(entry.rating);
    this.saveDailyEntry();
  }

  setHealthRating(rating: number) {
    const entry = this.dailyEntry();
    if (!entry) return;
    if (!entry.rating) {
      entry.rating = { productivity: 1, mood: 1, health: 1 };
    }
    entry.rating.health = rating;
    this.dayRating.set(entry.rating);
    this.saveDailyEntry();
  }

  toggleRecommendation(recommendation: Recommendation) {
    recommendation.added = !recommendation.added;
  }

  openEditTaskModal(task: CalendarEvent) {
    if (!task.id) return;

    const dialogRef = this.dialog.open(EditTaskFormComponent, {
      width: '600px',
      data: {
        task: {
          id: task.id,
          title: task.title,
          description: task.description || '',
          time: task.time,
          category: task.category || '',
          startDate: '',
          endDate: ''
        },
        categories: this.categories()
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (result.deleted) {
          // Delete task
          this.plannerService.deleteTask(task.id!).subscribe({
            next: () => {
              // Remove from events
              const events = this.events();
              const index = events.findIndex(e => e.id === task.id);
              if (index > -1) {
                events.splice(index, 1);
              }
            },
            error: (err) => console.error('Error deleting task:', err)
          });
        } else if (result.updated) {
          // Update task
          this.plannerService.updateTask(task.id!, result.data).subscribe({
            next: () => {
              // Update event
              Object.assign(task, result.data);
            },
            error: (err) => console.error('Error updating task:', err)
          });
        }
      }
    });
  }

  removeRecommendation(recommendationId: string) {
    const current = this.aiRecommendations();
    this.aiRecommendations.set(current.filter(r => r.id !== recommendationId));
  }
}

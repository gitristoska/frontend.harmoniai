import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  JournalService
} from '../../services/journal.service';
import {
  JournalEntryResponseDto,
  JournalEntryListDto,
  JournalEntryCreateDto,
  Sentiment
} from '../../models/journal.model';

@Component({
  selector: 'app-journal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatTabsModule,
    MatChipsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './journal.html',
  styleUrls: ['./journal.scss']
})
export class JournalComponent implements OnInit {
  // Signals for state management
  entries = signal<JournalEntryListDto[]>([]);
  selectedEntry = signal<JournalEntryResponseDto | null>(null);
  showForm = signal(false);
  showDetailView = signal(false);
  isLoading = signal(false);
  isAnalyzing = signal(false);
  
  // Form fields
  formText = signal('');
  enableAiAnalysis = signal(true);
  editingEntryId = signal<string | null>(null);

  // Date Range signals (NEW: Better filtering strategy)
  selectedTimeRange = signal<'week' | 'month' | 'quarter' | 'all'>('week');
  dateRangeStart = signal(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  dateRangeEnd = signal(new Date());

  // Filter signals
  showFilters = signal(false);
  selectedSentimentFilter = signal<string | null>(null);
  selectedFlags = signal<Set<string>>(new Set());
  selectedTheme = signal<string | null>(null);
  currentPage = signal(1);
  pageSize = signal(20);

  // Fixed lists
  sentiments = ['happy', 'sad', 'anxious', 'angry', 'hopeful', 'neutral', 'mixed'];
  sentimentEmojis: { [key: string]: string } = {
    happy: '😊', sad: '😢', anxious: '😰', angry: '😠', 
    hopeful: '🤞', neutral: '😐', mixed: '🎭'
  };
  mentalHealthFlags = [
    'burnout_risk', 'anxiety_spike', 'depression_indicators', 'sleep_deprivation',
    'social_isolation', 'substance_use', 'self_harm_thoughts', 'extreme_mood_swings',
    'perfectionism_spiral'
  ];

  // Mental Health Flags with emojis and descriptions for tooltips
  mentalHealthFlagDetails: { [key: string]: { emoji: string; description: string } } = {
    'burnout_risk': {
      emoji: '🔥',
      description: 'Excessive work stress, exhaustion'
    },
    'anxiety_spike': {
      emoji: '😰',
      description: 'Sudden increase in anxious language'
    },
    'depression_indicators': {
      emoji: '😞',
      description: 'Hopelessness, low energy language'
    },
    'sleep_deprivation': {
      emoji: '😴',
      description: 'Mentions of insufficient sleep'
    },
    'social_isolation': {
      emoji: '🏜️',
      description: 'Themes of loneliness, disconnection'
    },
    'substance_use': {
      emoji: '⚠️',
      description: 'References to alcohol/drug use'
    },
    'self_harm_thoughts': {
      emoji: '🆘',
      description: 'Any mention of harm ideation'
    },
    'extreme_mood_swings': {
      emoji: '🎢',
      description: 'Contradictory emotional states'
    },
    'perfectionism_spiral': {
      emoji: '🌀',
      description: 'Obsessive self-criticism'
    }
  };

  // Computed properties
  dateRangeLabel = computed(() => {
    const range = this.selectedTimeRange();
    switch(range) {
      case 'week': return 'Last 7 Days';
      case 'month': return 'Last 30 Days';
      case 'quarter': return 'Last 90 Days';
      case 'all': return 'All Time';
      default: return 'Custom Range';
    }
  });

  entriesInDateRange = computed(() => {
    const start = this.dateRangeStart().getTime();
    const end = this.dateRangeEnd().getTime();
    return this.entries().filter(e => {
      const entryTime = new Date(e.date).getTime();
      return entryTime >= start && entryTime <= end;
    });
  });

  // Filtered and sorted entries based on active filters
  filteredEntries = computed(() => {
    let result = [...this.entriesInDateRange()];

    // Apply sentiment filter
    if (this.selectedSentimentFilter()) {
      result = result.filter(e => e.sentiment === this.selectedSentimentFilter());
    }

    // Apply mental health flags filter
    if (this.selectedFlags().size > 0) {
      result = result.filter(e => {
        if (!e.mentalHealthFlags) return false;
        const entryFlags = new Set(this.getFlagTags(e.mentalHealthFlags));
        return Array.from(this.selectedFlags()).some(flag => entryFlags.has(flag));
      });
    }

    // Apply theme filter
    if (this.selectedTheme()) {
      result = result.filter(e => {
        if (!e.keyThemes) return false;
        const themes = this.getThemeTags(e.keyThemes);
        return themes.includes(this.selectedTheme()!);
      });
    }

    // Sort by date descending (newest first)
    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });

  // Get count of entries for each time range (for UI badges)
  timeRangeStats = computed(() => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const quarterAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    return {
      week: this.entries().filter(e => new Date(e.date) >= weekAgo).length,
      month: this.entries().filter(e => new Date(e.date) >= monthAgo).length,
      quarter: this.entries().filter(e => new Date(e.date) >= quarterAgo).length,
      all: this.entries().length
    };
  });

  // Extract unique themes from all entries (dynamic)
  availableThemes = computed(() => {
    const themes = new Set<string>();
    this.entries().forEach(entry => {
      if (entry.keyThemes) {
        this.getThemeTags(entry.keyThemes).forEach(theme => themes.add(theme));
      }
    });
    return Array.from(themes).sort();
  });

  // Get count of entries with each flag
  flagCounts = computed(() => {
    const counts: { [key: string]: number } = {};
    this.mentalHealthFlags.forEach(flag => {
      counts[flag] = this.entries().filter(e => {
        if (!e.mentalHealthFlags) return false;
        return this.getFlagTags(e.mentalHealthFlags).includes(flag);
      }).length;
    });
    return counts;
  });

  // Get count of entries with each sentiment
  sentimentCounts = computed(() => {
    const counts: { [key: string]: number } = {};
    this.sentiments.forEach(sentiment => {
      counts[sentiment] = this.entries().filter(e => e.sentiment === sentiment).length;
    });
    return counts;
  });

  hasActiveFilters = computed(() => {
    return this.selectedSentimentFilter() !== null || 
           this.selectedFlags().size > 0 || 
           this.selectedTheme() !== null;
  });

  constructor(private journalService: JournalService) {}

  ngOnInit() {
    this.loadEntriesForDateRange();
  }

  // ==================== DATA LOADING ====================

  loadEntriesForDateRange() {
    this.isLoading.set(true);
    const startStr = this.dateRangeStart().toISOString().split('T')[0];
    const endStr = this.dateRangeEnd().toISOString().split('T')[0];
    
    this.journalService.getByDateRange(startStr, endStr, 1, 100).subscribe({
      next: (response: any) => {
        // Handle both array and object response types
        const entries = Array.isArray(response) ? response : response.entries || [];
        this.entries.set(entries);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading entries:', err);
        this.isLoading.set(false);
      }
    });
  }

  setTimeRange(range: 'week' | 'month' | 'quarter' | 'all') {
    this.selectedTimeRange.set(range);
    const endDate = new Date();
    const startDate = new Date();

    switch(range) {
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case 'quarter':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case 'all':
        startDate.setFullYear(2000);
        break;
    }

    this.dateRangeStart.set(startDate);
    this.dateRangeEnd.set(endDate);
    this.loadEntriesForDateRange();
  }

  // ==================== CRUD OPERATIONS ====================

  createEntry() {
    const text = this.formText().trim();
    if (text.length < 10) {
      alert('Entry must be at least 10 characters');
      return;
    }

    const dto: JournalEntryCreateDto = {
      date: new Date().toISOString().split('T')[0],
      text,
      enableAiAnalysis: this.enableAiAnalysis()
    };

    this.journalService.create(dto).subscribe({
      next: (newEntry) => {
        // Convert response to list DTO
        const listEntry: JournalEntryListDto = {
          id: newEntry.id,
          date: newEntry.date,
          createdAt: newEntry.createdAt,
          textPreview: text.substring(0, 200),
          sentiment: newEntry.sentiment,
          keyThemes: newEntry.keyThemes,
          mentalHealthFlags: newEntry.mentalHealthFlags,
          hasAiAnalysis: newEntry.hasAiAnalysis
        };
        // Add new entry to list
        this.entries.update(entries => [listEntry, ...entries]);
        this.resetForm();
        alert('Entry created successfully!');
      },
      error: (err) => {
        console.error('Error creating entry:', err);
        alert('Failed to create entry');
      }
    });
  }

  updateEntry() {
    const id = this.editingEntryId();
    if (!id) return;

    const text = this.formText().trim();
    if (text.length < 10) {
      alert('Entry must be at least 10 characters');
      return;
    }

    this.journalService.update(id, { text }).subscribe({
      next: (updated) => {
        // Update in list
        this.entries.update(entries =>
          entries.map(e => e.id === id ? { ...e, textPreview: text.substring(0, 200) } : e)
        );
        this.resetForm();
        this.showDetailView.set(false);
        alert('Entry updated successfully!');
      },
      error: (err) => {
        console.error('Error updating entry:', err);
        alert('Failed to update entry');
      }
    });
  }

  deleteEntry(id: string) {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    this.journalService.delete(id).subscribe({
      next: () => {
        this.entries.update(entries => entries.filter(e => e.id !== id));
        this.showDetailView.set(false);
        alert('Entry deleted successfully!');
      },
      error: (err) => {
        console.error('Error deleting entry:', err);
        alert('Failed to delete entry');
      }
    });
  }

  // ==================== AI ANALYSIS ====================

  triggerAnalysis(id: string) {
    this.isAnalyzing.set(true);
    
    this.journalService.triggerAnalysis(id).subscribe({
      next: (response) => {
        // Update selected entry with analysis results
        if (this.selectedEntry()?.id === id) {
          this.selectedEntry.set(response.entry);
        }
        
        // Update in list
        const analyzed: JournalEntryListDto = {
          id: response.entry.id,
          date: response.entry.date,
          createdAt: response.entry.createdAt,
          textPreview: response.entry.text.substring(0, 200),
          sentiment: response.entry.sentiment,
          keyThemes: response.entry.keyThemes,
          mentalHealthFlags: response.entry.mentalHealthFlags,
          hasAiAnalysis: response.entry.hasAiAnalysis
        };
        
        this.entries.update(entries =>
          entries.map(e => e.id === id ? analyzed : e)
        );
        this.isAnalyzing.set(false);
      },
      error: (err) => {
        console.error('Error analyzing entry:', err);
        this.isAnalyzing.set(false);
        alert('Failed to analyze entry. Try again later.');
      }
    });
  }

  // ==================== UI INTERACTIONS ====================

  openCreateForm() {
    this.resetForm();
    this.showForm.set(true);
  }

  editEntry(entry: JournalEntryListDto | JournalEntryResponseDto) {
    const entryId = entry.id;
    this.editingEntryId.set(entryId);
    this.journalService.getById(entryId).subscribe({
      next: (fullEntry) => {
        this.formText.set(fullEntry.text);
        this.showForm.set(true);
      },
      error: (err) => {
        console.error('Error loading entry:', err);
        alert('Failed to load entry');
      }
    });
  }

  viewDetails(entry: JournalEntryListDto | JournalEntryResponseDto) {
    this.journalService.getById(entry.id).subscribe({
      next: (fullEntry) => {
        this.selectedEntry.set(fullEntry);
        this.showDetailView.set(true);
      },
      error: (err) => {
        console.error('Error loading entry:', err);
        alert('Failed to load entry');
      }
    });
  }

  previousDate() {
    // Removed - no longer needed with date range filtering
  }

  nextDate() {
    // Removed - no longer needed with date range filtering
  }

  goToToday() {
    // Reset to last 30 days (default range)
    this.setTimeRange('month');
  }

  resetForm() {
    this.formText.set('');
    this.enableAiAnalysis.set(true);
    this.editingEntryId.set(null);
    this.showForm.set(false);
  }

  // ==================== HELPER METHODS ====================

  getSentimentEmoji(sentiment: string | null): string {
    switch (sentiment) {
      case Sentiment.HAPPY: return '😊';
      case Sentiment.SAD: return '😢';
      case Sentiment.ANXIOUS: return '😰';
      case Sentiment.ANGRY: return '😠';
      case Sentiment.HOPEFUL: return '🤞';
      case Sentiment.NEUTRAL: return '😐';
      case Sentiment.MIXED: return '🤔';
      default: return '📝';
    }
  }

  getSentimentLabel(sentiment: string | null): string {
    return sentiment ? sentiment.charAt(0).toUpperCase() + sentiment.slice(1) : 'Not analyzed';
  }

  getThemeTags(themes: string | null): string[] {
    if (!themes) return [];
    return themes.split(',').map(t => t.trim());
  }

  getFlagTags(flags: string | null): string[] {
    if (!flags) return [];
    return flags.split(',').map(f => f.trim());
  }

  getPatternTags(patterns: string | null): string[] {
    if (!patterns) return [];
    return patterns.split(',').map(p => p.trim());
  }

  formatDate(input: string | Date): string {
    const date = typeof input === 'string' ? new Date(input) : input;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  formatFullDate(input: string | Date): string {
    const date = typeof input === 'string' ? new Date(input) : input;
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // ==================== FILTER METHODS ====================

  toggleSentimentFilter(sentiment: string) {
    if (this.selectedSentimentFilter() === sentiment) {
      this.selectedSentimentFilter.set(null);
    } else {
      this.selectedSentimentFilter.set(sentiment);
    }
    this.currentPage.set(1);
  }

  toggleFlagFilter(flag: string) {
    const newFlags = new Set(this.selectedFlags());
    if (newFlags.has(flag)) {
      newFlags.delete(flag);
    } else {
      newFlags.add(flag);
    }
    this.selectedFlags.set(newFlags);
    this.currentPage.set(1);
  }

  toggleThemeFilter(theme: string) {
    if (this.selectedTheme() === theme) {
      this.selectedTheme.set(null);
    } else {
      this.selectedTheme.set(theme);
    }
    this.currentPage.set(1);
  }

  clearAllFilters() {
    this.selectedSentimentFilter.set(null);
    this.selectedFlags.set(new Set());
    this.selectedTheme.set(null);
    this.currentPage.set(1);
  }

  isFlagSelected(flag: string): boolean {
    return this.selectedFlags().has(flag);
  }

  isSentimentSelected(sentiment: string): boolean {
    return this.selectedSentimentFilter() === sentiment;
  }

  isThemeSelected(theme: string): boolean {
    return this.selectedTheme() === theme;
  }
}

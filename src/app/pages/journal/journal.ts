// src/app/journal/journal.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { JournalService, JournalEntry } from '../../services/journal.service';

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
    MatSlideToggleModule
  ],
  templateUrl: './journal.html',
  styleUrls: ['./journal.scss']
})
export class JournalComponent implements OnInit {
  entries: JournalEntry[] = [];
  showForm = false;
  newEntryText = '';
  useAiAnalysis = true;
  editingEntryId:number | null = null;
  // Замени со вистински userId од auth токен
  userId ="fe3bb0a3-cc45-4330-8146-be208878a47b";

  constructor(private journalService: JournalService) {}

  ngOnInit() {
    this.loadEntries();
  }

  loadEntries() {
    this.journalService.getEntries(this.userId).subscribe(entries => {
      this.entries = entries;
    });
  }
editEntry(entry: JournalEntry) {
  this.showForm = true;
  this.newEntryText = entry.text;
  this.editingEntryId = entry.id; // чуваш id-то за update
}

saveEntry() {
  const text = this.newEntryText?.trim();
  if (!text) return;

  if (this.editingEntryId !== null) {
    const index = this.entries.findIndex(e => e.id === this.editingEntryId);
    if (index >= 0) {
      this.entries[index].text = text; // Update the text property
      this.journalService.updateEntry(this.editingEntryId, this.entries[index])
        .subscribe(updatedEntry => {
          // Replace the existing entry in the array
          const index = this.entries.findIndex(e => e.id === updatedEntry.id);
          if (index >= 0) this.entries[index] = updatedEntry;

          this.newEntryText = '';
          this.showForm = false;
          this.editingEntryId = null;
        });
    }
  } else {
    // Create a new entry
    this.journalService.createEntry({ text, useAi: this.useAiAnalysis })
      .subscribe(entry => {
        this.entries.unshift(entry);
        this.newEntryText = '';
        this.showForm = false;
      });
  }
}

cancelEntry() {
  this.newEntryText = '';
  this.showForm = false;
  this.editingEntryId = null;
}


deleteEntry(entry: JournalEntry) {
  if (!confirm("Are you sure you want to delete this entry?")) return;

  this.journalService.deleteEntry(entry.id).subscribe(() => {
    this.entries = this.entries.filter(e => e.id !== entry.id);
  });
}

  createNewEntry() {
    this.showForm = true;
  }

//   saveEntry() {
//     debugger; 
//   const text = this.newEntryText?.trim();
//   if (!text) return;

//   this.journalService.createEntry({ text, useAi: this.useAiAnalysis })
//     .subscribe(entry => {
//       const index = this.entries.findIndex(e => e.date.startsWith(new Date().toDateString()));
//       if (index >= 0) this.entries[index] = entry;
//       else this.entries.unshift(entry);

//       this.newEntryText = '';
//       this.showForm = false;
//     });
// }

//   cancelEntry() {
//     this.newEntryText = '';
//     this.showForm = false;
//   }

  getSentimentIcon(sentiment: string) {
    switch (sentiment) {
      case 'Positive': return 'sentiment_satisfied';
      case 'Neutral': return 'sentiment_neutral';
      case 'Negative': return 'sentiment_dissatisfied';
      default: return 'sentiment_neutral';
    }
  }

  get todayDate() {
    return new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }
}

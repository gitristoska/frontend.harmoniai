import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './settings.html',
  styleUrls: ['./settings.scss']
})
export class Settings implements OnInit {
  displayName = 'User';
  weekStartDay: 'monday' | 'sunday' = 'monday';

  modules = {
    planner: true,
    journal: true,
    habits: true
  } as { planner: boolean; journal: boolean; habits: boolean };

  ngOnInit(): void {
    this.loadSettings();
  }

  saveSettings() {
    const settings = {
      displayName: this.displayName,
      weekStartDay: this.weekStartDay,
      modules: this.modules
    };
    try {
      localStorage.setItem('harmoni_settings', JSON.stringify(settings));
      console.log('Settings saved', settings);
    } catch (e) {
      console.warn('Failed to save settings', e);
    }
  }

  loadSettings() {
    try {
      const raw = localStorage.getItem('harmoni_settings');
      if (!raw) return;
      const s = JSON.parse(raw);
      this.displayName = s.displayName ?? this.displayName;
      this.weekStartDay = s.weekStartDay ?? this.weekStartDay;
      this.modules = s.modules ?? this.modules;
    } catch (e) {
      console.warn('Failed to load settings', e);
    }
  }
}

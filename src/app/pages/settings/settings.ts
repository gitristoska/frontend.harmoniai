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
import { SettingsService } from '../../services/settings.service';

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
  weekStartDay: 'Monday' | 'Sunday' = 'Monday';
  aiConsent = false;
  enableNotifications = true;

  modules = {
    planner: true,
    journal: true,
    habits: true
  } as { planner: boolean; journal: boolean; habits: boolean };

  constructor(private settingsService: SettingsService) {}

  ngOnInit(): void {
    this.loadSettings();
  }

  saveSettings() {
    const modulesJson = JSON.stringify(this.modules);
    const dto = {
      displayName: this.displayName,
      weekStartsOn: this.weekStartDay,
      aiConsent: this.aiConsent,
      modulesJson: modulesJson,
      enableNotifications: this.enableNotifications
    };

    this.settingsService.updateSettings(dto).subscribe({
      next: (response) => {
        console.log('Settings saved successfully', response);
      },
      error: (err) => {
        console.error('Failed to save settings', err);
      }
    });
  }

  loadSettings() {
    this.settingsService.getSettings().subscribe({
      next: (settings) => {
        console.log('Settings loaded', settings);
        this.displayName = settings.displayName || 'User';
        this.weekStartDay = settings.weekStartsOn || 'Monday';
        this.aiConsent = settings.aiConsent ?? false;
        this.enableNotifications = settings.enableNotifications ?? true;

        // Parse modules JSON string
        if (settings.modulesJson) {
          try {
            const parsed = JSON.parse(settings.modulesJson);
            this.modules = parsed;
          } catch (e) {
            console.warn('Failed to parse modulesJson', e);
          }
        }
      },
      error: (err) => {
        console.warn('Failed to load settings from API', err);
      }
    });
  }
}

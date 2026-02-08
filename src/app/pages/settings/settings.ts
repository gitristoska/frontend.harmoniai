import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SettingsService, SettingsData, SettingsUpdate } from '../../services/settings.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './settings.html',
  styleUrls: ['./settings.scss']
})
export class SettingsComponent implements OnInit {
  settings = signal<SettingsData | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  saveSuccess = signal(false);

  localeOptions = [
    { label: 'English (US)', value: 'en-US' },
    { label: 'English (UK)', value: 'en-GB' },
    { label: 'Deutsch', value: 'de-DE' },
    { label: 'Français', value: 'fr-FR' },
    { label: 'Español', value: 'es-ES' },
    { label: 'Italiano', value: 'it-IT' },
    { label: 'Português (BR)', value: 'pt-BR' }
  ];

  timezoneOptions = [
    { label: 'UTC', value: 'UTC' },
    { label: 'New York', value: 'America/New_York' },
    { label: 'Chicago', value: 'America/Chicago' },
    { label: 'Denver', value: 'America/Denver' },
    { label: 'Los Angeles', value: 'America/Los_Angeles' },
    { label: 'London', value: 'Europe/London' },
    { label: 'Paris', value: 'Europe/Paris' },
    { label: 'Berlin', value: 'Europe/Berlin' },
    { label: 'Madrid', value: 'Europe/Madrid' },
    { label: 'Tokyo', value: 'Asia/Tokyo' },
    { label: 'Shanghai', value: 'Asia/Shanghai' },
    { label: 'Singapore', value: 'Asia/Singapore' },
    { label: 'Sydney', value: 'Australia/Sydney' }
  ];

  weekStartOptions = [
    { label: 'Monday', value: 'Monday' },
    { label: 'Sunday', value: 'Sunday' }
  ];

  constructor(private settingsService: SettingsService) {}

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.loading.set(true);
    this.error.set(null);
    this.settingsService.getSettings().subscribe({
      next: (data) => {
        this.settings.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load settings');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  onSettingChange(field: keyof SettingsUpdate, value: any): void {
    const currentSettings = this.settings();
    if (!currentSettings) return;

    const update: SettingsUpdate = { [field]: value };

    this.settingsService.updateSettings(update).subscribe({
      next: (updatedSettings) => {
        this.settings.set(updatedSettings);
        this.showSaveSuccess();
      },
      error: (err) => {
        this.error.set(`Failed to update ${field}`);
        console.error(err);
      }
    });
  }

  private showSaveSuccess(): void {
    this.saveSuccess.set(true);
    setTimeout(() => {
      this.saveSuccess.set(false);
    }, 2000);
  }
}

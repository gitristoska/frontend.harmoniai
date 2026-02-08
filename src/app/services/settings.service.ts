import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SettingsData {
  id: string;
  userId: string;
  darkMode: boolean;
  locale: string;
  timezone: string;
  weekStartsOn: string;
  enableEmailNotifications: boolean;
  dailyReminderTime: string;
  aiConsent: boolean;
  allowAnalytics: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SettingsUpdate {
  darkMode?: boolean;
  locale?: string;
  timezone?: string;
  weekStartsOn?: string;
  enableEmailNotifications?: boolean;
  dailyReminderTime?: string;
  aiConsent?: boolean;
  allowAnalytics?: boolean;
}

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private base = 'https://localhost:44304/api/settings';

  constructor(private http: HttpClient) {}

  getSettings(): Observable<SettingsData> {
    return this.http.get<SettingsData>(this.base);
  }

  updateSettings(settings: SettingsUpdate): Observable<SettingsData> {
    return this.http.put<SettingsData>(this.base, settings);
  }
}
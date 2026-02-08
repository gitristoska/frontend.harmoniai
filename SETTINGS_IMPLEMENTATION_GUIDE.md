# 🎯 SETTINGS FRONTEND IMPLEMENTATION GUIDE

## WHAT IS SETTINGS?

User preferences/configuration page. Simple toggles and selectors. Not critical for MVP but improves UX.

---

## 📋 BACKEND API READY

### Endpoints Available

- `GET  /api/settings`
- `PUT  /api/settings`

---

## 🔌 API CONTRACTS

### GET /api/settings

**Purpose:** Load user settings (auto-creates defaults if none exist)

**Request:**
```
GET https://localhost:44304/api/settings
Authorization: Bearer <JWT_TOKEN>
```

**Response: 200 OK**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "550e8401-e29b-41d4-a716-446655440001",
  "darkMode": false,
  "locale": "en-US",
  "timezone": "UTC",
  "weekStartsOn": "Monday",
  "enableEmailNotifications": true,
  "dailyReminderTime": "09:00",
  "aiConsent": false,
  "allowAnalytics": true,
  "createdAt": "2026-02-06T10:00:00Z",
  "updatedAt": "2026-02-06T10:30:00Z"
}
```

**Error: 401 Unauthorized**
```json
{
  "error": "Invalid or missing JWT token"
}
```

---

### PUT /api/settings

**Purpose:** Update user settings (only provided fields are updated)

**Request:**
```
PUT https://localhost:44304/api/settings
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

```json
{
  "darkMode": true,
  "locale": "de-DE",
  "timezone": "Europe/Berlin",
  "weekStartsOn": "Monday",
  "enableEmailNotifications": false,
  "dailyReminderTime": "08:00",
  "aiConsent": true,
  "allowAnalytics": false
}
```

**Note:** All fields are **OPTIONAL**. Only send fields you want to change.

**Example - Change only dark mode:**
```json
{
  "darkMode": true
}
```

**Response: 200 OK**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "550e8401-e29b-41d4-a716-446655440001",
  "darkMode": true,
  "locale": "de-DE",
  "timezone": "Europe/Berlin",
  "weekStartsOn": "Monday",
  "enableEmailNotifications": false,
  "dailyReminderTime": "08:00",
  "aiConsent": true,
  "allowAnalytics": false,
  "createdAt": "2026-02-06T10:00:00Z",
  "updatedAt": "2026-02-06T10:35:00Z"
}
```

**Error: 400 Bad Request**
```json
{
  "error": "Invalid timezone: InvalidValue"
}
```

---

## 🎨 SETTINGS FIELDS REFERENCE

| Field | Type | Valid Values | Default | UI Component |
|-------|------|--------------|---------|--------------|
| `darkMode` | boolean | true/false | false | Toggle Switch |
| `locale` | string | See below | "en-US" | Dropdown |
| `timezone` | string | See below | "UTC" | Dropdown |
| `weekStartsOn` | string | "Monday", "Sunday" | "Monday" | Radio/Select |
| `enableEmailNotifications` | boolean | true/false | true | Toggle Switch |
| `dailyReminderTime` | string | "HH:MM" (24-hour) | "09:00" | Time Picker |
| `aiConsent` | boolean | true/false | false | Toggle Switch + Info |
| `allowAnalytics` | boolean | true/false | true | Toggle Switch |

---

## 📍 VALID LOCALE VALUES

- `"en-US"` (English - United States)
- `"en-GB"` (English - United Kingdom)
- `"de-DE"` (Deutsch - Germany)
- `"fr-FR"` (Français - France)
- `"es-ES"` (Español - Spain)
- `"it-IT"` (Italiano - Italy)
- `"pt-BR"` (Português - Brazil)

---

## 🌍 VALID TIMEZONE VALUES

- `"UTC"`
- `"America/New_York"`
- `"America/Chicago"`
- `"America/Denver"`
- `"America/Los_Angeles"`
- `"Europe/London"`
- `"Europe/Paris"`
- `"Europe/Berlin"`
- `"Europe/Madrid"`
- `"Asia/Tokyo"`
- `"Asia/Shanghai"`
- `"Asia/Singapore"`
- `"Australia/Sydney"`

---

## 🏗️ FRONTEND IMPLEMENTATION

### Step 1: Create Settings Service

**File:** `src/app/services/settings.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Settings {
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

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private apiUrl = 'https://localhost:44304/api/settings';

  constructor(private http: HttpClient) {}

  getSettings(): Observable<Settings> {
    return this.http.get<Settings>(this.apiUrl);
  }

  updateSettings(settings: SettingsUpdate): Observable<Settings> {
    return this.http.put<Settings>(this.apiUrl, settings);
  }
}
```

---

### Step 2: Create Settings Component

**File:** `src/app/pages/settings/settings.ts`

```typescript
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SettingsService, Settings, SettingsUpdate } from '../../services/settings.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
  settings = signal<Settings | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  saveSuccess = signal(false);

  // Dropdown options
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
```

---

### Step 3: Create Settings Template

**File:** `src/app/pages/settings/settings.html`

```html
<div class="settings-container">
  <h1>Settings</h1>

  <!-- Success Message -->
  <div *ngIf="saveSuccess()" class="success-toast">
    <mat-icon>check_circle</mat-icon>
    <span>Settings saved successfully</span>
  </div>

  <!-- Error Message -->
  <div *ngIf="error()" class="error-toast">
    <mat-icon>error</mat-icon>
    <span>{{ error() }}</span>
  </div>

  <!-- Loading -->
  <div *ngIf="loading()" class="loading">
    <mat-icon>hourglass_empty</mat-icon>
    <p>Loading settings...</p>
  </div>

  <!-- Settings Form -->
  <div *ngIf="settings() && !loading()" class="settings-form">
    <!-- DISPLAY PREFERENCES -->
    <mat-card class="settings-section">
      <mat-card-header>
        <mat-card-title>
          <mat-icon>palette</mat-icon>
          Display
        </mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <!-- Dark Mode -->
        <div class="setting-item">
          <div class="setting-label">
            <label>Dark Mode</label>
          </div>
          <div class="setting-control">
            <mat-slide-toggle
              [checked]="settings()!.darkMode"
              (change)="onSettingChange('darkMode', $event.checked)">
            </mat-slide-toggle>
          </div>
        </div>

        <!-- Language -->
        <div class="setting-item">
          <div class="setting-label">
            <label>Language</label>
          </div>
          <div class="setting-control">
            <mat-form-field appearance="outline">
              <mat-label>Select Language</mat-label>
              <mat-select
                [value]="settings()!.locale"
                (selectionChange)="onSettingChange('locale', $event.value)">
                <mat-option *ngFor="let opt of localeOptions" [value]="opt.value">
                  {{ opt.label }}
                </mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </div>

        <!-- Timezone -->
        <div class="setting-item">
          <div class="setting-label">
            <label>Timezone</label>
          </div>
          <div class="setting-control">
            <mat-form-field appearance="outline">
              <mat-label>Select Timezone</mat-label>
              <mat-select
                [value]="settings()!.timezone"
                (selectionChange)="onSettingChange('timezone', $event.value)">
                <mat-option *ngFor="let opt of timezoneOptions" [value]="opt.value">
                  {{ opt.label }}
                </mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </div>

        <!-- Week Start -->
        <div class="setting-item">
          <div class="setting-label">
            <label>Week Starts On</label>
          </div>
          <div class="setting-control">
            <mat-form-field appearance="outline">
              <mat-label>Week Start</mat-label>
              <mat-select
                [value]="settings()!.weekStartsOn"
                (selectionChange)="onSettingChange('weekStartsOn', $event.value)">
                <mat-option *ngFor="let opt of weekStartOptions" [value]="opt.value">
                  {{ opt.label }}
                </mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </div>
      </mat-card-content>
    </mat-card>

    <!-- NOTIFICATION PREFERENCES -->
    <mat-card class="settings-section">
      <mat-card-header>
        <mat-card-title>
          <mat-icon>notifications</mat-icon>
          Notifications
        </mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <!-- Email Notifications -->
        <div class="setting-item">
          <div class="setting-label">
            <label>Email Notifications</label>
          </div>
          <div class="setting-control">
            <mat-slide-toggle
              [checked]="settings()!.enableEmailNotifications"
              (change)="onSettingChange('enableEmailNotifications', $event.checked)">
            </mat-slide-toggle>
          </div>
        </div>

        <!-- Daily Reminder Time -->
        <div class="setting-item">
          <div class="setting-label">
            <label>Daily Reminder Time</label>
          </div>
          <div class="setting-control">
            <mat-form-field appearance="outline">
              <mat-label>Reminder Time</mat-label>
              <input
                matInput
                type="time"
                [value]="settings()!.dailyReminderTime"
                (change)="onSettingChange('dailyReminderTime', $event.target.value)" />
            </mat-form-field>
          </div>
        </div>
      </mat-card-content>
    </mat-card>

    <!-- AI & PRIVACY -->
    <mat-card class="settings-section">
      <mat-card-header>
        <mat-card-title>
          <mat-icon>privacy_tip</mat-icon>
          AI & Privacy
        </mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <!-- AI Consent -->
        <div class="setting-item">
          <div class="setting-label">
            <label>
              <strong>AI Features Consent</strong>
              <p class="info-text">
                Allow AI to analyze your tasks, reflections, and habits to provide personalized
                insights
              </p>
            </label>
          </div>
          <div class="setting-control">
            <mat-slide-toggle
              [checked]="settings()!.aiConsent"
              (change)="onSettingChange('aiConsent', $event.checked)">
            </mat-slide-toggle>
          </div>
        </div>

        <!-- Analytics -->
        <div class="setting-item">
          <div class="setting-label">
            <label>
              <strong>Anonymous Analytics</strong>
              <p class="info-text">
                Help us improve by sharing anonymous usage patterns (no personal data)
              </p>
            </label>
          </div>
          <div class="setting-control">
            <mat-slide-toggle
              [checked]="settings()!.allowAnalytics"
              (change)="onSettingChange('allowAnalytics', $event.checked)">
            </mat-slide-toggle>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  </div>
</div>
```

---

### Step 4: Add Styling

**File:** `src/app/pages/settings/settings.scss`

```scss
.settings-container {
  max-width: 700px;
  margin: 0 auto;
  padding: 24px 16px;

  h1 {
    margin-bottom: 24px;
    font-size: 28px;
    font-weight: 500;
    color: #333;
  }
}

.success-toast {
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: #4caf50;
  color: white;
  padding: 12px 16px;
  border-radius: 4px;
  margin-bottom: 20px;
  animation: slideDown 0.3s ease-out;

  mat-icon {
    font-size: 20px;
    width: 20px;
    height: 20px;
  }
}

.error-toast {
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: #f44336;
  color: white;
  padding: 12px 16px;
  border-radius: 4px;
  margin-bottom: 20px;

  mat-icon {
    font-size: 20px;
    width: 20px;
    height: 20px;
  }
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #999;

  mat-icon {
    font-size: 48px;
    width: 48px;
    height: 48px;
    margin-bottom: 16px;
    animation: spin 1s linear infinite;
  }

  p {
    font-size: 16px;
  }
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.settings-section {
  mat-card-header {
    margin-bottom: 16px;

    mat-card-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 18px;
      font-weight: 500;
      color: #333;

      mat-icon {
        color: #1976d2;
      }
    }
  }

  mat-card-content {
    padding: 0;
  }
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }

  .setting-label {
    flex: 1;

    label {
      display: block;
      font-weight: 500;
      color: #333;
      margin-bottom: 4px;

      .info-text {
        font-size: 12px;
        color: #999;
        font-weight: normal;
        margin-top: 4px;
        line-height: 1.4;
      }
    }
  }

  .setting-control {
    display: flex;
    align-items: center;
    gap: 16px;
    min-width: 250px;

    mat-slide-toggle {
      margin: 0;
    }

    mat-form-field {
      width: 100%;
      min-width: 200px;
    }

    mat-select {
      width: 100%;
    }
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;

    .setting-control {
      width: 100%;
      min-width: auto;
    }
  }
}
```

---

## 🧪 TESTING CHECKLIST

- ✅ Load settings → GET /api/settings works
- ✅ Toggle dark mode → PUT with `darkMode: true`
- ✅ Change language → PUT with `locale: "de-DE"`
- ✅ Change timezone → PUT with `timezone: "Europe/Berlin"`
- ✅ Change reminder time → PUT with `dailyReminderTime: "08:00"`
- ✅ Toggle AI consent → PUT with `aiConsent: true`
- ✅ Toggle analytics → PUT with `allowAnalytics: false`
- ✅ Success message appears after save
- ✅ Error message appears on failure
- ✅ Only changed field is sent to backend
- ✅ Settings persist on page reload

---

## 📝 INTEGRATION STEPS

1. **Add Settings route to app routing**

```typescript
// src/app/app.routes.ts
export const routes: Routes = [
  // ... other routes
  { path: 'settings', component: SettingsComponent },
  // ...
];
```

2. **Add Settings link to navigation menu**

```html
<!-- src/app/shared/navbar/navbar.html -->
<a routerLink="/settings">
  <mat-icon>settings</mat-icon>
  <span>Settings</span>
</a>
```

3. **Import HttpClientModule in your app** (if not already imported)

4. **Test with Postman first**
   - GET /api/settings (should return defaults)
   - PUT /api/settings with `{ "darkMode": true }`
   - Should return updated settings

---

## 🎨 OPTIONAL ENHANCEMENTS

Not required for MVP, but nice to have:

### 1. Apply Dark Mode Globally

```typescript
// In app.component.ts
ngOnInit() {
  this.settingsService.getSettings().subscribe(settings => {
    if (settings.darkMode) {
      document.body.classList.add('dark-theme');
    }
  });
}
```

### 2. Apply Locale to i18n

Use Angular's i18n service to change language dynamically

### 3. Apply Timezone to Date Pipes

```html
<!-- Use timezone in date pipe -->
<div>{{ date | date: 'short' : '' : settings().timezone }}</div>
```

---

## 📊 SUMMARY

**What Frontend Needs to Build:**
- 1 service (SettingsService)
- 1 component (SettingsComponent)
- 1 template (HTML)
- 1 stylesheet (SCSS)

**API Calls:**
- `GET /api/settings` → Load on init
- `PUT /api/settings` → Save on each field change

**Estimated Time:** 2-3 hours to implement and test

**Complexity:** LOW - Just forms and API calls, no complex logic

---

## 🚀 QUICK START

1. Create service from TypeScript code above
2. Create component from TypeScript code above
3. Copy HTML template above
4. Copy SCSS styling above
5. Test with Postman first
6. Add route to app routing
7. Add link to navbar
8. Done!

---

**🎉 That's it! Everything your frontend team needs to implement Settings.**

**Key Points:**
- ✅ Backend is ready
- ✅ All validation on backend
- ✅ Frontend just displays UI + makes API calls
- ✅ Auto-save on each change (no submit button needed)
- ✅ ~2-3 hours to implement

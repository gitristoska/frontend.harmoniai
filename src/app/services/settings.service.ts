import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';
import { SettingsUpdateDto } from '../models/api';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private base = `${environment.apiBaseUrl}/api/v1/Settings`;

  constructor(private http: HttpClient) {}

  // GET /api/v1/Settings
  getSettings(): Observable<SettingsUpdateDto> {
    return this.http.get<SettingsUpdateDto>(this.base);
  }

  // PUT /api/v1/Settings
  updateSettings(dto: SettingsUpdateDto): Observable<SettingsUpdateDto> {
    return this.http.put<SettingsUpdateDto>(this.base, dto);
  }
}
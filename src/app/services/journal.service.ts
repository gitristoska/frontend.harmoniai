import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  JournalEntryCreateDto,
  JournalEntryUpdateDto,
  JournalEntryResponseDto,
  JournalEntryListDto,
  JournalDateRangeResponse
} from '../models/journal.model';

@Injectable({ providedIn: 'root' })
export class JournalService {
  private baseUrl = 'https://localhost:44304/api/journal-entries';

  constructor(private http: HttpClient) {}

  /**
   * CREATE: Create a new journal entry
   * POST /api/journal-entries
   */
  create(dto: JournalEntryCreateDto): Observable<JournalEntryResponseDto> {
    return this.http.post<JournalEntryResponseDto>(this.baseUrl, dto);
  }

  /**
   * READ: Get journal entry by ID
   * GET /api/journal-entries/{id}
   */
  getById(id: string): Observable<JournalEntryResponseDto> {
    return this.http.get<JournalEntryResponseDto>(`${this.baseUrl}/${id}`);
  }

  /**
   * READ: Get all entries for a specific date
   * GET /api/journal-entries/by-date/{date}
   */
  getByDate(date: string): Observable<JournalEntryListDto[]> {
    return this.http.get<JournalEntryListDto[]>(`${this.baseUrl}/by-date/${date}`);
  }

  /**
   * READ: Get entries by date range with pagination
   * GET /api/journal-entries/range?startDate={startDate}&endDate={endDate}&pageNumber={pageNumber}&pageSize={pageSize}
   */
  getByDateRange(
    startDate: string,
    endDate: string,
    pageNumber: number = 1,
    pageSize: number = 20
  ): Observable<JournalDateRangeResponse> {
    let params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate)
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', Math.min(pageSize, 100).toString()); // Max 100

    return this.http.get<JournalDateRangeResponse>(`${this.baseUrl}/range`, { params });
  }

  /**
   * READ: Get entries filtered by sentiment
   * GET /api/journal-entries/by-sentiment/{sentiment}
   */
  getBySentiment(sentiment: string): Observable<JournalEntryListDto[]> {
    return this.http.get<JournalEntryListDto[]>(`${this.baseUrl}/by-sentiment/${sentiment}`);
  }

  /**
   * READ: Get entries with mental health flags
   * GET /api/journal-entries/flagged?flags={flags}
   */
  getFlagged(flags?: string): Observable<JournalEntryListDto[]> {
    let params = new HttpParams();
    if (flags) {
      params = params.set('flags', flags);
    }
    return this.http.get<JournalEntryListDto[]>(`${this.baseUrl}/flagged`, { params });
  }

  /**
   * UPDATE: Update a journal entry
   * PUT /api/journal-entries/{id}
   */
  update(id: string, dto: JournalEntryUpdateDto): Observable<JournalEntryResponseDto> {
    return this.http.put<JournalEntryResponseDto>(`${this.baseUrl}/${id}`, dto);
  }

  /**
   * DELETE: Delete a journal entry
   * DELETE /api/journal-entries/{id}
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * ANALYZE: Trigger AI analysis on a journal entry
   * POST /api/journal-entries/{id}/analyze
   */
  triggerAnalysis(id: string): Observable<{ message: string; entry: JournalEntryResponseDto }> {
    return this.http.post<{ message: string; entry: JournalEntryResponseDto }>(
      `${this.baseUrl}/${id}/analyze`,
      {}
    );
  }
}

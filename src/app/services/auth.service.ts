// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, throwError } from 'rxjs';

export interface User {
  id: string;
  fullName: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface AuthError {
  message: string;
  code?: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'https://localhost:44304/api/Auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoadingSubject.asObservable();

  constructor(private http: HttpClient) {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        this.currentUserSubject.next(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse saved user', e);
        this.logout();
      }
    }
  }

  /**
   * Check if user is currently logged in
   */
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  /**
   * Get current user synchronously (use currentUser$ for reactive updates)
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Sign up a new user
   */
  signup(fullName: string, email: string, password: string): Observable<AuthResponse> {
    this.isLoadingSubject.next(true);
    return this.http.post<AuthResponse>(`${this.apiUrl}/signup`, { fullName, email, password })
      .pipe(
        tap(res => this.storeUser(res)),
        finalize(() => this.isLoadingSubject.next(false)),
        catchError(err => this.handleError(err))
      );
  }

  /**
   * Log in an existing user
   */
  login(email: string, password: string): Observable<AuthResponse> {
    this.isLoadingSubject.next(true);
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(res => this.storeUser(res)),
        finalize(() => this.isLoadingSubject.next(false)),
        catchError(err => this.handleError(err))
      );
  }

  /**
   * Log out the current user
   */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  /**
   * Get stored token
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Store user and token in localStorage and update subject
   */
  private storeUser(res: AuthResponse): void {
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
    this.currentUserSubject.next(res.user);
  }

  /**
   * Handle HTTP errors and return user-friendly messages
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unexpected error occurred. Please try again.';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message || errorMessage;
    } else {
      // Server-side error
      if (error.status === 0) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection.';
      } else if (error.status === 401 || error.status === 400) {
        errorMessage = error.error?.message || 'Invalid email or password.';
      } else if (error.status === 409) {
        errorMessage = 'This email is already registered.';
      } else if (error.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }
    }

    const authError: AuthError = {
      message: errorMessage,
      code: error.status
    };

    return throwError(() => authError);
  }
}

// Import finalize and catchError from rxjs
import { finalize, catchError } from 'rxjs';

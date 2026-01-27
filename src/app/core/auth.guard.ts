import { Injectable } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if user is logged in (has token in localStorage)
  const token = localStorage.getItem('token');
  
  if (token) {
    return true;
  }

  // Redirect to login and remember the original URL for redirect after login
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};

export const publicGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Redirect already logged-in users away from login/signup pages
  const token = localStorage.getItem('token');
  
  if (token) {
    router.navigate(['/']);
    return false;
  }

  return true;
};

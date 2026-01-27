import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { SettingsService } from '../../services/settings.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    MatMenuModule,
    MatDividerModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss'],
})
export class Navbar implements OnInit {
  showSidenav = false;
  currentUser$: Observable<User | null>;

  modules = signal({
    planner: true,
    journal: true,
    habits: true
  });

  constructor(
    private authService: AuthService,
    private settingsService: SettingsService,
    private router: Router
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit() {
    this.loadModuleSettings();
  }

  loadModuleSettings() {
    this.settingsService.getSettings().subscribe({
      next: (settings) => {
        if (settings.modulesJson) {
          try {
            const parsed = JSON.parse(settings.modulesJson);
            this.modules.set(parsed);
          } catch (e) {
            console.warn('Failed to parse modulesJson', e);
          }
        }
      },
      error: (err) => {
        console.warn('Failed to load module settings', err);
      }
    });
  }

  toggleSidenav() {
    this.showSidenav = !this.showSidenav;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
}

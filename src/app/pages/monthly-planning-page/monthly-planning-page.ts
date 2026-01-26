import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MonthlyPlanningComponent } from '../planner2/calendar/monthly-planning/monthly-planning.component';

@Component({
  selector: 'app-monthly-planning-page',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MonthlyPlanningComponent
  ],
  templateUrl: './monthly-planning-page.html',
  styleUrls: ['./monthly-planning-page.scss']
})
export class MonthlyPlanningPage {
  currentDate = signal(new Date());

  constructor(private router: Router) {}

  goBack() {
    this.router.navigate(['/planner']);
  }
}

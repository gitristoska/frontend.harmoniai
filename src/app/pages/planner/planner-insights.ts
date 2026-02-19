import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router } from '@angular/router';

import { PlannerService } from '../../services/task.service';
import { ProductivityInsight } from '../../models/planner/planner-insights.model';

@Component({
  selector: 'app-planner-insights',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule
  ],
  templateUrl: './planner-insights.html',
  styleUrls: ['./planner-insights.scss']
})
export class PlannerInsightsComponent implements OnInit {
  productivityInsights = signal<ProductivityInsight | null>(null);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  constructor(
    private plannerService: PlannerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadInsights();
  }

  loadInsights(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.plannerService.getProductivityInsights().subscribe({
      next: (insights) => {
        this.productivityInsights.set(insights);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load insights:', err);
        if (err.status === 404) {
          // Not enough data
          this.productivityInsights.set(null);
        } else {
          this.error.set('Failed to load productivity insights');
        }
        this.isLoading.set(false);
      }
    });
  }

  refreshInsights(): void {
    this.loadInsights();
  }

  goBack(): void {
    this.router.navigate(['/planner']);
  }

  trackByIndex(index: number): number {
    return index;
  }
}

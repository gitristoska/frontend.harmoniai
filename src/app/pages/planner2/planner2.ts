import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { TasksComponent } from './tasks/tasks.component';
import { CalendarComponent } from './calendar/calendar.component';
import { GoalsComponent } from './goals/goals.component';

@Component({
  selector: 'app-planner2',
  standalone: true,
  imports: [MatTabsModule, MatToolbarModule, TasksComponent, CalendarComponent, GoalsComponent],
  templateUrl: './planner2.html',
  styleUrls: ['./planner2.scss'],
})
export class Planner2 {
  tabIndex = 0; 
}

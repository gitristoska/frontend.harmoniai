import { Component, input, output } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-view-mode-selector',
  standalone: true,
  imports: [MatFormFieldModule, MatSelectModule],
  templateUrl: './view-mode-selector.component.html',
  styleUrls: ['./view-mode-selector.component.scss']
})
export class ViewModeSelectorComponent {
  viewMode = input.required<'daily' | 'weekly' | 'monthly'>();
  viewModeChange = output<'daily' | 'weekly' | 'monthly'>();

  onViewModeChange(value: string) {
    this.viewModeChange.emit(value as 'daily' | 'weekly' | 'monthly');
  }
}

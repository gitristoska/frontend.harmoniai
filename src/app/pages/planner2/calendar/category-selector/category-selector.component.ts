import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-category-selector',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './category-selector.component.html',
  styleUrls: ['./category-selector.component.scss']
})
export class CategorySelectorComponent {
  selectedCategory = input.required<string>();
  categories = input.required<Array<{id: string; name: string; color: string}>>();
  categoryChange = output<string>();

  onCategoryChange(value: string) {
    this.categoryChange.emit(value);
  }
}

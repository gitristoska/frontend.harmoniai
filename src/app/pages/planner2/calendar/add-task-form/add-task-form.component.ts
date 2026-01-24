import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

export interface NewTaskData {
  title: string;
  time: string;
  category: string;
}

@Component({
  selector: 'app-add-task-form',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  templateUrl: './add-task-form.component.html',
  styleUrls: ['./add-task-form.component.scss']
})
export class AddTaskFormComponent {
  selectedDate = input.required<Date>();
  categories = input.required<Array<{id: string; name: string; color: string}>>();
  
  taskSave = output<NewTaskData>();
  taskCancel = output<void>();

  newTaskTitle = '';
  newTaskTime = '09:00';
  newTaskCategory = 'study';

  onSave() {
    if (!this.newTaskTitle.trim()) return;
    
    this.taskSave.emit({
      title: this.newTaskTitle,
      time: this.newTaskTime,
      category: this.newTaskCategory
    });

    // Reset form
    this.newTaskTitle = '';
    this.newTaskTime = '09:00';
    this.newTaskCategory = 'study';
  }

  onCancel() {
    this.newTaskTitle = '';
    this.newTaskTime = '09:00';
    this.newTaskCategory = 'study';
    this.taskCancel.emit();
  }
}

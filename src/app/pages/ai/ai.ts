import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-ai',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './ai.html',
  styleUrls: ['./ai.scss']
})
export class Ai {
  analysis = { tasks: 3, habits: 5, entries: 1 };

  quickActions = [
    { icon: 'bolt', label: 'Start Deep Work Session' },
    { icon: 'target', label: 'Review Top 3 Priorities' },
    { icon: 'schedule', label: 'Schedule Tomorrow' },
    { icon: 'lightbulb', label: 'Brainstorm New Goals' }
  ];

  sections = [
    {
      id: 'productivity',
      title: 'Productivity',
      items: [
        { title: 'Peak Performance Hours', text: "Based on your task completion patterns, tackle high-priority work between 9-11 AM when you're most productive.", priority: 'high' },
        { title: 'Task Load Balance', text: "You're at 33% completion. Focus on your top 3 priorities today.", priority: 'medium' }
      ]
    },
    {
      id: 'schedule',
      title: 'Schedule Optimization',
      items: [
        { title: 'Time Blocking Suggestion', text: 'Create focused work blocks: 90 minutes deep work, followed by 15-minute breaks for optimal performance.', priority: 'medium' },
        { title: 'Task Distribution', text: 'You have 1 high-priority task. Schedule these in your prime hours.', priority: 'low' }
      ]
    },
    {
      id: 'habit',
      title: 'Habit & Wellness',
      items: [
        { title: 'Consistency Streak', text: "Excellent! 3 habits completed today. You're building strong routines.", priority: 'low' },
        { title: 'Wellness Integration', text: 'Schedule 5-10 minute mindfulness breaks between tasks to maintain energy and focus throughout the day.', priority: 'medium' }
      ]
    },
    {
      id: 'emotional',
      title: 'Emotional Balance',
      items: [
        { title: 'Mood Patterns', text: "Your recent journal shows positive energy. Great time for tackling challenging projects!", priority: 'low' },
        { title: 'Reflection Practice', text: 'Regular journaling helps identify patterns. Try writing for 5 minutes each evening.', priority: 'medium' }
      ]
    }
  ];

  suggestedGoals = [
    'Maintain 80% or higher task completion rate',
    'Complete all tracked habits at least 5 days this week',
    'Journal daily to improve self-awareness and emotional balance',
    'Review and adjust your schedule every evening for the next day'
  ];

  priorityClass(priority: string) {
    return `tag ${priority}`;
  }
}

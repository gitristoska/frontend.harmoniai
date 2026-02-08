export enum TaskStatus {
  Todo = 0,
  InProgress = 1,
  Done = 2
}

export enum TaskPriority {
  High = 1,
  Medium = 2,
  Low = 3
}

export enum TaskAction {
  Created = 'created',
  StatusChanged = 'statusChanged',
  Rescheduled = 'rescheduled'
}

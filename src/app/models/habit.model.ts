export interface Habit {
  id: string;
  name: string;
  days: boolean[];
  userId: string;
}

export interface HabitCreateDto {
  name: string;
  days: boolean[];
}

export interface HabitUpdateDto {
  name: string;
  days: boolean[];
}

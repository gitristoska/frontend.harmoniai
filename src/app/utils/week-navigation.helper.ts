/**
 * Utility class for week navigation and date calculations
 * Handles week start/end calculations and API date formatting
 */
export class WeekNavigationHelper {
  /**
   * Get Monday (week start) of the current week
   */
  static getCurrentWeekStart(): Date {
    const today = new Date();
    return this.getWeekStart(today);
  }

  /**
   * Calculate Monday (week start) from any date
   * @param date Any date within the desired week
   */
  static getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay() || 7; // Convert Sunday (0) to 7
    const diff = d.getDate() - day + 1; // Adjust to get Monday
    return new Date(d.setDate(diff));
  }

  /**
   * Get previous week's Monday
   */
  static getPreviousWeekStart(): Date {
    const today = new Date();
    today.setDate(today.getDate() - 7);
    return this.getWeekStart(today);
  }

  /**
   * Get next week's Monday
   */
  static getNextWeekStart(): Date {
    const today = new Date();
    today.setDate(today.getDate() + 7);
    return this.getWeekStart(today);
  }

  /**
   * Get week start by going back N weeks
   * @param weeksBack Number of weeks to go back (positive number)
   */
  static getWeekStartByOffset(weeksBack: number): Date {
    const date = new Date();
    date.setDate(date.getDate() - weeksBack * 7);
    return this.getWeekStart(date);
  }

  /**
   * Format date for API query (yyyy-MM-dd)
   */
  static formatDateForApi(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Get end date of week (Sunday) from week start (Monday)
   */
  static getWeekEnd(weekStart: Date): Date {
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 6);
    return end;
  }

  /**
   * Format week range for display (e.g., "Jan 27 - Feb 2, 2026")
   */
  static getWeekRangeLabel(weekStart: Date): string {
    const weekEnd = this.getWeekEnd(weekStart);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const startStr = weekStart.toLocaleDateString('en-US', options);
    const endStr = weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${startStr} - ${endStr}`;
  }

  /**
   * Check if a date is within the current week
   */
  static isCurrentWeek(weekStart: Date): boolean {
    const currentWeekStart = this.getCurrentWeekStart();
    return weekStart.getTime() === currentWeekStart.getTime();
  }

  /**
   * Check if a date is today
   */
  static isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  /**
   * Get day name from index (0=Monday, 6=Sunday)
   */
  static getDayName(dayIndex: number): string {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days[dayIndex] || '';
  }

  /**
   * Get day short name from index (0=Monday, 6=Sunday)
   */
  static getDayShortName(dayIndex: number): string {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days[dayIndex] || '';
  }

  /**
   * Get actual date for a specific day in a week
   * @param weekStart Monday of the week
   * @param dayIndex 0=Monday, 6=Sunday
   */
  static getDateForDayInWeek(weekStart: Date, dayIndex: number): Date {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + dayIndex);
    return date;
  }

  /**
   * Calculate difference in weeks between two dates
   */
  static getWeeksDifference(date1: Date, date2: Date): number {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.ceil(diffDays / 7);
  }
}

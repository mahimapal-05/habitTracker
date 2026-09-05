import {
  format,
  parseISO,
  isWithinInterval,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  subDays,
  addDays,
  isBefore,
  isAfter,
  isSameDay,
  getDay,
} from 'date-fns';

/**
 * Format a Date or ISO string into standard YYYY-MM-DD
 */
export function formatDateISO(date: Date | string): string {
  if (typeof date === 'string') {
    // If already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    return format(parseISO(date), 'yyyy-MM-dd');
  }
  return format(date, 'yyyy-MM-dd');
}

/**
 * Returns today's date formatted as YYYY-MM-DD
 */
export function getTodayISO(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * Parses YYYY-MM-DD string to local Date at midnight
 */
export function parseDateISO(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Checks if targetDate is within [startDate, endDate] inclusive
 */
export function isDateInRange(
  dateStr: string,
  startDateStr: string,
  endDateStr: string
): boolean {
  return dateStr >= startDateStr && dateStr <= endDateStr;
}

/**
 * Checks if a task is active on a given date based on start/end dates and frequency
 */
export function isTaskActiveOnDate(
  task: { startDate: string; endDate: string; frequency?: string },
  dateStr: string
): boolean {
  if (!isDateInRange(dateStr, task.startDate, task.endDate)) {
    return false;
  }

  const frequency = task.frequency || 'DAILY';
  const dayOfWeek = getDay(parseDateISO(dateStr)); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  if (frequency === 'DAILY') {
    return true;
  }

  if (frequency === 'WEEKDAYS') {
    return dayOfWeek >= 1 && dayOfWeek <= 5;
  }

  if (frequency === 'WEEKENDS') {
    return dayOfWeek === 0 || dayOfWeek === 6;
  }

  return true;
}

/**
 * Returns all dates for a given month as YYYY-MM-DD
 */
export function getDaysInMonthArray(year: number, month: number): string[] {
  // month is 1-indexed (1 = Jan, 12 = Dec)
  const start = startOfMonth(new Date(year, month - 1, 1));
  const end = endOfMonth(start);
  const days = eachDayOfInterval({ start, end });
  return days.map((d) => formatDateISO(d));
}

/**
 * Generate human readable greeting based on hour of the day
 */
export function getGreeting(name?: string): string {
  const hour = new Date().getHours();
  let timeGreeting = 'Good evening';
  if (hour < 12) {
    timeGreeting = 'Good morning';
  } else if (hour < 17) {
    timeGreeting = 'Good afternoon';
  }

  return name ? `${timeGreeting}, ${name}` : timeGreeting;
}

/**
 * Formats a date for display (e.g., "Sep 2, 2026")
 */
export function formatDisplayDate(dateStr: string): string {
  try {
    return format(parseDateISO(dateStr), 'MMM d, yyyy');
  } catch {
    return dateStr;
  }
}

/**
 * Formats a short day label (e.g., "Wed, Sep 2")
 */
export function formatShortDate(dateStr: string): string {
  try {
    return format(parseDateISO(dateStr), 'EEE, MMM d');
  } catch {
    return dateStr;
  }
}

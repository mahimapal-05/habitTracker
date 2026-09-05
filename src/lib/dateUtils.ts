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
 * Frequency configuration structure
 */
export type FrequencyType =
  | 'DAILY'
  | 'WEEKDAYS'
  | 'WEEKENDS'
  | 'CUSTOM_DAYS'
  | 'INTERVAL'
  | 'TIMES_PER_WEEK';

export interface ParsedFrequency {
  type: FrequencyType;
  customDays: number[]; // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  intervalDays: number;
  timesPerWeek: number;
}

/**
 * Format a Date or ISO string into standard YYYY-MM-DD
 */
export function formatDateISO(date: Date | string): string {
  if (typeof date === 'string') {
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
 * Parses a raw frequency string into structured frequency configuration
 * Supported formats:
 * - "DAILY"
 * - "WEEKDAYS"
 * - "WEEKENDS"
 * - "CUSTOM:1,3,5" or "SPECIFIC:1,3,5" (0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat)
 * - "INTERVAL:2" (Every 2 days from startDate)
 * - "WEEKLY:3" (3 days per week)
 */
export function parseFrequency(freqStr?: string): ParsedFrequency {
  if (!freqStr || freqStr === 'DAILY') {
    return {
      type: 'DAILY',
      customDays: [0, 1, 2, 3, 4, 5, 6],
      intervalDays: 1,
      timesPerWeek: 7,
    };
  }

  if (freqStr === 'WEEKDAYS') {
    return {
      type: 'WEEKDAYS',
      customDays: [1, 2, 3, 4, 5],
      intervalDays: 1,
      timesPerWeek: 5,
    };
  }

  if (freqStr === 'WEEKENDS') {
    return {
      type: 'WEEKENDS',
      customDays: [0, 6],
      intervalDays: 1,
      timesPerWeek: 2,
    };
  }

  if (
    freqStr.startsWith('CUSTOM:') ||
    freqStr.startsWith('SPECIFIC:') ||
    freqStr.startsWith('DAYS:')
  ) {
    const raw = freqStr.split(':')[1] || '';
    const days = raw
      .split(',')
      .map(Number)
      .filter((n) => !isNaN(n) && n >= 0 && n <= 6);
    return {
      type: 'CUSTOM_DAYS',
      customDays: days.length > 0 ? Array.from(new Set(days)) : [1, 3, 5],
      intervalDays: 1,
      timesPerWeek: days.length > 0 ? days.length : 3,
    };
  }

  if (freqStr.startsWith('INTERVAL:') || freqStr.startsWith('EVERY_')) {
    const raw = freqStr.split(':')[1] || freqStr.replace('EVERY_', '').replace('_DAYS', '');
    const interval = Math.max(1, parseInt(raw, 10) || 2);
    return {
      type: 'INTERVAL',
      customDays: [0, 1, 2, 3, 4, 5, 6],
      intervalDays: interval,
      timesPerWeek: Math.max(1, Math.round(7 / interval)),
    };
  }

  if (freqStr.startsWith('WEEKLY:') || freqStr.startsWith('TIMES_PER_WEEK:')) {
    const raw = freqStr.split(':')[1] || '';
    const times = Math.min(7, Math.max(1, parseInt(raw, 10) || 3));
    return {
      type: 'TIMES_PER_WEEK',
      customDays: [0, 1, 2, 3, 4, 5, 6],
      intervalDays: 1,
      timesPerWeek: times,
    };
  }

  return {
    type: 'DAILY',
    customDays: [0, 1, 2, 3, 4, 5, 6],
    intervalDays: 1,
    timesPerWeek: 7,
  };
}

/**
 * Checks if a task is active on a given date based on start/end dates and custom frequency
 */
export function isTaskActiveOnDate(
  task: { startDate: string; endDate: string; frequency?: string },
  dateStr: string
): boolean {
  if (!isDateInRange(dateStr, task.startDate, task.endDate)) {
    return false;
  }

  const parsed = parseFrequency(task.frequency);
  const dateObj = parseDateISO(dateStr);
  const dayOfWeek = getDay(dateObj); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  switch (parsed.type) {
    case 'DAILY':
      return true;

    case 'WEEKDAYS':
      return dayOfWeek >= 1 && dayOfWeek <= 5;

    case 'WEEKENDS':
      return dayOfWeek === 0 || dayOfWeek === 6;

    case 'CUSTOM_DAYS':
      return parsed.customDays.includes(dayOfWeek);

    case 'INTERVAL': {
      // Calculate elapsed days from task start date
      const startObj = parseDateISO(task.startDate);
      const diffTime = dateObj.getTime() - startObj.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays % parsed.intervalDays === 0;
    }

    case 'TIMES_PER_WEEK':
      // Open on any day during the duration
      return true;

    default:
      return true;
  }
}

/**
 * Formats any frequency string into a friendly, human-readable label
 * Examples:
 * - "DAILY" -> "Every day"
 * - "WEEKDAYS" -> "Weekdays (Mon–Fri)"
 * - "WEEKENDS" -> "Weekends (Sat–Sun)"
 * - "CUSTOM:1,3,5" -> "Mon, Wed, Fri"
 * - "INTERVAL:2" -> "Every 2 days (Alternate)"
 * - "INTERVAL:3" -> "Every 3 days"
 * - "WEEKLY:4" -> "4 days / week"
 */
export function formatFrequencyLabel(freqStr?: string): string {
  if (!freqStr || freqStr === 'DAILY') return 'Every day';
  if (freqStr === 'WEEKDAYS') return 'Weekdays (Mon–Fri)';
  if (freqStr === 'WEEKENDS') return 'Weekends (Sat–Sun)';

  const parsed = parseFrequency(freqStr);

  if (parsed.type === 'CUSTOM_DAYS') {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    // Sort starting with Monday (1) through Sunday (0)
    const sorted = [...parsed.customDays].sort((a, b) => {
      const orderA = a === 0 ? 7 : a;
      const orderB = b === 0 ? 7 : b;
      return orderA - orderB;
    });

    if (sorted.length === 7) return 'Every day';
    if (sorted.length === 5 && sorted.every((d) => d >= 1 && d <= 5)) return 'Weekdays (Mon–Fri)';
    if (sorted.length === 2 && sorted.includes(0) && sorted.includes(6)) return 'Weekends (Sat–Sun)';

    return sorted.map((d) => dayNames[d]).join(', ');
  }

  if (parsed.type === 'INTERVAL') {
    if (parsed.intervalDays === 2) return 'Every 2 days (Alternate)';
    return `Every ${parsed.intervalDays} days`;
  }

  if (parsed.type === 'TIMES_PER_WEEK') {
    return `${parsed.timesPerWeek} days / week`;
  }

  return 'Every day';
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

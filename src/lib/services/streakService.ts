import {
  parseDateISO,
  formatDateISO,
  getTodayISO,
  isTaskActiveOnDate,
} from '../dateUtils';
import { addDays, subDays, isBefore, isAfter } from 'date-fns';

export interface TaskStreakData {
  currentStreak: number;
  bestStreak: number;
  completionRate: number;
  totalCompletedDays: number;
  totalActiveDaysElapsed: number;
}

export interface TaskRecordLike {
  date: string;
  completed: boolean;
  actualValue?: number | null;
  manuallyCompleted?: boolean;
  isAutoCompleted?: boolean;
}

export interface TaskLike {
  startDate: string;
  endDate: string;
  frequency?: string;
}

/**
 * Returns a sorted map of records keyed by date string (YYYY-MM-DD)
 */
function createRecordMap(records: TaskRecordLike[]): Map<string, TaskRecordLike> {
  const map = new Map<string, TaskRecordLike>();
  for (const r of records) {
    map.set(r.date, r);
  }
  return map;
}

/**
 * Generates all active dates for a task between fromDate and toDate (inclusive)
 */
export function getActiveDatesForRange(
  task: TaskLike,
  fromDateStr: string,
  toDateStr: string
): string[] {
  if (fromDateStr > toDateStr) return [];
  
  const dates: string[] = [];
  let current = parseDateISO(fromDateStr);
  const end = parseDateISO(toDateStr);

  while (!isAfter(current, end)) {
    const dateStr = formatDateISO(current);
    if (isTaskActiveOnDate(task, dateStr)) {
      dates.push(dateStr);
    }
    current = addDays(current, 1);
  }

  return dates;
}

/**
 * Calculates the current active streak for a specific task.
 * Missed/incomplete day breaks the current streak.
 * If today is not yet completed, checks streak up to yesterday.
 */
export function calculateCurrentStreak(
  task: TaskLike,
  records: TaskRecordLike[],
  todayStr: string = getTodayISO()
): number {
  if (task.startDate > todayStr) {
    return 0; // Task hasn't started yet
  }

  const recordMap = createRecordMap(records);
  const effectiveEnd = task.endDate < todayStr ? task.endDate : todayStr;
  const activeDates = getActiveDatesForRange(task, task.startDate, effectiveEnd);

  if (activeDates.length === 0) return 0;

  // Check if today is an active date
  const isTodayActive = activeDates[activeDates.length - 1] === todayStr;
  const todayRecord = isTodayActive ? recordMap.get(todayStr) : null;
  const isTodayCompleted = todayRecord?.completed === true;

  let streak = 0;
  let startIndex = activeDates.length - 1;

  if (isTodayActive) {
    if (isTodayCompleted) {
      streak = 1;
      startIndex = activeDates.length - 2;
    } else {
      // Today is not completed yet. We inspect consecutive streak up to yesterday
      startIndex = activeDates.length - 2;
    }
  }

  // Walk backwards through preceding active dates
  for (let i = startIndex; i >= 0; i--) {
    const dateStr = activeDates[i];
    const rec = recordMap.get(dateStr);
    if (rec && rec.completed) {
      streak++;
    } else {
      // Incomplete/missed day breaks the current streak
      break;
    }
  }

  return streak;
}

/**
 * Calculates the best (longest) historical streak for a specific task.
 */
export function calculateBestStreak(
  task: TaskLike,
  records: TaskRecordLike[],
  todayStr: string = getTodayISO()
): number {
  const recordMap = createRecordMap(records);
  // Calculate best streak across all elapsed active dates up to min(today, task.endDate)
  const effectiveEnd = task.endDate < todayStr ? task.endDate : todayStr;
  const activeDates = getActiveDatesForRange(task, task.startDate, effectiveEnd);

  let bestStreak = 0;
  let currentRun = 0;

  for (const dateStr of activeDates) {
    const rec = recordMap.get(dateStr);
    if (rec && rec.completed) {
      currentRun++;
      if (currentRun > bestStreak) {
        bestStreak = currentRun;
      }
    } else {
      currentRun = 0;
    }
  }

  return bestStreak;
}

/**
 * Calculates the completion rate (%) for a specific task over its active elapsed duration.
 */
export function calculateCompletionRate(
  task: TaskLike,
  records: TaskRecordLike[],
  todayStr: string = getTodayISO()
): { completionRate: number; totalCompletedDays: number; totalActiveDaysElapsed: number } {
  if (task.startDate > todayStr) {
    return { completionRate: 0, totalCompletedDays: 0, totalActiveDaysElapsed: 0 };
  }

  const recordMap = createRecordMap(records);
  const effectiveEnd = task.endDate < todayStr ? task.endDate : todayStr;
  const activeDates = getActiveDatesForRange(task, task.startDate, effectiveEnd);

  const totalActiveDaysElapsed = activeDates.length;
  if (totalActiveDaysElapsed === 0) {
    return { completionRate: 0, totalCompletedDays: 0, totalActiveDaysElapsed: 0 };
  }

  let totalCompletedDays = 0;
  for (const dateStr of activeDates) {
    const rec = recordMap.get(dateStr);
    if (rec && rec.completed) {
      totalCompletedDays++;
    }
  }

  const completionRate = Math.round((totalCompletedDays / totalActiveDaysElapsed) * 100);

  return {
    completionRate,
    totalCompletedDays,
    totalActiveDaysElapsed,
  };
}

/**
 * Convenience helper to compute all streak and rate metrics for a task
 */
export function getTaskStreakMetrics(
  task: TaskLike,
  records: TaskRecordLike[],
  todayStr: string = getTodayISO()
): TaskStreakData {
  const currentStreak = calculateCurrentStreak(task, records, todayStr);
  const bestStreak = calculateBestStreak(task, records, todayStr);
  const { completionRate, totalCompletedDays, totalActiveDaysElapsed } =
    calculateCompletionRate(task, records, todayStr);

  return {
    currentStreak,
    bestStreak: Math.max(bestStreak, currentStreak),
    completionRate,
    totalCompletedDays,
    totalActiveDaysElapsed,
  };
}

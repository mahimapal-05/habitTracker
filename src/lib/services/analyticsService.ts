import { prisma } from '../prisma';
import { getTodayISO, isDateInRange, getDaysInMonthArray } from '../dateUtils';
import { getTaskStreakMetrics, getActiveDatesForRange } from './streakService';

export interface DailyChartPoint {
  date: string;
  displayDate: string;
  actual: number | null;
  target: number | null;
  completed: boolean;
  manuallyCompleted: boolean;
  isAutoCompleted: boolean;
}

export interface TaskAnalytics {
  taskId: string;
  taskName: string;
  type: string;
  target: number | null;
  unit: string | null;
  startDate: string;
  endDate: string;
  currentStreak: number;
  bestStreak: number;
  completionRate: number;
  totalCompletedDays: number;
  totalActiveDaysElapsed: number;
  personalBestActual: number | null;
  averageActual: number | null;
  chartData: DailyChartPoint[];
}

export interface OverallAnalytics {
  todayCompletionRate: number;
  todayCompletedCount: number;
  todayIncompleteCount: number;
  totalActiveTasksToday: number;
  overallHistoricalRate: number;
  totalStreaksCount: number;
  longestCurrentStreak: { taskName: string; streak: number } | null;
  longestBestStreak: { taskName: string; streak: number } | null;
  tasks: TaskAnalytics[];
}

/**
 * Computes overall and per-task analytics for a user
 */
export async function getUserAnalytics(
  userId: string,
  todayStr: string = getTodayISO()
): Promise<OverallAnalytics> {
  const tasks = await prisma.task.findMany({
    where: { userId },
    include: {
      records: {
        orderBy: { date: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  let todayCompletedCount = 0;
  let totalActiveTasksToday = 0;
  let totalActiveDaysAll = 0;
  let totalCompletedDaysAll = 0;
  let totalStreaksCount = 0;
  let longestCurrentStreak: { taskName: string; streak: number } | null = null;
  let longestBestStreak: { taskName: string; streak: number } | null = null;

  const taskAnalyticsList: TaskAnalytics[] = [];

  for (const task of tasks) {
    const isTodayActive = isDateInRange(todayStr, task.startDate, task.endDate);
    if (isTodayActive) {
      totalActiveTasksToday++;
    }

    const todayRecord = task.records.find((r) => r.date === todayStr);
    if (isTodayActive && todayRecord?.completed) {
      todayCompletedCount++;
    }

    // Streak metrics
    const metrics = getTaskStreakMetrics(task, task.records, todayStr);
    totalActiveDaysAll += metrics.totalActiveDaysElapsed;
    totalCompletedDaysAll += metrics.totalCompletedDays;
    totalStreaksCount += metrics.currentStreak;

    if (!longestCurrentStreak || metrics.currentStreak > longestCurrentStreak.streak) {
      longestCurrentStreak = { taskName: task.name, streak: metrics.currentStreak };
    }
    if (!longestBestStreak || metrics.bestStreak > longestBestStreak.streak) {
      longestBestStreak = { taskName: task.name, streak: metrics.bestStreak };
    }

    // Personal Best and Average
    const validActuals = task.records
      .map((r) => r.actualValue)
      .filter((v): v is number => v !== null && v !== undefined);
    const personalBestActual = validActuals.length > 0 ? Math.max(...validActuals) : null;
    const averageActual =
      validActuals.length > 0
        ? Number((validActuals.reduce((a, b) => a + b, 0) / validActuals.length).toFixed(1))
        : null;

    // Generate chart data across task's active dates
    const recordMap = new Map(task.records.map((r) => [r.date, r]));
    const effectiveEnd = task.endDate < todayStr ? task.endDate : todayStr;
    const activeDates = getActiveDatesForRange(task, task.startDate, effectiveEnd);

    const chartData: DailyChartPoint[] = activeDates.map((dateStr) => {
      const rec = recordMap.get(dateStr);
      // Format short display date like "Sep 2"
      const parts = dateStr.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthIndex = parseInt(parts[1], 10) - 1;
      const displayDate = `${monthNames[monthIndex]} ${parseInt(parts[2], 10)}`;

      return {
        date: dateStr,
        displayDate,
        actual: rec?.actualValue !== undefined ? rec.actualValue : null,
        target: task.target ?? null,
        completed: rec?.completed ?? false,
        manuallyCompleted: rec?.manuallyCompleted ?? false,
        isAutoCompleted: rec?.isAutoCompleted ?? false,
      };
    });

    taskAnalyticsList.push({
      taskId: task.id,
      taskName: task.name,
      type: task.type,
      target: task.target,
      unit: task.unit,
      startDate: task.startDate,
      endDate: task.endDate,
      currentStreak: metrics.currentStreak,
      bestStreak: metrics.bestStreak,
      completionRate: metrics.completionRate,
      totalCompletedDays: metrics.totalCompletedDays,
      totalActiveDaysElapsed: metrics.totalActiveDaysElapsed,
      personalBestActual,
      averageActual,
      chartData,
    });
  }

  const todayCompletionRate =
    totalActiveTasksToday > 0
      ? Math.round((todayCompletedCount / totalActiveTasksToday) * 100)
      : 0;

  const todayIncompleteCount = Math.max(0, totalActiveTasksToday - todayCompletedCount);

  const overallHistoricalRate =
    totalActiveDaysAll > 0
      ? Math.round((totalCompletedDaysAll / totalActiveDaysAll) * 100)
      : 0;

  return {
    todayCompletionRate,
    todayCompletedCount,
    todayIncompleteCount,
    totalActiveTasksToday,
    overallHistoricalRate,
    totalStreaksCount,
    longestCurrentStreak,
    longestBestStreak,
    tasks: taskAnalyticsList,
  };
}

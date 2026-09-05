import { prisma } from '../prisma';
import { getTodayISO, isDateInRange } from '../dateUtils';

export interface PendingReminder {
  taskId: string;
  taskName: string;
  taskType: string;
  target?: number | null;
  unit?: string | null;
  time: string;
  message: string;
  isCompletedToday: boolean;
}

/**
 * Calculates pending active reminders for a user for today.
 * Skips reminders if the task has already been completed for the day!
 */
export async function getActiveRemindersForToday(
  userId: string,
  todayStr: string = getTodayISO()
): Promise<PendingReminder[]> {
  const tasks = await prisma.task.findMany({
    where: {
      userId,
      reminderEnabled: true,
      startDate: { lte: todayStr },
      endDate: { gte: todayStr },
    },
    include: {
      records: {
        where: { date: todayStr },
      },
    },
  });

  const reminders: PendingReminder[] = [];

  for (const task of tasks) {
    const todayRecord = task.records[0];
    const isCompleted = todayRecord?.completed === true;

    // If task is completed for the day, DO NOT send reminders!
    if (isCompleted) {
      continue;
    }

    let parsedTimes: string[] = [];
    try {
      parsedTimes = JSON.parse(task.reminderTimes);
    } catch {
      parsedTimes = [];
    }

    const defaultMsg =
      task.reminderMessage ||
      `Time for "${task.name}"! Stay consistent and build your momentum.`;

    for (const time of parsedTimes) {
      reminders.push({
        taskId: task.id,
        taskName: task.name,
        taskType: task.type,
        target: task.target,
        unit: task.unit,
        time,
        message: defaultMsg,
        isCompletedToday: isCompleted,
      });
    }
  }

  // Sort by time
  return reminders.sort((a, b) => a.time.localeCompare(b.time));
}

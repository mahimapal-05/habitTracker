import { prisma } from '../prisma';
import { getTodayISO, isDateInRange } from '../dateUtils';
import { getTaskStreakMetrics } from './streakService';
import { generateTaskMotivation } from './motivationEngine';

export interface CreateTaskInput {
  name: string;
  description?: string;
  type: 'CHECKBOX' | 'NUMERIC' | 'TIME' | 'PROGRESS';
  target?: number;
  startValue?: number;
  direction?: 'DECREASE' | 'INCREASE';
  unit?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  frequency?: string;
  reminderEnabled?: boolean;
  reminderTimes?: string[]; // e.g. ["08:00", "13:00", "20:00"]
  reminderMessage?: string;
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {}

/**
 * Validates task date and target logic
 */
export function validateTaskInput(input: Partial<CreateTaskInput>) {
  if (input.name !== undefined && !input.name.trim()) {
    throw new Error('Task name is required.');
  }

  if (input.startDate && input.endDate) {
    if (input.endDate < input.startDate) {
      throw new Error('End date cannot be before start date.');
    }
  }

  if (input.type && input.type !== 'CHECKBOX') {
    if (input.target !== undefined && (input.target === null || input.target <= 0)) {
      throw new Error('Target value must be greater than zero.');
    }
  }
}

/**
 * Creates a new task for the authenticated user
 */
export async function createTask(userId: string, input: CreateTaskInput) {
  validateTaskInput(input);

  const reminderTimesStr = JSON.stringify(input.reminderTimes || []);

  const task = await prisma.task.create({
    data: {
      userId,
      name: input.name.trim(),
      description: input.description?.trim() || null,
      type: input.type || 'CHECKBOX',
      target: input.type !== 'CHECKBOX' ? (input.target ? Number(input.target) : null) : null,
      startValue: input.type === 'PROGRESS' ? (input.startValue !== undefined ? Number(input.startValue) : null) : null,
      direction: input.type === 'PROGRESS' ? (input.direction || 'DECREASE') : 'DECREASE',
      unit: input.unit?.trim() || (input.type === 'TIME' ? 'hours' : input.type === 'PROGRESS' ? 'kg' : null),
      startDate: input.startDate,
      endDate: input.endDate,
      frequency: input.frequency || 'DAILY',
      reminderEnabled: !!input.reminderEnabled,
      reminderTimes: reminderTimesStr,
      reminderMessage: input.reminderMessage?.trim() || null,
    },
  });

  return task;
}

/**
 * Retrieves all tasks for a user with streak calculations, progress stats, today's status, and motivation
 */
export async function getUserTasksWithMetrics(userId: string, targetDateStr: string = getTodayISO()) {
  const tasks = await prisma.task.findMany({
    where: { userId },
    include: {
      records: {
        orderBy: { date: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return tasks.map((task) => {
    // Parse reminder times
    let reminderTimes: string[] = [];
    try {
      reminderTimes = JSON.parse(task.reminderTimes);
    } catch {
      reminderTimes = [];
    }

    // Get Streak Metrics
    const metrics = getTaskStreakMetrics(task, task.records, targetDateStr);

    // Find today's and yesterday's record
    const todayRecord = task.records.find((r) => r.date === targetDateStr) || null;
    
    // Calculate personal best actual
    const validActuals = task.records
      .map((r) => r.actualValue)
      .filter((v): v is number => v !== null && v !== undefined);
    const personalBestActual = validActuals.length > 0 ? Math.max(...validActuals) : null;
    const averageActual =
      validActuals.length > 0
        ? validActuals.reduce((acc, curr) => acc + curr, 0) / validActuals.length
        : null;

    // Previous active record
    const pastRecords = task.records.filter((r) => r.date < targetDateStr);
    const yesterdayRecord = pastRecords.length > 0 ? pastRecords[pastRecords.length - 1] : null;

    // PROGRESS / Milestone Stats (e.g. Weight loss from 71.7kg to 65kg)
    const recordsWithValues = task.records
      .filter((r) => r.actualValue !== null && r.actualValue !== undefined)
      .sort((a, b) => b.date.localeCompare(a.date));

    const latestLoggedValue =
      recordsWithValues.length > 0
        ? recordsWithValues[0].actualValue
        : (task.startValue ?? null);

    const previousLoggedValue =
      recordsWithValues.length > 1
        ? recordsWithValues[1].actualValue
        : (task.startValue ?? null);

    let progressJourney: {
      startValue: number | null;
      targetValue: number | null;
      currentValue: number | null;
      direction: 'DECREASE' | 'INCREASE';
      deltaAchieved: number;
      deltaRemaining: number;
      percentAchieved: number;
      recentChange: number | null;
      isGoalMet: boolean;
    } | null = null;

    if (task.type === 'PROGRESS') {
      const start = task.startValue !== null && task.startValue !== undefined ? Number(task.startValue) : null;
      const target = task.target !== null && task.target !== undefined ? Number(task.target) : null;
      const current = latestLoggedValue !== null ? Number(latestLoggedValue) : start;
      const dir = (task.direction as 'DECREASE' | 'INCREASE') || 'DECREASE';

      let deltaAchieved = 0;
      let deltaRemaining = 0;
      let percentAchieved = 0;
      let isGoalMet = false;

      if (start !== null && target !== null && current !== null) {
        const totalDelta = Math.abs(start - target);
        if (dir === 'DECREASE') {
          deltaAchieved = Number((start - current).toFixed(2));
          deltaRemaining = Number(Math.max(0, current - target).toFixed(2));
          isGoalMet = current <= target;
        } else {
          deltaAchieved = Number((current - start).toFixed(2));
          deltaRemaining = Number(Math.max(0, target - current).toFixed(2));
          isGoalMet = current >= target;
        }

        if (totalDelta > 0) {
          percentAchieved = Math.min(100, Math.max(0, Math.round((Math.max(0, deltaAchieved) / totalDelta) * 100)));
        } else if (isGoalMet) {
          percentAchieved = 100;
        }
      }

      const recentChange =
        previousLoggedValue !== null && current !== null
          ? Number((current - Number(previousLoggedValue)).toFixed(2))
          : null;

      progressJourney = {
        startValue: start,
        targetValue: target,
        currentValue: current,
        direction: dir,
        deltaAchieved,
        deltaRemaining,
        percentAchieved,
        recentChange,
        isGoalMet,
      };
    }

    // Contextual Motivation
    const motivation = generateTaskMotivation({
      taskName: task.name,
      taskType: task.type,
      target: task.target,
      unit: task.unit,
      todayActual: todayRecord?.actualValue,
      todayCompleted: todayRecord?.completed,
      todayManuallyCompleted: todayRecord?.manuallyCompleted,
      yesterdayCompleted: yesterdayRecord?.completed,
      yesterdayActual: yesterdayRecord?.actualValue,
      currentStreak: metrics.currentStreak,
      bestStreak: metrics.bestStreak,
      personalBestActual,
      averageActual,
    });

    const isTodayActive = isDateInRange(targetDateStr, task.startDate, task.endDate);

    return {
      ...task,
      reminderTimes,
      isTodayActive,
      todayRecord,
      metrics,
      personalBestActual,
      averageActual,
      motivation,
      progressJourney,
    };
  });
}

/**
 * Updates a task by ID ensuring user ownership
 */
export async function updateTask(userId: string, taskId: string, input: UpdateTaskInput) {
  validateTaskInput(input);

  // Check ownership
  const existing = await prisma.task.findFirst({
    where: { id: taskId, userId },
  });

  if (!existing) {
    throw new Error('Task not found or unauthorized.');
  }

  const data: any = {};
  if (input.name !== undefined) data.name = input.name.trim();
  if (input.description !== undefined) data.description = input.description?.trim() || null;
  if (input.type !== undefined) data.type = input.type;
  if (input.target !== undefined) data.target = input.target !== null ? Number(input.target) : null;
  if (input.startValue !== undefined) data.startValue = input.startValue !== null ? Number(input.startValue) : null;
  if (input.direction !== undefined) data.direction = input.direction;
  if (input.unit !== undefined) data.unit = input.unit?.trim() || null;
  if (input.startDate !== undefined) data.startDate = input.startDate;
  if (input.endDate !== undefined) data.endDate = input.endDate;
  if (input.frequency !== undefined) data.frequency = input.frequency;
  if (input.reminderEnabled !== undefined) data.reminderEnabled = !!input.reminderEnabled;
  if (input.reminderTimes !== undefined) data.reminderTimes = JSON.stringify(input.reminderTimes);
  if (input.reminderMessage !== undefined) data.reminderMessage = input.reminderMessage?.trim() || null;

  return prisma.task.update({
    where: { id: taskId },
    data,
  });
}

/**
 * Deletes a task by ID ensuring user ownership
 */
export async function deleteTask(userId: string, taskId: string) {
  const existing = await prisma.task.findFirst({
    where: { id: taskId, userId },
  });

  if (!existing) {
    throw new Error('Task not found or unauthorized.');
  }

  return prisma.task.delete({
    where: { id: taskId },
  });
}

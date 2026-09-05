import { prisma } from '../prisma';
import { getTodayISO, isDateInRange } from '../dateUtils';
import { getTaskStreakMetrics } from './streakService';
import { generateTaskMotivation } from './motivationEngine';

export interface CreateTaskInput {
  name: string;
  description?: string;
  type: 'CHECKBOX' | 'NUMERIC' | 'TIME';
  target?: number;
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
      throw new Error('Target value must be greater than zero for numeric and time goals.');
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
      unit: input.unit?.trim() || (input.type === 'TIME' ? 'hours' : null),
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
 * Retrieves all tasks for a user with streak calculations, today's status, and motivation
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

import { prisma } from '../prisma';
import { isDateInRange } from '../dateUtils';

export interface LogDailyRecordInput {
  taskId: string;
  date: string; // YYYY-MM-DD
  actualValue?: number | null;
  completed?: boolean;
  manuallyCompleted?: boolean;
  note?: string | null;
}

/**
 * Upserts a daily tracking record for a task with automatic completion calculation
 */
export async function logDailyRecord(userId: string, input: LogDailyRecordInput) {
  // 1. Verify task ownership & date boundaries
  const task = await prisma.task.findFirst({
    where: { id: input.taskId, userId },
  });

  if (!task) {
    throw new Error('Task not found or unauthorized.');
  }

  if (!isDateInRange(input.date, task.startDate, task.endDate)) {
    throw new Error(`Cannot record progress for ${input.date}: outside task duration (${task.startDate} to ${task.endDate}).`);
  }

  // 2. Fetch existing record if any
  const existingRecord = await prisma.dailyRecord.findUnique({
    where: {
      taskId_date: {
        taskId: input.taskId,
        date: input.date,
      },
    },
  });

  let completed = existingRecord?.completed ?? false;
  let isAutoCompleted = existingRecord?.isAutoCompleted ?? false;
  let manuallyCompleted = existingRecord?.manuallyCompleted ?? false;
  let actualValue = input.actualValue !== undefined ? input.actualValue : existingRecord?.actualValue;
  const note = input.note !== undefined ? input.note : existingRecord?.note;

  // 3. Apply completion rules based on task type
  if (task.type === 'CHECKBOX') {
    if (input.completed !== undefined) {
      completed = input.completed;
      manuallyCompleted = true;
      isAutoCompleted = false;
    }
  } else {
    // NUMERIC or TIME Goal
    const target = task.target ?? 0;
    
    // If actual value is provided
    if (actualValue !== undefined && actualValue !== null) {
      if (target > 0 && actualValue >= target) {
        // Automatic completion
        completed = true;
        isAutoCompleted = true;
        manuallyCompleted = false;
      } else {
        // actualValue < target
        isAutoCompleted = false;
        // If explicit manual completed override was provided or already present
        if (input.manuallyCompleted !== undefined) {
          manuallyCompleted = input.manuallyCompleted;
          completed = input.manuallyCompleted;
        } else if (input.completed !== undefined) {
          completed = input.completed;
          manuallyCompleted = input.completed;
        } else {
          // If no explicit manual override, only maintain manual completion if it was set
          if (!manuallyCompleted) {
            completed = false;
          }
        }
      }
    } else if (input.completed !== undefined) {
      // User manually toggled completion checkbox without entering actual value
      completed = input.completed;
      manuallyCompleted = true;
      isAutoCompleted = false;
    }
  }

  // 4. Save to database
  const record = await prisma.dailyRecord.upsert({
    where: {
      taskId_date: {
        taskId: input.taskId,
        date: input.date,
      },
    },
    update: {
      actualValue,
      completed,
      manuallyCompleted,
      isAutoCompleted,
      note,
    },
    create: {
      taskId: input.taskId,
      date: input.date,
      actualValue,
      completed,
      manuallyCompleted,
      isAutoCompleted,
      note,
    },
  });

  return record;
}

/**
 * Toggles manual completion status for a given task and date without erasing actual value
 */
export async function toggleManualCompletion(
  userId: string,
  taskId: string,
  date: string,
  explicitState?: boolean
) {
  const task = await prisma.task.findFirst({
    where: { id: taskId, userId },
  });

  if (!task) {
    throw new Error('Task not found or unauthorized.');
  }

  if (!isDateInRange(date, task.startDate, task.endDate)) {
    throw new Error(`Date ${date} is outside the task duration.`);
  }

  const existingRecord = await prisma.dailyRecord.findUnique({
    where: {
      taskId_date: {
        taskId,
        date,
      },
    },
  });

  const nextState = explicitState !== undefined ? explicitState : !(existingRecord?.completed ?? false);

  return prisma.dailyRecord.upsert({
    where: {
      taskId_date: {
        taskId,
        date,
      },
    },
    update: {
      completed: nextState,
      manuallyCompleted: true,
      isAutoCompleted: false,
    },
    create: {
      taskId,
      date,
      actualValue: null,
      completed: nextState,
      manuallyCompleted: true,
      isAutoCompleted: false,
    },
  });
}

/**
 * Retrieves all records for a user across all tasks for a specific month
 */
export async function getUserRecordsForMonth(userId: string, year: number, month: number) {
  const monthStr = month < 10 ? `0${month}` : `${month}`;
  const startDateStr = `${year}-${monthStr}-01`;
  const endDateStr = `${year}-${monthStr}-31`;

  const records = await prisma.dailyRecord.findMany({
    where: {
      task: { userId },
      date: {
        gte: startDateStr,
        lte: endDateStr,
      },
    },
    include: {
      task: true,
    },
  });

  return records;
}

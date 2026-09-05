import { NextResponse, NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { logDailyRecord, toggleManualCompletion } from '@/lib/services/dailyRecordService';
import { getUserTasksWithMetrics } from '@/lib/services/taskService';
import { getTodayISO } from '@/lib/dateUtils';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { taskId, date, actualValue, completed, manuallyCompleted, note } = body;

    if (!taskId || !date) {
      return NextResponse.json({ error: 'taskId and date are required.' }, { status: 400 });
    }

    const record = await logDailyRecord(user.userId, {
      taskId,
      date,
      actualValue: actualValue !== undefined && actualValue !== null ? Number(actualValue) : undefined,
      completed,
      manuallyCompleted,
      note,
    });

    // Return updated tasks with refreshed streaks & motivation
    const tasks = await getUserTasksWithMetrics(user.userId, date || getTodayISO());

    return NextResponse.json({
      record,
      tasks,
      message: 'Progress recorded successfully!',
    });
  } catch (err: any) {
    console.error('Error logging record:', err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { taskId, date, completed } = body;

    if (!taskId || !date) {
      return NextResponse.json({ error: 'taskId and date are required.' }, { status: 400 });
    }

    const record = await toggleManualCompletion(user.userId, taskId, date, completed);
    const tasks = await getUserTasksWithMetrics(user.userId, date || getTodayISO());

    return NextResponse.json({
      record,
      tasks,
      message: 'Completion status updated!',
    });
  } catch (err: any) {
    console.error('Error toggling completion:', err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

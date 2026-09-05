import { NextResponse, NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { createTask, getUserTasksWithMetrics } from '@/lib/services/taskService';
import { getTodayISO } from '@/lib/dateUtils';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const targetDate = searchParams.get('date') || getTodayISO();

    const tasks = await getUserTasksWithMetrics(user.userId, targetDate);
    return NextResponse.json({ tasks });
  } catch (err: any) {
    console.error('Error fetching tasks:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const task = await createTask(user.userId, body);
    return NextResponse.json({ task, message: 'Task created successfully!' }, { status: 201 });
  } catch (err: any) {
    console.error('Error creating task:', err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

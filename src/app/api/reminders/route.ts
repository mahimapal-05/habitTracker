import { NextResponse, NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getActiveRemindersForToday } from '@/lib/services/reminderService';
import { getTodayISO } from '@/lib/dateUtils';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const today = searchParams.get('date') || getTodayISO();

    const reminders = await getActiveRemindersForToday(user.userId, today);
    return NextResponse.json({ reminders });
  } catch (err: any) {
    console.error('Error fetching reminders:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

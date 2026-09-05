import { NextResponse, NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getUserAnalytics } from '@/lib/services/analyticsService';
import { getTodayISO } from '@/lib/dateUtils';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const today = searchParams.get('date') || getTodayISO();

    const analytics = await getUserAnalytics(user.userId, today);
    return NextResponse.json({ analytics });
  } catch (err: any) {
    console.error('Error fetching analytics:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

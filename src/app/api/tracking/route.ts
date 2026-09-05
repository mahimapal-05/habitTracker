import { NextResponse, NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getDaysInMonthArray, getTodayISO, isDateInRange, isTaskActiveOnDate } from '@/lib/dateUtils';
import { getTaskStreakMetrics } from '@/lib/services/streakService';
import { generateTaskMotivation } from '@/lib/services/motivationEngine';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const now = new Date();
    const year = parseInt(searchParams.get('year') || `${now.getFullYear()}`, 10);
    const month = parseInt(searchParams.get('month') || `${now.getMonth() + 1}`, 10);
    const todayStr = getTodayISO();

    const daysInMonth = getDaysInMonthArray(year, month);
    const startDate = daysInMonth[0];
    const endDate = daysInMonth[daysInMonth.length - 1];

    // Fetch user's tasks
    const tasks = await prisma.task.findMany({
      where: { userId: user.userId },
      include: {
        records: {
          orderBy: { date: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Build the grid payload
    const gridData = tasks.map((task) => {
      const recordMap = new Map(task.records.map((r) => [r.date, r]));
      const metrics = getTaskStreakMetrics(task, task.records, todayStr);

      const days = daysInMonth.map((dateStr) => {
        const isInsideDuration = isDateInRange(dateStr, task.startDate, task.endDate);
        const isActiveDay = isInsideDuration && isTaskActiveOnDate(task, dateStr);
        const record = recordMap.get(dateStr) || null;
        const isCompleted = record?.completed === true;
        const isFuture = dateStr > todayStr;

        let status: 'completed' | 'incomplete' | 'outside' | 'future' | 'inactive_freq';

        if (!isInsideDuration) {
          status = 'outside';
        } else if (!isActiveDay) {
          status = 'inactive_freq';
        } else if (isCompleted) {
          status = 'completed';
        } else if (isFuture) {
          status = 'future';
        } else {
          status = 'incomplete';
        }

        // Generate contextual motivation for this day's cell detail
        const validActuals = task.records
          .map((r) => r.actualValue)
          .filter((v): v is number => v !== null && v !== undefined);
        const personalBestActual = validActuals.length > 0 ? Math.max(...validActuals) : null;

        const cellMotivation = generateTaskMotivation({
          taskName: task.name,
          taskType: task.type,
          target: task.target,
          unit: task.unit,
          todayActual: record?.actualValue,
          todayCompleted: record?.completed,
          todayManuallyCompleted: record?.manuallyCompleted,
          currentStreak: metrics.currentStreak,
          bestStreak: metrics.bestStreak,
          personalBestActual,
        });

        return {
          date: dateStr,
          status,
          isInsideDuration,
          isActiveDay,
          isFuture,
          record,
          motivation: cellMotivation,
        };
      });

      return {
        task: {
          id: task.id,
          name: task.name,
          description: task.description,
          type: task.type,
          target: task.target,
          unit: task.unit,
          startDate: task.startDate,
          endDate: task.endDate,
          frequency: task.frequency,
          startValue: task.startValue,
          direction: task.direction,
        },
        metrics,
        days,
      };
    });

    return NextResponse.json({
      year,
      month,
      daysInMonth,
      today: todayStr,
      grid: gridData,
    });
  } catch (err: any) {
    console.error('Error fetching tracking grid:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

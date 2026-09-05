import { prisma } from './prisma';
import { hashPassword } from './auth';
import { getTodayISO } from './dateUtils';
import { format, subDays, addDays, parseISO } from 'date-fns';

export async function seedDemoAccount(): Promise<string> {
  const demoEmail = 'demo@momentum.app';
  
  // Check if demo user already exists
  let user = await prisma.user.findUnique({
    where: { email: demoEmail },
  });

  const todayStr = getTodayISO();
  const todayDate = parseISO(todayStr);

  if (user) {
    // Return existing demo user id
    return user.id;
  }

  const passwordHash = await hashPassword('momentum123');
  user = await prisma.user.create({
    data: {
      name: 'Alex Rivera',
      email: demoEmail,
      passwordHash,
    },
  });

  const userId = user.id;

  // Task 1: 10K Steps (Numeric)
  const task1Start = format(subDays(todayDate, 10), 'yyyy-MM-dd');
  const task1End = format(addDays(todayDate, 20), 'yyyy-MM-dd');
  const task1 = await prisma.task.create({
    data: {
      userId,
      name: '10K Steps Daily',
      description: 'Daily walking goal for cardiovascular health and active recovery.',
      type: 'NUMERIC',
      target: 10000,
      unit: 'steps',
      startDate: task1Start,
      endDate: task1End,
      frequency: 'DAILY',
      reminderEnabled: true,
      reminderTimes: JSON.stringify(['09:00', '18:00', '20:30']),
      reminderMessage: "Keep moving! Hit that 10,000 steps mark today.",
    },
  });

  // Populate records for Task 1:
  // Days 10 to 1 ago:
  // -10: 10,400 (completed, auto)
  // -9: 11,200 (completed, auto)
  // -8: 9,800 (completed, manual override)
  // -7: 8,500 (missed/incomplete) -> broke streak
  // -6: 10,150 (completed, auto) -> new streak starts here (6-day streak!)
  // -5: 10,800 (completed, auto)
  // -4: 12,400 (completed, auto, PB!)
  // -3: 10,500 (completed, auto)
  // -2: 11,000 (completed, auto)
  // -1 (yesterday): 10,650 (completed, auto)
  // 0 (today): 8,432 (in progress)
  const task1Records = [
    { daysAgo: 10, val: 10400, comp: true, manual: false, auto: true, note: 'Morning walk in the park' },
    { daysAgo: 9, val: 11200, comp: true, manual: false, auto: true, note: 'Walked to grocery store' },
    { daysAgo: 8, val: 9800, comp: true, manual: true, auto: false, note: 'Intense strength workout counted' },
    { daysAgo: 7, val: 8500, comp: false, manual: false, auto: false, note: 'Raining all day' },
    { daysAgo: 6, val: 10150, comp: true, manual: false, auto: true, note: 'Back on track' },
    { daysAgo: 5, val: 10800, comp: true, manual: false, auto: true, note: 'Evening walk with podcast' },
    { daysAgo: 4, val: 12400, comp: true, manual: false, auto: true, note: 'Weekend hike - Personal best!' },
    { daysAgo: 3, val: 10500, comp: true, manual: false, auto: true, note: 'Hit the goal at work' },
    { daysAgo: 2, val: 11000, comp: true, manual: false, auto: true, note: 'Great pace' },
    { daysAgo: 1, val: 10650, comp: true, manual: false, auto: true, note: 'Evening stroll' },
    { daysAgo: 0, val: 8432, comp: false, manual: false, auto: false, note: 'Need 1,568 more steps tonight' },
  ];

  for (const r of task1Records) {
    const dStr = format(subDays(todayDate, r.daysAgo), 'yyyy-MM-dd');
    await prisma.dailyRecord.create({
      data: {
        taskId: task1.id,
        date: dStr,
        actualValue: r.val,
        completed: r.comp,
        manuallyCompleted: r.manual,
        isAutoCompleted: r.auto,
        note: r.note,
      },
    });
  }

  // Task 2: No Junk Food (Checkbox)
  const task2Start = format(subDays(todayDate, 7), 'yyyy-MM-dd');
  const task2End = format(addDays(todayDate, 7), 'yyyy-MM-dd');
  const task2 = await prisma.task.create({
    data: {
      userId,
      name: 'No Junk Food Challenge',
      description: 'Zero processed sugar, chips, or fast food for 2 weeks.',
      type: 'CHECKBOX',
      startDate: task2Start,
      endDate: task2End,
      frequency: 'DAILY',
      reminderEnabled: true,
      reminderTimes: JSON.stringify(['12:30', '19:00']),
      reminderMessage: 'Remember your clean eating goals during lunch and dinner!',
    },
  });

  for (let i = 7; i >= 0; i--) {
    const dStr = format(subDays(todayDate, i), 'yyyy-MM-dd');
    const isCompleted = i !== 4; // Missed 4 days ago
    await prisma.dailyRecord.create({
      data: {
        taskId: task2.id,
        date: dStr,
        actualValue: null,
        completed: isCompleted,
        manuallyCompleted: isCompleted,
        isAutoCompleted: false,
        note: isCompleted ? 'Healthy home-cooked meals' : 'Had a slice of birthday cake at the office',
      },
    });
  }

  // Task 3: Deep Study (Time)
  const task3Start = format(subDays(todayDate, 14), 'yyyy-MM-dd');
  const task3End = format(addDays(todayDate, 16), 'yyyy-MM-dd');
  const task3 = await prisma.task.create({
    data: {
      userId,
      name: 'Deep Study & Coding',
      description: 'Dedicated focus session without distractions.',
      type: 'TIME',
      target: 2.0,
      unit: 'hours',
      startDate: task3Start,
      endDate: task3End,
      frequency: 'DAILY',
      reminderEnabled: true,
      reminderTimes: JSON.stringify(['14:00', '20:00']),
      reminderMessage: 'Time for your 2-hour deep study block!',
    },
  });

  for (let i = 14; i >= 0; i--) {
    const dStr = format(subDays(todayDate, i), 'yyyy-MM-dd');
    // Generate varying hours: 2.5, 2.0, 1.5, 3.0, etc.
    let hours = i % 3 === 0 ? 2.5 : i % 3 === 1 ? 2.0 : 1.5;
    if (i === 0) hours = 2.5; // Completed today!
    const isAuto = hours >= 2.0;
    const isManual = hours < 2.0 && i !== 5; // Manually completed on some days
    const isCompleted = isAuto || isManual;

    await prisma.dailyRecord.create({
      data: {
        taskId: task3.id,
        date: dStr,
        actualValue: hours,
        completed: isCompleted,
        manuallyCompleted: isManual,
        isAutoCompleted: isAuto,
        note: `Focused on Next.js and algorithms (${hours} hrs)`,
      },
    });
  }

  // Task 4: Morning Hydration (Numeric)
  const task4Start = format(subDays(todayDate, 5), 'yyyy-MM-dd');
  const task4End = format(addDays(todayDate, 25), 'yyyy-MM-dd');
  const task4 = await prisma.task.create({
    data: {
      userId,
      name: 'Daily Water Intake',
      description: 'Drink at least 8 glasses of water every day.',
      type: 'NUMERIC',
      target: 8,
      unit: 'glasses',
      startDate: task4Start,
      endDate: task4End,
      frequency: 'DAILY',
      reminderEnabled: true,
      reminderTimes: JSON.stringify(['10:00', '15:00', '19:00']),
      reminderMessage: 'Stay hydrated! Have a fresh glass of water.',
    },
  });

  for (let i = 5; i >= 0; i--) {
    const dStr = format(subDays(todayDate, i), 'yyyy-MM-dd');
    const glasses = i === 0 ? 8 : 8 + (i % 2);
    await prisma.dailyRecord.create({
      data: {
        taskId: task4.id,
        date: dStr,
        actualValue: glasses,
        completed: true,
        manuallyCompleted: false,
        isAutoCompleted: true,
        note: `${glasses} glasses recorded`,
      },
    });
  }

  return userId;
}

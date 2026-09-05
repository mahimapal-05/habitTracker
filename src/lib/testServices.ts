import {
  calculateCurrentStreak,
  calculateBestStreak,
  calculateCompletionRate,
} from './services/streakService';
import { generateTaskMotivation } from './services/motivationEngine';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`FAIL: ${message}`);
  }
  console.log(`✓ PASS: ${message}`);
}

async function runTests() {
  console.log('--- RUNNING DOMAIN LOGIC UNIT TESTS ---');

  // Test 1: Task starting Sep 1, ending Sep 30, Daily
  const taskA = { startDate: '2026-09-01', endDate: '2026-09-30', frequency: 'DAILY' };

  // 1.1 All days completed up to Sep 5 (today = Sep 5)
  const records1 = [
    { date: '2026-09-01', completed: true },
    { date: '2026-09-02', completed: true },
    { date: '2026-09-03', completed: true },
    { date: '2026-09-04', completed: true },
    { date: '2026-09-05', completed: true },
  ];
  assert(
    calculateCurrentStreak(taskA, records1, '2026-09-05') === 5,
    'Current streak should be 5 when 1-5 completed'
  );
  assert(
    calculateBestStreak(taskA, records1, '2026-09-05') === 5,
    'Best streak should be 5'
  );
  const rate1 = calculateCompletionRate(taskA, records1, '2026-09-05');
  assert(rate1.completionRate === 100, 'Completion rate should be 100%');

  // 1.2 Sep 4 missed, Sep 5 completed
  const records2 = [
    { date: '2026-09-01', completed: true },
    { date: '2026-09-02', completed: true },
    { date: '2026-09-03', completed: true },
    { date: '2026-09-04', completed: false }, // missed day breaks streak!
    { date: '2026-09-05', completed: true },
  ];
  assert(
    calculateCurrentStreak(taskA, records2, '2026-09-05') === 1,
    'Current streak should reset to 1 after missed day'
  );
  assert(
    calculateBestStreak(taskA, records2, '2026-09-05') === 3,
    'Best streak should remain 3 historically'
  );

  // 1.3 Today (Sep 5) is NOT completed yet, but Sep 1-4 are completed
  const records3 = [
    { date: '2026-09-01', completed: true },
    { date: '2026-09-02', completed: true },
    { date: '2026-09-03', completed: true },
    { date: '2026-09-04', completed: true },
  ];
  assert(
    calculateCurrentStreak(taskA, records3, '2026-09-05') === 4,
    'Current streak should be 4 (yesterdays active streak) when today is pending'
  );

  // 1.4 Today is pending, but yesterday was missed
  const records4 = [
    { date: '2026-09-01', completed: true },
    { date: '2026-09-02', completed: true },
    { date: '2026-09-03', completed: true },
    { date: '2026-09-04', completed: false },
  ];
  assert(
    calculateCurrentStreak(taskA, records4, '2026-09-05') === 0,
    'Current streak should be 0 if yesterday was missed and today is pending'
  );

  // Test 2: Motivation Engine Performance Feedback
  // 2.1 Target Exceeded
  const mot1 = generateTaskMotivation({
    taskName: '10K Steps',
    taskType: 'NUMERIC',
    target: 10000,
    unit: 'steps',
    todayActual: 10500,
    todayCompleted: true,
    currentStreak: 4,
    bestStreak: 7,
    personalBestActual: 10500,
  });
  assert(mot1.type === 'target_exceeded' || mot1.type === 'personal_best', 'Motivation identifies exceeded target');
  assert(mot1.message.includes('beat your target') || mot1.message.includes('Personal Record'), 'Message is congratulatory and precise');

  // 2.2 Historical Anchor (performed below target today, but had reached higher before)
  const mot2 = generateTaskMotivation({
    taskName: '10K Steps',
    taskType: 'NUMERIC',
    target: 10000,
    unit: 'steps',
    todayActual: 8500,
    todayCompleted: false,
    currentStreak: 0,
    bestStreak: 10,
    personalBestActual: 10500,
  });
  assert(mot2.type === 'anchor', 'Motivation recognizes historical anchor');
  assert(mot2.message.includes('10,500'), 'Mentions previous personal best');

  // 2.3 Recovery after missed day
  const mot3 = generateTaskMotivation({
    taskName: 'Deep Work',
    taskType: 'TIME',
    target: 2,
    unit: 'hours',
    todayActual: null,
    todayCompleted: false,
    yesterdayCompleted: false,
    currentStreak: 0,
    bestStreak: 5,
  });
  assert(mot3.type === 'recovery', 'Recognizes recovery after missed day');
  assert(mot3.message.includes('Yesterday didn\'t go as planned'), 'Encouraging fresh start tone');

  console.log('\n--- ALL DOMAIN LOGIC UNIT TESTS PASSED SUCCESSFULLY! ---');
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});

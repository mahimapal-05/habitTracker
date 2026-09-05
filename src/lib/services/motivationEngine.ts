export interface MotivationResult {
  title: string;
  message: string;
  type:
    | 'target_exceeded'
    | 'personal_best'
    | 'target_hit'
    | 'encouragement'
    | 'anchor'
    | 'recovery'
    | 'streak_milestone'
    | 'manual_completed'
    | 'welcome'
    | 'ready';
  tag: string;
  accent: 'emerald' | 'amber' | 'blue' | 'purple' | 'rose' | 'indigo';
}

export interface MotivationContext {
  taskName: string;
  taskType: string; // "CHECKBOX" | "NUMERIC" | "TIME"
  target?: number | null;
  unit?: string | null;
  todayActual?: number | null;
  todayCompleted?: boolean;
  todayManuallyCompleted?: boolean;
  yesterdayCompleted?: boolean;
  yesterdayActual?: number | null;
  currentStreak: number;
  bestStreak: number;
  personalBestActual?: number | null;
  averageActual?: number | null;
}

/**
 * Formats a numeric value nicely (e.g. 10000 -> 10,000, 2.5 -> 2.5)
 */
function formatNum(val: number): string {
  if (Number.isInteger(val)) {
    return val.toLocaleString();
  }
  return Number(val.toFixed(2)).toString();
}

/**
 * Analyzes real performance data and generates personalized, non-generic motivation
 */
export function generateTaskMotivation(ctx: MotivationContext): MotivationResult {
  const {
    taskName,
    taskType,
    target,
    unit = '',
    todayActual,
    todayCompleted,
    todayManuallyCompleted,
    yesterdayCompleted,
    currentStreak,
    personalBestActual,
  } = ctx;

  const unitStr = unit ? ` ${unit}` : '';

  // 1. Streak Milestones (7, 14, 21, 30, 50, 100 days)
  const milestoneDays = [3, 7, 10, 14, 21, 30, 50, 60, 90, 100, 365];
  if (todayCompleted && milestoneDays.includes(currentStreak)) {
    return {
      title: `${currentStreak}-Day Streak!`,
      message: `🔥 Phenomenal consistency on "${taskName}"! You've maintained this habit for ${currentStreak} consecutive days. Momentum is on your side.`,
      type: 'streak_milestone',
      tag: 'Milestone',
      accent: 'amber',
    };
  }

  // 2. Numeric / Time Goals Performance Evaluation
  if ((taskType === 'NUMERIC' || taskType === 'TIME') && target != null) {
    if (todayActual != null) {
      // Check for New Personal Best
      if (
        personalBestActual != null &&
        todayActual > personalBestActual &&
        todayActual > target
      ) {
        const diff = todayActual - personalBestActual;
        return {
          title: 'New Personal Best!',
          message: `🏆 Incredible! You hit ${formatNum(todayActual)}${unitStr}, beating your previous record of ${formatNum(personalBestActual)}${unitStr} by ${formatNum(diff)}${unitStr}!`,
          type: 'personal_best',
          tag: 'Personal Record',
          accent: 'purple',
        };
      }

      // Target Exceeded
      if (todayActual > target) {
        const excess = todayActual - target;
        return {
          title: 'Target Exceeded!',
          message: `🔥 Amazing! You beat your target by ${formatNum(excess)}${unitStr} (total: ${formatNum(todayActual)}${unitStr})!`,
          type: 'target_exceeded',
          tag: 'Overachieved',
          accent: 'emerald',
        };
      }

      // Target Hit Exactly
      if (todayActual === target || (todayCompleted && !todayManuallyCompleted)) {
        return {
          title: 'Target Hit!',
          message: `🎯 Spot on! You reached your goal of ${formatNum(target)}${unitStr} today. Keep this rhythm going!`,
          type: 'target_hit',
          tag: 'Completed',
          accent: 'emerald',
        };
      }

      // Manual Override when actual < target
      if (todayCompleted && todayManuallyCompleted) {
        return {
          title: 'Manually Completed',
          message: `✓ Logged ${formatNum(todayActual)}${unitStr} and marked complete. Flexibility and commitment create long-term habits.`,
          type: 'manual_completed',
          tag: 'Completed',
          accent: 'blue',
        };
      }

      // Below Target: Check if user has historically reached higher
      if (todayActual < target) {
        if (personalBestActual != null && personalBestActual >= target) {
          return {
            title: 'You Can Reach It',
            message: `You've reached ${formatNum(personalBestActual)}${unitStr} before. You know you can do it — let's get back above ${formatNum(target)}${unitStr}!`,
            type: 'anchor',
            tag: 'Historical Anchor',
            accent: 'indigo',
          };
        }

        // Close to target (e.g. >= 70%)
        if (todayActual >= target * 0.7) {
          const remaining = target - todayActual;
          return {
            title: 'Almost There!',
            message: `You're at ${formatNum(todayActual)}${unitStr}, only ${formatNum(remaining)}${unitStr} away from your target. You've got this!`,
            type: 'encouragement',
            tag: 'In Progress',
            accent: 'blue',
          };
        }

        // Just started logging today
        if (todayActual > 0) {
          return {
            title: 'Progress Started',
            message: `You've logged ${formatNum(todayActual)} / ${formatNum(target)}${unitStr}. Every effort moves you closer to the finish line.`,
            type: 'encouragement',
            tag: 'In Progress',
            accent: 'blue',
          };
        }
      }
    }
  }

  // 3. Checkbox Goal Completed
  if (todayCompleted) {
    if (currentStreak > 1) {
      return {
        title: 'Habit Locked In',
        message: `✓ Completed for today! That's ${currentStreak} days strong on "${taskName}".`,
        type: 'target_hit',
        tag: 'Completed',
        accent: 'emerald',
      };
    }
    return {
      title: 'Done for Today',
      message: `✓ Great job checking off "${taskName}" today! Tomorrow builds on today's win.`,
      type: 'target_hit',
      tag: 'Completed',
      accent: 'emerald',
    };
  }

  // 4. Recovery after missed day
  if (yesterdayCompleted === false && !todayCompleted) {
    return {
      title: 'Fresh Start Today',
      message: `Yesterday didn't go as planned. That's okay — no guilt. Today is a brand new opportunity to build momentum!`,
      type: 'recovery',
      tag: 'Fresh Start',
      accent: 'indigo',
    };
  }

  // 5. Default ready state
  return {
    title: 'Ready for Action',
    message: `Stay focused on "${taskName}" today. Small, consistent daily actions compound into extraordinary results.`,
    type: 'ready',
    tag: 'Ready',
    accent: 'blue',
  };
}

/**
 * Generates an overarching dashboard motivational banner based on daily aggregate progress
 */
export function generateDashboardMotivation(data: {
  completedCount: number;
  totalActiveCount: number;
  activeStreaksCount: number;
  highestStreak: number;
  userName?: string;
}): MotivationResult {
  const { completedCount, totalActiveCount, activeStreaksCount, highestStreak } = data;

  if (totalActiveCount === 0) {
    return {
      title: 'Welcome to Momentum',
      message: 'Create your first goal or habit to kickstart your personal journey with smart tracking and streak analytics.',
      type: 'welcome',
      tag: 'Get Started',
      accent: 'indigo',
    };
  }

  const completionPct = Math.round((completedCount / totalActiveCount) * 100);

  if (completionPct === 100) {
    return {
      title: '🌟 Perfect Day! 100% Completed',
      message: `Outstanding execution! You've checked off all ${totalActiveCount} tasks today. Bask in the accomplishment.`,
      type: 'target_hit',
      tag: 'Flawless',
      accent: 'emerald',
    };
  }

  if (completionPct >= 75) {
    return {
      title: '⚡ Crushing It Today',
      message: `You are at ${completionPct}% completion (${completedCount}/${totalActiveCount} tasks). Just a tiny push to wrap up a clean sweep!`,
      type: 'encouragement',
      tag: 'High Momentum',
      accent: 'amber',
    };
  }

  if (completionPct > 0) {
    return {
      title: '🚀 Building Daily Momentum',
      message: `You've completed ${completedCount} of ${totalActiveCount} tasks today. Keep the focus sharp — one habit at a time!`,
      type: 'encouragement',
      tag: 'In Progress',
      accent: 'blue',
    };
  }

  if (highestStreak >= 5) {
    return {
      title: `🔥 Defend Your ${highestStreak}-Day Streak`,
      message: `You have an active streak of ${highestStreak} days on your habits. Step up today to keep that flame burning!`,
      type: 'streak_milestone',
      tag: 'Streak at Stake',
      accent: 'amber',
    };
  }

  return {
    title: '☀️ Make Today Count',
    message: `You have ${totalActiveCount} active tasks lined up for today. Let's start with the first one and build your daily momentum.`,
    type: 'ready',
    tag: 'Daily Focus',
    accent: 'indigo',
  };
}

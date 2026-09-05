'use client';

import React from 'react';
import { Sparkles, Calendar, Zap, Sun, Moon, Sunrise, Trophy } from 'lucide-react';
import { getTodayISO, formatDisplayDate } from '@/lib/dateUtils';
import { generateDashboardMotivation } from '@/lib/services/motivationEngine';

interface GreetingBannerProps {
  userName?: string;
  completedCount: number;
  totalActiveCount: number;
  highestStreak: number;
}

export function GreetingBanner({
  userName,
  completedCount,
  totalActiveCount,
  highestStreak,
}: GreetingBannerProps) {
  const todayStr = getTodayISO();
  const currentHour = new Date().getHours();

  let timeGreeting = 'Good day';
  let TimeIcon = Sun;
  if (currentHour < 12) {
    timeGreeting = 'Good morning';
    TimeIcon = Sunrise;
  } else if (currentHour < 17) {
    timeGreeting = 'Good afternoon';
    TimeIcon = Sun;
  } else {
    timeGreeting = 'Good evening';
    TimeIcon = Moon;
  }

  const greeting = userName ? `${timeGreeting}, ${userName}` : timeGreeting;

  const motivation = generateDashboardMotivation({
    completedCount,
    totalActiveCount,
    activeStreaksCount: completedCount,
    highestStreak,
    userName,
  });

  const completionPct =
    totalActiveCount > 0 ? Math.round((completedCount / totalActiveCount) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Top Greeting & Date */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <TimeIcon className="w-5 h-5 text-amber-400" />
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {greeting}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-mocha-300 flex items-center gap-1.5 font-medium">
            <Calendar className="w-3.5 h-3.5 text-caramel-400" />
            <span>{formatDisplayDate(todayStr)}</span>
            <span className="text-mocha-500">•</span>
            <span className="text-caramel-300 font-semibold">
              {totalActiveCount} active habits scheduled today
            </span>
          </p>
        </div>

        {highestStreak > 0 && (
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-bold shadow-sm">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Top Streak: {highestStreak} Days</span>
          </div>
        )}
      </div>

      {/* Motivational Performance Banner */}
      <div
        className={`p-5 rounded-2xl glass-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border transition-all duration-300 relative overflow-hidden ${
          motivation.accent === 'emerald'
            ? 'border-emerald-500/30 bg-emerald-950/25 text-emerald-300 glow-emerald'
            : motivation.accent === 'amber'
            ? 'border-amber-500/30 bg-amber-950/25 text-amber-300 glow-amber'
            : motivation.accent === 'purple'
            ? 'border-caramel-600/30 bg-espresso-900/30 text-caramel-200'
            : 'border-caramel-500/30 bg-mocha-950/40 text-caramel-300 glow-primary'
        }`}
      >
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-64 h-32 bg-caramel-500/10 blur-3xl pointer-events-none rounded-full" />

        <div className="flex items-start gap-4 z-10">
          <div
            className={`p-3 rounded-2xl shrink-0 mt-0.5 md:mt-0 shadow-lg ${
              motivation.accent === 'emerald'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : motivation.accent === 'amber'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-caramel-500/20 text-caramel-300 border border-caramel-500/30'
            }`}
          >
            <Sparkles className="w-5 h-5 animate-soft-pulse" />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-white tracking-tight">
                {motivation.title}
              </span>
              <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-mocha-200 border border-white/10">
                {motivation.tag}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-mocha-200 leading-relaxed max-w-3xl">
              {motivation.message}
            </p>
          </div>
        </div>

        {/* Today's Quick Progress Meter */}
        <div className="w-full md:w-auto flex md:flex-col items-center md:items-end justify-between gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-white/10 z-10">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-mocha-200">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Today's Completion</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-24 h-2 bg-black/40 rounded-full overflow-hidden border border-white/10">
              <div
                className="h-full rounded-full gradient-primary transition-all duration-500"
                style={{ width: `${completionPct}%` }}
              />
            </div>
            <span className="text-xs font-black text-white font-mono">{completionPct}%</span>
          </div>
        </div>
      </div>

    </div>
  );
}

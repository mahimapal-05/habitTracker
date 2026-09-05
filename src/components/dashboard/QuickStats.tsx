'use client';

import React from 'react';
import { CheckCircle2, CircleDashed, Flame, Target, TrendingUp, Sparkles } from 'lucide-react';

interface QuickStatsProps {
  completedCount: number;
  totalActiveCount: number;
  totalStreaksCount: number;
  longestStreak: number;
}

export function QuickStats({
  completedCount,
  totalActiveCount,
  totalStreaksCount,
  longestStreak,
}: QuickStatsProps) {
  const completionPercentage =
    totalActiveCount > 0 ? Math.round((completedCount / totalActiveCount) * 100) : 0;
  const incompleteCount = Math.max(0, totalActiveCount - completedCount);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Today's Overall Completion % */}
      <div className="glass-card-interactive p-4 sm:p-5 rounded-2xl flex flex-col justify-between border-l-4 border-l-caramel-500 relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-mocha-400 uppercase tracking-wider">
            Daily Progress
          </span>
          <div className="p-2 rounded-xl bg-caramel-500/15 text-caramel-300 group-hover:scale-110 transition-transform">
            <Target className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 space-y-2">
          <div className="flex items-baseline justify-between">
            <p className="text-2xl sm:text-3xl font-black text-white">{completionPercentage}%</p>
            <span className="text-[11px] font-semibold text-caramel-300">
              {completedCount}/{totalActiveCount} done
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full gradient-primary transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Completed Tasks */}
      <div className="glass-card-interactive p-4 sm:p-5 rounded-2xl flex flex-col justify-between border-l-4 border-l-emerald-500 relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-mocha-400 uppercase tracking-wider">
            Completed
          </span>
          <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 group-hover:scale-110 transition-transform">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 space-y-1">
          <p className="text-2xl sm:text-3xl font-black text-emerald-400">{completedCount}</p>
          <p className="text-[11px] text-mocha-300 font-medium">
            habits achieved today
          </p>
        </div>
      </div>

      {/* Incomplete Tasks */}
      <div className="glass-card-interactive p-4 sm:p-5 rounded-2xl flex flex-col justify-between border-l-4 border-l-rose-500 relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-mocha-400 uppercase tracking-wider">
            Pending
          </span>
          <div className="p-2 rounded-xl bg-rose-500/15 text-rose-400 group-hover:scale-110 transition-transform">
            <CircleDashed className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 space-y-1">
          <p className="text-2xl sm:text-3xl font-black text-rose-400">{incompleteCount}</p>
          <p className="text-[11px] text-mocha-300 font-medium">
            {incompleteCount === 0 ? '🎉 All tasks finished!' : 'remaining for today'}
          </p>
        </div>
      </div>

      {/* Top Active Streak */}
      <div className="glass-card-interactive p-4 sm:p-5 rounded-2xl flex flex-col justify-between border-l-4 border-l-amber-500 relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-mocha-400 uppercase tracking-wider">
            Top Streak
          </span>
          <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 group-hover:scale-110 transition-transform">
            <Flame className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 space-y-1">
          <p className="text-2xl sm:text-3xl font-black text-amber-400">
            {longestStreak}{' '}
            <span className="text-sm font-bold text-mocha-300">days</span>
          </p>
          <p className="text-[11px] text-mocha-300 font-medium">
            unbroken consistency record
          </p>
        </div>
      </div>
    </div>

  );
}

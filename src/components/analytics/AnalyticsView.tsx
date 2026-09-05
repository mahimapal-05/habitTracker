'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Flame,
  Trophy,
  CheckCircle2,
  TrendingUp,
  Target,
  Calendar,
  Sparkles,
  Award,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';

export function AnalyticsView() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/analytics');
      if (res.ok) {
        const json = await res.json();
        setData(json.analytics);
        if (json.analytics?.tasks?.length > 0 && !selectedTaskId) {
          setSelectedTaskId(json.analytics.tasks[0].taskId);
        }
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="glass-card p-16 text-center text-slate-400 text-sm space-y-3">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p>Computing analytics and trend charts...</p>
      </div>
    );
  }

  if (!data || data.tasks.length === 0) {
    return (
      <div className="glass-card p-14 text-center text-slate-400 space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
          <Sparkles className="w-6 h-6" />
        </div>
        <p className="text-base font-bold text-white">No habit data available</p>
        <p className="text-xs max-w-sm mx-auto">
          Start logging your goals to unlock deep performance analytics, trend graphs, and streak records.
        </p>
      </div>
    );
  }

  const selectedTask =
    data.tasks.find((t: any) => t.taskId === selectedTaskId) || data.tasks[0];

  return (
    <div className="space-y-8 pb-12">
      {/* Overall Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card-interactive p-5 rounded-2xl space-y-2 border-l-4 border-l-indigo-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Today's Rate
            </span>
            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white">{data.todayCompletionRate}%</p>
          <p className="text-[11px] text-slate-400">
            {data.todayCompletedCount} of {data.totalActiveTasksToday} tasks finished today
          </p>
        </div>

        <div className="glass-card-interactive p-5 rounded-2xl space-y-2 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Overall Success
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white">{data.overallHistoricalRate}%</p>
          <p className="text-[11px] text-slate-400">Historical consistency across all elapsed days</p>
        </div>

        <div className="glass-card-interactive p-5 rounded-2xl space-y-2 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Top Active Streak
            </span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-400">
            {data.longestCurrentStreak?.streak ?? 0}{' '}
            <span className="text-sm font-bold text-slate-400">days</span>
          </p>
          <p className="text-[11px] text-slate-400 truncate">
            {data.longestCurrentStreak?.taskName || 'Keep consistent'}
          </p>
        </div>

        <div className="glass-card-interactive p-5 rounded-2xl space-y-2 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              All-Time Best
            </span>
            <Trophy className="w-4 h-4 text-yellow-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white">
            {data.longestBestStreak?.streak ?? 0}{' '}
            <span className="text-sm font-bold text-slate-400">days</span>
          </p>
          <p className="text-[11px] text-slate-400 truncate">
            {data.longestBestStreak?.taskName || 'Personal record'}
          </p>
        </div>
      </div>

      {/* Task Performance Deep Dive Section */}
      <div className="glass-card p-6 rounded-2xl space-y-6 border border-white/10">
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-white/10 pb-4">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              <span>Goal Performance Trends</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Select a habit to inspect historical performance curves and target reference lines.
            </p>
          </div>

          {/* Task Select Dropdown */}
          <select
            value={selectedTaskId || ''}
            onChange={(e) => setSelectedTaskId(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold focus:outline-none focus:border-indigo-500 transition"
          >
            {data.tasks.map((t: any) => (
              <option key={t.taskId} value={t.taskId} className="bg-slate-900 text-white">
                {t.taskName} ({t.type})
              </option>
            ))}
          </select>
        </div>

        {selectedTask && (
          <div className="space-y-6">
            {/* Task KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 text-center">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Current Streak</p>
                <p className="text-lg font-black text-amber-400 flex items-center justify-center gap-1 mt-0.5">
                  <Flame className="w-4 h-4" />
                  <span>{selectedTask.currentStreak}d</span>
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 text-center">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Best Streak</p>
                <p className="text-lg font-black text-yellow-400 flex items-center justify-center gap-1 mt-0.5">
                  <Trophy className="w-4 h-4" />
                  <span>{selectedTask.bestStreak}d</span>
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 text-center">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Success Rate</p>
                <p className="text-lg font-black text-emerald-400 mt-0.5">
                  {selectedTask.completionRate}%
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 text-center">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Days Completed</p>
                <p className="text-lg font-black text-white mt-0.5">
                  {selectedTask.totalCompletedDays} / {selectedTask.totalActiveDaysElapsed}
                </p>
              </div>

              {selectedTask.type !== 'CHECKBOX' ? (
                <>
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 text-center">
                    <p className="text-[11px] font-bold text-slate-400 uppercase">Average Actual</p>
                    <p className="text-lg font-black text-indigo-400 mt-0.5">
                      {selectedTask.averageActual !== null
                        ? selectedTask.averageActual.toLocaleString()
                        : '—'}{' '}
                      <span className="text-[10px] text-slate-400">{selectedTask.unit || ''}</span>
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 text-center">
                    <p className="text-[11px] font-bold text-slate-400 uppercase">Personal Best</p>
                    <p className="text-lg font-black text-purple-400 mt-0.5">
                      {selectedTask.personalBestActual !== null
                        ? selectedTask.personalBestActual.toLocaleString()
                        : '—'}{' '}
                      <span className="text-[10px] text-slate-400">{selectedTask.unit || ''}</span>
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 text-center">
                    <p className="text-[11px] font-bold text-slate-400 uppercase">Goal Duration</p>
                    <p className="text-xs font-bold text-white mt-1">
                      {selectedTask.startDate} → {selectedTask.endDate}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 text-center">
                    <p className="text-[11px] font-bold text-slate-400 uppercase">Goal Type</p>
                    <p className="text-xs font-bold text-indigo-300 mt-1">
                      Manual Checklist
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Interactive Trend Chart for Numeric & Time Goals */}
            {selectedTask.type !== 'CHECKBOX' && selectedTask.chartData?.length > 0 ? (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 font-semibold text-indigo-300">
                      <span className="w-3 h-3 rounded-full bg-indigo-500 shadow-sm" />
                      <span>Actual Performance</span>
                    </span>
                    <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
                      <span className="w-3 h-0.5 bg-emerald-400 border-dashed" />
                      <span>Target ({selectedTask.target} {selectedTask.unit || ''})</span>
                    </span>
                  </div>
                </div>

                <div className="h-72 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={selectedTask.chartData}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.45} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis
                        dataKey="displayDate"
                        stroke="#64748b"
                        fontSize={11}
                        tickLine={false}
                      />
                      <YAxis
                        stroke="#64748b"
                        fontSize={11}
                        tickLine={false}
                        domain={[0, 'auto']}
                      />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const d = payload[0].payload;
                            return (
                              <div className="glass-panel p-3.5 rounded-xl border border-white/20 bg-slate-950/95 text-xs shadow-2xl space-y-1.5 backdrop-blur-xl">
                                <p className="font-black text-white">{label}</p>
                                <p className="text-indigo-300">
                                  Actual:{' '}
                                  <span className="font-bold font-mono">
                                    {d.actual !== null ? d.actual.toLocaleString() : 'Not logged'}{' '}
                                    {selectedTask.unit || ''}
                                  </span>
                                </p>
                                <p className="text-emerald-300">
                                  Target:{' '}
                                  <span className="font-bold font-mono">
                                    {d.target?.toLocaleString()} {selectedTask.unit || ''}
                                  </span>
                                </p>
                                <p className="text-slate-400">
                                  Status:{' '}
                                  <span
                                    className={
                                      d.completed ? 'text-emerald-400 font-bold' : 'text-slate-400'
                                    }
                                  >
                                    {d.completed ? '✓ Met Target' : 'Incomplete'}
                                  </span>
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      {selectedTask.target && (
                        <ReferenceLine
                          y={selectedTask.target}
                          stroke="#10b981"
                          strokeDasharray="4 4"
                          strokeWidth={2}
                          label={{
                            value: `Target: ${selectedTask.target}`,
                            fill: '#10b981',
                            fontSize: 11,
                            position: 'top',
                          }}
                        />
                      )}
                      <Area
                        type="monotone"
                        dataKey="actual"
                        stroke="#6366f1"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#actualGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-white/5 border border-white/5 text-center text-xs text-slate-400 space-y-2">
                <Target className="w-8 h-8 mx-auto text-indigo-400" />
                <p className="font-bold text-white">Checkbox Habit Tracking</p>
                <p className="max-w-md mx-auto">
                  Checkbox habits track discrete daily completion. Switch to a Numeric or Time goal in the dropdown to view value curve trend graphs.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Habit Consistency Leaderboard */}
      <div className="glass-card p-6 rounded-2xl space-y-4 border border-white/10">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-black text-white">Habit Consistency Leaderboard</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-bold text-[11px]">
                <th className="p-3">Rank & Habit</th>
                <th className="p-3">Type</th>
                <th className="p-3 text-center">Current Streak</th>
                <th className="p-3 text-center">Best Streak</th>
                <th className="p-3 text-center">Success Rate</th>
                <th className="p-3 text-right">Completed Days</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[...data.tasks]
                .sort((a, b) => b.completionRate - a.completionRate)
                .map((task: any, idx: number) => (
                  <tr key={task.taskId} className="hover:bg-white/[0.02] transition">
                    <td className="p-3 font-bold text-white flex items-center gap-2.5">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs ${
                          idx === 0
                            ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                            : idx === 1
                            ? 'bg-slate-300/20 text-slate-200 border border-slate-300/40'
                            : idx === 2
                            ? 'bg-amber-600/20 text-amber-300 border border-amber-600/40'
                            : 'bg-white/5 text-slate-500'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span>{task.taskName}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-white/5 text-slate-300">
                        {task.type}
                      </span>
                    </td>
                    <td className="p-3 text-center font-bold text-amber-400">
                      {task.currentStreak}d
                    </td>
                    <td className="p-3 text-center font-semibold text-yellow-400">
                      {task.bestStreak}d
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`font-black font-mono px-2 py-0.5 rounded-md ${
                          task.completionRate >= 80
                            ? 'text-emerald-400 bg-emerald-500/15'
                            : 'text-slate-300 bg-white/5'
                        }`}
                      >
                        {task.completionRate}%
                      </span>
                    </td>
                    <td className="p-3 text-right text-slate-300 font-mono">
                      {task.totalCompletedDays} / {task.totalActiveDaysElapsed}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

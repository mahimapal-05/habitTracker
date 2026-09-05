'use client';

import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Check,
  X,
  Minus,
  Flame,
  Sparkles,
  TrendingUp,
  Award,
} from 'lucide-react';
import { CellModal } from './CellModal';
import { getTodayISO, formatDisplayDate } from '@/lib/dateUtils';

export function TrackingGrid() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [gridData, setGridData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCell, setSelectedCell] = useState<any | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const fetchGrid = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/tracking?year=${year}&month=${month}`);
      if (res.ok) {
        const data = await res.json();
        setGridData(data);
      }
    } catch (err) {
      console.error('Failed to load tracking grid:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrid();
  }, [year, month]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 2, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month, 1));
  };

  const handleTodayMonth = () => {
    setCurrentDate(new Date());
  };

  const handleSaveRecord = async (
    taskId: string,
    date: string,
    actualValue?: number | null,
    completed?: boolean,
    note?: string
  ) => {
    await fetch('/api/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, date, actualValue, completed, note }),
    });
    await fetchGrid();
  };

  const todayStr = getTodayISO();

  return (
    <div className="space-y-6">
      {/* Month Navigation & Matrix Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 glass-card p-5 rounded-2xl border border-white/10">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white tracking-tight">
                {monthNames[month - 1]} {year}
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Habit Matrix
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Interactive monthly habit execution matrix. Click any day cell to inspect or record progress.
            </p>
          </div>
        </div>

        {/* Month controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleTodayMonth}
            className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 transition"
          >
            Today
          </button>
          <div className="flex items-center rounded-xl bg-white/5 border border-white/10 p-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-bold px-2 text-slate-300">
              {month < 10 ? `0${month}` : month}/{year}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Visual Status Legend */}
      <div className="flex items-center gap-4 text-xs text-slate-400 px-3 py-2.5 rounded-xl bg-white/5 border border-white/5 flex-wrap">
        <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Status Legend:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center font-bold text-[10px]">
            ✓
          </span>
          <span className="text-xs text-slate-300 font-medium">Completed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center justify-center font-bold text-[10px]">
            ✗
          </span>
          <span className="text-xs text-slate-300 font-medium">Missed / Incomplete</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-md border border-dashed border-white/20 text-slate-500 flex items-center justify-center font-bold text-[10px]">
            ○
          </span>
          <span className="text-xs text-slate-300 font-medium">Upcoming Day</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-md bg-white/5 text-slate-600 border border-white/5 flex items-center justify-center font-bold text-[10px]">
            —
          </span>
          <span className="text-xs text-slate-400 font-medium">Outside Goal Duration</span>
        </div>
      </div>

      {/* Matrix Table */}
      {loading ? (
        <div className="glass-card p-16 text-center text-slate-400 text-sm space-y-3">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Loading monthly tracking matrix...</p>
        </div>
      ) : !gridData || gridData.grid.length === 0 ? (
        <div className="glass-card p-14 text-center text-slate-400 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <p className="text-base font-bold text-white">No habits active for this period</p>
          <p className="text-xs max-w-sm mx-auto">
            Create customized goals or adjust your date range to populate the tracking matrix.
          </p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden border border-white/10 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-white/10 bg-slate-900/90 text-[11px] font-bold text-slate-400">
                  <th className="p-4 min-w-[220px] sticky left-0 z-20 bg-slate-950/98 backdrop-blur-md border-r border-white/10">
                    Habit / Goal
                  </th>
                  {gridData.daysInMonth.map((dateStr: string) => {
                    const dayNum = parseInt(dateStr.split('-')[2], 10);
                    const isToday = dateStr === todayStr;
                    return (
                      <th
                        key={dateStr}
                        className={`p-2 text-center min-w-[34px] font-mono text-xs ${
                          isToday
                            ? 'bg-indigo-600/35 text-indigo-300 font-black border-b-2 border-indigo-500'
                            : ''
                        }`}
                      >
                        {dayNum}
                      </th>
                    );
                  })}
                  <th className="p-4 text-center min-w-[90px] border-l border-white/10 bg-slate-950/98 font-bold">
                    Rate
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {gridData.grid.map((row: any) => {
                  const { task, metrics, days } = row;
                  const completedDaysCount = days.filter((d: any) => d.status === 'completed').length;
                  const totalElapsedDaysCount = days.filter(
                    (d: any) => d.status === 'completed' || d.status === 'incomplete'
                  ).length;
                  const rowRate =
                    totalElapsedDaysCount > 0
                      ? Math.round((completedDaysCount / totalElapsedDaysCount) * 100)
                      : 0;

                  return (
                    <tr key={task.id} className="hover:bg-white/[0.02] transition">
                      {/* Sticky Task Name Column */}
                      <td className="p-3.5 sticky left-0 z-20 bg-slate-950/98 backdrop-blur-md border-r border-white/10">
                        <div className="space-y-1">
                          <p className="font-bold text-white text-xs truncate max-w-[190px]">
                            {task.name}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                            <span className="font-bold text-indigo-400 uppercase">{task.type}</span>
                            {task.target && (
                              <span>
                                • {task.target.toLocaleString()} {task.unit || ''}
                              </span>
                            )}
                            {metrics.currentStreak > 0 && (
                              <span className="text-amber-400 flex items-center gap-0.5 ml-1 font-bold">
                                <Flame className="w-2.5 h-2.5" />
                                {metrics.currentStreak}d
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Days Grid Cells */}
                      {days.map((dayObj: any) => {
                        const { date, status, isInsideDuration, record, motivation } = dayObj;
                        const isToday = date === todayStr;

                        let cellClass =
                          'w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[10px] transition cursor-pointer mx-auto';
                        let content = '';

                        if (status === 'completed') {
                          cellClass +=
                            ' bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/40 shadow-sm shadow-emerald-500/20';
                          content = '✓';
                        } else if (status === 'incomplete') {
                          cellClass +=
                            ' bg-rose-500/20 text-rose-300 border border-rose-500/35 hover:bg-rose-500/30';
                          content = '✗';
                        } else if (status === 'future') {
                          cellClass +=
                            ' border border-dashed border-white/20 text-slate-500 hover:border-white/40';
                          content = '○';
                        } else {
                          cellClass += ' text-slate-700 cursor-not-allowed opacity-30';
                          content = '—';
                        }

                        return (
                          <td
                            key={date}
                            className={`p-1 text-center align-middle ${
                              isToday ? 'bg-indigo-600/15' : ''
                            }`}
                          >
                            <button
                              disabled={status === 'outside' || status === 'inactive_freq'}
                              onClick={() => {
                                if (status !== 'outside' && status !== 'inactive_freq') {
                                  setSelectedCell({
                                    task,
                                    date,
                                    status,
                                    record,
                                    motivation,
                                    metrics,
                                  });
                                }
                              }}
                              className={cellClass}
                              title={`${task.name} - ${date} (${status})`}
                            >
                              {content}
                            </button>
                          </td>
                        );
                      })}

                      {/* Row Success Rate Column */}
                      <td className="p-3 text-center border-l border-white/10 bg-slate-950/98">
                        <span
                          className={`font-mono text-xs font-black px-2 py-0.5 rounded-md ${
                            rowRate >= 80
                              ? 'text-emerald-400 bg-emerald-500/15'
                              : rowRate >= 50
                              ? 'text-amber-400 bg-amber-500/15'
                              : 'text-slate-400 bg-white/5'
                          }`}
                        >
                          {rowRate}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cell Detail Inspection / Edit Modal */}
      <CellModal
        isOpen={!!selectedCell}
        onClose={() => setSelectedCell(null)}
        cellData={selectedCell}
        onSaveRecord={handleSaveRecord}
      />
    </div>
  );
}

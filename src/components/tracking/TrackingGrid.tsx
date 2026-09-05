'use client';

import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Flame,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Repeat,
} from 'lucide-react';
import {
  formatDisplayDate,
  getTodayISO,
  formatFrequencyLabel,
} from '@/lib/dateUtils';
import { CellModal } from './CellModal';

export function TrackingGrid() {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [gridData, setGridData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCell, setSelectedCell] = useState<any | null>(null);

  const todayStr = getTodayISO();

  const fetchGrid = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/tracking?year=${currentYear}&month=${currentMonth}`
      );
      if (res.ok) {
        const json = await res.json();
        setGridData(json);
      }
    } catch (err) {
      console.error('Failed to load tracking grid:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrid();
  }, [currentYear, currentMonth]);

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleSaveRecord = async (
    taskId: string,
    date: string,
    actualValue?: number | null,
    completed?: boolean,
    note?: string
  ) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          actualValue,
          completed,
          note,
        }),
      });
      if (res.ok) {
        await fetchGrid();
      }
    } catch (err) {
      console.error('Failed to save record:', err);
    }
  };

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Month Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-5 rounded-2xl border border-white/10 bg-espresso-950/60">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-caramel-500/15 text-caramel-400 border border-caramel-500/25">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">
              {monthNames[currentMonth - 1]} {currentYear}
            </h2>
            <p className="text-xs text-mocha-300">
              Interactive monthly execution matrix & habit history
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setCurrentYear(new Date().getFullYear());
              setCurrentMonth(new Date().getMonth() + 1);
            }}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-mocha-200 text-xs font-semibold border border-white/10 transition"
          >
            Today
          </button>
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-mocha-300 hover:text-white hover:bg-white/10 transition"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-mocha-300 hover:text-white hover:bg-white/10 transition"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Visual Status Legend */}
      <div className="flex items-center gap-4 text-xs text-mocha-300 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/5 flex-wrap">
        <span className="text-[11px] font-bold text-mocha-200 uppercase tracking-wider">Status Legend:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center font-bold text-[10px]">
            ✓
          </span>
          <span className="text-xs text-mocha-200 font-medium">Completed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center justify-center font-bold text-[10px]">
            ✗
          </span>
          <span className="text-xs text-mocha-200 font-medium">Missed / Incomplete</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-md border border-dashed border-white/20 text-mocha-400 flex items-center justify-center font-bold text-[10px]">
            ○
          </span>
          <span className="text-xs text-mocha-200 font-medium">Upcoming Day</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-md bg-white/5 text-mocha-400 border border-white/10 flex items-center justify-center font-bold text-xs">
            ·
          </span>
          <span className="text-xs text-mocha-200 font-medium">Rest / Off-Schedule</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-md bg-white/5 text-mocha-500 border border-white/5 flex items-center justify-center font-bold text-[10px]">
            —
          </span>
          <span className="text-xs text-mocha-400 font-medium">Outside Goal Duration</span>
        </div>
      </div>

      {/* Matrix Table */}
      {loading ? (
        <div className="glass-card p-16 text-center text-mocha-300 text-sm space-y-3">
          <div className="w-6 h-6 border-2 border-caramel-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Loading monthly tracking matrix...</p>
        </div>
      ) : !gridData || gridData.grid.length === 0 ? (
        <div className="glass-card p-14 text-center text-mocha-300 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-caramel-500/10 text-caramel-400 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <p className="text-base font-bold text-white">No habits active for this period</p>
          <p className="text-xs max-w-sm mx-auto">
            Create customized goals or adjust your date range to populate the tracking matrix.
          </p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden border border-white/10 shadow-xl bg-espresso-950/60">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-white/10 bg-espresso-900/90 text-[11px] font-bold text-mocha-300">
                  <th className="p-4 min-w-[220px] sticky left-0 z-20 bg-espresso-950/98 backdrop-blur-md border-r border-white/10">
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
                            ? 'bg-caramel-600/35 text-caramel-200 font-black border-b-2 border-caramel-500'
                            : ''
                        }`}
                      >
                        {dayNum}
                      </th>
                    );
                  })}
                  <th className="p-4 text-center min-w-[90px] border-l border-white/10 bg-espresso-950/98 font-bold">
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

                  const freqLabel = formatFrequencyLabel(task.frequency);

                  return (
                    <tr key={task.id} className="hover:bg-white/[0.02] transition">
                      {/* Sticky Task Name Column */}
                      <td className="p-3.5 sticky left-0 z-20 bg-espresso-950/98 backdrop-blur-md border-r border-white/10">
                        <div className="space-y-1">
                          <p className="font-bold text-white text-xs truncate max-w-[190px]">
                            {task.name}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] text-mocha-400 flex-wrap">
                            <span className="font-bold text-caramel-400 uppercase">{task.type}</span>
                            {task.target && (
                              <span>
                                • {task.target.toLocaleString()} {task.unit || ''}
                              </span>
                            )}
                            <span className="text-mocha-300 font-semibold bg-white/5 px-1.5 py-0.2 rounded border border-white/5">
                              {freqLabel}
                            </span>
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
                            ' border border-dashed border-white/20 text-mocha-400 hover:border-white/40';
                          content = '○';
                        } else if (status === 'inactive_freq') {
                          if (record?.completed) {
                            cellClass +=
                              ' bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/40';
                            content = '✓';
                          } else {
                            cellClass += ' text-mocha-500 hover:text-mocha-300 hover:bg-white/5 text-xs';
                            content = '·';
                          }
                        } else {
                          cellClass += ' text-mocha-700 cursor-not-allowed opacity-30';
                          content = '—';
                        }

                        return (
                          <td
                            key={date}
                            className={`p-1 text-center align-middle ${
                              isToday ? 'bg-caramel-600/15' : ''
                            }`}
                          >
                            <button
                              disabled={status === 'outside'}
                              onClick={() => {
                                if (status !== 'outside') {
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
                              title={`${task.name} - ${date} (${status === 'inactive_freq' ? 'Rest / Off-schedule day' : status})`}
                            >
                              {content}
                            </button>
                          </td>
                        );
                      })}

                      {/* Row Success Rate Column */}
                      <td className="p-3 text-center border-l border-white/10 bg-espresso-950/98">
                        <span
                          className={`font-mono text-xs font-black px-2 py-0.5 rounded-md ${
                            rowRate >= 80
                              ? 'text-emerald-400 bg-emerald-500/15'
                              : rowRate >= 50
                              ? 'text-amber-400 bg-amber-500/15'
                              : 'text-mocha-300 bg-white/5'
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

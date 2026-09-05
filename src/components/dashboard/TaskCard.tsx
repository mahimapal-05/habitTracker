'use client';

import React, { useState } from 'react';
import {
  Check,
  Flame,
  Trophy,
  MoreVertical,
  Edit2,
  Trash2,
  Clock,
  Sparkles,
  Plus,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Target,
  Zap,
  Repeat,
  Scale,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatFrequencyLabel, isTaskActiveOnDate, getTodayISO } from '@/lib/dateUtils';

interface TaskCardProps {
  task: any;
  onUpdateRecord: (
    taskId: string,
    actualValue?: number | null,
    completed?: boolean,
    note?: string
  ) => Promise<void>;
  onEditTask: (task: any) => void;
  onDeleteTask: (taskId: string) => void;
}

export function TaskCard({ task, onUpdateRecord, onEditTask, onDeleteTask }: TaskCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [inputValue, setInputValue] = useState(
    task.todayRecord?.actualValue !== undefined && task.todayRecord?.actualValue !== null
      ? String(task.todayRecord.actualValue)
      : task.type === 'PROGRESS' && task.progressJourney?.currentValue !== null
      ? String(task.progressJourney?.currentValue)
      : ''
  );
  const [noteValue, setNoteValue] = useState(task.todayRecord?.note || '');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const isCompleted = task.todayRecord?.completed === true;
  const isAuto = task.todayRecord?.isAutoCompleted === true;
  const actualVal = task.todayRecord?.actualValue ?? null;
  const targetVal = task.target ?? 0;

  // Calculate progress percentage
  let progressPct = 0;
  if (task.type === 'CHECKBOX') {
    progressPct = isCompleted ? 100 : 0;
  } else if (task.type === 'PROGRESS' && task.progressJourney) {
    progressPct = task.progressJourney.percentAchieved;
  } else if (targetVal > 0) {
    const curr = actualVal ?? 0;
    progressPct = Math.min(100, Math.round((curr / targetVal) * 100));
  }

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch {
      // ignore
    }
  };

  const handleToggleCheckbox = async () => {
    setIsUpdating(true);
    const nextCompleted = !isCompleted;
    if (nextCompleted) triggerConfetti();
    await onUpdateRecord(task.id, actualVal, nextCompleted, noteValue);
    setIsUpdating(false);
  };

  const handleSaveValue = async () => {
    const num = parseFloat(inputValue);
    if (!isNaN(num)) {
      setIsUpdating(true);
      if (task.type === 'PROGRESS') {
        const isGoalMet =
          task.direction === 'DECREASE'
            ? num <= (task.target ?? 0)
            : num >= (task.target ?? 0);
        if (isGoalMet) triggerConfetti();
      } else if (task.target && num >= task.target && !isCompleted) {
        triggerConfetti();
      }
      await onUpdateRecord(task.id, num, undefined, noteValue);
      setIsUpdating(false);
    }
  };

  const handleQuickAdd = async (amount: number) => {
    const base =
      actualVal !== null
        ? actualVal
        : task.type === 'PROGRESS' && task.progressJourney?.currentValue !== null
        ? task.progressJourney.currentValue
        : 0;

    const nextVal = Number((base + amount).toFixed(2));
    setInputValue(String(nextVal));
    setIsUpdating(true);
    if (task.type === 'PROGRESS') {
      const isGoalMet =
        task.direction === 'DECREASE'
          ? nextVal <= (task.target ?? 0)
          : nextVal >= (task.target ?? 0);
      if (isGoalMet) triggerConfetti();
    } else if (task.target && nextVal >= task.target && !isCompleted) {
      triggerConfetti();
    }
    await onUpdateRecord(task.id, nextVal, undefined, noteValue);
    setIsUpdating(false);
  };

  const handleSaveNote = async () => {
    setIsUpdating(true);
    await onUpdateRecord(task.id, actualVal, isCompleted, noteValue);
    setShowNoteInput(false);
    setIsUpdating(false);
  };

  const journey = task.progressJourney;
  const isScheduledToday = isTaskActiveOnDate(task, getTodayISO());

  return (
    <div
      className={`glass-card-interactive p-5 rounded-2xl relative transition-all duration-300 flex flex-col justify-between ${
        isCompleted || (task.type === 'PROGRESS' && journey?.isGoalMet)
          ? 'border-emerald-500/35 bg-espresso-900/85 glow-emerald shadow-lg'
          : 'border-white/10 bg-espresso-950/60 hover:border-white/20'
      }`}
    >
      {/* Top Header: Title, Type Badge & Action Menu */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-white tracking-tight truncate">
                {task.name}
              </h3>

              {/* Goal Type Pill */}
              <span
                className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  task.type === 'PROGRESS'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : task.type === 'CHECKBOX'
                    ? 'bg-caramel-500/15 text-caramel-300 border-caramel-500/30'
                    : task.type === 'NUMERIC'
                    ? 'bg-caramel-500/15 text-caramel-300 border-caramel-500/30'
                    : 'bg-latte-500/15 text-latte-300 border-latte-500/30'
                }`}
              >
                {task.type === 'PROGRESS' ? 'Milestone' : task.type}
              </span>

              {/* Frequency Schedule Pill */}
              {task.frequency && (
                <span className="text-[10px] font-semibold text-caramel-300 bg-caramel-500/10 px-2 py-0.5 rounded-full border border-caramel-500/20 flex items-center gap-1">
                  <Repeat className="w-2.5 h-2.5" />
                  <span>{formatFrequencyLabel(task.frequency)}</span>
                </span>
              )}

              {/* Scheduled / Rest Day status */}
              {!isScheduledToday && (
                <span className="text-[10px] font-bold text-mocha-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                  Rest Day
                </span>
              )}

              {/* Status Indicator */}
              {(isCompleted || (task.type === 'PROGRESS' && journey?.isGoalMet)) && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                    isAuto || (task.type === 'PROGRESS' && journey?.isGoalMet)
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-caramel-500/20 text-caramel-300 border-caramel-500/30'
                  }`}
                >
                  <Check className="w-3 h-3" />
                  <span>{journey?.isGoalMet ? 'Target Reached!' : isAuto ? 'Auto Goal Met' : 'Completed'}</span>
                </span>
              )}
            </div>

            {task.description && (
              <p className="text-xs text-mocha-300 line-clamp-2 leading-relaxed">
                {task.description}
              </p>
            )}
          </div>

          {/* Action Menu (Edit / Delete) */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-xl text-mocha-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-1 w-36 rounded-2xl glass-panel p-1.5 z-30 shadow-2xl border border-white/15 bg-espresso-950/98">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onEditTask(task);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-mocha-200 hover:text-white hover:bg-white/10 transition"
                >
                  <Edit2 className="w-3.5 h-3.5 text-caramel-400" />
                  <span>Edit Habit</span>
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDeleteTask(task.id);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* PROGRESS / Weight Loss Journey View */}
        {task.type === 'PROGRESS' && journey && (
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-3">
            {/* Journey Stats Header */}
            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="text-mocha-400 text-[11px] block uppercase font-semibold">
                  {journey.direction === 'DECREASE' ? 'Weight Loss Journey' : 'Milestone Progress'}
                </span>
                <div className="flex items-center gap-1.5 text-sm font-black text-white">
                  <span>{journey.currentValue ?? journey.startValue} {task.unit || ''}</span>
                  <span className="text-xs text-mocha-400 font-normal">
                    (Start: {journey.startValue} → Goal: {journey.targetValue} {task.unit || ''})
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="font-mono text-xs font-bold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-md border border-amber-500/25">
                  {journey.percentAchieved}%
                </span>
              </div>
            </div>

            {/* Journey Progress Bar */}
            <div className="w-full h-2.5 rounded-full bg-espresso-950 border border-white/10 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  journey.isGoalMet ? 'gradient-emerald' : 'gradient-primary'
                }`}
                style={{ width: `${journey.percentAchieved}%` }}
              />
            </div>

            {/* Sub delta metrics */}
            <div className="flex items-center justify-between text-[11px] text-mocha-300">
              <span className="text-emerald-400 font-semibold">
                {journey.direction === 'DECREASE' ? '📉 Lost' : '📈 Gained'}: {journey.deltaAchieved} {task.unit || ''}
              </span>
              <span>
                {journey.isGoalMet
                  ? '🎉 Goal Reached!'
                  : `${journey.deltaRemaining} ${task.unit || ''} remaining`}
              </span>
            </div>

            {/* Quick Weigh-in / Progress Input */}
            <div className="pt-2 border-t border-white/10 space-y-2">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="number"
                    step="any"
                    placeholder={`Log ${task.unit || 'weight'}`}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveValue()}
                    className="w-full px-3 py-1.5 rounded-xl bg-espresso-950 border border-white/10 text-white text-xs placeholder-mocha-400 focus:outline-none focus:border-caramel-500 transition-colors font-mono font-bold"
                  />
                </div>

                <button
                  onClick={handleSaveValue}
                  disabled={isUpdating || !inputValue}
                  className="px-3 py-1.5 rounded-xl gradient-primary text-white text-xs font-bold transition disabled:opacity-40 shadow-sm"
                >
                  Save Log
                </button>
              </div>

              {/* Micro adjustment buttons */}
              <div className="flex items-center gap-1.5">
                {[-0.5, -0.1, 0.1, 0.5].map((delta) => (
                  <button
                    key={delta}
                    type="button"
                    onClick={() => handleQuickAdd(delta)}
                    className="flex-1 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-mocha-200 text-[11px] font-mono transition text-center"
                  >
                    {delta > 0 ? `+${delta}` : delta}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Standard Numeric / Time / Checkbox Section */}
        {task.type !== 'PROGRESS' && (
          <div className="space-y-2 pt-1">
            {task.type !== 'CHECKBOX' ? (
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-mocha-200">
                  <span className="text-white text-sm font-black">
                    {actualVal !== null ? actualVal.toLocaleString() : '0'}
                  </span>{' '}
                  <span className="text-mocha-300">/ {targetVal.toLocaleString()} {task.unit || ''}</span>
                </span>
                <span className="font-mono text-xs font-bold text-caramel-300 bg-caramel-500/15 px-2 py-0.5 rounded-md border border-caramel-500/25">
                  {progressPct}%
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between text-xs">
                <span className="text-mocha-400">Daily Checklist</span>
                <span className={`font-bold ${isCompleted ? 'text-emerald-400' : 'text-mocha-400'}`}>
                  {isCompleted ? '✓ Done for today' : 'Pending completion'}
                </span>
              </div>
            )}

            {/* Animated Progress Bar */}
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isCompleted ? 'gradient-emerald' : 'gradient-primary'
                }`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Standard Quick Numeric / Time Input Controls */}
        {task.type !== 'CHECKBOX' && task.type !== 'PROGRESS' && (
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  step="any"
                  placeholder={`Log ${task.unit || 'value'}`}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveValue()}
                  className="w-full px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-mocha-400 focus:outline-none focus:border-caramel-500 transition-colors"
                />
              </div>

              <button
                onClick={handleSaveValue}
                disabled={isUpdating || !inputValue}
                className="px-3 py-1.5 rounded-xl bg-caramel-600 hover:bg-caramel-500 text-white text-xs font-bold transition disabled:opacity-40 shadow-sm"
              >
                Log
              </button>
            </div>

            {/* Increments */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {task.type === 'NUMERIC' && (
                <>
                  <button
                    onClick={() => handleQuickAdd(1)}
                    className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-mocha-200 text-[11px] font-mono transition"
                    title="Add 1"
                  >
                    +1
                  </button>
                  <button
                    onClick={() => handleQuickAdd(5)}
                    className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-mocha-200 text-[11px] font-mono transition"
                    title="Add 5"
                  >
                    +5
                  </button>
                  <button
                    onClick={() => handleQuickAdd(1000)}
                    className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-mocha-200 text-[11px] font-mono transition"
                    title="Add 1,000"
                  >
                    +1k
                  </button>
                  <button
                    onClick={() => handleQuickAdd(2500)}
                    className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-mocha-200 text-[11px] font-mono transition"
                    title="Add 2,500"
                  >
                    +2.5k
                  </button>
                </>
              )}

              {task.type === 'TIME' && (
                <>
                  <button
                    onClick={() => handleQuickAdd(0.25)}
                    className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-mocha-200 text-[11px] font-mono transition"
                    title="Add 15 mins"
                  >
                    +15m
                  </button>
                  <button
                    onClick={() => handleQuickAdd(0.5)}
                    className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-mocha-200 text-[11px] font-mono transition"
                    title="Add 30 mins"
                  >
                    +30m
                  </button>
                  <button
                    onClick={() => handleQuickAdd(1)}
                    className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-mocha-200 text-[11px] font-mono transition"
                    title="Add 1 hour"
                  >
                    +1h
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer: Action Buttons, Streak & Motivation */}
      <div className="pt-4 border-t border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          {/* Checkbox or Action Toggle */}
          {task.type === 'CHECKBOX' ? (
            <button
              onClick={handleToggleCheckbox}
              disabled={isUpdating}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 ${
                isCompleted
                  ? 'bg-emerald-600 text-white shadow-emerald-600/30 hover:bg-emerald-500'
                  : 'bg-white/10 text-mocha-200 hover:bg-white/15 border border-white/10'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{isCompleted ? 'Completed' : 'Check In'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-mocha-300">
              <span className="font-semibold">{task.metrics?.totalCompletedDays ?? 0}</span>
              <span>days logged</span>
            </div>
          )}

          {/* Streak & Best Records */}
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-bold"
              title="Current Active Streak"
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>{task.metrics?.currentStreak ?? 0}d</span>
            </span>

            <button
              onClick={() => setShowNoteInput(!showNoteInput)}
              className={`p-2 rounded-lg border transition ${
                noteValue
                  ? 'bg-caramel-500/20 text-caramel-300 border-caramel-500/30'
                  : 'bg-white/5 text-mocha-300 border-white/5 hover:border-white/10'
              }`}
              title="Add Daily Note"
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Note Editor Dropdown */}
        {showNoteInput && (
          <div className="pt-2 border-t border-white/5 space-y-2 animate-fade-in">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add daily reflection or note..."
                value={noteValue}
                onChange={(e) => setNoteValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveNote()}
                className="w-full px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-mocha-400 focus:outline-none focus:border-caramel-500"
              />
              <button
                onClick={handleSaveNote}
                className="px-3 py-1.5 rounded-xl gradient-primary text-white text-xs font-bold shrink-0"
              >
                Save
              </button>
            </div>
          </div>
        )}

        {/* Contextual Motivation Snippet */}
        {task.motivation && (
          <div
            className={`p-2.5 rounded-xl text-xs flex items-start gap-2 border ${
              task.motivation.accent === 'emerald'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                : task.motivation.accent === 'amber'
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                : 'bg-caramel-500/10 border-caramel-500/20 text-caramel-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5 text-caramel-400" />
            <div className="leading-snug">
              <span className="font-bold">{task.motivation.title}: </span>
              <span>{task.motivation.message}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

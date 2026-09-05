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
      if (task.target && num >= task.target && !isCompleted) {
        triggerConfetti();
      }
      await onUpdateRecord(task.id, num, undefined, noteValue);
      setIsUpdating(false);
    }
  };

  const handleQuickAdd = async (amount: number) => {
    const current = actualVal ?? 0;
    const nextVal = current + amount;
    setInputValue(String(nextVal));
    setIsUpdating(true);
    if (task.target && nextVal >= task.target && !isCompleted) {
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

  return (
    <div
      className={`glass-card-interactive p-5 rounded-2xl relative transition-all duration-300 flex flex-col justify-between ${
        isCompleted
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
                  task.type === 'CHECKBOX'
                    ? 'bg-caramel-500/15 text-caramel-300 border-caramel-500/30'
                    : task.type === 'NUMERIC'
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    : 'bg-latte-500/15 text-latte-300 border-latte-500/30'
                }`}
              >
                {task.type}
              </span>

              {/* Frequency Schedule Pill */}
              {task.frequency && (
                <span className="text-[10px] font-semibold text-caramel-300 bg-caramel-500/10 px-2 py-0.5 rounded-full border border-caramel-500/20 flex items-center gap-1">
                  <Repeat className="w-2.5 h-2.5" />
                  <span>{formatFrequencyLabel(task.frequency)}</span>
                </span>
              )}

              {/* Scheduled / Rest Day status */}
              {!isTaskActiveOnDate(task, getTodayISO()) && (
                <span className="text-[10px] font-bold text-mocha-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                  Rest Day
                </span>
              )}

              {/* Status Indicator */}
              {isCompleted && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                    isAuto
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-caramel-500/20 text-caramel-300 border-caramel-500/30'
                  }`}
                >
                  <Check className="w-3 h-3" />
                  <span>{isAuto ? 'Auto Goal Met' : 'Completed'}</span>
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

        {/* Progress & Target Section */}
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

        {/* Quick Numeric / Time Input Controls */}
        {task.type !== 'CHECKBOX' && (
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
                    onClick={() => handleQuickAdd(1.0)}
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

      {/* Footer Section: Streaks, Note Toggle & Checkbox Action */}
      <div className="mt-4 pt-3 border-t border-white/10 space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* Streak Badges */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                task.metrics.currentStreak > 0
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/35 glow-amber'
                  : 'bg-white/5 text-mocha-300 border border-white/5'
              }`}
              title={`Current streak: ${task.metrics.currentStreak} days`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>{task.metrics.currentStreak}d streak</span>
            </span>

            <span
              className="inline-flex items-center gap-1 px-2 py-1 rounded-xl bg-white/5 text-mocha-300 text-xs font-semibold"
              title={`All-time best streak: ${task.metrics.bestStreak} days`}
            >
              <Trophy className="w-3 h-3 text-amber-400" />
              <span>{task.metrics.bestStreak}d best</span>
            </span>
          </div>

          {/* Note Toggle & Checkbox Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNoteInput(!showNoteInput)}
              className={`p-2 rounded-xl border text-xs transition-all ${
                noteValue
                  ? 'bg-caramel-500/20 text-caramel-300 border-caramel-500/30'
                  : 'bg-white/5 text-mocha-300 border-white/5 hover:bg-white/10 hover:text-white'
              }`}
              title={noteValue ? `Note: ${noteValue}` : 'Add a note for today'}
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleToggleCheckbox}
              disabled={isUpdating}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all active:scale-95 shadow-sm ${
                isCompleted
                  ? 'bg-emerald-600 text-white shadow-emerald-600/30 hover:bg-emerald-500'
                  : 'bg-white/10 text-mocha-100 hover:bg-white/20 border border-white/15'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isCompleted ? 'Completed' : 'Mark Done'}</span>
            </button>
          </div>
        </div>

        {/* Collapsible Note Input Drawer */}
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
                : task.motivation.accent === 'purple'
                ? 'bg-caramel-600/15 border-caramel-500/30 text-caramel-200'
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

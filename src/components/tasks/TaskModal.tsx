'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Clock,
  Calendar,
  Target,
  Sparkles,
  Wand2,
  Check,
  Repeat,
  CalendarDays,
  Flame,
} from 'lucide-react';
import {
  getTodayISO,
  parseFrequency,
  formatFrequencyLabel,
  FrequencyType,
} from '@/lib/dateUtils';
import { addDays, format, parseISO } from 'date-fns';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  editingTask?: any | null;
}

const GOAL_TEMPLATES = [
  {
    name: '10,000 Daily Steps',
    description: 'Brisk walking or jogging to maintain active physical health.',
    type: 'NUMERIC' as const,
    target: '10000',
    unit: 'steps',
    frequency: 'DAILY',
    durationDays: 30,
    reminderTimes: ['08:00', '18:00'],
  },
  {
    name: 'Gym Strength Training',
    description: 'Weight lifting and resistance workouts.',
    type: 'CHECKBOX' as const,
    target: '1',
    unit: 'session',
    frequency: 'CUSTOM:1,3,5', // Mon, Wed, Fri
    durationDays: 60,
    reminderTimes: ['17:30'],
  },
  {
    name: 'Drink 2.5L Water',
    description: 'Stay properly hydrated throughout the day.',
    type: 'NUMERIC' as const,
    target: '2500',
    unit: 'ml',
    frequency: 'DAILY',
    durationDays: 30,
    reminderTimes: ['09:00', '13:00', '17:00'],
  },
  {
    name: 'Read 30 Minutes',
    description: 'Read non-fiction, philosophy, or literature daily.',
    type: 'TIME' as const,
    target: '0.5',
    unit: 'hours',
    frequency: 'DAILY',
    durationDays: 30,
    reminderTimes: ['21:00'],
  },
  {
    name: 'Deep Work / Coding',
    description: 'Distraction-free high-focus engineering or creative sprint.',
    type: 'TIME' as const,
    target: '2',
    unit: 'hours',
    frequency: 'WEEKDAYS',
    durationDays: 60,
    reminderTimes: ['09:30'],
  },
  {
    name: 'Deep House Cleaning',
    description: 'Tidy up rooms and organize workspace periodically.',
    type: 'CHECKBOX' as const,
    target: '1',
    unit: 'session',
    frequency: 'INTERVAL:3', // Every 3 days
    durationDays: 45,
    reminderTimes: ['10:00'],
  },
  {
    name: 'Weekend Reflection & Review',
    description: 'Review weekly progress, reflect on lessons, and plan next week.',
    type: 'TIME' as const,
    target: '1',
    unit: 'hours',
    frequency: 'WEEKENDS', // Sat & Sun
    durationDays: 60,
    reminderTimes: ['11:00'],
  },
];

const WEEK_DAYS = [
  { day: 1, label: 'Mon', short: 'M' },
  { day: 2, label: 'Tue', short: 'T' },
  { day: 3, label: 'Wed', short: 'W' },
  { day: 4, label: 'Thu', short: 'T' },
  { day: 5, label: 'Fri', short: 'F' },
  { day: 6, label: 'Sat', short: 'S' },
  { day: 0, label: 'Sun', short: 'S' },
];

export function TaskModal({ isOpen, onClose, onSaved, editingTask }: TaskModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'CHECKBOX' | 'NUMERIC' | 'TIME'>('CHECKBOX');
  const [target, setTarget] = useState<string>('10000');
  const [unit, setUnit] = useState<string>('steps');
  const [startDate, setStartDate] = useState(getTodayISO());
  const [endDate, setEndDate] = useState(
    format(addDays(parseISO(getTodayISO()), 30), 'yyyy-MM-dd')
  );

  // Custom Frequency Tracking State
  const [freqType, setFreqType] = useState<FrequencyType>('DAILY');
  const [customDays, setCustomDays] = useState<number[]>([1, 3, 5]); // Mon, Wed, Fri by default
  const [intervalDays, setIntervalDays] = useState<number>(2); // Every 2 days
  const [timesPerWeek, setTimesPerWeek] = useState<number>(3); // 3 days/week

  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTimes, setReminderTimes] = useState<string[]>(['09:00']);
  const [newTimeInput, setNewTimeInput] = useState('18:00');
  const [reminderMessage, setReminderMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingTask) {
      setName(editingTask.name || '');
      setDescription(editingTask.description || '');
      setType(editingTask.type || 'CHECKBOX');
      setTarget(editingTask.target ? String(editingTask.target) : '10000');
      setUnit(editingTask.unit || (editingTask.type === 'TIME' ? 'hours' : 'steps'));
      setStartDate(editingTask.startDate || getTodayISO());
      setEndDate(editingTask.endDate || getTodayISO());

      // Parse existing frequency into custom controls
      const parsed = parseFrequency(editingTask.frequency);
      setFreqType(parsed.type);
      setCustomDays(parsed.customDays);
      setIntervalDays(parsed.intervalDays);
      setTimesPerWeek(parsed.timesPerWeek);

      setReminderEnabled(!!editingTask.reminderEnabled);
      setReminderTimes(editingTask.reminderTimes || ['09:00']);
      setReminderMessage(editingTask.reminderMessage || '');
    } else {
      setName('');
      setDescription('');
      setType('CHECKBOX');
      setTarget('10000');
      setUnit('steps');
      setStartDate(getTodayISO());
      setEndDate(format(addDays(parseISO(getTodayISO()), 30), 'yyyy-MM-dd'));

      setFreqType('DAILY');
      setCustomDays([1, 3, 5]);
      setIntervalDays(2);
      setTimesPerWeek(3);

      setReminderEnabled(false);
      setReminderTimes(['09:00']);
      setReminderMessage('');
    }
    setError(null);
  }, [editingTask, isOpen]);

  if (!isOpen) return null;

  const handleApplyTemplate = (tpl: (typeof GOAL_TEMPLATES)[0]) => {
    setName(tpl.name);
    setDescription(tpl.description);
    setType(tpl.type);
    setTarget(tpl.target);
    setUnit(tpl.unit);

    const parsed = parseFrequency(tpl.frequency);
    setFreqType(parsed.type);
    setCustomDays(parsed.customDays);
    setIntervalDays(parsed.intervalDays);
    setTimesPerWeek(parsed.timesPerWeek);

    setStartDate(getTodayISO());
    setEndDate(format(addDays(parseISO(getTodayISO()), tpl.durationDays), 'yyyy-MM-dd'));
    setReminderEnabled(true);
    setReminderTimes(tpl.reminderTimes);
    setReminderMessage(`Time to complete: ${tpl.name}!`);
  };

  const handleTypeChange = (newType: 'CHECKBOX' | 'NUMERIC' | 'TIME') => {
    setType(newType);
    if (newType === 'TIME') {
      setTarget('2');
      setUnit('hours');
    } else if (newType === 'NUMERIC') {
      setTarget('10000');
      setUnit('steps');
    }
  };

  const toggleCustomDay = (dayIndex: number) => {
    if (customDays.includes(dayIndex)) {
      if (customDays.length > 1) {
        setCustomDays(customDays.filter((d) => d !== dayIndex));
      }
    } else {
      setCustomDays([...customDays, dayIndex].sort((a, b) => a - b));
    }
  };

  const handleAddTime = () => {
    if (newTimeInput && !reminderTimes.includes(newTimeInput)) {
      setReminderTimes([...reminderTimes, newTimeInput].sort());
    }
  };

  const handleRemoveTime = (timeToRemove: string) => {
    setReminderTimes(reminderTimes.filter((t) => t !== timeToRemove));
  };

  // Compute final serialized frequency string to save
  const buildFrequencyString = (): string => {
    switch (freqType) {
      case 'DAILY':
        return 'DAILY';
      case 'WEEKDAYS':
        return 'WEEKDAYS';
      case 'WEEKENDS':
        return 'WEEKENDS';
      case 'CUSTOM_DAYS':
        return `CUSTOM:${customDays.join(',')}`;
      case 'INTERVAL':
        return `INTERVAL:${Math.max(1, intervalDays)}`;
      case 'TIMES_PER_WEEK':
        return `WEEKLY:${Math.max(1, Math.min(7, timesPerWeek))}`;
      default:
        return 'DAILY';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Task / Habit name is required.');
      return;
    }

    if (!startDate || !endDate) {
      setError('Start date and end date are required.');
      return;
    }

    if (endDate < startDate) {
      setError('End date cannot be before start date.');
      return;
    }

    if (type !== 'CHECKBOX') {
      const numTarget = parseFloat(target);
      if (isNaN(numTarget) || numTarget <= 0) {
        setError('Please enter a valid numeric target greater than 0.');
        return;
      }
    }

    const frequencyStr = buildFrequencyString();

    try {
      setLoading(true);
      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
        type,
        target: type !== 'CHECKBOX' ? parseFloat(target) : undefined,
        unit: type !== 'CHECKBOX' ? unit.trim() : undefined,
        startDate,
        endDate,
        frequency: frequencyStr,
        reminderEnabled,
        reminderTimes,
        reminderMessage: reminderMessage.trim() || undefined,
      };

      const url = editingTask ? `/api/tasks/${editingTask.id}` : '/api/tasks';
      const method = editingTask ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save habit');
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const currentComputedFreq = buildFrequencyString();
  const currentFormattedLabel = formatFrequencyLabel(currentComputedFreq);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-xl rounded-2xl glass-panel border border-white/15 bg-espresso-950/98 p-6 sm:p-7 shadow-2xl relative max-h-[92vh] overflow-y-auto space-y-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-mocha-300 hover:text-white hover:bg-white/10 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2 tracking-tight">
            <Sparkles className="w-5 h-5 text-caramel-400" />
            <span>{editingTask ? 'Edit Goal & Habit' : 'Create New Goal / Habit'}</span>
          </h2>
          <p className="text-xs text-mocha-300">
            Set custom duration, targets, frequencies, and scheduled reminders.
          </p>
        </div>

        {/* Quick Start Templates for New Goals */}
        {!editingTask && (
          <div className="space-y-2 p-3.5 rounded-2xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-caramel-300">
              <Wand2 className="w-3.5 h-3.5" />
              <span>Quick-Start Popular Templates</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {GOAL_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.name}
                  type="button"
                  onClick={() => handleApplyTemplate(tpl)}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-caramel-600/20 border border-white/10 hover:border-caramel-500/40 text-mocha-200 hover:text-caramel-200 text-[11px] font-semibold transition active:scale-95"
                >
                  + {tpl.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Section 1: Basic Info */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-mocha-200 mb-1">
                Goal / Habit Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 10,000 Steps, Gym Workout, Read 30 Mins"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-mocha-400 focus:outline-none focus:border-caramel-500 text-sm transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-mocha-200 mb-1">
                Description / Guidelines (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Why this habit matters, rules, reminders..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-mocha-400 focus:outline-none focus:border-caramel-500 text-xs transition"
              />
            </div>
          </div>

          {/* Section 2: Habit Type & Target Values */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <label className="block text-xs font-bold text-mocha-200">
              Tracking Metric Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleTypeChange('CHECKBOX')}
                className={`p-3 rounded-xl border text-left space-y-1 transition-all ${
                  type === 'CHECKBOX'
                    ? 'border-caramel-500 bg-caramel-500/15 shadow-sm'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <span className="block text-xs font-bold text-white">✓ Checkbox</span>
                <span className="block text-[10px] text-mocha-300">Simple Yes / No</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('NUMERIC')}
                className={`p-3 rounded-xl border text-left space-y-1 transition-all ${
                  type === 'NUMERIC'
                    ? 'border-caramel-500 bg-caramel-500/15 shadow-sm'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <span className="block text-xs font-bold text-white"># Numeric Target</span>
                <span className="block text-[10px] text-mocha-300">Steps, ml, pages...</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('TIME')}
                className={`p-3 rounded-xl border text-left space-y-1 transition-all ${
                  type === 'TIME'
                    ? 'border-caramel-500 bg-caramel-500/15 shadow-sm'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <span className="block text-xs font-bold text-white">⏱️ Duration / Time</span>
                <span className="block text-[10px] text-mocha-300">Hours or minutes</span>
              </button>
            </div>

            {type !== 'CHECKBOX' && (
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-white/5 border border-white/5">
                <div>
                  <label className="block text-[11px] font-bold text-mocha-200 mb-1">
                    Daily Target Value *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder={type === 'TIME' ? '2' : '10000'}
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-espresso-950 border border-white/10 text-white text-sm font-mono focus:outline-none focus:border-caramel-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-mocha-200 mb-1">
                    Measurement Unit
                  </label>
                  <input
                    type="text"
                    placeholder={type === 'TIME' ? 'hours' : 'steps'}
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-espresso-950 border border-white/10 text-white text-sm focus:outline-none focus:border-caramel-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Duration Dates */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-mocha-200 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-caramel-400" />
                  <span>Start Date *</span>
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-caramel-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-mocha-200 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-caramel-400" />
                  <span>End Date *</span>
                </label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-caramel-500"
                />
              </div>
            </div>

            {/* Section 4: Customized Frequency Tracking */}
            <div className="space-y-3 pt-3 border-t border-white/10">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-mocha-200 flex items-center gap-1.5">
                  <Repeat className="w-3.5 h-3.5 text-caramel-400" />
                  <span>Custom Frequency Tracking</span>
                </label>
                <span className="text-[11px] font-bold text-caramel-300 bg-caramel-500/15 px-2 py-0.5 rounded-md border border-caramel-500/25">
                  {currentFormattedLabel}
                </span>
              </div>

              {/* Frequency Mode Selector Tabs */}
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10">
                <button
                  type="button"
                  onClick={() => setFreqType('DAILY')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                    freqType === 'DAILY'
                      ? 'bg-caramel-600 text-white shadow-sm'
                      : 'text-mocha-300 hover:text-white'
                  }`}
                >
                  Every Day
                </button>
                <button
                  type="button"
                  onClick={() => setFreqType('WEEKDAYS')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                    freqType === 'WEEKDAYS'
                      ? 'bg-caramel-600 text-white shadow-sm'
                      : 'text-mocha-300 hover:text-white'
                  }`}
                >
                  Mon – Fri
                </button>
                <button
                  type="button"
                  onClick={() => setFreqType('WEEKENDS')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                    freqType === 'WEEKENDS'
                      ? 'bg-caramel-600 text-white shadow-sm'
                      : 'text-mocha-300 hover:text-white'
                  }`}
                >
                  Sat & Sun
                </button>
                <button
                  type="button"
                  onClick={() => setFreqType('CUSTOM_DAYS')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                    freqType === 'CUSTOM_DAYS'
                      ? 'bg-caramel-600 text-white shadow-sm'
                      : 'text-mocha-300 hover:text-white'
                  }`}
                >
                  Specific Days
                </button>
                <button
                  type="button"
                  onClick={() => setFreqType('INTERVAL')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                    freqType === 'INTERVAL'
                      ? 'bg-caramel-600 text-white shadow-sm'
                      : 'text-mocha-300 hover:text-white'
                  }`}
                >
                  Every N Days
                </button>
                <button
                  type="button"
                  onClick={() => setFreqType('TIMES_PER_WEEK')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                    freqType === 'TIMES_PER_WEEK'
                      ? 'bg-caramel-600 text-white shadow-sm'
                      : 'text-mocha-300 hover:text-white'
                  }`}
                >
                  N Times / Wk
                </button>
              </div>

              {/* Mode 1: Specific Days Picker */}
              {freqType === 'CUSTOM_DAYS' && (
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Choose Active Days</span>
                    {/* Quick day shortcuts */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setCustomDays([1, 3, 5])}
                        className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white/5 hover:bg-white/10 text-mocha-200 transition"
                      >
                        MWF
                      </button>
                      <button
                        type="button"
                        onClick={() => setCustomDays([2, 4, 6])}
                        className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white/5 hover:bg-white/10 text-mocha-200 transition"
                      >
                        TTS
                      </button>
                      <button
                        type="button"
                        onClick={() => setCustomDays([1, 2, 3, 4, 5])}
                        className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white/5 hover:bg-white/10 text-mocha-200 transition"
                      >
                        Mon-Fri
                      </button>
                    </div>
                  </div>

                  {/* Circular Day Toggle Buttons */}
                  <div className="grid grid-cols-7 gap-1.5">
                    {WEEK_DAYS.map(({ day, label, short }) => {
                      const isSelected = customDays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleCustomDay(day)}
                          className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all ${
                            isSelected
                              ? 'bg-caramel-500 text-white shadow-md shadow-caramel-500/30 border border-caramel-400 font-bold scale-[1.02]'
                              : 'bg-espresso-950/80 text-mocha-400 border border-white/10 hover:border-white/20 hover:text-white'
                          }`}
                        >
                          <span className="text-[11px] font-extrabold">{short}</span>
                          <span className="text-[9px] opacity-80">{label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Mode 2: Interval / Cyclic Repeater */}
              {freqType === 'INTERVAL' && (
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Repeat Cycle Interval</span>
                    <span className="text-[11px] font-mono text-mocha-300">
                      {intervalDays === 2 ? 'Alternate days' : `Every ${intervalDays} days`}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIntervalDays(Math.max(1, intervalDays - 1))}
                      className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white font-black text-base flex items-center justify-center transition active:scale-95"
                    >
                      -
                    </button>
                    <div className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-espresso-950 border border-white/10">
                      <span className="text-sm font-extrabold text-caramel-400 font-mono">
                        Every {intervalDays}
                      </span>
                      <span className="text-xs text-mocha-300">day(s)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIntervalDays(Math.min(30, intervalDays + 1))}
                      className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white font-black text-base flex items-center justify-center transition active:scale-95"
                    >
                      +
                    </button>
                  </div>

                  {/* Quick interval presets */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {[
                      { days: 2, label: 'Alternate (Every 2d)' },
                      { days: 3, label: 'Every 3 days' },
                      { days: 4, label: 'Every 4 days' },
                      { days: 7, label: 'Weekly (Every 7d)' },
                    ].map((p) => (
                      <button
                        key={p.days}
                        type="button"
                        onClick={() => setIntervalDays(p.days)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                          intervalDays === p.days
                            ? 'bg-caramel-500/25 text-caramel-300 border border-caramel-500/40'
                            : 'bg-white/5 text-mocha-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Mode 3: Times Per Week */}
              {freqType === 'TIMES_PER_WEEK' && (
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Flexible Weekly Target</span>
                    <span className="text-[11px] font-mono text-mocha-300">
                      {timesPerWeek} out of 7 days
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setTimesPerWeek(Math.max(1, timesPerWeek - 1))}
                      className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white font-black text-base flex items-center justify-center transition active:scale-95"
                    >
                      -
                    </button>
                    <div className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-espresso-950 border border-white/10">
                      <span className="text-sm font-extrabold text-caramel-400 font-mono">
                        {timesPerWeek}
                      </span>
                      <span className="text-xs text-mocha-300">day(s) per week</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTimesPerWeek(Math.min(7, timesPerWeek + 1))}
                      className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white font-black text-base flex items-center justify-center transition active:scale-95"
                    >
                      +
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-1 pt-1">
                    {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setTimesPerWeek(num)}
                        className={`flex-1 py-1 rounded-lg text-xs font-bold transition ${
                          timesPerWeek === num
                            ? 'bg-caramel-500 text-white shadow-sm'
                            : 'bg-white/5 text-mocha-300 hover:bg-white/10'
                        }`}
                      >
                        {num}x
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 5: Scheduled Reminders */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white">Smart Reminders</span>
                  <p className="text-[10px] text-mocha-300">Scheduled in-app notifications</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={reminderEnabled}
                  onChange={(e) => setReminderEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-mocha-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-caramel-600"></div>
              </label>
            </div>

            {reminderEnabled && (
              <div className="space-y-3 pt-3 border-t border-white/10 animate-fade-in">
                <div>
                  <label className="block text-[11px] font-bold text-mocha-300 mb-1.5">
                    Scheduled Daily Times
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {reminderTimes.map((time) => (
                      <span
                        key={time}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold"
                      >
                        {time}
                        <button
                          type="button"
                          onClick={() => handleRemoveTime(time)}
                          className="hover:text-rose-400 transition"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="time"
                      value={newTimeInput}
                      onChange={(e) => setNewTimeInput(e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-espresso-950 border border-white/10 text-white text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleAddTime}
                      className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Time</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-mocha-300 mb-1">
                    Custom Notification Message
                  </label>
                  <input
                    type="text"
                    placeholder={`e.g. Time to complete: ${name || 'habit'}!`}
                    value={reminderMessage}
                    onChange={(e) => setReminderMessage(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-espresso-950 border border-white/10 text-white text-xs focus:outline-none focus:border-caramel-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-mocha-300 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl gradient-primary text-white text-xs font-black shadow-lg shadow-caramel-600/25 hover:opacity-95 active:scale-95 transition disabled:opacity-50"
            >
              {loading ? 'Saving Goal...' : editingTask ? 'Update Habit' : 'Create Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

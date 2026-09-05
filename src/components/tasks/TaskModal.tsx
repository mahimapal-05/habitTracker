'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Clock, Calendar, Target, Sparkles, Wand2, Check } from 'lucide-react';
import { getTodayISO } from '@/lib/dateUtils';
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
    frequency: 'DAILY' as const,
    durationDays: 30,
    reminderTimes: ['08:00', '18:00'],
  },
  {
    name: 'Drink 2.5L Water',
    description: 'Stay properly hydrated throughout the day.',
    type: 'NUMERIC' as const,
    target: '2500',
    unit: 'ml',
    frequency: 'DAILY' as const,
    durationDays: 30,
    reminderTimes: ['09:00', '13:00', '17:00'],
  },
  {
    name: 'Read 30 Minutes',
    description: 'Read non-fiction, philosophy, or literature daily.',
    type: 'TIME' as const,
    target: '0.5',
    unit: 'hours',
    frequency: 'DAILY' as const,
    durationDays: 30,
    reminderTimes: ['21:00'],
  },
  {
    name: 'Deep Work / Coding',
    description: 'Distraction-free high-focus engineering or creative sprint.',
    type: 'TIME' as const,
    target: '2',
    unit: 'hours',
    frequency: 'WEEKDAYS' as const,
    durationDays: 60,
    reminderTimes: ['09:30'],
  },
  {
    name: 'Morning Meditation',
    description: 'Mindfulness breathing and mental focus session.',
    type: 'CHECKBOX' as const,
    target: '1',
    unit: 'session',
    frequency: 'DAILY' as const,
    durationDays: 30,
    reminderTimes: ['07:00'],
  },
  {
    name: 'No Sugar / Healthy Diet',
    description: 'Avoid added refined sugars and processed snacks.',
    type: 'CHECKBOX' as const,
    target: '1',
    unit: 'day',
    frequency: 'DAILY' as const,
    durationDays: 21,
    reminderTimes: ['20:00'],
  },
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
  const [frequency, setFrequency] = useState<'DAILY' | 'WEEKDAYS' | 'WEEKENDS'>('DAILY');
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
      setFrequency(editingTask.frequency || 'DAILY');
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
      setFrequency('DAILY');
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
    setFrequency(tpl.frequency);
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

  const handleAddTime = () => {
    if (newTimeInput && !reminderTimes.includes(newTimeInput)) {
      setReminderTimes([...reminderTimes, newTimeInput].sort());
    }
  };

  const handleRemoveTime = (timeToRemove: string) => {
    setReminderTimes(reminderTimes.filter((t) => t !== timeToRemove));
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
        frequency,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-xl rounded-2xl glass-panel border border-white/15 bg-slate-950/98 p-6 sm:p-7 shadow-2xl relative max-h-[92vh] overflow-y-auto space-y-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2 tracking-tight">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span>{editingTask ? 'Edit Goal & Habit' : 'Create New Goal / Habit'}</span>
          </h2>
          <p className="text-xs text-slate-400">
            Set custom duration, targets, frequencies, and scheduled reminders.
          </p>
        </div>

        {/* Quick Start Templates for New Goals */}
        {!editingTask && (
          <div className="space-y-2 p-3.5 rounded-2xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
              <Wand2 className="w-3.5 h-3.5" />
              <span>Quick-Start Popular Templates</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {GOAL_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.name}
                  type="button"
                  onClick={() => handleApplyTemplate(tpl)}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-indigo-600/20 border border-white/10 hover:border-indigo-500/40 text-slate-300 hover:text-indigo-200 text-[11px] font-semibold transition active:scale-95"
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
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Goal / Habit Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 10,000 Steps, Deep Work, Read 30 Mins"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Description / Guidelines (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Why this habit matters, rules, reminders..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs transition"
              />
            </div>
          </div>

          {/* Section 2: Goal Type & Targets */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Goal Type *
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'CHECKBOX', label: 'Checkbox', desc: 'Manual completion' },
                  { id: 'NUMERIC', label: 'Numeric', desc: 'Steps, pages, count' },
                  { id: 'TIME', label: 'Time', desc: 'Hours, minutes' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleTypeChange(t.id as any)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      type === t.id
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-500/20'
                        : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                    }`}
                  >
                    <p className="text-xs font-bold text-white">{t.label}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Target & Unit (for numeric/time) */}
            {type !== 'CHECKBOX' && (
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-white/5 border border-white/5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Daily Target *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    min="0.01"
                    placeholder={type === 'TIME' ? '2' : '10000'}
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Measurement Unit
                  </label>
                  <input
                    type="text"
                    placeholder={type === 'TIME' ? 'hours' : 'steps'}
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Duration & Frequency */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Start Date *</span>
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  <span>End Date *</span>
                </label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Tracking Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold focus:outline-none focus:border-indigo-500"
              >
                <option value="DAILY" className="bg-slate-900 text-white">Everyday (Daily)</option>
                <option value="WEEKDAYS" className="bg-slate-900 text-white">Weekdays Only (Mon - Fri)</option>
                <option value="WEEKENDS" className="bg-slate-900 text-white">Weekends Only (Sat - Sun)</option>
              </select>
            </div>
          </div>

          {/* Section 4: Scheduled Reminders */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white">Smart Reminders</span>
                  <p className="text-[10px] text-slate-400">Scheduled in-app notifications</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={reminderEnabled}
                  onChange={(e) => setReminderEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {reminderEnabled && (
              <div className="space-y-3 pt-3 border-t border-white/10 animate-fade-in">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1.5">
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
                      className="px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-white text-xs font-mono"
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
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    Custom Notification Message
                  </label>
                  <input
                    type="text"
                    placeholder={`e.g. Time to complete: ${name || 'habit'}!`}
                    value={reminderMessage}
                    onChange={(e) => setReminderMessage(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
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
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl gradient-primary text-white text-xs font-black shadow-lg shadow-indigo-500/25 hover:opacity-95 active:scale-95 transition disabled:opacity-50"
            >
              {loading ? 'Saving Goal...' : editingTask ? 'Update Habit' : 'Create Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

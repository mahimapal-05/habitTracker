'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Flame, Calendar, Sparkles, MessageSquare, Target } from 'lucide-react';
import { formatDisplayDate } from '@/lib/dateUtils';
import confetti from 'canvas-confetti';

interface CellModalProps {
  isOpen: boolean;
  onClose: () => void;
  cellData: any | null; // { task, date, status, record, motivation, metrics }
  onSaveRecord: (
    taskId: string,
    date: string,
    actualValue?: number | null,
    completed?: boolean,
    note?: string
  ) => Promise<void>;
}

export function CellModal({ isOpen, onClose, cellData, onSaveRecord }: CellModalProps) {
  const [actualVal, setActualVal] = useState<string>('');
  const [noteVal, setNoteVal] = useState<string>('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (cellData) {
      setActualVal(
        cellData.record?.actualValue !== undefined && cellData.record?.actualValue !== null
          ? String(cellData.record.actualValue)
          : ''
      );
      setNoteVal(cellData.record?.note || '');
      setIsCompleted(cellData.record?.completed === true);
    }
  }, [cellData]);

  if (!isOpen || !cellData) return null;

  const { task, date, status, motivation, metrics } = cellData;

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const num = actualVal !== '' ? parseFloat(actualVal) : null;
      if (isCompleted && !cellData.record?.completed) {
        try {
          confetti({ particleCount: 40, spread: 50 });
        } catch {}
      }
      await onSaveRecord(task.id, date, num, isCompleted, noteVal);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md rounded-2xl glass-panel border border-white/15 bg-espresso-950/98 p-6 shadow-2xl relative space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-mocha-300 hover:text-white hover:bg-white/10 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1 pr-6">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-caramel-500/20 text-caramel-300 border border-caramel-500/30">
              {task.type}
            </span>
            <span className="text-xs text-mocha-300 flex items-center gap-1 font-mono">
              <Calendar className="w-3.5 h-3.5 text-caramel-400" />
              {formatDisplayDate(date)}
            </span>
          </div>
          <h2 className="text-lg font-black text-white tracking-tight">{task.name}</h2>
        </div>

        {/* Status Indicator & Checkbox Switch */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-mocha-300 uppercase tracking-wider">
              Completion Status
            </p>
            <p className="text-sm font-bold text-white mt-0.5">
              {isCompleted ? (
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> Goal Completed
                </span>
              ) : (
                <span className="text-mocha-400">Not Completed</span>
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsCompleted(!isCompleted)}
            className={`px-3.5 py-2 rounded-xl font-bold text-xs transition-all active:scale-95 shadow-sm ${
              isCompleted
                ? 'bg-emerald-600 text-white shadow-emerald-600/30 hover:bg-emerald-500'
                : 'bg-white/10 text-mocha-200 hover:bg-white/20 border border-white/10'
            }`}
          >
            {isCompleted ? 'Mark Incomplete' : '✓ Mark Done'}
          </button>
        </div>

        {/* Actual vs Target for Numeric / Time Goals */}
        {task.type !== 'CHECKBOX' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-mocha-200">
              <span className="font-semibold">Target: {task.target?.toLocaleString()} {task.unit || ''}</span>
              <span className="text-[11px] text-caramel-300">
                Auto-done when actual ≥ target
              </span>
            </div>
            <div>
              <label className="block text-xs font-bold text-mocha-200 mb-1">
                Actual Value Logged
              </label>
              <input
                type="number"
                step="any"
                placeholder={`Enter actual ${task.unit || 'value'}`}
                value={actualVal}
                onChange={(e) => {
                  setActualVal(e.target.value);
                  const num = parseFloat(e.target.value);
                  if (task.target && !isNaN(num) && num >= task.target) {
                    setIsCompleted(true);
                  }
                }}
                className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-caramel-500 transition"
              />
            </div>
          </div>
        )}

        {/* Daily Reflections / Notes */}
        <div>
          <label className="block text-xs font-bold text-mocha-200 mb-1 flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5 text-caramel-400" />
            <span>Daily Reflection or Note</span>
          </label>
          <textarea
            rows={2}
            placeholder="Add context or notes for this day..."
            value={noteVal}
            onChange={(e) => setNoteVal(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-mocha-400 focus:outline-none focus:border-caramel-500 transition"
          />
        </div>

        {/* Contextual Motivation */}
        {motivation && (
          <div className="p-3 rounded-xl bg-caramel-500/10 border border-caramel-500/20 text-caramel-300 text-xs flex items-start gap-2">
            <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-caramel-400" />
            <div className="leading-snug">
              <span className="font-bold">{motivation.title}: </span>
              <span>{motivation.message}</span>
            </div>
          </div>
        )}

        {/* Save Actions */}
        <div className="pt-3 flex items-center justify-end gap-3 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-mocha-300 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl gradient-primary text-white text-xs font-bold shadow-lg shadow-caramel-600/25 hover:opacity-95 transition disabled:opacity-50 active:scale-95"
          >
            {isSaving ? 'Saving...' : 'Save Record'}
          </button>
        </div>
      </div>
    </div>
  );
}


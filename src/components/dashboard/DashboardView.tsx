'use client';

import React, { useState } from 'react';
import {
  Plus,
  Sparkles,
  Filter,
  CheckCircle2,
  CircleDashed,
  Search,
  LayoutGrid,
  List,
  Check,
  Flame,
  Trophy,
  Edit2,
  Trash2,
} from 'lucide-react';
import { GreetingBanner } from './GreetingBanner';
import { QuickStats } from './QuickStats';
import { TaskCard } from './TaskCard';
import { TaskModal } from '../tasks/TaskModal';
import { useAuth } from '../providers/AuthProvider';
import confetti from 'canvas-confetti';

interface DashboardViewProps {
  tasks: any[];
  onRefresh: () => void;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
}

export function DashboardView({
  tasks,
  onRefresh,
  isCreateModalOpen,
  setIsCreateModalOpen,
}: DashboardViewProps) {
  const { user } = useAuth();
  const [filter, setFilter] = useState<'ALL' | 'INCOMPLETE' | 'COMPLETED'>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');
  const [editingTask, setEditingTask] = useState<any | null>(null);

  // Active tasks for today
  const activeTasksToday = tasks.filter((t) => t.isTodayActive);
  const completedToday = activeTasksToday.filter((t) => t.todayRecord?.completed === true);
  const highestStreak = tasks.reduce((max, t) => Math.max(max, t.metrics?.currentStreak || 0), 0);
  const totalStreaksCount = tasks.reduce((sum, t) => sum + (t.metrics?.currentStreak || 0), 0);

  // Filtered display list
  const displayTasks = activeTasksToday.filter((task) => {
    const isComp = task.todayRecord?.completed === true;
    if (filter === 'COMPLETED' && !isComp) return false;
    if (filter === 'INCOMPLETE' && isComp) return false;
    if (typeFilter !== 'ALL' && task.type !== typeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = task.name.toLowerCase().includes(q);
      const matchDesc = task.description?.toLowerCase().includes(q);
      if (!matchName && !matchDesc) return false;
    }
    return true;
  });

  const handleUpdateRecord = async (
    taskId: string,
    actualValue?: number | null,
    completed?: boolean,
    note?: string
  ) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          date: today,
          actualValue,
          completed,
          note,
        }),
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error('Record update failed:', err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('Are you sure you want to delete this habit and all its history?')) {
      try {
        const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
        if (res.ok) {
          onRefresh();
        }
      } catch (err) {
        console.error('Delete failed:', err);
      }
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Dynamic Greeting & Motivation Engine Banner */}
      <GreetingBanner
        userName={user?.name}
        completedCount={completedToday.length}
        totalActiveCount={activeTasksToday.length}
        highestStreak={highestStreak}
      />

      {/* Quick Summary KPI Cards */}
      <QuickStats
        completedCount={completedToday.length}
        totalActiveCount={activeTasksToday.length}
        totalStreaksCount={totalStreaksCount}
        longestStreak={highestStreak}
      />

      {/* Habits & Goals Control Bar */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 glass-card p-4 rounded-2xl">
          {/* Left: Title & Search */}
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search today's habits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-indigo-500 transition"
            >
              <option value="ALL" className="bg-slate-900 text-white">All Types</option>
              <option value="CHECKBOX" className="bg-slate-900 text-white">Checkboxes</option>
              <option value="NUMERIC" className="bg-slate-900 text-white">Numeric</option>
              <option value="TIME" className="bg-slate-900 text-white">Time</option>
            </select>
          </div>

          {/* Right: Status Filters & View Mode Toggle */}
          <div className="flex items-center justify-between lg:justify-end gap-3 flex-wrap">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
              <button
                onClick={() => setFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filter === 'ALL'
                    ? 'gradient-primary text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({activeTasksToday.length})
              </button>
              <button
                onClick={() => setFilter('INCOMPLETE')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filter === 'INCOMPLETE'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Pending ({activeTasksToday.length - completedToday.length})
              </button>
              <button
                onClick={() => setFilter('COMPLETED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filter === 'COMPLETED'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Done ({completedToday.length})
              </button>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center rounded-xl bg-white/5 border border-white/10 p-1">
              <button
                onClick={() => setViewMode('GRID')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'GRID'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Grid Card View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('LIST')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'LIST'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Compact List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Task Cards Grid or Compact List */}
        {displayTasks.length === 0 ? (
          <div className="glass-card p-12 text-center text-slate-400 space-y-4 rounded-2xl">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center mx-auto text-indigo-400">
              <Sparkles className="w-7 h-7 animate-soft-pulse" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-bold text-white">
                {filter === 'COMPLETED'
                  ? 'No tasks completed yet today'
                  : filter === 'INCOMPLETE'
                  ? '🎉 Outstanding! All habits completed for today.'
                  : 'No active habits scheduled for today'}
              </p>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                {filter === 'ALL'
                  ? 'Create your first customized goal or adjust frequency settings.'
                  : 'Adjust your search queries or filter criteria to see other tasks.'}
              </p>
            </div>
            {filter === 'ALL' && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white text-xs font-bold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:opacity-95 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Goal</span>
              </button>
            )}
          </div>
        ) : viewMode === 'GRID' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onUpdateRecord={handleUpdateRecord}
                onEditTask={(t) => {
                  setEditingTask(t);
                  setIsCreateModalOpen(true);
                }}
                onDeleteTask={handleDeleteTask}
              />
            ))}
          </div>
        ) : (
          /* Compact Table List View */
          <div className="glass-card rounded-2xl overflow-hidden border border-white/10 divide-y divide-white/5">
            {displayTasks.map((task) => {
              const isComp = task.todayRecord?.completed === true;
              const actualVal = task.todayRecord?.actualValue ?? null;
              const targetVal = task.target ?? 0;
              let progressPct = 0;
              if (task.type === 'CHECKBOX') progressPct = isComp ? 100 : 0;
              else if (targetVal > 0) progressPct = Math.min(100, Math.round(((actualVal ?? 0) / targetVal) * 100));

              return (
                <div
                  key={task.id}
                  className="p-4 flex items-center justify-between gap-4 hover:bg-white/[0.02] transition flex-wrap sm:flex-nowrap"
                >
                  {/* Left: Check / Name / Type */}
                  <div className="flex items-center gap-3 min-w-[200px] flex-1">
                    <button
                      onClick={async () => {
                        const nextComp = !isComp;
                        if (nextComp) confetti({ particleCount: 30, spread: 50 });
                        await handleUpdateRecord(task.id, actualVal, nextComp);
                      }}
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
                        isComp
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                          : 'bg-white/5 text-slate-500 border border-white/10 hover:border-white/25'
                      }`}
                      title={isComp ? 'Mark Incomplete' : 'Mark Complete'}
                    >
                      {isComp ? <Check className="w-4 h-4" /> : null}
                    </button>

                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${isComp ? 'line-through text-slate-400' : 'text-white'} truncate`}>
                          {task.name}
                        </span>
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-white/5 text-slate-400">
                          {task.type}
                        </span>
                      </div>
                      {task.type !== 'CHECKBOX' && (
                        <p className="text-[11px] text-slate-400">
                          {actualVal !== null ? actualVal : 0} / {targetVal} {task.unit || ''} ({progressPct}%)
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Middle: Streak info */}
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                      <Flame className="w-3.5 h-3.5" />
                      <span>{task.metrics.currentStreak}d</span>
                    </span>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setEditingTask(task);
                        setIsCreateModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
                      title="Edit Habit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                      title="Delete Habit"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Task Create / Edit Modal */}
      <TaskModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingTask(null);
        }}
        onSaved={onRefresh}
        editingTask={editingTask}
      />
    </div>
  );
}

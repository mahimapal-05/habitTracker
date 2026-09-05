'use client';

import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  Flame,
  Trophy,
  Search,
  CheckCircle2,
  Sparkles,
  Target,
} from 'lucide-react';
import { formatDisplayDate, getTodayISO } from '@/lib/dateUtils';
import { TaskModal } from './TaskModal';

interface TasksManagerProps {
  tasks: any[];
  onRefresh: () => void;
}

export function TasksManager({ tasks, onRefresh }: TasksManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [editingTask, setEditingTask] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const todayStr = getTodayISO();

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'ALL' || task.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleDelete = async (taskId: string) => {
    if (
      confirm(
        'Are you sure you want to delete this habit? All tracking records, notes, and streak stats will be permanently removed.'
      )
    ) {
      try {
        const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
        if (res.ok) {
          onRefresh();
        }
      } catch (err) {
        console.error('Delete error:', err);
      }
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Controls: Search, Filter, Create */}
      <div className="glass-card p-4 rounded-2xl flex items-center justify-between gap-4 flex-wrap border border-white/10">
        <div className="flex items-center gap-3 flex-1 min-w-[260px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-mocha-400" />
            <input
              type="text"
              placeholder="Search goals by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-mocha-400 text-xs focus:outline-none focus:border-caramel-500 transition"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold focus:outline-none focus:border-caramel-500 transition"
          >
            <option value="ALL" className="bg-espresso-950 text-white">All Types</option>
            <option value="CHECKBOX" className="bg-espresso-950 text-white">Checkboxes</option>
            <option value="NUMERIC" className="bg-espresso-950 text-white">Numeric</option>
            <option value="TIME" className="bg-espresso-950 text-white">Time</option>
          </select>
        </div>

        <button
          onClick={() => {
            setEditingTask(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white text-xs font-bold shadow-lg shadow-caramel-600/25 hover:shadow-caramel-600/40 hover:opacity-95 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Goal</span>
        </button>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="glass-card p-14 text-center text-mocha-300 space-y-3 rounded-2xl">
          <div className="w-12 h-12 rounded-2xl bg-caramel-500/10 text-caramel-400 flex items-center justify-center mx-auto">
            <Target className="w-6 h-6" />
          </div>
          <p className="text-base font-bold text-white">No habits match criteria</p>
          <p className="text-xs max-w-sm mx-auto">
            Try adjusting your search query or create a new customized habit.
          </p>
          <button
            onClick={() => {
              setEditingTask(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl gradient-primary text-white text-xs font-bold shadow hover:opacity-90 transition mt-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Goal</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTasks.map((task) => {
            const isEnded = task.endDate < todayStr;
            const isNotStarted = task.startDate > todayStr;

            return (
              <div
                key={task.id}
                className="glass-card-interactive p-5 rounded-2xl flex flex-col justify-between gap-4 border border-white/10 hover:border-white/20 transition relative bg-espresso-950/60"
              >
                <div className="space-y-3">
                  {/* Top Bar: Badges & Actions */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full border ${
                            task.type === 'CHECKBOX'
                              ? 'bg-caramel-500/15 text-caramel-300 border-caramel-500/30'
                              : task.type === 'NUMERIC'
                              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                              : 'bg-latte-500/15 text-latte-300 border-latte-500/30'
                          }`}
                        >
                          {task.type}
                        </span>

                        {isEnded ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-mocha-900 text-mocha-300 border border-mocha-800">
                            Completed Cycle
                          </span>
                        ) : isNotStarted ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-caramel-500/20 text-caramel-300 border border-caramel-500/30">
                            Upcoming
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Active
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-black text-white">{task.name}</h3>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => {
                          setEditingTask(task);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-mocha-300 hover:text-white hover:bg-white/10 transition"
                        title="Edit Goal"
                      >
                        <Edit2 className="w-4 h-4 text-caramel-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="p-1.5 rounded-lg text-mocha-300 hover:text-rose-400 hover:bg-rose-500/10 transition"
                        title="Delete Goal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {task.description && (
                    <p className="text-xs text-mocha-300 leading-relaxed line-clamp-2">
                      {task.description}
                    </p>
                  )}

                  {/* Target details */}
                  {task.target && (
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs flex items-center justify-between text-mocha-200">
                      <span className="text-mocha-400">Daily Target:</span>
                      <span className="font-bold text-white font-mono">
                        {task.target.toLocaleString()} {task.unit || ''}
                      </span>
                    </div>
                  )}

                  {/* Dates & Frequency */}
                  <div className="flex items-center gap-3 text-xs text-mocha-300 pt-1 flex-wrap">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-caramel-400" />
                      <span>
                        {formatDisplayDate(task.startDate)} → {formatDisplayDate(task.endDate)}
                      </span>
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] font-bold text-mocha-200 border border-white/5">
                      {task.frequency}
                    </span>
                  </div>

                  {/* Reminders summary */}
                  {task.reminderEnabled && task.reminderTimes?.length > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-amber-300/90 pt-0.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Scheduled Reminders: {task.reminderTimes.join(', ')}</span>
                    </div>
                  )}
                </div>

                {/* Footer KPIs */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                      <Flame className="w-3.5 h-3.5" />
                      <span>{task.metrics?.currentStreak ?? 0}d streak</span>
                    </span>
                    <span className="flex items-center gap-1 text-amber-300 font-semibold">
                      <Trophy className="w-3 h-3 text-amber-400" />
                      <span>{task.metrics?.bestStreak ?? 0}d best</span>
                    </span>
                  </div>

                  <span className="text-emerald-400 font-black font-mono">
                    {task.metrics?.completionRate ?? 0}% success
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}


      {/* Task Modal for editing / creating */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onSaved={onRefresh}
        editingTask={editingTask}
      />
    </div>
  );
}

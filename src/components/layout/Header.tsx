'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Flame, Plus, Check, Clock, Sparkles, X, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onOpenCreateTask?: () => void;
  onRecordUpdated?: () => void;
}

export function Header({ title, subtitle, onOpenCreateTask, onRecordUpdated }: HeaderProps) {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<any[]>([]);
  const [showBellMenu, setShowBellMenu] = useState(false);
  const [loadingReminders, setLoadingReminders] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchReminders = async () => {
    try {
      setLoadingReminders(true);
      const res = await fetch('/api/reminders');
      if (res.ok) {
        const data = await res.json();
        setReminders(data.reminders || []);
      }
    } catch {
      // ignore
    } finally {
      setLoadingReminders(false);
    }
  };

  useEffect(() => {
    fetchReminders();
    const interval = setInterval(fetchReminders, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowBellMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleQuickComplete = async (taskId: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await fetch('/api/records', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, date: today, completed: true }),
      });
      if (res.ok) {
        await fetchReminders();
        if (onRecordUpdated) onRecordUpdated();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="flex items-center justify-between py-4 px-4 sm:px-8 border-b border-white/10 bg-espresso-950/80 backdrop-blur-xl sticky top-0 z-30 transition-all">
      {/* Title & Subtitle */}
      <div className="space-y-0.5">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">{title}</h1>
        </div>
        {subtitle && (
          <p className="text-xs text-mocha-300 font-medium line-clamp-1">{subtitle}</p>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {onOpenCreateTask && (
          <button
            onClick={onOpenCreateTask}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl gradient-primary text-white text-xs font-bold shadow-md shadow-caramel-600/20 hover:shadow-caramel-600/35 hover:opacity-95 transition-all duration-200 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Goal</span>
          </button>
        )}

        {/* Reminder Notification Bell */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => {
              setShowBellMenu(!showBellMenu);
              fetchReminders();
            }}
            className={`relative p-2.5 rounded-xl border transition-all duration-200 ${
              showBellMenu || reminders.length > 0
                ? 'bg-caramel-500/20 border-caramel-500/40 text-caramel-300 shadow-sm'
                : 'bg-white/5 border-white/10 text-mocha-300 hover:text-white hover:bg-white/10'
            }`}
            title="Reminders & Notifications"
          >
            <Bell className="w-4 h-4" />
            {reminders.length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white rounded-full text-[10px] font-black flex items-center justify-center shadow-lg shadow-rose-500/50 animate-bounce">
                {reminders.length}
              </span>
            )}
          </button>

          {/* Reminders Dropdown Menu */}
          {showBellMenu && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl glass-panel p-4 shadow-2xl z-50 border border-white/15 bg-espresso-950/98 backdrop-blur-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">Daily Reminders</h3>
                    <p className="text-[10px] text-mocha-300">Scheduled notifications for today</p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-mocha-200">
                  {reminders.length} pending
                </span>
              </div>

              <div className="mt-3 max-h-72 overflow-y-auto space-y-2">
                {reminders.length === 0 ? (
                  <div className="py-8 text-center space-y-2">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">All Caught Up!</p>
                      <p className="text-[11px] text-mocha-300 mt-0.5">
                        No pending reminders for today. Great job staying on top!
                      </p>
                    </div>
                  </div>
                ) : (
                  reminders.map((rem, idx) => (
                    <div
                      key={`${rem.taskId}-${idx}`}
                      className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 flex items-center justify-between gap-3 transition-all"
                    >
                      <div className="truncate space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white truncate">
                            {rem.taskName}
                          </span>
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {rem.time}
                          </span>
                        </div>
                        {rem.message && (
                          <p className="text-[11px] text-mocha-300 line-clamp-1">{rem.message}</p>
                        )}
                      </div>

                      <button
                        onClick={() => handleQuickComplete(rem.taskId)}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 text-xs font-bold flex items-center gap-1 shrink-0 active:scale-95 transition-all"
                        title="Mark Complete for Today"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Done</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User initials chip on mobile */}
        {user && (
          <div className="md:hidden w-8 h-8 rounded-xl bg-caramel-600/30 border border-caramel-400/30 flex items-center justify-center text-caramel-300 font-bold text-xs">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    </header>

  );
}

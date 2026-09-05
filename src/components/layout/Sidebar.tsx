'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarDays,
  BarChart3,
  ListTodo,
  Flame,
  Sun,
  Moon,
  LogOut,
  PlusCircle,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';
import { useTheme } from '../providers/ThemeProvider';

interface SidebarProps {
  onOpenCreateTask?: () => void;
}

export function Sidebar({ onOpenCreateTask }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      badge: 'Live',
    },
    {
      label: 'Tracking Grid',
      href: '/tracking',
      icon: CalendarDays,
      badge: null,
    },
    {
      label: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      badge: null,
    },
    {
      label: 'My Goals',
      href: '/tasks',
      icon: ListTodo,
      badge: null,
    },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-white/10 bg-slate-950/70 backdrop-blur-2xl p-4 min-h-screen justify-between shrink-0 sticky top-0 h-screen overflow-y-auto">
      {/* Brand & Navigation Header */}
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2 py-1">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-200">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  Momentum
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Goal & Habit Suite</p>
            </div>
          </Link>
        </div>

        {/* Create Task Button */}
        {onOpenCreateTask && (
          <button
            onClick={onOpenCreateTask}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl gradient-primary text-white font-bold text-xs shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:opacity-95 transition-all duration-200 active:scale-[0.98] group"
          >
            <PlusCircle className="w-4 h-4 transition-transform group-hover:rotate-90 duration-200" />
            <span>Create New Goal</span>
          </button>
        )}

        {/* Navigation Categories */}
        <div className="space-y-4">
          <div>
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Workspace
            </span>
            <nav className="mt-2 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all duration-200 relative group ${
                      isActive
                        ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-sm shadow-indigo-500/10'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive
                            ? 'text-indigo-400'
                            : 'text-slate-400 group-hover:text-slate-200'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse">
                        {item.badge}
                      </span>
                    )}

                    {isActive && (
                      <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full gradient-primary" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Quick Motivation Card in Sidebar */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-slate-900/60 border border-indigo-500/20 space-y-2">
            <div className="flex items-center gap-1.5 text-indigo-300 text-xs font-bold">
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              <span>Streak Rule</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Never miss twice. Missing once is an accident; missing twice is the start of a new habit.
            </p>
          </div>
        </div>
      </div>

      {/* Footer / User Profile & Controls */}
      <div className="space-y-3 pt-4 border-t border-white/10">
        {/* User profile card */}
        {user && (
          <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-300 font-bold text-xs shrink-0 shadow-inner">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-200 truncate">{user.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
              </div>
            </div>

            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/10 transition"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-300" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-400" />
              )}
            </button>
          </div>
        )}

        {/* Sign out button */}
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 border border-rose-500/10 hover:border-rose-500/30 transition-all duration-200"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

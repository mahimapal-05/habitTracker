'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CalendarDays, BarChart3, ListTodo, Plus } from 'lucide-react';

interface MobileNavProps {
  onOpenCreateTask?: () => void;
}

export function MobileNav({ onOpenCreateTask }: MobileNavProps) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Grid', href: '/tracking', icon: CalendarDays },
    { label: 'Analytics', href: '/analytics', icon: BarChart3 },
    { label: 'Goals', href: '/tasks', icon: ListTodo },
  ];

  return (
    <nav className="md:hidden fixed bottom-3 left-4 right-4 z-40 bg-slate-900/90 backdrop-blur-2xl border border-white/15 rounded-2xl px-3 py-2 flex items-center justify-around shadow-2xl shadow-black/80">
      {navItems.slice(0, 2).map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[11px] font-bold transition-all duration-200 ${
              isActive
                ? 'text-indigo-400 bg-indigo-500/15'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}

      {onOpenCreateTask && (
        <button
          onClick={onOpenCreateTask}
          className="-mt-6 p-3 rounded-2xl gradient-primary text-white shadow-xl shadow-indigo-500/40 border border-white/20 active:scale-95 transition-all duration-200"
          aria-label="Create New Goal"
        >
          <Plus className="w-5 h-5" />
        </button>
      )}

      {navItems.slice(2).map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[11px] font-bold transition-all duration-200 ${
              isActive
                ? 'text-indigo-400 bg-indigo-500/15'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

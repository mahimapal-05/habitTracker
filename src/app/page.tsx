'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Flame,
  Target,
  Sparkles,
  Calendar,
  BarChart3,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  Layers,
  Award,
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';

export default function HomePage() {
  const { user, loginDemo, loading } = useAuth();
  const router = useRouter();

  const handleLaunchDemo = async () => {
    await loginDemo();
  };

  return (
    <div className="min-h-screen bg-espresso-950 text-mocha-100 flex flex-col justify-between selection:bg-caramel-500 selection:text-white relative overflow-hidden">
      {/* Radiant ambient brown & amber glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-caramel-600/20 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[350px] bg-amber-600/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 left-0 w-[400px] h-[300px] bg-mocha-600/20 blur-[100px] rounded-full pointer-events-none" />

      {/* Navigation */}
      <header className="max-w-7xl w-full mx-auto px-6 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-caramel-500/30">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-tight bg-gradient-to-r from-white via-latte-100 to-mocha-300 bg-clip-text text-transparent">
                Momentum
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-caramel-500/20 text-caramel-300 border border-caramel-500/30">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-mocha-300 font-medium">Goal & Habit Suite</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-white text-xs font-bold shadow-lg shadow-caramel-500/25 hover:opacity-90 transition active:scale-95"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-mocha-200 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition"
              >
                Sign In
              </Link>
              <button
                onClick={handleLaunchDemo}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-white text-xs font-black shadow-lg shadow-caramel-500/30 hover:opacity-95 transition active:scale-95"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>1-Click Demo</span>
              </button>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl w-full mx-auto px-6 py-12 sm:py-20 flex-1 flex flex-col items-center text-center relative z-10 space-y-12">
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-caramel-500/15 border border-caramel-500/30 text-caramel-300 text-xs font-bold shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-caramel-400" />
          <span>Multi-User Goal & Daily Habit Tracking Platform</span>
        </div>

        {/* Hero Title */}
        <div className="space-y-5 max-w-3xl">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1]">
            Build Unstoppable Daily{' '}
            <span className="bg-gradient-to-r from-caramel-300 via-amber-300 to-latte-200 bg-clip-text text-transparent">
              Momentum
            </span>
          </h1>
          <p className="text-base sm:text-lg text-mocha-300 leading-relaxed max-w-2xl mx-auto">
            Personalized habit tracking with custom date durations, task-specific streaks, automatic vs manual completion overrides, and a contextual motivation engine that adapts to your actual performance.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center max-w-md">
          <button
            onClick={handleLaunchDemo}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl gradient-primary text-white font-black text-sm shadow-xl shadow-caramel-500/30 hover:shadow-caramel-500/40 hover:opacity-95 transition-all duration-200 active:scale-98"
          >
            <Zap className="w-4 h-4 text-amber-300" />
            <span>Launch Live Demo Account</span>
          </button>
          <Link
            href="/register"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-sm transition"
          >
            <span>Create Free Account</span>
            <ArrowRight className="w-4 h-4 text-mocha-300" />
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 text-left w-full">
          <div className="glass-card-interactive p-6 rounded-2xl space-y-3.5 border border-white/10 hover:border-caramel-500/40">
            <div className="w-11 h-11 rounded-2xl bg-caramel-500/20 text-caramel-400 flex items-center justify-center border border-caramel-500/30">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-base font-black text-white">Custom Independent Durations</h3>
            <p className="text-xs text-mocha-300 leading-relaxed">
              No rigid weekly or monthly cycles. Set arbitrary start and end dates for every single goal independently.
            </p>
          </div>

          <div className="glass-card-interactive p-6 rounded-2xl space-y-3.5 border border-white/10 hover:border-amber-500/40">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Flame className="w-5 h-5" />
            </div>
            <h3 className="text-base font-black text-white">Task-Specific Streaks</h3>
            <p className="text-xs text-mocha-300 leading-relaxed">
              Streaks are isolated per habit. Monitor current streaks, all-time best streaks, and completion rates with precision.
            </p>
          </div>

          <div className="glass-card-interactive p-6 rounded-2xl space-y-3.5 border border-white/10 hover:border-mocha-400/40">
            <div className="w-11 h-11 rounded-2xl bg-caramel-500/20 text-caramel-300 flex items-center justify-center border border-caramel-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-black text-white">Performance Motivation</h3>
            <p className="text-xs text-mocha-300 leading-relaxed">
              No cliché quotes. Analyzes your real target data, historical personal records, and recovery days for genuine encouragement.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl w-full mx-auto px-6 py-6 border-t border-white/10 text-xs text-mocha-400 flex items-center justify-between flex-wrap gap-4 relative z-10">
        <p>© 2026 Momentum Goal & Habit Tracker. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-mocha-300">
            <ShieldCheck className="w-4 h-4 text-caramel-400" />
            <span>Strict Multi-Tenant Isolation</span>
          </span>
        </div>
      </footer>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Flame, Lock, Mail, ArrowRight, Zap, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';

export default function LoginPage() {
  const { login, loginDemo } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setLoading(true);
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setError(null);
    try {
      setDemoLoading(true);
      await loginDemo();
    } catch (err: any) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-espresso-950 text-mocha-100 flex items-center justify-center p-4 relative overflow-hidden selection:bg-caramel-500 selection:text-white">
      {/* Warm brown radiant glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[550px] h-[400px] bg-caramel-600/20 blur-[140px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md rounded-2xl glass-panel p-8 border border-white/15 bg-espresso-950/95 relative z-10 space-y-6 shadow-2xl backdrop-blur-2xl">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center mx-auto shadow-lg shadow-caramel-500/35">
            <Flame className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Welcome to Momentum</h2>
          <p className="text-xs text-mocha-300">Sign in to track your goals, streaks, and habits</p>
        </div>

        {/* 1-Click Demo Button */}
        <button
          onClick={handleDemo}
          disabled={demoLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-caramel-500/15 border border-caramel-500/35 text-caramel-200 hover:bg-caramel-500/25 text-xs font-black transition-all shadow-sm active:scale-98"
        >
          <Zap className="w-4 h-4 text-amber-400" />
          <span>{demoLoading ? 'Launching Demo...' : '1-Click Instant Demo Login (Pre-populated)'}</span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-white/10 w-full" />
          <span className="bg-espresso-950 px-3 text-[11px] uppercase tracking-wider text-mocha-400 font-bold absolute">
            Or sign in with email
          </span>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-mocha-200 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-mocha-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-mocha-500 text-xs focus:outline-none focus:border-caramel-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-mocha-200 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-mocha-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-mocha-500 text-xs focus:outline-none focus:border-caramel-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-mocha-400 hover:text-mocha-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl gradient-primary text-white font-black text-xs shadow-lg shadow-caramel-500/25 hover:opacity-95 transition-all disabled:opacity-50 active:scale-98"
          >
            <span>{loading ? 'Signing in...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-mocha-400">
          Don't have an account?{' '}
          <Link href="/register" className="text-caramel-400 font-bold hover:underline">
            Register for free
          </Link>
        </p>
      </div>
    </div>
  );
}

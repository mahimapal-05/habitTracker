'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { AnalyticsView } from '@/components/analytics/AnalyticsView';
import { useAuth } from '@/components/providers/AuthProvider';

export default function AnalyticsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-espresso-950 flex items-center justify-center text-mocha-300 text-sm">
        <div className="w-5 h-5 border-2 border-caramel-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AppLayout
      title="Performance & Analytics"
      subtitle="Deep-dive metrics, historical trends, and personal records"
    >
      <AnalyticsView />
    </AppLayout>
  );
}

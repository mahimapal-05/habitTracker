'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { TrackingGrid } from '@/components/tracking/TrackingGrid';
import { useAuth } from '@/components/providers/AuthProvider';

export default function TrackingPage() {
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
      title="Tracking Grid"
      subtitle="Monthly habit matrix and historical execution overview"
    >
      <TrackingGrid />
    </AppLayout>
  );
}

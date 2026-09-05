'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { TasksManager } from '@/components/tasks/TasksManager';
import { useAuth } from '@/components/providers/AuthProvider';

export default function TasksPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<any[]>([]);
  const [fetchingTasks, setFetchingTasks] = useState(true);

  const fetchTasks = async () => {
    try {
      setFetchingTasks(true);
      const res = await fetch('/api/tasks');
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
      } else if (res.status === 401) {
        router.push('/login');
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setFetchingTasks(false);
    }
  };

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else {
        fetchTasks();
      }
    }
  }, [user, loading]);

  if (loading || fetchingTasks) {
    return (
      <div className="min-h-screen bg-espresso-950 flex items-center justify-center text-mocha-300 text-sm">
        <div className="w-5 h-5 border-2 border-caramel-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AppLayout
      title="Goal & Habit Management"
      subtitle="Configure independent durations, goal targets, and notification schedules"
      onRefreshData={fetchTasks}
    >
      <TasksManager tasks={tasks} onRefresh={fetchTasks} />
    </AppLayout>
  );
}

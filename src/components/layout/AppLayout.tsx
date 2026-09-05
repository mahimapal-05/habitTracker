'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { TaskModal } from '../tasks/TaskModal';
import { useAuth } from '../providers/AuthProvider';

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  onRefreshData?: () => void;
}

export function AppLayout({ children, title, subtitle, onRefreshData }: AppLayoutProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { user } = useAuth();

  const handleSaved = () => {
    if (onRefreshData) onRefreshData();
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white antialiased">
      {/* Desktop Sidebar */}
      <Sidebar onOpenCreateTask={() => setIsCreateModalOpen(true)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-24 md:pb-12">
        {/* Top Header */}
        <Header
          title={title}
          subtitle={subtitle}
          onOpenCreateTask={() => setIsCreateModalOpen(true)}
          onRecordUpdated={onRefreshData}
        />

        {/* Page Content Container */}
        <main className="flex-1 px-4 sm:px-8 py-6 sm:py-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Floating Navigation */}
      <MobileNav onOpenCreateTask={() => setIsCreateModalOpen(true)} />

      {/* Global Task Creation / Edit Modal */}
      <TaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSaved={handleSaved}
      />
    </div>
  );
}

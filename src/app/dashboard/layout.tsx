'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/lib/useUserStore';
import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import { ToastContainer, useToast } from '@/lib/useToast';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, user } = useUserStore();
  const { toasts, removeToast } = useToast();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Check if user is authenticated after mount
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Show loading only on client side after hydration
  if (!isMounted) {
    return (
      <div suppressHydrationWarning className="flex h-screen bg-slate-50">
        <Sidebar />
        <div className="flex-1 flex flex-col md:ml-64">
          <div className="hidden md:block h-16 border-b border-slate-200 bg-white sticky top-0 z-20">
            <Navbar />
          </div>
          <main className="flex-1 overflow-auto flex items-center justify-center">
            <div className="text-slate-600">Loading...</div>
          </main>
        </div>
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </div>
    );
  }

  if (!isAuthenticated()) {
    return (
      <div suppressHydrationWarning className="flex h-screen bg-slate-50">
        <Sidebar />
        <div className="flex-1 flex flex-col md:ml-64">
          <div className="hidden md:block h-16 border-b border-slate-200 bg-white sticky top-0 z-20">
            <Navbar />
          </div>
          <main className="flex-1 overflow-auto flex items-center justify-center">
            <div className="text-slate-600">Redirecting to login...</div>
          </main>
        </div>
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-64">
        {/* Desktop Navbar */}
        <div className="hidden md:block h-16 border-b border-slate-200 bg-white sticky top-0 z-20">
          <Navbar />
        </div>
        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">{children}</div>
        </main>
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

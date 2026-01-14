'use client';

import { useEffect } from 'react';
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

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated()) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-64">
        <Navbar />
        <main className="flex-1 overflow-auto pt-16 md:pt-0">
          <div className="p-6">{children}</div>
        </main>
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

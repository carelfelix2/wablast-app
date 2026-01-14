'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/lib/useUserStore';
import { LoginForm } from './form';
import { ToastContainer, useToast } from '@/lib/useToast';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated } = useUserStore();
  const { toasts, removeToast } = useToast();

  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-green-600 mb-2">WABlast</h1>
            <p className="text-slate-600">WhatsApp Business API Dashboard</p>
          </div>

          <LoginForm />

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900 font-medium mb-2">🔓 Demo Mode</p>
            <p className="text-xs text-blue-800">
              Use any email & password (min 6 chars) to access the dashboard and test the interface.
            </p>
          </div>

          <p className="mt-4 text-center text-xs text-slate-600">
            📝 Example: <code className="bg-slate-100 px-2 py-1 rounded">demo@wablast.com</code> / <code className="bg-slate-100 px-2 py-1 rounded">password123</code>
          </p>
        </div>
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
}

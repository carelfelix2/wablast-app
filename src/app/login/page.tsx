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

          <p className="mt-6 text-center text-sm text-slate-600">
            Demo: Use any credentials to test the interface
          </p>
        </div>
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
}

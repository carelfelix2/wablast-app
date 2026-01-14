'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { loginSchema, type LoginFormData } from '@/lib/validations';
import { authService } from '@/services/authService';
import { useToast } from '@/lib/useToast';
import { useUserStore } from '@/lib/useUserStore';

export function LoginForm() {
  const router = useRouter();
  const { success, error: showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      // Try real API first
      try {
        const response = await authService.login(data);
        success(`Welcome back, ${response.user.name}!`);
        router.push('/dashboard');
      } catch (apiErr: any) {
        // Debug: log the actual error
        console.log('Login API Error:', {
          code: apiErr.code,
          message: apiErr.message,
          response: apiErr.response?.status,
          hasResponse: !!apiErr.response,
        });

        // Check if it's a network error (API unavailable)
        const isNetworkError = 
          !apiErr.response || 
          apiErr.code === 'ECONNREFUSED' || 
          apiErr.code === 'ENOTFOUND' ||
          apiErr.message?.includes('ECONNREFUSED') ||
          apiErr.message?.includes('ENOTFOUND') ||
          apiErr.message?.includes('Failed to fetch');

        if (isNetworkError) {
          // Mock login - accept any credentials for demo
          const mockUser = {
            id: 'demo-user-' + Date.now(),
            email: data.email,
            name: data.email.split('@')[0],
            apiKey: 'sk_demo_' + Math.random().toString(36).substr(2, 9),
          };

          // Save to Zustand store (will persist automatically via middleware)
          const mockToken = 'demo_token_' + Date.now();
          useUserStore.getState().setUser(mockUser);
          useUserStore.getState().setToken(mockToken);

          console.log('Mock login successful:', mockUser);
          success(`✓ Welcome ${mockUser.name}! (Demo Mode)`);
          
          // Small delay to ensure store is persisted before redirect
          setTimeout(() => {
            router.push('/dashboard');
          }, 100);
        } else {
          // Real API error (invalid credentials, etc)
          const errorMessage =
            apiErr.response?.data?.message ||
            apiErr.message ||
            'Login failed. Please check your credentials.';
          showError(errorMessage);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700">
          Email
        </label>
        <Input
          id="email"
          type="email"
          placeholder="your@email.com"
          {...register('email')}
          className="mt-1"
          disabled={isLoading}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-700">
          Password
        </label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          {...register('password')}
          className="mt-1"
          disabled={isLoading}
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full bg-green-600 hover:bg-green-700"
        disabled={isLoading}
      >
        {isLoading ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import React from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

let toastId = 0;

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: ToastType = 'info') => {
    const id = `${toastId++}-${Date.now()}`;
    const toast: Toast = { id, message, type };
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => {
      removeToast(id);
    }, 5000);
    return id;
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return {
    toasts,
    addToast,
    removeToast,
    success: (message: string) => addToast(message, 'success'),
    error: (message: string) => addToast(message, 'error'),
    info: (message: string) => addToast(message, 'info'),
  };
};

interface ToastContainerProps {
  toasts: Toast[];
  removeToast: (id: string) => void;
}

export const ToastContainer = React.memo(
  function ToastContainerComponent({ toasts, removeToast }: ToastContainerProps) {
    return React.createElement(
      'div',
      { className: 'fixed bottom-4 right-4 z-50 space-y-2' },
      toasts.map((toast) => {
        let bgColor = 'bg-blue-600';
        let IconComponent = Info;

        if (toast.type === 'success') {
          bgColor = 'bg-green-600';
          IconComponent = CheckCircle;
        } else if (toast.type === 'error') {
          bgColor = 'bg-red-600';
          IconComponent = AlertCircle;
        }

        return React.createElement(
          'div',
          {
            key: toast.id,
            className: `flex items-center gap-3 px-4 py-3 rounded-lg text-white shadow-lg animate-in fade-in slide-in-from-right-full ${bgColor}`,
          },
          React.createElement(IconComponent, { size: 20 }),
          React.createElement(
            'span',
            { className: 'flex-1' },
            toast.message
          ),
          React.createElement(
            'button',
            {
              onClick: () => removeToast(toast.id),
              className: 'hover:opacity-75',
            },
            React.createElement(X, { size: 16 })
          )
        );
      })
    );
  }
);

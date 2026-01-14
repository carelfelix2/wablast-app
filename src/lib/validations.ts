import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const sendMessageSchema = z.object({
  to: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^\d+$/, 'Phone number must contain only digits'),
  body: z
    .string()
    .min(1, 'Message is required')
    .min(1, 'Message cannot be empty')
    .max(4096, 'Message is too long'),
});

export type SendMessageFormData = z.infer<typeof sendMessageSchema>;

export const createInstanceSchema = z.object({
  name: z
    .string()
    .min(1, 'Instance name is required')
    .min(2, 'Instance name must be at least 2 characters')
    .max(50, 'Instance name must be less than 50 characters'),
});

export type CreateInstanceFormData = z.infer<typeof createInstanceSchema>;

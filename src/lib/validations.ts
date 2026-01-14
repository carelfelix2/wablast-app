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
    .regex(/^62\d{9,13}$/, 'Phone number must start with 62 and have 11-15 digits'),
  body: z
    .string()
    .min(1, 'Message is required')
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

// Phonebook validation schemas
export const createContactSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long'),
  phoneNumber: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^62\d{9,13}$/, 'Phone number must start with 62 and have 11-15 digits'),
  notes: z.string().max(500, 'Notes is too long').optional().or(z.literal('')),
  groupId: z.string().optional().or(z.literal('')),
  status: z.enum(['active', 'inactive']).optional(),
});

export type CreateContactFormData = z.infer<typeof createContactSchema>;

export const createGroupSchema = z.object({
  groupName: z
    .string()
    .min(1, 'Group name is required')
    .min(2, 'Group name must be at least 2 characters')
    .max(100, 'Group name is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
});

export type CreateGroupFormData = z.infer<typeof createGroupSchema>;

export const broadcastToGroupSchema = z.object({
  message: z
    .string()
    .min(1, 'Message is required')
    .max(4096, 'Message is too long'),
  instanceId: z.string().min(1, 'Instance is required'),
});

export type BroadcastToGroupFormData = z.infer<typeof broadcastToGroupSchema>;

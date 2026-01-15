'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Plus, Trash2, Clock, X } from 'lucide-react';
import { useToast } from '@/lib/useToast';
import { scheduleService, type ScheduledMessage } from '@/services/scheduleService';
import { instanceService, type Instance } from '@/services/instanceService';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import dayjs from 'dayjs';

const scheduleSchema = z.object({
  recipients: z.string().min(1, 'Recipients are required'),
  message: z
    .string()
    .min(1, 'Message is required')
    .max(4096, 'Message is too long'),
  scheduledAt: z.string().min(1, 'Scheduled date and time is required'),
});

type ScheduleFormInput = z.input<typeof scheduleSchema>;

export default function SchedulePage() {
  const { success, error: showError, info } = useToast();
  const [instances, setInstances] = useState<Instance[]>([]);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string>('');
  const [scheduledMessages, setScheduledMessages] = useState<ScheduledMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ScheduleFormInput>({
    resolver: zodResolver(scheduleSchema),
  });

  useEffect(() => {
    loadInstances();
  }, []);

  const loadInstances = async () => {
    try {
      const data = await instanceService.getInstances();
      setInstances(data);
      if (data.length > 0) {
        setSelectedInstanceId(data[0].id);
      }
    } catch (error) {
      showError('Failed to load instances');
    }
  };

  useEffect(() => {
    if (selectedInstanceId) {
      loadScheduledMessages();
    }
  }, [selectedInstanceId]);

  const loadScheduledMessages = async () => {
    setIsLoading(true);
    try {
      const data = await scheduleService.getScheduledMessages(selectedInstanceId);
      setScheduledMessages(data);
    } catch (error) {
      showError('Failed to load scheduled messages');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ScheduleFormInput) => {
    setIsSubmitting(true);
    try {
      const recipientsArray = data.recipients
        .split('\n')
        .map((x) => x.trim())
        .filter((x) => x);
      await scheduleService.createSchedule({
        instanceId: selectedInstanceId,
        recipients: recipientsArray,
        message: data.message,
        scheduledAt: data.scheduledAt,
      });
      success('Message scheduled successfully');
      reset();
      setIsDialogOpen(false);
      loadScheduledMessages();
    } catch (error) {
      showError('Failed to schedule message');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this scheduled message?')) return;
    try {
      await scheduleService.cancelSchedule(id);
      success('Scheduled message cancelled');
      loadScheduledMessages();
    } catch (error) {
      showError('Failed to cancel scheduled message');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this scheduled message?')) return;
    try {
      await scheduleService.deleteSchedule(id);
      success('Scheduled message deleted');
      loadScheduledMessages();
    } catch (error) {
      showError('Failed to delete scheduled message');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-slate-100 text-slate-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Schedule Messages</h1>
          <p className="text-slate-600 mt-1">
            Schedule WhatsApp messages to be sent at a later time
          </p>
        </div>
        <Button
          onClick={() => {
            reset();
            setIsDialogOpen(true);
          }}
          className="bg-green-600 hover:bg-green-700 gap-2"
          disabled={!selectedInstanceId}
        >
          <Plus size={20} />
          Schedule Message
        </Button>
      </div>

      {/* Instance Selection */}
      <Card className="p-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Select Instance
        </label>
        <select
          value={selectedInstanceId}
          onChange={(e) => setSelectedInstanceId(e.target.value)}
          disabled={instances.length === 0}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">Choose an instance</option>
          {instances.map((inst) => (
            <option key={inst.id} value={inst.id}>
              {inst.name}
            </option>
          ))}
        </select>
      </Card>

      {/* Scheduled Messages List */}
      <Card>
        {isLoading ? (
          <div className="p-8 text-center text-slate-600">
            Loading scheduled messages...
          </div>
        ) : scheduledMessages.length === 0 ? (
          <div className="p-8 text-center text-slate-600">
            No scheduled messages yet. Schedule one to get started.
          </div>
        ) : (
          <div className="space-y-3 p-6">
            {scheduledMessages.map((msg) => (
              <div
                key={msg.id}
                className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={16} className="text-slate-500" />
                    <span className="font-semibold text-slate-900">
                      {dayjs(msg.scheduledAt).format('DD/MM/YYYY HH:mm')}
                    </span>
                    <Badge className={getStatusColor(msg.status)}>
                      {msg.status}
                    </Badge>
                  </div>
                  <div className="mb-2">
                    <p className="text-sm font-medium text-slate-700">
                      Recipients: {msg.recipients.join(', ')}
                    </p>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2">
                    {msg.message}
                  </p>
                </div>
                <div className="flex gap-2">
                  {msg.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancel(msg.id)}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(msg.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </>
                  )}
                  {msg.status !== 'pending' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(msg.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Schedule Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Message</DialogTitle>
            <DialogDescription>
              Schedule a message to be sent at a specific time
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Recipients <span className="text-red-500">*</span>
              </label>
              <textarea
                placeholder="Enter phone numbers, one per line. Example:&#10;628123456789&#10;628123456790"
                {...register('recipients')}
                disabled={isSubmitting}
                rows={4}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 font-mono text-sm"
              />
              {errors.recipients && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.recipients.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                placeholder="Type your message here"
                {...register('message')}
                disabled={isSubmitting}
                rows={5}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {errors.message && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.message.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Schedule Date & Time <span className="text-red-500">*</span>
              </label>
              <Input
                type="datetime-local"
                {...register('scheduledAt')}
                disabled={isSubmitting}
                className="mt-1"
              />
              {errors.scheduledAt && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.scheduledAt.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Scheduling...' : 'Schedule Message'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

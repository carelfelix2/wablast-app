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
import { Plus, Trash2, Edit2, Power, TestTube, ExternalLink } from 'lucide-react';
import { useToast } from '@/lib/useToast';
import { webhookService, type WebhookConfig, type WebhookLog } from '@/services/webhookService';
import { instanceService, type Instance } from '@/services/instanceService';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import dayjs from 'dayjs';

const webhookSchema = z.object({
  url: z.string().url('Valid URL required'),
  events: z.string(),
});

type WebhookFormInput = z.input<typeof webhookSchema>;

interface DialogState {
  type: 'webhook' | 'logs' | null;
  isOpen: boolean;
  editingWebhook?: WebhookConfig;
  selectedWebhookId?: string;
}

export default function WebhooksPage() {
  const { success, error: showError, info } = useToast();
  const [instances, setInstances] = useState<Instance[]>([]);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string>('');
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  const [availableEvents, setAvailableEvents] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogState, setDialogState] = useState<DialogState>({
    type: null,
    isOpen: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<WebhookFormInput>({
    resolver: zodResolver(webhookSchema),
  });

  useEffect(() => {
    loadInstances();
    loadAvailableEvents();
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

  const loadAvailableEvents = async () => {
    try {
      const data = await webhookService.getAvailableEvents();
      setAvailableEvents(data);
    } catch (error) {
      console.error('Failed to load available events');
    }
  };

  useEffect(() => {
    if (selectedInstanceId) {
      loadWebhooks();
    }
  }, [selectedInstanceId]);

  const loadWebhooks = async () => {
    setIsLoading(true);
    try {
      const data = await webhookService.getWebhooks(selectedInstanceId);
      setWebhooks(data);
    } catch (error) {
      showError('Failed to load webhooks');
    } finally {
      setIsLoading(false);
    }
  };

  const loadWebhookLogs = async (webhookId: string) => {
    try {
      const data = await webhookService.getWebhookLogs(webhookId);
      setWebhookLogs(data);
    } catch (error) {
      showError('Failed to load webhook logs');
    }
  };

  const onSubmit = async (data: WebhookFormInput) => {
    setIsSubmitting(true);
    try {
      const eventsArray = data.events
        .split('\n')
        .map((x) => x.trim())
        .filter((x) => x);
      if (dialogState.editingWebhook) {
        await webhookService.updateWebhook(dialogState.editingWebhook.id, {
          instanceId: selectedInstanceId,
          url: data.url,
          events: eventsArray,
        });
        success('Webhook updated successfully');
      } else {
        await webhookService.registerWebhook({
          instanceId: selectedInstanceId,
          url: data.url,
          events: eventsArray,
        });
        success('Webhook registered successfully');
      }
      reset();
      setDialogState({ type: null, isOpen: false });
      loadWebhooks();
    } catch (error) {
      showError('Failed to save webhook');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) return;
    try {
      await webhookService.deleteWebhook(id);
      success('Webhook deleted successfully');
      loadWebhooks();
    } catch (error) {
      showError('Failed to delete webhook');
    }
  };

  const handleToggle = async (webhook: WebhookConfig) => {
    try {
      await webhookService.toggleWebhook(webhook.id, !webhook.isActive);
      success(
        webhook.isActive
          ? 'Webhook disabled'
          : 'Webhook enabled'
      );
      loadWebhooks();
    } catch (error) {
      showError('Failed to toggle webhook');
    }
  };

  const handleTestWebhook = async (id: string) => {
    setIsTesting(true);
    try {
      const result = await webhookService.testWebhook(id);
      if (result.success) {
        success(
          `Webhook test successful (Status: ${result.statusCode})`
        );
      } else {
        showError(`Webhook test failed: ${result.error}`);
      }
    } catch (error) {
      showError('Failed to test webhook');
    } finally {
      setIsTesting(false);
    }
  };

  const openWebhookDialog = (webhook?: WebhookConfig) => {
    if (webhook) {
      reset({
        url: webhook.url,
        events: webhook.events.join('\n') as any,
      });
      setDialogState({
        type: 'webhook',
        isOpen: true,
        editingWebhook: webhook,
      });
    } else {
      reset({
        url: '',
        events: '',
      });
      setDialogState({ type: 'webhook', isOpen: true });
    }
  };

  const openLogsDialog = (webhookId: string) => {
    loadWebhookLogs(webhookId);
    setDialogState({
      type: 'logs',
      isOpen: true,
      selectedWebhookId: webhookId,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Webhooks</h1>
          <p className="text-slate-600 mt-1">
            Manage webhook endpoints for real-time events
          </p>
        </div>
        <Button
          onClick={() => openWebhookDialog()}
          className="bg-green-600 hover:bg-green-700 gap-2"
          disabled={!selectedInstanceId}
        >
          <Plus size={20} />
          Register Webhook
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

      {/* Info Card */}
      <Card className="p-4 bg-blue-50 border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">About Webhooks</h3>
        <p className="text-sm text-blue-800">
          Webhooks allow you to receive real-time notifications when events occur in your WhatsApp instance. 
          You must provide a publicly accessible HTTPS URL to receive webhook payloads.
        </p>
      </Card>

      {/* Webhooks List */}
      <Card>
        {isLoading ? (
          <div className="p-8 text-center text-slate-600">
            Loading webhooks...
          </div>
        ) : webhooks.length === 0 ? (
          <div className="p-8 text-center text-slate-600">
            No webhooks configured yet. Register one to get started.
          </div>
        ) : (
          <div className="space-y-3 p-6">
            {webhooks.map((webhook) => (
              <div
                key={webhook.id}
                className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      className={
                        webhook.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }
                    >
                      {webhook.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    {webhook.failureCount > 0 && (
                      <Badge className="bg-orange-100 text-orange-800">
                        {webhook.failureCount} failures
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm font-medium text-slate-900 break-all mb-2">
                    {webhook.url}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {webhook.events.map((event) => (
                      <Badge
                        key={event}
                        className="bg-purple-100 text-purple-800 text-xs"
                      >
                        {event}
                      </Badge>
                    ))}
                  </div>
                  {webhook.lastEventAt && (
                    <p className="text-xs text-slate-500">
                      Last event: {dayjs(webhook.lastEventAt).format('DD/MM/YYYY HH:mm:ss')}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTestWebhook(webhook.id)}
                    disabled={isTesting}
                  >
                    <TestTube size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openLogsDialog(webhook.id)}
                  >
                    Logs
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggle(webhook)}
                  >
                    <Power size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openWebhookDialog(webhook)}
                  >
                    <Edit2 size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(webhook.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Webhook Dialog */}
      <Dialog
        open={dialogState.type === 'webhook' && dialogState.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDialogState({ type: null, isOpen: false });
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogState.editingWebhook ? 'Edit Webhook' : 'Register Webhook'}
            </DialogTitle>
            <DialogDescription>
              Configure a webhook endpoint to receive events
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Webhook URL <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="https://yourapp.com/webhook"
                {...register('url')}
                disabled={isSubmitting}
                className="mt-1"
              />
              {errors.url && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.url.message}
                </p>
              )}
              <p className="mt-1 text-xs text-slate-500">
                Must be a valid HTTPS URL accessible from the internet
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Events to Subscribe <span className="text-red-500">*</span>
              </label>
              <textarea
                placeholder="Select events (one per line)"
                {...register('events')}
                disabled={isSubmitting}
                rows={6}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 font-mono text-sm"
              />
              {errors.events && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.events.message}
                </p>
              )}
              <div className="mt-2 max-h-32 overflow-y-auto p-2 bg-slate-50 rounded border border-slate-200">
                <p className="text-xs font-medium text-slate-700 mb-2">
                  Available Events:
                </p>
                <div className="space-y-1">
                  {availableEvents.map((event) => (
                    <div key={event} className="text-xs text-slate-600">
                      • {event}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setDialogState({ type: null, isOpen: false })
                }
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? 'Saving...'
                  : dialogState.editingWebhook
                    ? 'Update Webhook'
                    : 'Register Webhook'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Webhook Logs Dialog */}
      <Dialog
        open={dialogState.type === 'logs' && dialogState.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDialogState({ type: null, isOpen: false });
          }
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Webhook Logs</DialogTitle>
            <DialogDescription>
              Recent webhook delivery attempts
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {webhookLogs.length === 0 ? (
              <div className="text-center text-slate-600 py-8">
                No logs available
              </div>
            ) : (
              webhookLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 border border-slate-200 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm text-slate-900">
                      {log.event}
                    </span>
                    <Badge
                      className={
                        log.status === 'success'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }
                    >
                      {log.status}
                      {log.statusCode && ` (${log.statusCode})`}
                    </Badge>
                  </div>
                  {log.errorMessage && (
                    <p className="text-xs text-red-600 mb-2">
                      Error: {log.errorMessage}
                    </p>
                  )}
                  <p className="text-xs text-slate-500">
                    {dayjs(log.createdAt).format('DD/MM/YYYY HH:mm:ss')}
                  </p>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

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
import { Plus, Trash2, Edit2, Power } from 'lucide-react';
import { useToast } from '@/lib/useToast';
import { autoReplyService, type AutoReplyRule } from '@/services/autoReplyService';
import { instanceService, type Instance } from '@/services/instanceService';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const autoReplySchema = z.object({
  keyword: z
    .string()
    .min(1, 'Keyword is required')
    .min(2, 'Keyword must be at least 2 characters'),
  matchType: z.enum(['exact', 'contains', 'regex']),
  replyMessage: z
    .string()
    .min(1, 'Reply message is required')
    .max(4096, 'Reply message is too long'),
});

type AutoReplyFormData = z.infer<typeof autoReplySchema>;

export default function AutoReplyPage() {
  const { success, error: showError, info } = useToast();
  const [instances, setInstances] = useState<Instance[]>([]);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string>('');
  const [rules, setRules] = useState<AutoReplyRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AutoReplyRule | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<AutoReplyFormData>({
    resolver: zodResolver(autoReplySchema),
  });

  const matchType = watch('matchType');

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
      loadRules();
    }
  }, [selectedInstanceId]);

  const loadRules = async () => {
    setIsLoading(true);
    try {
      const data = await autoReplyService.getAutoReplies(selectedInstanceId);
      setRules(data);
    } catch (error) {
      showError('Failed to load auto-reply rules');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: AutoReplyFormData) => {
    setIsSubmitting(true);
    try {
      if (editingRule) {
        await autoReplyService.updateAutoReply({
          ...data,
          instanceId: selectedInstanceId,
          id: editingRule.id,
        });
        success('Auto-reply rule updated successfully');
      } else {
        await autoReplyService.createAutoReply({
          ...data,
          instanceId: selectedInstanceId,
        });
        success('Auto-reply rule created successfully');
      }
      reset();
      setIsDialogOpen(false);
      setEditingRule(null);
      loadRules();
    } catch (error) {
      showError('Failed to save auto-reply rule');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this rule?')) return;
    try {
      await autoReplyService.deleteAutoReply(id);
      success('Auto-reply rule deleted successfully');
      loadRules();
    } catch (error) {
      showError('Failed to delete auto-reply rule');
    }
  };

  const handleToggle = async (rule: AutoReplyRule) => {
    try {
      await autoReplyService.toggleAutoReply(rule.id, !rule.isActive);
      success(
        rule.isActive
          ? 'Auto-reply rule disabled'
          : 'Auto-reply rule enabled'
      );
      loadRules();
    } catch (error) {
      showError('Failed to toggle auto-reply rule');
    }
  };

  const openDialog = (rule?: AutoReplyRule) => {
    setEditingRule(rule || null);
    if (rule) {
      reset({
        keyword: rule.keyword,
        matchType: rule.matchType,
        replyMessage: rule.replyMessage,
      });
    } else {
      reset();
    }
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Auto Reply</h1>
          <p className="text-slate-600 mt-1">
            Manage automatic reply rules for your WhatsApp instance
          </p>
        </div>
        <Button
          onClick={() => openDialog()}
          className="bg-green-600 hover:bg-green-700 gap-2"
          disabled={!selectedInstanceId}
        >
          <Plus size={20} />
          Add Rule
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

      {/* Rules List */}
      <Card>
        {isLoading ? (
          <div className="p-8 text-center text-slate-600">Loading rules...</div>
        ) : rules.length === 0 ? (
          <div className="p-8 text-center text-slate-600">
            No auto-reply rules yet. Create one to get started.
          </div>
        ) : (
          <div className="space-y-3 p-6">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-slate-900">
                      {rule.keyword}
                    </h3>
                    <Badge
                      className={
                        rule.matchType === 'exact'
                          ? 'bg-blue-100 text-blue-800'
                          : rule.matchType === 'contains'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-orange-100 text-orange-800'
                      }
                    >
                      {rule.matchType}
                    </Badge>
                    <Badge
                      className={
                        rule.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }
                    >
                      {rule.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600">{rule.replyMessage}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggle(rule)}
                  >
                    <Power size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openDialog(rule)}
                  >
                    <Edit2 size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(rule.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingRule ? 'Edit Auto Reply Rule' : 'Create Auto Reply Rule'}
            </DialogTitle>
            <DialogDescription>
              Set up automatic replies based on keywords
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Keyword <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g., hello, help, support"
                {...register('keyword')}
                disabled={isSubmitting}
                className="mt-1"
              />
              {errors.keyword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.keyword.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Match Type <span className="text-red-500">*</span>
              </label>
              <select
                {...register('matchType')}
                disabled={isSubmitting}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="exact">Exact Match</option>
                <option value="contains">Contains</option>
                <option value="regex">Regex</option>
              </select>
              {errors.matchType && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.matchType.message}
                </p>
              )}
              <p className="mt-1 text-xs text-slate-500">
                {matchType === 'exact' &&
                  'Reply only if message is exactly this keyword'}
                {matchType === 'contains' &&
                  'Reply if message contains this keyword'}
                {matchType === 'regex' && 'Reply if message matches this regex'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Reply Message <span className="text-red-500">*</span>
              </label>
              <textarea
                placeholder="Type your automatic reply message here"
                {...register('replyMessage')}
                disabled={isSubmitting}
                rows={5}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {errors.replyMessage && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.replyMessage.message}
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
                {isSubmitting
                  ? 'Saving...'
                  : editingRule
                    ? 'Update Rule'
                    : 'Create Rule'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

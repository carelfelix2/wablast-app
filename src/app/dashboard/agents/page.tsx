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
import { Plus, Trash2, Edit2, Users, Settings } from 'lucide-react';
import { useToast } from '@/lib/useToast';
import { agentService, type Agent, type RoutingRule } from '@/services/agentService';
import { instanceService, type Instance } from '@/services/instanceService';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const agentSchema = z.object({
  name: z
    .string()
    .min(1, 'Agent name is required')
    .min(2, 'Agent name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Valid email required'),
  phoneNumber: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^62\d{9,13}$/.test(val),
      'Valid phone number required'
    ),
  maxConversations: z
    .number()
    .min(1, 'Max conversations must be at least 1')
    .max(100, 'Max conversations cannot exceed 100'),
  // Keep as string in the form; we'll convert to array on submit
  keywords: z.string().optional().default(''),
});

type AgentFormData = z.infer<typeof agentSchema>;

interface DialogState {
  type: 'agent' | 'routing' | null;
  isOpen: boolean;
  editingAgent?: Agent;
}

export default function AgentsPage() {
  const { success, error: showError, info } = useToast();
  const [instances, setInstances] = useState<Instance[]>([]);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string>('');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [routingRules, setRoutingRules] = useState<RoutingRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogState, setDialogState] = useState<DialogState>({
    type: null,
    isOpen: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AgentFormData>({
    resolver: zodResolver(agentSchema),
    defaultValues: {
      maxConversations: 10,
    },
  });

  useEffect(() => {
    loadInstances();
    loadAgents();
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

  const loadAgents = async () => {
    setIsLoading(true);
    try {
      const data = await agentService.getAgents();
      setAgents(data);
    } catch (error) {
      showError('Failed to load agents');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedInstanceId) {
      loadRoutingRules();
    }
  }, [selectedInstanceId]);

  const loadRoutingRules = async () => {
    try {
      const data = await agentService.getRoutingRules(selectedInstanceId);
      setRoutingRules(data);
    } catch (error) {
      console.error('Failed to load routing rules');
    }
  };

  const onSubmitAgent = async (data: AgentFormData) => {
    setIsSubmitting(true);
    try {
      const keywordsArray = (data.keywords || '')
        .split(',')
        .map((k) => k.trim())
        .filter((k) => k);
      if (dialogState.editingAgent) {
        await agentService.updateAgent({
          name: data.name,
          email: data.email,
          phoneNumber: data.phoneNumber,
          maxConversations: data.maxConversations,
          keywords: keywordsArray,
          id: dialogState.editingAgent.id,
        });
        success('Agent updated successfully');
      } else {
        await agentService.createAgent({
          name: data.name,
          email: data.email,
          phoneNumber: data.phoneNumber,
          maxConversations: data.maxConversations,
          keywords: keywordsArray,
        });
        success('Agent created successfully');
      }
      reset();
      setDialogState({ type: null, isOpen: false });
      loadAgents();
    } catch (error) {
      showError('Failed to save agent');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAgent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this agent?')) return;
    try {
      await agentService.deleteAgent(id);
      success('Agent deleted successfully');
      loadAgents();
    } catch (error) {
      showError('Failed to delete agent');
    }
  };

  const handleDeleteRoutingRule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this routing rule?')) return;
    try {
      await agentService.deleteRoutingRule(id);
      success('Routing rule deleted successfully');
      loadRoutingRules();
    } catch (error) {
      showError('Failed to delete routing rule');
    }
  };

  const openAgentDialog = (agent?: Agent) => {
    if (agent) {
      reset({
        name: agent.name,
        email: agent.email,
        phoneNumber: agent.phoneNumber,
        maxConversations: agent.maxConversations,
        keywords: agent.keywords.join(', '),
      });
      setDialogState({ type: 'agent', isOpen: true, editingAgent: agent });
    } else {
      reset();
      setDialogState({ type: 'agent', isOpen: true });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-100 text-green-800';
      case 'busy':
        return 'bg-yellow-100 text-yellow-800';
      case 'offline':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Agents</h1>
          <p className="text-slate-600 mt-1">
            Manage support agents and conversation routing
          </p>
        </div>
        <Button
          onClick={() => openAgentDialog()}
          className="bg-green-600 hover:bg-green-700 gap-2"
        >
          <Plus size={20} />
          Add Agent
        </Button>
      </div>

      {/* Instance Selection */}
      <Card className="p-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Select Instance (for Routing Rules)
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

      {/* Agents List */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Users size={20} />
            Support Agents
          </h2>
          {isLoading ? (
            <div className="text-center text-slate-600">Loading agents...</div>
          ) : agents.length === 0 ? (
            <div className="text-center text-slate-600">
              No agents yet. Add one to get started.
            </div>
          ) : (
            <div className="space-y-3">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-slate-900">
                        {agent.name}
                      </h3>
                      <Badge className={getStatusColor(agent.status)}>
                        {agent.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{agent.email}</p>
                    <div className="flex flex-wrap gap-1">
                      {agent.keywords.map((kw) => (
                        <Badge
                          key={kw}
                          className="bg-blue-100 text-blue-800 text-xs"
                        >
                          {kw}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      {agent.assignedConversations} / {agent.maxConversations}{' '}
                      conversations
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openAgentDialog(agent)}
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteAgent(agent.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Routing Rules */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Settings size={20} />
            Conversation Routing Rules
          </h2>
          {routingRules.length === 0 ? (
            <div className="text-center text-slate-600">
              No routing rules configured yet.
            </div>
          ) : (
            <div className="space-y-3">
              {routingRules.map((rule) => {
                const assignedAgent = agents.find(
                  (a) => a.id === rule.assignedAgentId
                );
                return (
                  <div
                    key={rule.id}
                    className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-purple-100 text-purple-800">
                          {rule.keyword}
                        </Badge>
                        <span className="text-sm font-medium text-slate-700">
                          → {assignedAgent?.name || 'Unknown Agent'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Priority: {rule.priority}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteRoutingRule(rule.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      {/* Add/Edit Agent Dialog */}
      <Dialog
        open={dialogState.type === 'agent' && dialogState.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDialogState({ type: null, isOpen: false });
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogState.editingAgent ? 'Edit Agent' : 'Add Agent'}
            </DialogTitle>
            <DialogDescription>
              Manage support agent information
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmitAgent)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Name <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Agent name"
                {...register('name')}
                disabled={isSubmitting}
                className="mt-1"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Email <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                placeholder="agent@example.com"
                {...register('email')}
                disabled={isSubmitting}
                className="mt-1"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Phone Number
              </label>
              <Input
                placeholder="628123456789"
                {...register('phoneNumber')}
                disabled={isSubmitting}
                className="mt-1"
              />
              {errors.phoneNumber && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.phoneNumber.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Max Conversations <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                min="1"
                max="100"
                {...register('maxConversations', { valueAsNumber: true })}
                disabled={isSubmitting}
                className="mt-1"
              />
              {errors.maxConversations && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.maxConversations.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Keywords (comma-separated)
              </label>
              <Input
                placeholder="e.g., support, help, issue"
                {...register('keywords')}
                disabled={isSubmitting}
                className="mt-1"
              />
              {errors.keywords && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.keywords.message}
                </p>
              )}
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
                  : dialogState.editingAgent
                    ? 'Update Agent'
                    : 'Add Agent'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

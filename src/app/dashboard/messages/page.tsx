'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { messageService, type Message } from '@/services/messageService';
import { instanceService, type Instance } from '@/services/instanceService';
import { useToast } from '@/lib/useToast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { sendMessageSchema } from '@/lib/validations';

export default function MessagesPage() {
  const { success, error: showError, info } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [instances, setInstances] = useState<Instance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(sendMessageSchema),
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [instancesData, messagesData] = await Promise.all([
        instanceService.getInstances(),
        messageService.getMessages(),
      ]);

      setInstances(instancesData);
      setMessages(messagesData);

      if (instancesData.length > 0 && !selectedInstanceId) {
        setSelectedInstanceId(instancesData[0].id);
      }
    } catch (error) {
      info('Using demo messages');
      // Demo data
      setInstances([
        {
          id: '1',
          name: 'Main Instance',
          status: 'connected',
          phone: '62812345678',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);

      setMessages([
        {
          id: '1',
          instanceId: '1',
          to: '6287123456789',
          body: 'Hello! This is a test message',
          status: 'sent',
          sentAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          instanceId: '1',
          to: '6287654321098',
          body: 'Welcome to WABlast API',
          status: 'sent',
          sentAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
      ]);

      setSelectedInstanceId('1');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onSubmit = async (data: any) => {
    if (!selectedInstanceId) {
      showError('Please select an instance first');
      return;
    }

    setIsSending(true);
    try {
      const newMessage = await messageService.sendMessage({
        instanceId: selectedInstanceId,
        to: data.to,
        body: data.body,
      });

      setMessages([newMessage, ...messages]);
      reset();
      success('Message sent successfully!');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to send message';
      showError(errorMsg);
    } finally {
      setIsSending(false);
    }
  };

  const filteredMessages = selectedInstanceId
    ? messages.filter((m) => m.instanceId === selectedInstanceId)
    : messages;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Messages</h1>
        <p className="text-slate-600 mt-1">
          Send and track your WhatsApp messages
        </p>
      </div>

      {/* Send Message Form */}
      <Card className="p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Send Message</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Instance
              </label>
              <select
                value={selectedInstanceId}
                onChange={(e) => setSelectedInstanceId(e.target.value)}
                disabled={isSending || instances.length === 0}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select Instance</option>
                {instances.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Phone Number
              </label>
              <Input
                placeholder="6287123456789"
                {...register('to')}
                disabled={isSending}
                className="mt-1"
              />
              {errors.to && (
                <p className="mt-1 text-sm text-red-600">
                  {(errors.to as any).message}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">
                Message
              </label>
              <Input
                placeholder="Type your message..."
                {...register('body')}
                disabled={isSending}
                className="mt-1"
              />
              {errors.body && (
                <p className="mt-1 text-sm text-red-600">
                  {(errors.body as any).message}
                </p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="bg-green-600 hover:bg-green-700 gap-2 w-full md:w-auto"
            disabled={isSending || !selectedInstanceId}
          >
            <Send size={20} />
            {isSending ? 'Sending...' : 'Send Message'}
          </Button>
        </form>
      </Card>

      {/* Messages Table */}
      <Card>
        {isLoading ? (
          <div className="p-8 text-center text-slate-600">
            Loading messages...
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="p-8 text-center text-slate-600">
            No messages yet. Send one to get started.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>To</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sent At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMessages.map((message) => (
                <TableRow key={message.id}>
                  <TableCell className="font-medium">{message.to}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {message.body}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        message.status === 'sent'
                          ? 'bg-green-600'
                          : message.status === 'pending'
                            ? 'bg-yellow-600'
                            : 'bg-red-600'
                      }
                    >
                      {message.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(message.sentAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}

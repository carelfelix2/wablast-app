'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Send,
  Loader2,
  Users,
} from 'lucide-react';
import { useToast } from '@/lib/useToast';
import { usePhonebookStore } from '@/lib/usePhonebookStore';
import { groupService, contactService } from '@/services/phonebookService';
import { instanceService, type Instance } from '@/services/instanceService';
import { broadcastToGroupSchema, type BroadcastToGroupFormData } from '@/lib/validations';
import type { Contact } from '@/types/phonebook';
import dayjs from 'dayjs';

export default function GroupDetailPage() {
  const router = useRouter();
  const params = useParams();
  const groupId = params.id as string;
  
  const { success, error: showError, info } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [instances, setInstances] = useState<Instance[]>([]);
  const [availableContacts, setAvailableContacts] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

  const { groups, contacts } = usePhonebookStore();

  const {
    register: registerBroadcast,
    handleSubmit: handleSubmitBroadcast,
    formState: { errors: broadcastErrors },
    reset: resetBroadcast,
  } = useForm<BroadcastToGroupFormData>({
    resolver: zodResolver(broadcastToGroupSchema),
  });

  const currentGroup = groups.find((g) => g.id === groupId);
  const groupMembers = contacts.filter((c) => c.groupId === groupId);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load instances for broadcast
      const instancesData = await instanceService.getInstances();
      setInstances(instancesData);

      // Load available contacts (not in this group)
      const allContacts = await contactService.getContacts();
      const available = allContacts.filter((c) => c.groupId !== groupId);
      setAvailableContacts(available);
    } catch (error: any) {
      const isNetworkError = !error.response;

      if (isNetworkError) {
        info('Using demo mode');
        
        // Demo instance
        setInstances([
          {
            id: 'demo-instance-1',
            name: 'Demo Instance',
            status: 'connected',
            phone: '6281234567890',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]);

        // Available contacts (not in current group)
        const available = contacts.filter((c) => c.groupId !== groupId);
        setAvailableContacts(available);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!currentGroup) {
      router.push('/dashboard/groups');
      return;
    }
    loadData();
  }, [groupId, currentGroup]);

  const handleAddMembers = async () => {
    if (selectedContacts.length === 0) {
      showError('Please select at least one contact');
      return;
    }

    try {
      // Add each selected contact to group
      for (const contactId of selectedContacts) {
        await groupService.addContactToGroup(groupId, { contactId });
        
        // Update local store
        const contact = availableContacts.find((c) => c.id === contactId);
        if (contact) {
          await contactService.updateContact(contactId, { groupId });
        }
      }

      success(`${selectedContacts.length} contact(s) added to group!`);
      setSelectedContacts([]);
      setIsAddMemberOpen(false);
      
      // Reload to refresh members list
      window.location.reload();
    } catch (error: any) {
      const isNetworkError = !error.response;

      if (isNetworkError) {
        success('✓ Contacts added! (Demo Mode)');
        setSelectedContacts([]);
        setIsAddMemberOpen(false);
      } else {
        showError(error.response?.data?.message || 'Failed to add contacts');
      }
    }
  };

  const handleRemoveMember = async (contactId: string) => {
    if (!confirm('Remove this contact from the group?')) return;

    try {
      await groupService.removeContactFromGroup(groupId, contactId);
      await contactService.updateContact(contactId, { groupId: undefined });
      
      success('Contact removed from group!');
      window.location.reload();
    } catch (error: any) {
      const isNetworkError = !error.response;

      if (isNetworkError) {
        success('✓ Contact removed! (Demo Mode)');
      } else {
        showError(error.response?.data?.message || 'Failed to remove contact');
      }
    }
  };

  const onBroadcast = async (data: BroadcastToGroupFormData) => {
    setIsBroadcasting(true);
    try {
      await groupService.broadcastToGroup(groupId, data.message, data.instanceId);
      
      success(`Message broadcasted to ${groupMembers.length} members!`);
      setIsBroadcastOpen(false);
      resetBroadcast();
    } catch (error: any) {
      const isNetworkError = !error.response;

      if (isNetworkError) {
        success(`✓ Broadcast sent to ${groupMembers.length} members! (Demo Mode)`);
        setIsBroadcastOpen(false);
        resetBroadcast();
      } else {
        showError(error.response?.data?.message || 'Failed to broadcast message');
      }
    } finally {
      setIsBroadcasting(false);
    }
  };

  if (!currentGroup) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft size={20} />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-900">{currentGroup.groupName}</h1>
          {currentGroup.description && (
            <p className="text-slate-600 mt-1">{currentGroup.description}</p>
          )}
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {groupMembers.length} {groupMembers.length === 1 ? 'Member' : 'Members'}
        </Badge>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          className="bg-green-600 hover:bg-green-700 gap-2"
          onClick={() => setIsAddMemberOpen(true)}
        >
          <Plus size={20} />
          Add Members
        </Button>
        <Button
          className="bg-blue-600 hover:bg-blue-700 gap-2"
          onClick={() => setIsBroadcastOpen(true)}
          disabled={groupMembers.length === 0}
        >
          <Send size={20} />
          Broadcast Message
        </Button>
      </div>

      {/* Members Table */}
      <Card>
        {isLoading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
            Loading members...
          </div>
        ) : groupMembers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              No members yet
            </h3>
            <p className="text-slate-600 mb-4">
              Add contacts to this group to get started
            </p>
            <Button
              className="bg-green-600 hover:bg-green-700 gap-2"
              onClick={() => setIsAddMemberOpen(true)}
            >
              <Plus size={20} />
              Add Members
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Added</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groupMembers.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div>{contact.name}</div>
                      {contact.notes && (
                        <div className="text-xs text-slate-500 mt-1">
                          {contact.notes}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{contact.phoneNumber}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        contact.status === 'active' ? 'bg-green-600' : 'bg-slate-600'
                      }
                    >
                      {contact.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{dayjs(contact.createdAt).format('DD/MM/YYYY')}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleRemoveMember(contact.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Add Members Dialog */}
      <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Members to {currentGroup.groupName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {availableContacts.length === 0 ? (
              <p className="text-slate-600 text-center py-8">
                No available contacts. All contacts are already in this group.
              </p>
            ) : (
              <>
                <div className="max-h-[400px] overflow-y-auto space-y-2">
                  {availableContacts.map((contact) => (
                    <label
                      key={contact.id}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedContacts.includes(contact.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedContacts([...selectedContacts, contact.id]);
                          } else {
                            setSelectedContacts(
                              selectedContacts.filter((id) => id !== contact.id)
                            );
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <div className="flex-1">
                        <div className="font-medium">{contact.name}</div>
                        <div className="text-sm text-slate-600">
                          {contact.phoneNumber}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddMemberOpen(false);
                      setSelectedContacts([]);
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddMembers}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    disabled={selectedContacts.length === 0}
                  >
                    Add {selectedContacts.length > 0 && `(${selectedContacts.length})`}
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Broadcast Dialog */}
      <Dialog open={isBroadcastOpen} onOpenChange={setIsBroadcastOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Broadcast to {currentGroup.groupName}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitBroadcast(onBroadcast)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Instance <span className="text-red-500">*</span>
              </label>
              <select
                {...registerBroadcast('instanceId')}
                disabled={isBroadcasting}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select Instance</option>
                {instances.map((instance) => (
                  <option key={instance.id} value={instance.id}>
                    {instance.name}
                  </option>
                ))}
              </select>
              {broadcastErrors.instanceId && (
                <p className="mt-1 text-sm text-red-600">
                  {broadcastErrors.instanceId.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                {...registerBroadcast('message')}
                disabled={isBroadcasting}
                placeholder="Type your broadcast message..."
                rows={6}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {broadcastErrors.message && (
                <p className="mt-1 text-sm text-red-600">
                  {broadcastErrors.message.message}
                </p>
              )}
              <p className="mt-1 text-xs text-slate-500">
                Will be sent to {groupMembers.length}{' '}
                {groupMembers.length === 1 ? 'member' : 'members'}
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsBroadcastOpen(false);
                  resetBroadcast();
                }}
                disabled={isBroadcasting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={isBroadcasting}
              >
                {isBroadcasting ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={16} className="mr-2" />
                    Send Broadcast
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

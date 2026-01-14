'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Edit2, Trash2, Users, Send, Loader2, ArrowRight } from 'lucide-react';
import { useToast } from '@/lib/useToast';
import { usePhonebookStore } from '@/lib/usePhonebookStore';
import { groupService } from '@/services/phonebookService';
import { createGroupSchema, type CreateGroupFormData } from '@/lib/validations';
import type { Group } from '@/types/phonebook';
import dayjs from 'dayjs';

export default function GroupsPage() {
  const router = useRouter();
  const { success, error: showError, info } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);

  const { groups, contacts, setGroups, addGroup, updateGroup, deleteGroup } =
    usePhonebookStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CreateGroupFormData>({
    resolver: zodResolver(createGroupSchema),
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const groupsData = await groupService.getGroups();
      setGroups(groupsData);
    } catch (error: any) {
      console.log('API Error:', error);

      const isNetworkError = !error.response;

      if (isNetworkError) {
        info('Using demo mode - API unavailable');
        
        // Demo data already in store from contacts page
        if (groups.length === 0) {
          const demoGroups: Group[] = [
            {
              id: 'group-1',
              groupName: 'Customer VIP',
              description: 'Pelanggan prioritas',
              memberCount: 2,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: 'group-2',
              groupName: 'Follower IG',
              description: 'Instagram followers',
              memberCount: 1,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ];
          setGroups(demoGroups);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onSubmit = async (data: CreateGroupFormData) => {
    setIsSaving(true);
    try {
      if (editingGroup) {
        // Update existing group
        const updated = await groupService.updateGroup(editingGroup.id, data);
        updateGroup(editingGroup.id, updated);
        success('Group updated successfully!');
      } else {
        // Create new group
        const newGroup = await groupService.createGroup(data);
        addGroup(newGroup);
        success('Group created successfully!');
      }

      setIsDialogOpen(false);
      reset();
      setEditingGroup(null);
    } catch (error: any) {
      console.log('Save error:', error);

      const isNetworkError = !error.response;

      if (isNetworkError) {
        // Demo mode - create locally
        const mockGroup: Group = {
          id: 'group-' + Date.now(),
          groupName: data.groupName,
          description: data.description,
          memberCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        if (editingGroup) {
          updateGroup(editingGroup.id, mockGroup);
          success('✓ Group updated! (Demo Mode)');
        } else {
          addGroup(mockGroup);
          success('✓ Group created! (Demo Mode)');
        }

        setIsDialogOpen(false);
        reset();
        setEditingGroup(null);
      } else {
        showError(error.response?.data?.message || 'Failed to save group');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (group: Group) => {
    setEditingGroup(group);
    setValue('groupName', group.groupName);
    setValue('description', group.description || '');
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure? This will remove group assignment from all contacts.')) {
      return;
    }

    try {
      await groupService.deleteGroup(id);
      deleteGroup(id);
      success('Group deleted successfully!');
    } catch (error: any) {
      const isNetworkError = !error.response;

      if (isNetworkError) {
        deleteGroup(id);
        success('✓ Group deleted! (Demo Mode)');
      } else {
        showError(error.response?.data?.message || 'Failed to delete group');
      }
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    reset();
    setEditingGroup(null);
  };

  const getMemberCount = (groupId: string) => {
    return contacts.filter((c) => c.groupId === groupId).length;
  };

  const handleViewGroup = (groupId: string) => {
    router.push(`/dashboard/groups/${groupId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Groups</h1>
          <p className="text-slate-600 mt-1">
            Organize contacts into groups for broadcasts and campaigns
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-green-600 hover:bg-green-700 gap-2"
              onClick={() => {
                setEditingGroup(null);
                reset({
                  groupName: '',
                  description: '',
                });
              }}
            >
              <Plus size={20} />
              Add Group
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingGroup ? 'Edit Group' : 'Create New Group'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Group Name <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Customer VIP"
                  {...register('groupName')}
                  disabled={isSaving}
                  className="mt-1"
                />
                {errors.groupName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.groupName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  disabled={isSaving}
                  placeholder="Optional description..."
                  rows={3}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                  disabled={isSaving}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={16} className="animate-spin mr-2" />
                      Saving...
                    </>
                  ) : editingGroup ? (
                    'Update Group'
                  ) : (
                    'Create Group'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Groups Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      ) : groups.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            No groups yet
          </h3>
          <p className="text-slate-600 mb-4">
            Create your first group to organize contacts
          </p>
          <Button
            className="bg-green-600 hover:bg-green-700 gap-2"
            onClick={() => setIsDialogOpen(true)}
          >
            <Plus size={20} />
            Create Group
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => {
            const memberCount = getMemberCount(group.id);
            
            return (
              <Card key={group.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{group.groupName}</h3>
                      <Badge variant="outline" className="mt-1">
                        {memberCount} {memberCount === 1 ? 'member' : 'members'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {group.description && (
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                    {group.description}
                  </p>
                )}

                <div className="text-xs text-slate-500 mb-4">
                  Created {dayjs(group.createdAt).format('DD MMM YYYY')}
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleViewGroup(group.id)}
                  >
                    <ArrowRight size={16} className="mr-1" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(group)}
                  >
                    <Edit2 size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(group.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

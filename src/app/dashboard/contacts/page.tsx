'use client';

import { useEffect, useState } from 'react';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Edit2, Trash2, Users, Search, Loader2 } from 'lucide-react';
import { useToast } from '@/lib/useToast';
import { usePhonebookStore } from '@/lib/usePhonebookStore';
import { contactService, groupService } from '@/services/phonebookService';
import { createContactSchema, type CreateContactFormData } from '@/lib/validations';
import type { Contact, Group } from '@/types/phonebook';
import dayjs from 'dayjs';

export default function ContactsPage() {
  const { success, error: showError, info } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('all');

  const {
    contacts,
    groups,
    setContacts,
    setGroups,
    addContact,
    updateContact,
    deleteContact,
  } = usePhonebookStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CreateContactFormData>({
    resolver: zodResolver(createContactSchema),
    defaultValues: {
      status: 'active',
    },
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [contactsData, groupsData] = await Promise.all([
        contactService.getContacts(),
        groupService.getGroups(),
      ]);

      setContacts(contactsData);
      setGroups(groupsData);
    } catch (error: any) {
      console.log('API Error:', error);
      
      // Check if network error
      const isNetworkError = !error.response;
      
      if (isNetworkError) {
        info('Using demo mode - API unavailable');
        
        // Demo data
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

        const demoContacts: Contact[] = [
          {
            id: 'contact-1',
            name: 'John Doe',
            phoneNumber: '6281234567890',
            notes: 'Customer sejak 2024',
            groupId: 'group-1',
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'contact-2',
            name: 'Jane Smith',
            phoneNumber: '6287654321098',
            notes: 'VIP customer',
            groupId: 'group-1',
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'contact-3',
            name: 'Bob Wilson',
            phoneNumber: '6289876543210',
            groupId: 'group-2',
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];

        setGroups(demoGroups);
        setContacts(demoContacts);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onSubmit = async (data: CreateContactFormData) => {
    setIsSaving(true);
    try {
      if (editingContact) {
        // Update existing contact
        const updated = await contactService.updateContact(editingContact.id, data);
        updateContact(editingContact.id, updated);
        success('Contact updated successfully!');
      } else {
        // Create new contact
        const newContact = await contactService.createContact(data);
        addContact(newContact);
        success('Contact added successfully!');
      }

      setIsDialogOpen(false);
      reset();
      setEditingContact(null);
    } catch (error: any) {
      console.log('Save error:', error);
      
      const isNetworkError = !error.response;
      
      if (isNetworkError) {
        // Demo mode - create locally
        const mockContact: Contact = {
          id: 'contact-' + Date.now(),
          name: data.name,
          phoneNumber: data.phoneNumber,
          notes: data.notes,
          groupId: data.groupId,
          status: data.status || 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        if (editingContact) {
          updateContact(editingContact.id, mockContact);
          success('✓ Contact updated! (Demo Mode)');
        } else {
          addContact(mockContact);
          success('✓ Contact added! (Demo Mode)');
        }

        setIsDialogOpen(false);
        reset();
        setEditingContact(null);
      } else {
        showError(error.response?.data?.message || 'Failed to save contact');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setValue('name', contact.name);
    setValue('phoneNumber', contact.phoneNumber);
    setValue('notes', contact.notes || '');
    setValue('groupId', contact.groupId || '');
    setValue('status', contact.status);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;

    try {
      await contactService.deleteContact(id);
      deleteContact(id);
      success('Contact deleted successfully!');
    } catch (error: any) {
      const isNetworkError = !error.response;
      
      if (isNetworkError) {
        deleteContact(id);
        success('✓ Contact deleted! (Demo Mode)');
      } else {
        showError(error.response?.data?.message || 'Failed to delete contact');
      }
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    reset();
    setEditingContact(null);
  };

  // Filter contacts
  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phoneNumber.includes(searchQuery);
    
    const matchesGroup =
      selectedGroupFilter === 'all' ||
      (selectedGroupFilter === 'none' && !contact.groupId) ||
      contact.groupId === selectedGroupFilter;

    return matchesSearch && matchesGroup;
  });

  const getGroupName = (groupId?: string) => {
    if (!groupId) return 'No Group';
    const group = groups.find((g) => g.id === groupId);
    return group?.groupName || 'Unknown';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Contacts</h1>
          <p className="text-slate-600 mt-1">
            Manage your WhatsApp contacts
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-green-600 hover:bg-green-700 gap-2"
              onClick={() => {
                setEditingContact(null);
                reset({
                  name: '',
                  phoneNumber: '',
                  notes: '',
                  groupId: '',
                  status: 'active',
                });
              }}
            >
              <Plus size={20} />
              Add Contact
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingContact ? 'Edit Contact' : 'Add New Contact'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Name <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="John Doe"
                  {...register('name')}
                  disabled={isSaving}
                  className="mt-1"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="628123456789"
                  {...register('phoneNumber')}
                  disabled={isSaving}
                  className="mt-1"
                />
                {errors.phoneNumber && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.phoneNumber.message}
                  </p>
                )}
                <p className="mt-1 text-xs text-slate-500">Must start with 62</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Group
                </label>
                <select
                  {...register('groupId')}
                  disabled={isSaving}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">No Group</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.groupName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Notes
                </label>
                <textarea
                  {...register('notes')}
                  disabled={isSaving}
                  placeholder="Optional notes..."
                  rows={3}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                {errors.notes && (
                  <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Status
                </label>
                <select
                  {...register('status')}
                  disabled={isSaving}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
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
                  ) : editingContact ? (
                    'Update Contact'
                  ) : (
                    'Add Contact'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Search size={16} className="inline mr-2" />
              Search
            </label>
            <Input
              placeholder="Search by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Users size={16} className="inline mr-2" />
              Filter by Group
            </label>
            <select
              value={selectedGroupFilter}
              onChange={(e) => setSelectedGroupFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Groups</option>
              <option value="none">No Group</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.groupName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Contacts Table */}
      <Card>
        {isLoading ? (
          <div className="p-8 text-center text-slate-600">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
            Loading contacts...
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="p-8 text-center text-slate-600">
            {searchQuery || selectedGroupFilter !== 'all'
              ? 'No contacts found with current filters.'
              : 'No contacts yet. Add one to get started.'}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead>Group</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div>{contact.name}</div>
                      {contact.notes && (
                        <div className="text-xs text-slate-500 mt-1">
                          {contact.notes.substring(0, 50)}
                          {contact.notes.length > 50 && '...'}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{contact.phoneNumber}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{getGroupName(contact.groupId)}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        contact.status === 'active'
                          ? 'bg-green-600'
                          : 'bg-slate-600'
                      }
                    >
                      {contact.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {dayjs(contact.createdAt).format('DD/MM/YYYY')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(contact)}
                      >
                        <Edit2 size={16} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(contact.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <div className="text-sm text-slate-600">
        Showing {filteredContacts.length} of {contacts.length} contacts
      </div>
    </div>
  );
}

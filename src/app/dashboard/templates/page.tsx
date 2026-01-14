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
import { Plus, Trash2, Edit2, Copy } from 'lucide-react';
import { useToast } from '@/lib/useToast';
import { templateService, type MessageTemplate } from '@/services/templateService';
import { instanceService, type Instance } from '@/services/instanceService';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const templateSchema = z.object({
  name: z
    .string()
    .min(1, 'Template name is required')
    .min(2, 'Template name must be at least 2 characters'),
  category: z.string().min(1, 'Category is required'),
  content: z
    .string()
    .min(1, 'Template content is required')
    .max(4096, 'Template content is too long'),
});

type TemplateFormData = z.infer<typeof templateSchema>;

export default function TemplatesPage() {
  const { success, error: showError, info } = useToast();
  const [instances, setInstances] = useState<Instance[]>([]);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string>('');
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
  });

  const templateContent = watch('content');

  useEffect(() => {
    loadInstances();
    loadCategories();
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

  const loadCategories = async () => {
    try {
      const data = await templateService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories');
    }
  };

  useEffect(() => {
    if (selectedInstanceId) {
      loadTemplates();
    }
  }, [selectedInstanceId]);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const data = await templateService.getTemplates(selectedInstanceId);
      setTemplates(data);
    } catch (error) {
      showError('Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: TemplateFormData) => {
    setIsSubmitting(true);
    try {
      if (editingTemplate) {
        await templateService.updateTemplate({
          ...data,
          instanceId: selectedInstanceId,
          id: editingTemplate.id,
        });
        success('Template updated successfully');
      } else {
        await templateService.createTemplate({
          ...data,
          instanceId: selectedInstanceId,
        });
        success('Template created successfully');
      }
      reset();
      setIsDialogOpen(false);
      setEditingTemplate(null);
      loadTemplates();
    } catch (error) {
      showError('Failed to save template');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    try {
      await templateService.deleteTemplate(id);
      success('Template deleted successfully');
      loadTemplates();
    } catch (error) {
      showError('Failed to delete template');
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    success('Template copied to clipboard');
  };

  const openDialog = (template?: MessageTemplate) => {
    setEditingTemplate(template || null);
    if (template) {
      reset({
        name: template.name,
        category: template.category,
        content: template.content,
      });
    } else {
      reset();
    }
    setIsDialogOpen(true);
  };

  const filteredTemplates = filterCategory
    ? templates.filter((t) => t.category === filterCategory)
    : templates;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Templates</h1>
          <p className="text-slate-600 mt-1">
            Manage message templates for quick access
          </p>
        </div>
        <Button
          onClick={() => openDialog()}
          className="bg-green-600 hover:bg-green-700 gap-2"
          disabled={!selectedInstanceId}
        >
          <Plus size={20} />
          Create Template
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

      {/* Category Filter */}
      {templates.length > 0 && (
        <Card className="p-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Filter by Category
          </label>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={filterCategory === '' ? 'default' : 'outline'}
              onClick={() => setFilterCategory('')}
            >
              All
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat}
                size="sm"
                variant={filterCategory === cat ? 'default' : 'outline'}
                onClick={() => setFilterCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        </Card>
      )}

      {/* Templates Grid */}
      <div>
        {isLoading ? (
          <Card className="p-8 text-center text-slate-600">
            Loading templates...
          </Card>
        ) : filteredTemplates.length === 0 ? (
          <Card className="p-8 text-center text-slate-600">
            {filterCategory ? 'No templates in this category' : 'No templates yet. Create one to get started.'}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="mb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {template.name}
                      </h3>
                      <Badge className="mt-1 bg-blue-100 text-blue-800">
                        {template.category}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600 line-clamp-3">
                    {template.content}
                  </p>
                </div>

                {template.variables && template.variables.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-slate-700 mb-1">
                      Variables:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {template.variables.map((v) => (
                        <Badge key={v} className="bg-purple-100 text-purple-800">
                          {'{'}
                          {v}
                          {'}'}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopy(template.content)}
                    className="flex-1"
                  >
                    <Copy size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openDialog(template)}
                  >
                    <Edit2 size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(template.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Edit Template' : 'Create Template'}
            </DialogTitle>
            <DialogDescription>
              Create reusable message templates
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Template Name <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="e.g., Welcome Message"
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
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('category')}
                  disabled={isSubmitting}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.category.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Content <span className="text-red-500">*</span>
              </label>
              <textarea
                placeholder="Type your template content here. Use {{variable}} for placeholders."
                {...register('content')}
                disabled={isSubmitting}
                rows={8}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 font-mono text-sm"
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.content.message}
                </p>
              )}
              <p className="mt-1 text-xs text-slate-500">
                Characters: {templateContent?.length || 0} / 4096
              </p>
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
                  : editingTemplate
                    ? 'Update Template'
                    : 'Create Template'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

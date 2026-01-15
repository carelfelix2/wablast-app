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
import { Plus, Trash2, Power, RefreshCw } from 'lucide-react';
import { instanceService, type Instance } from '@/services/instanceService';
import { useToast } from '@/lib/useToast';
import { CreateInstanceDialog } from './CreateInstanceDialog';
import { QRCodeModal } from './QRCodeModal';

export default function InstancesPage() {
  const { success, error: showError, info } = useToast();
  const [instances, setInstances] = useState<Instance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [qrCodeModal, setQRCodeModal] = useState<{
    open: boolean;
    qrCode?: string;
    instanceName?: string;
  }>({ open: false });

  const loadInstances = async () => {
    setIsLoading(true);
    try {
      const data = await instanceService.getInstances();
      setInstances(data);
    } catch (error) {
      info('Using demo instances');
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
        {
          id: '2',
          name: 'Support Team',
          status: 'disconnected',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInstances();
  }, []);

  const handleCreate = async (name: string) => {
    try {
      const newInstance = await instanceService.createInstance({ name });
      setInstances([...instances, newInstance]);
      setShowCreateDialog(false);
      success('Instance created successfully');
    } catch (error) {
      showError('Failed to create instance');
    }
  };

  const handleStartSession = async (instance: Instance) => {
    try {
      const { qrCode } = await instanceService.getQRCode(instance.id);
      setQRCodeModal({
        open: true,
        qrCode,
        instanceName: instance.name,
      });
    } catch (error) {
      showError('Failed to generate QR code');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this instance?')) {
      return;
    }

    try {
      await instanceService.deleteInstance(id);
      setInstances(instances.filter((i) => i.id !== id));
      success('Instance deleted successfully');
    } catch (error) {
      showError('Failed to delete instance');
    }
  };

  const handleRestart = async (id: string) => {
    try {
      await instanceService.restartInstance(id);
      success('Instance restarting...');
      // Reload instances
      loadInstances();
    } catch (error) {
      showError('Failed to restart instance');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Instances</h1>
          <p className="text-slate-600 mt-1">
            Manage your WhatsApp instances
          </p>
        </div>
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="bg-green-600 hover:bg-green-700 gap-2"
        >
          <Plus size={20} />
          Create Instance
        </Button>
      </div>

      <Card>
        {isLoading ? (
          <div className="p-8 text-center text-slate-600">
            Loading instances...
          </div>
        ) : instances.length === 0 ? (
          <div className="p-8 text-center text-slate-600">
            No instances yet. Create one to get started.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {instances.map((instance) => (
                <TableRow key={instance.id}>
                  <TableCell className="font-medium">{instance.name}</TableCell>
                  <TableCell>{instance.phone || '-'}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        instance.status === 'connected'
                          ? 'bg-green-600'
                          : instance.status === 'connecting'
                            ? 'bg-yellow-600'
                            : 'bg-red-600'
                      }
                    >
                      {instance.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(instance.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStartSession(instance)}
                      className="gap-1"
                    >
                      <Power size={16} />
                      Connect
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRestart(instance.id)}
                      className="gap-1"
                    >
                      <RefreshCw size={16} />
                      Restart
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(instance.id)}
                      className="gap-1"
                    >
                      <Trash2 size={16} />
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <CreateInstanceDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreate={handleCreate}
      />

      <QRCodeModal
        open={qrCodeModal.open}
        onOpenChange={(open: boolean) =>
          setQRCodeModal({ ...qrCodeModal, open })
        }
        qrCode={qrCodeModal.qrCode}
        instanceName={qrCodeModal.instanceName}
      />
    </div>
  );
}

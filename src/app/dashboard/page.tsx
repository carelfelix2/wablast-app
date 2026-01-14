'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart } from '@/components/charts/LineChart';
import { useToast } from '@/lib/useToast';
import { instanceService } from '@/services/instanceService';
import { messageService } from '@/services/messageService';
import { Smartphone, MessageSquare, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const { info } = useToast();
  const [stats, setStats] = useState({
    totalInstances: 0,
    totalMessages: 0,
    connectedInstances: 0,
    messageStats: { total: 0, sent: 0, failed: 0, pending: 0 },
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [instances, messageStats] = await Promise.all([
          instanceService.getInstances(),
          messageService.getMessageStats(),
        ]);

        setStats({
          totalInstances: instances.length,
          connectedInstances: instances.filter(
            (i) => i.status === 'connected'
          ).length,
          totalMessages: messageStats.total,
          messageStats,
        });
      } catch (error) {
        info('Using demo data for dashboard');
        // Demo data
        setStats({
          totalInstances: 5,
          connectedInstances: 3,
          totalMessages: 1250,
          messageStats: {
            total: 1250,
            sent: 1200,
            failed: 30,
            pending: 20,
          },
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, [info]);

  const chartData = [
    { name: 'Jan', messages: 240 },
    { name: 'Feb', messages: 390 },
    { name: 'Mar', messages: 200 },
    { name: 'Apr', messages: 530 },
    { name: 'May', messages: 430 },
    { name: 'Jun', messages: 620 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-2">Welcome to WABlast Dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Instances</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">
                {stats.totalInstances}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Smartphone className="text-blue-600" size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Connected</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">
                {stats.connectedInstances}
              </p>
            </div>
            <Badge className="bg-green-600 hover:bg-green-700">Active</Badge>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Messages</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">
                {stats.totalMessages}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <MessageSquare className="text-green-600" size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Success Rate</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">
                {stats.messageStats.total > 0
                  ? Math.round(
                      (stats.messageStats.sent / stats.messageStats.total) * 100
                    )
                  : 0}
                %
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="text-purple-600" size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Chart */}
      <Card className="p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">
          Messages Usage
        </h2>
        <LineChart data={chartData} />
      </Card>

      {/* Messages Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <p className="text-sm font-medium text-slate-600">Sent</p>
          <p className="text-2xl font-bold text-green-600 mt-2">
            {stats.messageStats.sent}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm font-medium text-slate-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-600 mt-2">
            {stats.messageStats.pending}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm font-medium text-slate-600">Failed</p>
          <p className="text-2xl font-bold text-red-600 mt-2">
            {stats.messageStats.failed}
          </p>
        </Card>
      </div>
    </div>
  );
}

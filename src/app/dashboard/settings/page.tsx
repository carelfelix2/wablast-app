'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Copy, RefreshCw } from 'lucide-react';
import { useUserStore } from '@/lib/useUserStore';
import { useToast } from '@/lib/useToast';
import { billingService } from '@/services/billingService';

export default function SettingsPage() {
  const { user, updateApiKey } = useUserStore();
  const { success, error: showError, info } = useToast();
  const [apiKey, setApiKey] = useState('••••••••••••••••');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  useEffect(() => {
    // Load initial API key
    if (user?.apiKey) {
      setApiKey(user.apiKey);
    } else {
      info('No API key generated yet');
    }
    setIsLoadingSettings(false);
  }, [user, info]);

  const handleGenerateAPIKey = async () => {
    setIsGenerating(true);
    try {
      const { apiKey: newApiKey } = await billingService.generateAPIKey();
      setApiKey(newApiKey);
      updateApiKey(newApiKey);
      setShowApiKey(true);
      success('API Key generated successfully!');
    } catch (error) {
      showError('Failed to generate API key');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyApiKey = () => {
    if (apiKey && apiKey !== '••••••••••••••••') {
      navigator.clipboard.writeText(apiKey);
      success('API Key copied to clipboard!');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600 mt-1">Manage your account and preferences</p>
      </div>

      {/* User Profile */}
      <Card className="p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">
          Account Information
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Name
            </label>
            <Input
              value={user?.name || ''}
              disabled
              className="mt-1 bg-slate-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <Input
              value={user?.email || ''}
              disabled
              className="mt-1 bg-slate-50"
            />
          </div>
        </div>
      </Card>

      {/* API Key */}
      <Card className="p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">API Key</h2>
        <p className="text-sm text-slate-600 mb-4">
          Use your API key to authenticate requests to the WABlast API
        </p>

        {isLoadingSettings ? (
          <div className="text-slate-600">Loading...</div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Your API Key
              </label>
              <div className="flex gap-2">
                <Input
                  value={showApiKey ? apiKey : '••••••••••••••••'}
                  disabled
                  className="bg-slate-50 font-mono text-sm"
                />
                <Button
                  onClick={handleCopyApiKey}
                  variant="outline"
                  size="sm"
                  disabled={!apiKey || apiKey === '••••••••••••••••'}
                >
                  <Copy size={16} />
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => setShowApiKey(!showApiKey)}
                variant="outline"
                size="sm"
              >
                {showApiKey ? 'Hide' : 'Show'} API Key
              </Button>
              <Button
                onClick={handleGenerateAPIKey}
                variant="outline"
                size="sm"
                disabled={isGenerating}
                className="gap-2"
              >
                <RefreshCw size={16} />
                {isGenerating ? 'Generating...' : 'Generate New'}
              </Button>
            </div>

            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ Keep your API key secret! Do not share it in public places.
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Documentation */}
      <Card className="p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">
          API Documentation
        </h2>
        <div className="space-y-3 text-sm text-slate-600">
          <p>
            Base URL: <code className="bg-slate-100 px-2 py-1 rounded">https://api.wablast.net</code>
          </p>
          <p>
            Authorization: <code className="bg-slate-100 px-2 py-1 rounded">Bearer YOUR_API_KEY</code>
          </p>
          <p>
            For more information, visit our{' '}
            <a
              href="https://api.wablast.net/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 hover:underline"
            >
              API Documentation
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
}

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Link2, KeyRound, Info, Smartphone, MessageSquare, Clock } from 'lucide-react';

export default function DocsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Documentation</h1>
          <p className="text-slate-600 mt-1">
            Quick start, endpoints, and integration notes for WABlast frontend.
          </p>
        </div>
        <Badge className="bg-green-100 text-green-800">v1.0</Badge>
      </div>

      <Card className="p-6 space-y-3">
        <div className="flex items-center gap-2 text-slate-900 font-semibold">
          <Info size={18} /> Overview
        </div>
        <p className="text-sm text-slate-700">
          This dashboard is a frontend shell for Evolution/WABlast API. It supports demo-mode fallbacks when the API is unreachable (SSL or network errors).
          Replace demo data by configuring a valid API base URL and API key.
        </p>
        <div className="grid md:grid-cols-2 gap-3 text-sm text-slate-800">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="font-semibold mb-1">Environment</div>
            <p><code>NEXT_PUBLIC_API_URL</code>: https://api.wablast.net</p>
            <p><code>NEXT_PUBLIC_API_KEY</code>: &lt;&lt;your_api_key&gt;&gt;</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="font-semibold mb-1">Auth Header</div>
            <p><code>Authorization: Bearer &lt;token|api_key&gt;</code></p>
            <p className="text-slate-600 mt-1">User token overrides env API key if present.</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-semibold">
          <Link2 size={18} /> Core Endpoints
        </div>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-slate-800">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <Smartphone size={16} /> Instances
            </div>
            <p><code>GET /instances</code> — list instances</p>
            <p><code>POST /instance</code> — create instance</p>
            <p><code>GET /instance/:id/qr</code> — fetch QR code</p>
            <p><code>POST /instance/:id/restart</code> — restart</p>
            <p><code>DELETE /instance/:id</code> — delete</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <MessageSquare size={16} /> Messaging & Contacts
            </div>
            <p><code>GET /instance/:id/messages</code> — history</p>
            <p><code>POST /instance/:id/messages</code> — send text/media</p>
            <p><code>GET /instance/:id/contacts</code> — contacts</p>
            <p><code>POST /instance/:id/groups</code> — create group</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <Clock size={16} /> Automation
            </div>
            <p><code>POST /instance/:id/auto-reply</code> — rules</p>
            <p><code>POST /instance/:id/schedule</code> — schedule message</p>
            <p><code>POST /instance/:id/templates</code> — templates CRUD</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <KeyRound size={16} /> Agents & Webhooks
            </div>
            <p><code>POST /agent/create</code> — add agent</p>
            <p><code>GET /agent/routing-rules/:instanceId</code> — routing</p>
            <p><code>POST /webhooks</code> — register webhook</p>
            <p><code>POST /webhooks/test</code> — test webhook delivery</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-3">
        <div className="flex items-center gap-2 text-slate-900 font-semibold">
          <CheckCircle2 size={18} /> Demo Mode Behavior
        </div>
        <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
          <li>When API calls fail (SSL/network), services return mock data so UI stays usable.</li>
          <li>Instances select will populate with demo instances if the API is unreachable.</li>
          <li>QR codes fallback to generated data URLs when backend QR is unavailable.</li>
          <li>API key generation uses a fake key in demo mode.</li>
        </ul>
        <div className="text-xs text-slate-500">
          To disable demo mode, ensure the API base URL and key are valid and reachable over HTTPS.
        </div>
      </Card>

      <Card className="p-6 space-y-3">
        <div className="flex items-center gap-2 text-slate-900 font-semibold">
          <Info size={18} /> Integration Tips
        </div>
        <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
          <li>Store <code>NEXT_PUBLIC_API_KEY</code> in <code>.env.local</code> and restart dev server.</li>
          <li>Ensure CORS allows your dashboard origin when calling the Evolution API.</li>
          <li>Use HTTPS for webhook targets; test via the “Webhooks” page test button.</li>
          <li>Map your backend payloads to the frontend service contracts for consistency.</li>
        </ul>
        <Button
          className="bg-green-600 hover:bg-green-700"
          asChild
        >
          <a href="/dashboard/settings">Go to Settings</a>
        </Button>
      </Card>
    </div>
  );
}

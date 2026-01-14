'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  qrCode?: string;
  instanceName?: string;
}

export function QRCodeModal({
  open,
  onOpenChange,
  qrCode,
  instanceName,
}: QRCodeModalProps) {
  const [renderSrc, setRenderSrc] = useState<string | undefined>(undefined);
  const isDataUrl = qrCode?.startsWith('data:');

  useEffect(() => {
    let cancelled = false;
    async function prepare() {
      if (!qrCode) {
        setRenderSrc(undefined);
        return;
      }
      if (isDataUrl) {
        setRenderSrc(qrCode);
        return;
      }
      try {
        const dataUrl = await QRCode.toDataURL(qrCode);
        if (!cancelled) setRenderSrc(dataUrl);
      } catch {
        if (!cancelled) setRenderSrc(undefined);
      }
    }
    prepare();
    return () => {
      cancelled = true;
    };
  }, [qrCode, isDataUrl]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-center">
        <DialogHeader>
          <DialogTitle>Connect {instanceName}</DialogTitle>
          <DialogDescription>
            Scan this QR code with your WhatsApp to connect the instance
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center py-6">
          {renderSrc ? (
            <img
              src={renderSrc}
              alt="WhatsApp QR Code"
              className="w-64 h-64 rounded-lg"
            />
          ) : qrCode ? (
            <div className="w-64 h-64 bg-slate-100 rounded-lg flex items-center justify-center">
              <p className="text-slate-600">Preparing QR Code...</p>
            </div>
          ) : (
            <div className="w-64 h-64 bg-slate-100 rounded-lg flex items-center justify-center">
              <p className="text-slate-600">Loading QR Code...</p>
            </div>
          )}
        </div>

        <p className="text-sm text-slate-600">
          Keep your phone nearby and follow the WhatsApp instructions
        </p>
      </DialogContent>
    </Dialog>
  );
}

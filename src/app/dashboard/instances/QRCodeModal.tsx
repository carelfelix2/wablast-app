'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { QRCodeSVG } from 'qrcode.react';

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
          {qrCode ? (
            <QRCodeSVG
              value={qrCode}
              size={256}
              level="H"
              includeMargin={true}
            />
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

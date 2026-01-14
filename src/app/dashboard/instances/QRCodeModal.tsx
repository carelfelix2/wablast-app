'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
  const isDataUrl = qrCode?.startsWith('data:');

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
            isDataUrl ? (
              <img
                src={qrCode}
                alt="WhatsApp QR Code"
                className="w-64 h-64 rounded-lg"
              />
            ) : (
              <div className="w-64 h-64 bg-slate-100 rounded-lg flex items-center justify-center">
                <p className="text-slate-600">Invalid QR Code</p>
              </div>
            )
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

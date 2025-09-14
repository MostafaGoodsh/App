import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface VideoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoUrl: string;
  title: string;
  description?: string;
}

export const VideoModal = ({ open, onOpenChange, videoUrl, title, description }: VideoModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="font-cairo text-xl">{title}</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {description && (
            <p className="font-cairo text-sm text-muted-foreground mt-2">{description}</p>
          )}
        </DialogHeader>
        
        <div className="px-6 pb-6">
          <div className="relative w-full bg-black rounded-lg overflow-hidden">
            <video
              src={videoUrl}
              controls
              autoPlay
              className="w-full h-auto max-h-[70vh] object-contain"
              onError={(e) => {
                console.error('Video failed to load:', e);
              }}
            >
              متصفحك لا يدعم تشغيل الفيديو
            </video>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
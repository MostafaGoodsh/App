import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { useState } from "react";

interface MediaModalProps {
  children: React.ReactNode;
  media_url: string;
  media_type: string;
  title: string;
}

const MediaModal = ({ children, media_url, media_type, title }: MediaModalProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="cursor-pointer">
          {children}
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95">
        <div className="relative w-full h-full flex items-center justify-center">
          <button
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          
          {media_type === 'image' ? (
            <img 
              src={media_url} 
              alt={title}
              className="max-w-full max-h-full object-contain"
            />
          ) : media_type === 'video' ? (
            <video 
              src={media_url}
              controls
              className="max-w-full max-h-full"
              autoPlay
            >
              متصفحك لا يدعم تشغيل الفيديو
            </video>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MediaModal;
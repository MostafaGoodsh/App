import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { useVirtualCard } from '@/hooks/useVirtualCard';

interface Props {
  createCard: ReturnType<typeof useVirtualCard>['createCard'];
}

const CreateCardDialog = ({ createCard }: Props) => {
  const [open, setOpen] = useState(false);

  const handleCreate = (type: 'visa' | 'mastercard') => {
    createCard.mutate(type);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full gap-2 bg-[#D4AF37] text-black hover:bg-[#C4A032] font-bold" size="lg">
          <Plus className="w-5 h-5" />
          Create New Card
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm bg-black/95 border-[#D4AF37]/30">
        <DialogHeader>
          <DialogTitle className="text-center text-[#D4AF37]">Choose Card Type</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <button
            onClick={() => handleCreate('visa')}
            className="p-6 rounded-xl border-2 border-[#D4AF37]/20 hover:border-[#D4AF37] transition-all flex flex-col items-center gap-3 hover:bg-[#D4AF37]/5 bg-black/30"
          >
            <div className="text-3xl font-bold italic text-[#D4AF37]">VISA</div>
            <p className="text-xs text-[#D4AF37]/50">Virtual Visa</p>
          </button>
          <button
            onClick={() => handleCreate('mastercard')}
            className="p-6 rounded-xl border-2 border-[#D4AF37]/20 hover:border-[#D4AF37] transition-all flex flex-col items-center gap-3 hover:bg-[#D4AF37]/5 bg-black/30"
          >
            <div className="flex -space-x-2 mb-1">
              <div className="w-8 h-8 rounded-full bg-[#D4AF37]" />
              <div className="w-8 h-8 rounded-full bg-[#D4AF37]/50" />
            </div>
            <p className="text-xs text-[#D4AF37]/50">Virtual Mastercard</p>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCardDialog;

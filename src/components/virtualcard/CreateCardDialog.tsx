import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CreditCard, Plus } from 'lucide-react';
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
        <Button className="w-full gap-2 bg-gradient-to-r from-[#D4AF37] to-[#B8941F] text-black hover:from-[#C4A032] hover:to-[#A88520]" size="lg">
          <Plus className="w-5 h-5" />
          إنشاء كارت جديد | Create New Card
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center">اختر نوع الكارت | Choose Card Type</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <button
            onClick={() => handleCreate('visa')}
            className="p-6 rounded-xl border-2 border-border hover:border-[#D4AF37] transition-all flex flex-col items-center gap-3 hover:bg-[#D4AF37]/5"
          >
            <div className="text-3xl font-bold italic text-blue-500">VISA</div>
            <p className="text-xs text-muted-foreground">فيزا افتراضي</p>
          </button>
          <button
            onClick={() => handleCreate('mastercard')}
            className="p-6 rounded-xl border-2 border-border hover:border-[#D4AF37] transition-all flex flex-col items-center gap-3 hover:bg-[#D4AF37]/5"
          >
            <div className="flex -space-x-2 mb-1">
              <div className="w-8 h-8 rounded-full bg-red-500" />
              <div className="w-8 h-8 rounded-full bg-yellow-500 opacity-80" />
            </div>
            <p className="text-xs text-muted-foreground">ماستركارد افتراضي</p>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCardDialog;

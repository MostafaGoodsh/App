import { DollarSign, TrendingDown } from 'lucide-react';
import type { VirtualCard } from '@/hooks/useVirtualCard';

interface Props {
  card: VirtualCard;
}

const CardBalance = ({ card }: Props) => {
  const dailyRemaining = Math.max(0, card.daily_limit - card.total_spent);
  const dailyPercent = card.daily_limit > 0 ? (card.total_spent / card.daily_limit) * 100 : 0;

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="p-4 rounded-xl bg-black/40 border border-[#D4AF37]/30 text-center">
        <DollarSign className="w-5 h-5 text-[#D4AF37] mx-auto mb-1" />
        <p className="text-[10px] text-[#D4AF37]/50 mb-1">Balance</p>
        <p className="text-xl font-bold text-[#D4AF37]" dir="ltr">${card.balance.toFixed(2)}</p>
      </div>
      <div className="p-4 rounded-xl bg-black/40 border border-[#D4AF37]/30 text-center">
        <TrendingDown className="w-5 h-5 text-[#D4AF37]/70 mx-auto mb-1" />
        <p className="text-[10px] text-[#D4AF37]/50 mb-1">Daily Limit</p>
        <p className="text-xl font-bold text-[#D4AF37]/80" dir="ltr">${dailyRemaining.toFixed(0)}</p>
        <div className="w-full bg-[#D4AF37]/10 rounded-full h-1.5 mt-2">
          <div 
            className="bg-[#D4AF37] h-1.5 rounded-full transition-all" 
            style={{ width: `${Math.min(100, dailyPercent)}%` }} 
          />
        </div>
      </div>
    </div>
  );
};

export default CardBalance;

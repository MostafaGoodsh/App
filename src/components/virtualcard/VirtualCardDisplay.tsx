import { useState } from 'react';
import { Eye, EyeOff, Wifi, CreditCard } from 'lucide-react';
import type { VirtualCard } from '@/hooks/useVirtualCard';

interface Props {
  card: VirtualCard;
}

const VirtualCardDisplay = ({ card }: Props) => {
  const [showDetails, setShowDetails] = useState(false);

  const maskedNumber = `•••• •••• •••• ${card.card_number_last4}`;
  const fullFakeNumber = `4532 7891 2345 ${card.card_number_last4}`;
  const expiry = `${String(card.expiry_month).padStart(2, '0')}/${String(card.expiry_year).slice(-2)}`;
  const isVisa = card.card_type === 'visa';
  const isFrozen = card.status === 'frozen';

  return (
    <div className={`relative w-full max-w-[360px] mx-auto aspect-[1.586/1] rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 ${isFrozen ? 'opacity-60 grayscale' : ''}`}>
      {/* Card Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]" />
      <div className="absolute inset-0 bg-gradient-to-tr from-[#D4AF37]/20 via-transparent to-[#D4AF37]/10" />
      
      {/* Decorative circles */}
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[#D4AF37]/10 blur-xl" />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-[#D4AF37]/5 blur-lg" />

      {/* Card Content */}
      <div className="relative z-10 h-full flex flex-col justify-between p-5">
        {/* Top Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wifi className="w-5 h-5 text-[#D4AF37] rotate-90" />
            {card.is_contactless_enabled && (
              <span className="text-[10px] text-[#D4AF37]/70 uppercase tracking-wider">Contactless</span>
            )}
          </div>
          <button 
            onClick={() => setShowDetails(!showDetails)} 
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            {showDetails ? <EyeOff className="w-4 h-4 text-white/80" /> : <Eye className="w-4 h-4 text-white/80" />}
          </button>
        </div>

        {/* Chip */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-8 rounded-md bg-gradient-to-br from-[#D4AF37] to-[#B8941F] flex items-center justify-center">
            <div className="w-7 h-5 rounded-sm border border-[#8B7316]/50 bg-gradient-to-b from-[#E5C644] to-[#C4A032]" />
          </div>
          {isFrozen && (
            <span className="text-xs font-bold text-red-400 bg-red-900/30 px-2 py-0.5 rounded">مجمّد | FROZEN</span>
          )}
        </div>

        {/* Card Number */}
        <div className="space-y-1" dir="ltr">
          <p className="font-mono text-lg tracking-[3px] text-white/95">
            {showDetails ? fullFakeNumber : maskedNumber}
          </p>
        </div>

        {/* Bottom Row */}
        <div className="flex items-end justify-between">
          <div className="space-y-0.5">
            <p className="text-[10px] text-white/50 uppercase tracking-wider">Card Holder</p>
            <p className="text-sm text-white font-medium tracking-wide">
              {card.card_holder_name || 'CARD HOLDER'}
            </p>
          </div>
          <div className="text-right space-y-0.5">
            <p className="text-[10px] text-white/50 uppercase tracking-wider">Expires</p>
            <p className="text-sm text-white font-mono">{showDetails ? expiry : '••/••'}</p>
          </div>
          <div className="text-right space-y-0.5">
            <p className="text-[10px] text-white/50 uppercase tracking-wider">CVV</p>
            <p className="text-sm text-white font-mono">{showDetails ? card.cvv_hash : '•••'}</p>
          </div>
        </div>

        {/* Card Brand */}
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-[#D4AF37]/60 font-medium tracking-widest">MS-RA BANK</p>
          {isVisa ? (
            <div className="text-2xl font-bold italic text-white tracking-wider">VISA</div>
          ) : (
            <div className="flex -space-x-2">
              <div className="w-7 h-7 rounded-full bg-red-500/80" />
              <div className="w-7 h-7 rounded-full bg-yellow-500/80" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VirtualCardDisplay;

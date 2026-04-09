import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ArrowUpCircle } from 'lucide-react';
import { useInternalWallet } from '@/hooks/useInternalWallet';
import type { useVirtualCard } from '@/hooks/useVirtualCard';

interface Props {
  topupCard: ReturnType<typeof useVirtualCard>['topupCard'];
}

const CardTopup = ({ topupCard }: Props) => {
  const { tokens, balances } = useInternalWallet();
  const [amount, setAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState('XP');
  const quickAmounts = [10, 50, 100, 500];

  const token = tokens.find(t => t.symbol === selectedToken);
  const balance = balances.find(b => b.token_id === token?.id);
  const estimatedUsd = token && amount ? (parseFloat(amount) * token.exchange_rate_usd).toFixed(2) : '0.00';

  const handleTopup = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    topupCard.mutate({ amount: parseFloat(amount), tokenSymbol: selectedToken });
    setAmount('');
  };

  return (
    <div className="rounded-xl bg-black/40 border border-[#D4AF37]/20 p-4 space-y-3">
      <h3 className="text-sm font-bold text-[#D4AF37] flex items-center gap-2">
        <ArrowUpCircle className="w-4 h-4" />
        Top Up Card
      </h3>
      <p className="text-[10px] text-[#D4AF37]/40">شحن الكارت</p>

      <Select value={selectedToken} onValueChange={setSelectedToken}>
        <SelectTrigger className="bg-black/30 border-[#D4AF37]/20 text-foreground">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {tokens.filter(t => t.is_active).map(t => {
            const bal = balances.find(b => b.token_id === t.id);
            return (
              <SelectItem key={t.symbol} value={t.symbol}>
                {t.name} ({t.symbol}) — {bal?.balance?.toFixed(2) || '0'}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      <div>
        <Input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="bg-black/30 border-[#D4AF37]/20"
          dir="ltr"
        />
        {amount && (
          <p className="text-xs text-[#D4AF37]/50 mt-1" dir="ltr">≈ ${estimatedUsd} USD</p>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {quickAmounts.map(qa => (
          <Button key={qa} type="button" variant="outline" size="sm" onClick={() => setAmount(qa.toString())} 
            className="text-xs border-[#D4AF37]/20 text-[#D4AF37] hover:bg-[#D4AF37]/10">
            {qa} {selectedToken}
          </Button>
        ))}
      </div>

      <Button
        onClick={handleTopup}
        disabled={topupCard.isPending || !amount || parseFloat(amount) <= 0}
        className="w-full bg-[#D4AF37] text-black hover:bg-[#C4A032] font-bold"
      >
        {topupCard.isPending ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
        Top Up Card
      </Button>
    </div>
  );
};

export default CardTopup;

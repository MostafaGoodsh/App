import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <ArrowUpCircle className="w-5 h-5 text-green-400" />
          شحن الكارت | Top Up
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Select value={selectedToken} onValueChange={setSelectedToken}>
          <SelectTrigger className="bg-background/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {tokens.filter(t => t.is_active).map(t => {
              const bal = balances.find(b => b.token_id === t.id);
              return (
                <SelectItem key={t.symbol} value={t.symbol}>
                  {t.name} ({t.symbol}) — رصيد: {bal?.balance?.toFixed(2) || '0'}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        <div className="relative">
          <Input
            type="number"
            placeholder="المبلغ | Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-background/50"
            dir="ltr"
          />
          {amount && (
            <p className="text-xs text-muted-foreground mt-1" dir="ltr">
              ≈ ${estimatedUsd} USD
            </p>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          {quickAmounts.map(qa => (
            <Button key={qa} type="button" variant="outline" size="sm" onClick={() => setAmount(qa.toString())} className="text-xs">
              {qa} {selectedToken}
            </Button>
          ))}
        </div>

        <Button
          onClick={handleTopup}
          disabled={topupCard.isPending || !amount || parseFloat(amount) <= 0}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
        >
          {topupCard.isPending ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
          شحن الكارت | Top Up Card
        </Button>
      </CardContent>
    </Card>
  );
};

export default CardTopup;

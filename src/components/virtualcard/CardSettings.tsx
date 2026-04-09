import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Snowflake, Play, Wifi, Globe, ShoppingCart, Settings } from 'lucide-react';
import type { VirtualCard, useVirtualCard } from '@/hooks/useVirtualCard';

interface Props {
  card: VirtualCard;
  toggleStatus: ReturnType<typeof useVirtualCard>['toggleCardStatus'];
  updateSettings: ReturnType<typeof useVirtualCard>['updateCardSettings'];
}

const CardSettings = ({ card, toggleStatus, updateSettings }: Props) => {
  const isFrozen = card.status === 'frozen';

  return (
    <div className="rounded-xl bg-black/40 border border-[#D4AF37]/20 p-4 space-y-4">
      <h3 className="text-sm font-bold text-[#D4AF37] flex items-center gap-2">
        <Settings className="w-4 h-4" />
        Card Settings
      </h3>
      <p className="text-[10px] text-[#D4AF37]/40">إعدادات الكارت</p>

      <Button
        variant={isFrozen ? 'default' : 'destructive'}
        className={`w-full gap-2 ${isFrozen ? 'bg-[#D4AF37] text-black hover:bg-[#C4A032]' : ''}`}
        onClick={() => toggleStatus.mutate(isFrozen ? 'active' : 'frozen')}
        disabled={toggleStatus.isPending}
      >
        {isFrozen ? <Play className="w-4 h-4" /> : <Snowflake className="w-4 h-4" />}
        {isFrozen ? 'Activate Card' : 'Freeze Card'}
      </Button>

      <div className="space-y-3">
        {[
          { icon: Wifi, label: 'Contactless', key: 'is_contactless_enabled' as const },
          { icon: ShoppingCart, label: 'Online Payments', key: 'is_online_enabled' as const },
          { icon: Globe, label: 'International', key: 'is_international_enabled' as const },
        ].map(({ icon: Icon, label, key }) => (
          <div key={key} className="flex items-center justify-between">
            <Label className="flex items-center gap-2 text-sm text-[#D4AF37]/80">
              <Icon className="w-4 h-4 text-[#D4AF37]" />
              {label}
            </Label>
            <Switch
              checked={card[key]}
              onCheckedChange={(v) => updateSettings.mutate({ [key]: v })}
            />
          </div>
        ))}
      </div>

      <div className="bg-black/30 rounded-lg p-3 space-y-1 border border-[#D4AF37]/10">
        <p className="text-xs text-[#D4AF37]/50">Limits</p>
        <div className="flex justify-between text-sm">
          <span className="text-[#D4AF37]/60">Daily</span>
          <span className="font-mono text-[#D4AF37]" dir="ltr">${card.daily_limit.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#D4AF37]/60">Monthly</span>
          <span className="font-mono text-[#D4AF37]" dir="ltr">${card.monthly_limit.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default CardSettings;

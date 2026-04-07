import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Settings className="w-5 h-5" />
          إعدادات الكارت | Card Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Freeze/Unfreeze */}
        <Button
          variant={isFrozen ? 'default' : 'destructive'}
          className="w-full gap-2"
          onClick={() => toggleStatus.mutate(isFrozen ? 'active' : 'frozen')}
          disabled={toggleStatus.isPending}
        >
          {isFrozen ? <Play className="w-4 h-4" /> : <Snowflake className="w-4 h-4" />}
          {isFrozen ? 'تفعيل الكارت | Activate' : 'تجميد الكارت | Freeze'}
        </Button>

        {/* Toggle Settings */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 text-sm">
              <Wifi className="w-4 h-4 text-blue-400" />
              اللاتلامسي | Contactless
            </Label>
            <Switch
              checked={card.is_contactless_enabled}
              onCheckedChange={(v) => updateSettings.mutate({ is_contactless_enabled: v })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 text-sm">
              <ShoppingCart className="w-4 h-4 text-green-400" />
              الشراء أونلاين | Online
            </Label>
            <Switch
              checked={card.is_online_enabled}
              onCheckedChange={(v) => updateSettings.mutate({ is_online_enabled: v })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 text-sm">
              <Globe className="w-4 h-4 text-purple-400" />
              الدولي | International
            </Label>
            <Switch
              checked={card.is_international_enabled}
              onCheckedChange={(v) => updateSettings.mutate({ is_international_enabled: v })}
            />
          </div>
        </div>

        {/* Limits Info */}
        <div className="bg-background/30 rounded-lg p-3 space-y-1">
          <p className="text-xs text-muted-foreground">الحدود | Limits</p>
          <div className="flex justify-between text-sm">
            <span>يومي | Daily</span>
            <span className="font-mono text-foreground" dir="ltr">${card.daily_limit.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>شهري | Monthly</span>
            <span className="font-mono text-foreground" dir="ltr">${card.monthly_limit.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CardSettings;

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminPageShell from '@/components/admin/AdminPageShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, Users, DollarSign, Snowflake, Play, Ban } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { VirtualCard } from '@/hooks/useVirtualCard';

const VirtualCardAdmin = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cards = [], isLoading } = useQuery({
    queryKey: ['admin-virtual-cards'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('virtual_cards')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as unknown as (VirtualCard & { profiles?: { full_name: string; email: string } })[];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ cardId, status }: { cardId: string; status: string }) => {
      const { error } = await supabase
        .from('virtual_cards')
        .update({ status })
        .eq('id', cardId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-virtual-cards'] });
      toast({ title: '✅ تم التحديث' });
    },
  });

  const totalBalance = cards.reduce((sum, c) => sum + (c.balance || 0), 0);
  const activeCount = cards.filter(c => c.status === 'active').length;
  const frozenCount = cards.filter(c => c.status === 'frozen').length;

  const statusColors: Record<string, string> = {
    active: 'bg-green-500/20 text-green-400',
    frozen: 'bg-blue-500/20 text-blue-400',
    cancelled: 'bg-red-500/20 text-red-400',
    expired: 'bg-gray-500/20 text-gray-400',
  };

  return (
    <AdminPageShell title="إدارة البطاقات الافتراضية" titleEn="Virtual Cards Management">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Card className="bg-card/50">
          <CardContent className="p-4 text-center">
            <CreditCard className="w-5 h-5 mx-auto text-primary mb-1" />
            <p className="text-2xl font-bold">{cards.length}</p>
            <p className="text-xs text-muted-foreground">إجمالي الكروت</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardContent className="p-4 text-center">
            <Play className="w-5 h-5 mx-auto text-green-400 mb-1" />
            <p className="text-2xl font-bold text-green-400">{activeCount}</p>
            <p className="text-xs text-muted-foreground">نشط</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardContent className="p-4 text-center">
            <Snowflake className="w-5 h-5 mx-auto text-blue-400 mb-1" />
            <p className="text-2xl font-bold text-blue-400">{frozenCount}</p>
            <p className="text-xs text-muted-foreground">مجمّد</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardContent className="p-4 text-center">
            <DollarSign className="w-5 h-5 mx-auto text-[#D4AF37] mb-1" />
            <p className="text-2xl font-bold text-[#D4AF37]" dir="ltr">${totalBalance.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">إجمالي الأرصدة</p>
          </CardContent>
        </Card>
      </div>

      {/* Cards List */}
      <div className="space-y-3">
        {isLoading ? (
          <p className="text-center text-muted-foreground py-8">جاري التحميل...</p>
        ) : cards.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">لا توجد بطاقات</p>
        ) : (
          cards.map(card => (
            <Card key={card.id} className="bg-card/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-[#D4AF37]/10">
                      <CreditCard className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {card.card_holder_name || 'بدون اسم'} 
                        <span className="text-muted-foreground font-mono text-xs ml-2" dir="ltr">
                          •••• {card.card_number_last4}
                        </span>
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="uppercase">{card.card_type}</span>
                        <span dir="ltr">${card.balance.toFixed(2)}</span>
                        <Badge className={`text-[9px] ${statusColors[card.status] || ''}`}>
                          {card.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Select
                    value={card.status}
                    onValueChange={(v) => updateStatus.mutate({ cardId: card.id, status: v })}
                  >
                    <SelectTrigger className="w-28 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">نشط</SelectItem>
                      <SelectItem value="frozen">مجمّد</SelectItem>
                      <SelectItem value="cancelled">ملغي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </AdminPageShell>
  );
};

export default VirtualCardAdmin;

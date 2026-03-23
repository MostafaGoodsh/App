import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Coins, Upload, X } from "lucide-react";
import AdminPageShell from "@/components/admin/AdminPageShell";

interface Token {
  id: string;
  symbol: string;
  name: string;
  description: string | null;
  icon_url: string | null;
  decimals: number;
  is_active: boolean;
  is_base_currency: boolean;
  exchange_rate_usd: number;
}

const InternalTokensAdmin = () => {
  const { toast } = useToast();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editToken, setEditToken] = useState<Token | null>(null);
  const [form, setForm] = useState({
    symbol: '', name: '', description: '', icon_url: '',
    decimals: 8, exchange_rate_usd: 0, is_active: true, is_base_currency: false,
    contract_address: '', network: 'solana'
  });

  useEffect(() => { loadTokens(); }, []);

  const loadTokens = async () => {
    setLoading(true);
    const { data } = await supabase.from('internal_tokens').select('*').order('symbol');
    setTokens(data || []);
    setLoading(false);
  };

  const handleSave = async () => {
    try {
      const tokenData = {
        symbol: form.symbol.toUpperCase(),
        name: form.name,
        description: form.description || null,
        icon_url: form.icon_url || null,
        decimals: form.decimals,
        exchange_rate_usd: form.exchange_rate_usd,
        is_active: form.is_active,
        is_base_currency: form.is_base_currency,
      };

      if (editToken) {
        await supabase.from('internal_tokens').update(tokenData).eq('id', editToken.id);
        toast({ title: 'تم التحديث' });
      } else {
        await supabase.from('internal_tokens').insert(tokenData);
        if (form.contract_address) {
          await supabase.from('custom_tokens').insert({
            contract_address: form.contract_address,
            name: form.name,
            symbol: form.symbol.toUpperCase(),
            network: form.network,
            decimals: form.decimals,
            is_verified: true,
          });
        }
        toast({ title: 'تم الإضافة' });
      }

      setShowAdd(false);
      setEditToken(null);
      resetForm();
      loadTokens();
    } catch (err: any) {
      toast({ title: 'خطأ', description: err.message, variant: 'destructive' });
    }
  };

  const resetForm = () => setForm({
    symbol: '', name: '', description: '', icon_url: '',
    decimals: 8, exchange_rate_usd: 0, is_active: true, is_base_currency: false,
    contract_address: '', network: 'solana'
  });

  const openEdit = (t: Token) => {
    setEditToken(t);
    setForm({
      symbol: t.symbol, name: t.name, description: t.description || '',
      icon_url: t.icon_url || '', decimals: t.decimals,
      exchange_rate_usd: t.exchange_rate_usd, is_active: t.is_active,
      is_base_currency: t.is_base_currency, contract_address: '', network: 'solana'
    });
    setShowAdd(true);
  };

  const toggleActive = async (id: string, active: boolean) => {
    await supabase.from('internal_tokens').update({ is_active: active }).eq('id', id);
    loadTokens();
  };

  return (
    <AdminPageShell withContainer containerClassName="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">إدارة العملات الداخلية</h1>
          <p className="text-sm text-muted-foreground">إضافة وتعديل العملات مع عقود العملات</p>
        </div>
        <Button onClick={() => { resetForm(); setEditToken(null); setShowAdd(true); }}>
          <Plus className="w-4 h-4 mr-2" /> إضافة عملة
        </Button>
      </div>

      <div className="space-y-3">
        {tokens.map(t => (
          <Card key={t.id} className="border-border/50">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Coins className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-bold" dir="ltr">{t.symbol}</p>
                  <p className="text-sm text-muted-foreground">{t.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={t.is_active ? "default" : "secondary"}>
                  {t.is_active ? 'نشط' : 'معطل'}
                </Badge>
                <Switch checked={t.is_active} onCheckedChange={(v) => toggleActive(t.id, v)} />
                <Button variant="ghost" size="sm" onClick={() => openEdit(t)}>
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editToken ? 'تعديل عملة' : 'إضافة عملة جديدة'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>الرمز</Label>
                <Input value={form.symbol} onChange={e => setForm({...form, symbol: e.target.value})} placeholder="MSRA" dir="ltr" />
              </div>
              <div>
                <Label>الاسم</Label>
                <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="MS-RA Token" />
              </div>
            </div>
            <div>
              <Label>الوصف</Label>
              <Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            </div>
            <div>
              <Label>رابط الأيقونة</Label>
              <Input value={form.icon_url} onChange={e => setForm({...form, icon_url: e.target.value})} dir="ltr" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>الكسور العشرية</Label>
                <Input type="number" value={form.decimals} onChange={e => setForm({...form, decimals: parseInt(e.target.value)})} />
              </div>
              <div>
                <Label>السعر (USD)</Label>
                <Input type="number" step="0.0001" value={form.exchange_rate_usd} onChange={e => setForm({...form, exchange_rate_usd: parseFloat(e.target.value)})} />
              </div>
            </div>
            
            {!editToken && (
              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-3">عقد العملة (اختياري)</p>
                <div>
                  <Label>عنوان العقد</Label>
                  <Input value={form.contract_address} onChange={e => setForm({...form, contract_address: e.target.value})} placeholder="0x... أو عنوان Solana" dir="ltr" />
                </div>
                <div className="mt-2">
                  <Label>الشبكة</Label>
                  <select className="w-full p-2 border rounded-md bg-background" value={form.network} onChange={e => setForm({...form, network: e.target.value})}>
                    <option value="solana">Solana</option>
                    <option value="ethereum">Ethereum</option>
                    <option value="polygon">Polygon</option>
                    <option value="bsc">BSC</option>
                    <option value="ton">TON</option>
                  </select>
                </div>
              </div>
            )}

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch checked={form.is_active} onCheckedChange={v => setForm({...form, is_active: v})} />
                <Label>نشط</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_base_currency} onCheckedChange={v => setForm({...form, is_base_currency: v})} />
                <Label>عملة أساسية</Label>
              </div>
            </div>

            <Button onClick={handleSave} className="w-full">
              {editToken ? 'تحديث' : 'إضافة'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminPageShell>
  );
};

export default InternalTokensAdmin;

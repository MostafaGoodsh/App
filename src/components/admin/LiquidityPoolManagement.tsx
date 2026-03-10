import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, Edit2, Trash2, Settings, ArrowDownCircle, ArrowUpCircle, 
  Heart, Gift, DollarSign, Lock, RefreshCw, Percent
} from 'lucide-react';
import type { LiquidityPool, StakingPlan, AutoRouting, CharityProgram } from '@/hooks/useLiquidityPool';

export default function LiquidityPoolManagement() {
  const { toast } = useToast();
  const [pools, setPools] = useState<LiquidityPool[]>([]);
  const [stakingPlans, setStakingPlans] = useState<StakingPlan[]>([]);
  const [autoRouting, setAutoRouting] = useState<AutoRouting[]>([]);
  const [charityPrograms, setCharityPrograms] = useState<CharityProgram[]>([]);
  const [selectedPool, setSelectedPool] = useState<LiquidityPool | null>(null);
  const [loading, setLoading] = useState(true);

  // Pool form
  const [poolForm, setPoolForm] = useState({
    name: '', name_en: '', slug: '', pool_type: 'general',
    description: '', description_en: '',
    apy_percentage: 0, fee_percentage: 0.5, min_deposit: 10, max_deposit: 0,
    token_a_symbol: 'MSRA', token_b_symbol: 'USDT', is_active: true,
  });
  const [poolDialogOpen, setPoolDialogOpen] = useState(false);
  const [editingPoolId, setEditingPoolId] = useState<string | null>(null);

  // Staking plan form
  const [stakingForm, setStakingForm] = useState({
    name: '', name_en: '', duration_days: 30, apy_bonus: 2, min_amount: 100, max_amount: 0,
  });
  const [stakingDialogOpen, setStakingDialogOpen] = useState(false);
  const [editingStakingId, setEditingStakingId] = useState<string | null>(null);

  // Routing form
  const [routingForm, setRoutingForm] = useState({
    source_type: 'purchase', routing_percentage: 5, description: '', is_active: true,
  });
  const [routingDialogOpen, setRoutingDialogOpen] = useState(false);
  const [editingRoutingId, setEditingRoutingId] = useState<string | null>(null);

  // Charity form
  const [charityForm, setCharityForm] = useState({
    name: '', name_en: '', description: '', allocation_percentage: 5, is_active: true,
  });
  const [charityDialogOpen, setCharityDialogOpen] = useState(false);
  const [editingCharityId, setEditingCharityId] = useState<string | null>(null);

  useEffect(() => { fetchPools(); }, []);
  useEffect(() => { if (selectedPool) fetchPoolDetails(selectedPool.id); }, [selectedPool?.id]);

  const fetchPools = async () => {
    setLoading(true);
    const { data } = await supabase.from('liquidity_pools').select('*').order('created_at');
    if (data) {
      setPools(data as unknown as LiquidityPool[]);
      if (!selectedPool && data.length > 0) setSelectedPool(data[0] as unknown as LiquidityPool);
    }
    setLoading(false);
  };

  const fetchPoolDetails = async (poolId: string) => {
    const [plans, routing, charity] = await Promise.all([
      supabase.from('pool_staking_plans').select('*').eq('pool_id', poolId),
      supabase.from('pool_auto_routing').select('*').eq('pool_id', poolId),
      supabase.from('pool_charity_programs').select('*').eq('pool_id', poolId),
    ]);
    setStakingPlans((plans.data || []) as unknown as StakingPlan[]);
    setAutoRouting((routing.data || []) as unknown as AutoRouting[]);
    setCharityPrograms((charity.data || []) as unknown as CharityProgram[]);
  };

  // ========== POOL CRUD ==========
  const savePool = async () => {
    const payload = {
      ...poolForm,
      max_deposit: poolForm.max_deposit || null,
    };
    if (editingPoolId) {
      await supabase.from('liquidity_pools').update(payload).eq('id', editingPoolId);
      toast({ title: 'تم تحديث المجمع' });
    } else {
      await supabase.from('liquidity_pools').insert(payload);
      toast({ title: 'تم إنشاء المجمع' });
    }
    setPoolDialogOpen(false);
    setEditingPoolId(null);
    fetchPools();
  };

  const editPool = (pool: LiquidityPool) => {
    setPoolForm({
      name: pool.name, name_en: pool.name_en || '', slug: pool.slug, pool_type: pool.pool_type,
      description: pool.description || '', description_en: pool.description_en || '',
      apy_percentage: pool.apy_percentage, fee_percentage: pool.fee_percentage,
      min_deposit: pool.min_deposit, max_deposit: pool.max_deposit || 0,
      token_a_symbol: pool.token_a_symbol || '', token_b_symbol: pool.token_b_symbol || '',
      is_active: pool.is_active,
    });
    setEditingPoolId(pool.id);
    setPoolDialogOpen(true);
  };

  const deletePool = async (id: string) => {
    await supabase.from('liquidity_pools').delete().eq('id', id);
    toast({ title: 'تم حذف المجمع' });
    if (selectedPool?.id === id) setSelectedPool(null);
    fetchPools();
  };

  // ========== STAKING CRUD ==========
  const saveStaking = async () => {
    if (!selectedPool) return;
    const payload = { ...stakingForm, pool_id: selectedPool.id, max_amount: stakingForm.max_amount || null };
    if (editingStakingId) {
      await supabase.from('pool_staking_plans').update(payload).eq('id', editingStakingId);
    } else {
      await supabase.from('pool_staking_plans').insert(payload);
    }
    toast({ title: editingStakingId ? 'تم التحديث' : 'تم الإضافة' });
    setStakingDialogOpen(false);
    setEditingStakingId(null);
    fetchPoolDetails(selectedPool.id);
  };

  const deleteStaking = async (id: string) => {
    await supabase.from('pool_staking_plans').delete().eq('id', id);
    toast({ title: 'تم الحذف' });
    if (selectedPool) fetchPoolDetails(selectedPool.id);
  };

  // ========== ROUTING CRUD ==========
  const saveRouting = async () => {
    if (!selectedPool) return;
    const payload = { ...routingForm, pool_id: selectedPool.id };
    if (editingRoutingId) {
      await supabase.from('pool_auto_routing').update(payload).eq('id', editingRoutingId);
    } else {
      await supabase.from('pool_auto_routing').insert(payload);
    }
    toast({ title: editingRoutingId ? 'تم التحديث' : 'تم الإضافة' });
    setRoutingDialogOpen(false);
    setEditingRoutingId(null);
    fetchPoolDetails(selectedPool.id);
  };

  const deleteRouting = async (id: string) => {
    await supabase.from('pool_auto_routing').delete().eq('id', id);
    toast({ title: 'تم الحذف' });
    if (selectedPool) fetchPoolDetails(selectedPool.id);
  };

  // ========== CHARITY CRUD ==========
  const saveCharity = async () => {
    if (!selectedPool) return;
    const payload = { ...charityForm, pool_id: selectedPool.id };
    if (editingCharityId) {
      await supabase.from('pool_charity_programs').update(payload).eq('id', editingCharityId);
    } else {
      await supabase.from('pool_charity_programs').insert(payload);
    }
    toast({ title: editingCharityId ? 'تم التحديث' : 'تم الإضافة' });
    setCharityDialogOpen(false);
    setEditingCharityId(null);
    fetchPoolDetails(selectedPool.id);
  };

  const deleteCharity = async (id: string) => {
    await supabase.from('pool_charity_programs').delete().eq('id', id);
    toast({ title: 'تم الحذف' });
    if (selectedPool) fetchPoolDetails(selectedPool.id);
  };

  const sourceTypeLabels: Record<string, string> = {
    purchase: 'مشتريات', game: 'ألعاب', fee: 'رسوم', staking: 'ستاكينج',
    early_access: 'وصول مبكر', platform_payment: 'مدفوعات المنصة', manual: 'يدوي',
  };

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-12 bg-muted rounded" /><div className="h-64 bg-muted rounded" /></div>;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Pool List & Create */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-cairo text-xl">إدارة مجمعات السيولة</CardTitle>
            <CardDescription>إنشاء وتعديل مجمعات السيولة والإعدادات</CardDescription>
          </div>
          <Button size="sm" onClick={() => { setEditingPoolId(null); setPoolForm({ name: '', name_en: '', slug: '', pool_type: 'general', description: '', description_en: '', apy_percentage: 0, fee_percentage: 0.5, min_deposit: 10, max_deposit: 0, token_a_symbol: 'MSRA', token_b_symbol: 'USDT', is_active: true }); setPoolDialogOpen(true); }}>
            <Plus className="w-4 h-4 ml-1" /> مجمع جديد
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {pools.map(pool => (
              <div key={pool.id} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${selectedPool?.id === pool.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/40'}`} onClick={() => setSelectedPool(pool)}>
                <span className="font-cairo text-sm font-bold">{pool.name}</span>
                <Badge variant={pool.is_active ? 'default' : 'secondary'} className="text-[10px]">{pool.is_active ? 'نشط' : 'متوقف'}</Badge>
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); editPool(pool); }}><Edit2 className="w-3 h-3" /></Button>
                <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={(e) => { e.stopPropagation(); deletePool(pool.id); }}><Trash2 className="w-3 h-3" /></Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Pool Details */}
      {selectedPool && (
        <Card>
          <CardHeader>
            <CardTitle className="font-cairo">{selectedPool.name} - التفاصيل</CardTitle>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>TVL: {selectedPool.total_value_locked.toLocaleString()}</span>
              <span>APY: {selectedPool.apy_percentage}%</span>
              <span>رسوم: {selectedPool.fee_percentage}%</span>
              <span>مزودين: {selectedPool.providers_count}</span>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="inputs" className="w-full">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="inputs" className="text-xs gap-1"><ArrowDownCircle className="w-3 h-3" />المدخلات</TabsTrigger>
                <TabsTrigger value="outputs" className="text-xs gap-1"><ArrowUpCircle className="w-3 h-3" />المخرجات</TabsTrigger>
                <TabsTrigger value="staking" className="text-xs gap-1"><Lock className="w-3 h-3" />Staking</TabsTrigger>
                <TabsTrigger value="settings" className="text-xs gap-1"><Settings className="w-3 h-3" />إعدادات</TabsTrigger>
              </TabsList>

              {/* مدخلات - Inputs / Auto Routing */}
              <TabsContent value="inputs" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-cairo font-bold">مصادر التمويل (المدخلات)</h3>
                  <Button size="sm" onClick={() => { setEditingRoutingId(null); setRoutingForm({ source_type: 'purchase', routing_percentage: 5, description: '', is_active: true }); setRoutingDialogOpen(true); }}>
                    <Plus className="w-4 h-4 ml-1" /> إضافة مصدر
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>المصدر</TableHead>
                      <TableHead>النسبة</TableHead>
                      <TableHead>الوصف</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>إجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {autoRouting.map(r => (
                      <TableRow key={r.id}>
                        <TableCell className="font-cairo">{sourceTypeLabels[r.source_type] || r.source_type}</TableCell>
                        <TableCell><Badge variant="outline">{r.routing_percentage}%</Badge></TableCell>
                        <TableCell className="text-sm text-muted-foreground">{r.description || '-'}</TableCell>
                        <TableCell><Badge variant={r.is_active ? 'default' : 'secondary'}>{r.is_active ? 'نشط' : 'متوقف'}</Badge></TableCell>
                        <TableCell className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditingRoutingId(r.id); setRoutingForm({ source_type: r.source_type, routing_percentage: r.routing_percentage, description: r.description || '', is_active: r.is_active }); setRoutingDialogOpen(true); }}><Edit2 className="w-3 h-3" /></Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteRouting(r.id)}><Trash2 className="w-3 h-3" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {autoRouting.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">لا توجد مصادر تمويل - أضف مصدر جديد</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </TabsContent>

              {/* مخرجات - Outputs / Charity */}
              <TabsContent value="outputs" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-cairo font-bold">المخرجات والتبرعات</h3>
                  <Button size="sm" onClick={() => { setEditingCharityId(null); setCharityForm({ name: '', name_en: '', description: '', allocation_percentage: 5, is_active: true }); setCharityDialogOpen(true); }}>
                    <Plus className="w-4 h-4 ml-1" /> إضافة مخرج
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الاسم</TableHead>
                      <TableHead>النسبة</TableHead>
                      <TableHead>إجمالي التوزيع</TableHead>
                      <TableHead>المستفيدين</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>إجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {charityPrograms.map(c => (
                      <TableRow key={c.id}>
                        <TableCell className="font-cairo">{c.name}</TableCell>
                        <TableCell><Badge variant="outline">{c.allocation_percentage}%</Badge></TableCell>
                        <TableCell>{c.total_distributed.toLocaleString()}</TableCell>
                        <TableCell>{c.beneficiaries_count}</TableCell>
                        <TableCell><Badge variant={c.is_active ? 'default' : 'secondary'}>{c.is_active ? 'نشط' : 'متوقف'}</Badge></TableCell>
                        <TableCell className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditingCharityId(c.id); setCharityForm({ name: c.name, name_en: c.name_en || '', description: c.description || '', allocation_percentage: c.allocation_percentage, is_active: c.is_active }); setCharityDialogOpen(true); }}><Edit2 className="w-3 h-3" /></Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteCharity(c.id)}><Trash2 className="w-3 h-3" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {charityPrograms.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">لا توجد مخرجات - أضف تبرع أو مكافأة أو دعم مجمع</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </TabsContent>

              {/* Staking Plans */}
              <TabsContent value="staking" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-cairo font-bold">خطط الـ Staking</h3>
                  <Button size="sm" onClick={() => { setEditingStakingId(null); setStakingForm({ name: '', name_en: '', duration_days: 30, apy_bonus: 2, min_amount: 100, max_amount: 0 }); setStakingDialogOpen(true); }}>
                    <Plus className="w-4 h-4 ml-1" /> خطة جديدة
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الخطة</TableHead>
                      <TableHead>المدة</TableHead>
                      <TableHead>مكافأة APY</TableHead>
                      <TableHead>الحد الأدنى</TableHead>
                      <TableHead>إجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stakingPlans.map(s => (
                      <TableRow key={s.id}>
                        <TableCell className="font-cairo">{s.name}</TableCell>
                        <TableCell>{s.duration_days} يوم</TableCell>
                        <TableCell><Badge variant="outline">+{s.apy_bonus}%</Badge></TableCell>
                        <TableCell>{s.min_amount.toLocaleString()}</TableCell>
                        <TableCell className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditingStakingId(s.id); setStakingForm({ name: s.name, name_en: s.name_en || '', duration_days: s.duration_days, apy_bonus: s.apy_bonus, min_amount: s.min_amount, max_amount: s.max_amount || 0 }); setStakingDialogOpen(true); }}><Edit2 className="w-3 h-3" /></Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteStaking(s.id)}><Trash2 className="w-3 h-3" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {stakingPlans.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">لا توجد خطط Staking</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </TabsContent>

              {/* Settings - Pool Config */}
              <TabsContent value="settings" className="space-y-4">
                <Card className="border-primary/20">
                  <CardContent className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">TVL</Label>
                      <p className="font-bold text-lg">{selectedPool.total_value_locked.toLocaleString()}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">حجم 24 ساعة</Label>
                      <p className="font-bold text-lg">{selectedPool.total_volume_24h.toLocaleString()}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">APY</Label>
                      <p className="font-bold text-lg text-green-500">{selectedPool.apy_percentage}%</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">الرسوم</Label>
                      <p className="font-bold text-lg">{selectedPool.fee_percentage}%</p>
                    </div>
                  </CardContent>
                </Card>
                <Button onClick={() => editPool(selectedPool)} className="w-full"><Edit2 className="w-4 h-4 ml-2" />تعديل إعدادات المجمع</Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* ===== DIALOGS ===== */}
      {/* Pool Dialog */}
      <Dialog open={poolDialogOpen} onOpenChange={setPoolDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader><DialogTitle className="font-cairo">{editingPoolId ? 'تعديل المجمع' : 'مجمع جديد'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>الاسم</Label><Input value={poolForm.name} onChange={e => setPoolForm({...poolForm, name: e.target.value})} /></div>
              <div><Label>Name (EN)</Label><Input value={poolForm.name_en} onChange={e => setPoolForm({...poolForm, name_en: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Slug</Label><Input value={poolForm.slug} onChange={e => setPoolForm({...poolForm, slug: e.target.value})} /></div>
              <div><Label>النوع</Label>
                <Select value={poolForm.pool_type} onValueChange={v => setPoolForm({...poolForm, pool_type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="general">عام</SelectItem><SelectItem value="stablecoin">عملة مستقرة</SelectItem><SelectItem value="token_pair">زوج تداول</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>الوصف</Label><Textarea value={poolForm.description} onChange={e => setPoolForm({...poolForm, description: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>APY %</Label><Input type="number" value={poolForm.apy_percentage} onChange={e => setPoolForm({...poolForm, apy_percentage: +e.target.value})} /></div>
              <div><Label>رسوم %</Label><Input type="number" value={poolForm.fee_percentage} onChange={e => setPoolForm({...poolForm, fee_percentage: +e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>حد أدنى</Label><Input type="number" value={poolForm.min_deposit} onChange={e => setPoolForm({...poolForm, min_deposit: +e.target.value})} /></div>
              <div><Label>حد أقصى (0=بلا حد)</Label><Input type="number" value={poolForm.max_deposit} onChange={e => setPoolForm({...poolForm, max_deposit: +e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>رمز عملة A</Label><Input value={poolForm.token_a_symbol} onChange={e => setPoolForm({...poolForm, token_a_symbol: e.target.value})} /></div>
              <div><Label>رمز عملة B</Label><Input value={poolForm.token_b_symbol} onChange={e => setPoolForm({...poolForm, token_b_symbol: e.target.value})} /></div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={poolForm.is_active} onCheckedChange={v => setPoolForm({...poolForm, is_active: v})} />
              <Label>نشط</Label>
            </div>
            <Button onClick={savePool} className="w-full">{editingPoolId ? 'حفظ التعديلات' : 'إنشاء المجمع'}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Staking Dialog */}
      <Dialog open={stakingDialogOpen} onOpenChange={setStakingDialogOpen}>
        <DialogContent dir="rtl">
          <DialogHeader><DialogTitle className="font-cairo">{editingStakingId ? 'تعديل الخطة' : 'خطة Staking جديدة'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>الاسم</Label><Input value={stakingForm.name} onChange={e => setStakingForm({...stakingForm, name: e.target.value})} /></div>
              <div><Label>Name (EN)</Label><Input value={stakingForm.name_en} onChange={e => setStakingForm({...stakingForm, name_en: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>المدة (أيام)</Label><Input type="number" value={stakingForm.duration_days} onChange={e => setStakingForm({...stakingForm, duration_days: +e.target.value})} /></div>
              <div><Label>مكافأة APY %</Label><Input type="number" value={stakingForm.apy_bonus} onChange={e => setStakingForm({...stakingForm, apy_bonus: +e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>حد أدنى</Label><Input type="number" value={stakingForm.min_amount} onChange={e => setStakingForm({...stakingForm, min_amount: +e.target.value})} /></div>
              <div><Label>حد أقصى</Label><Input type="number" value={stakingForm.max_amount} onChange={e => setStakingForm({...stakingForm, max_amount: +e.target.value})} /></div>
            </div>
            <Button onClick={saveStaking} className="w-full">{editingStakingId ? 'حفظ' : 'إضافة'}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Routing Dialog */}
      <Dialog open={routingDialogOpen} onOpenChange={setRoutingDialogOpen}>
        <DialogContent dir="rtl">
          <DialogHeader><DialogTitle className="font-cairo">{editingRoutingId ? 'تعديل المصدر' : 'مصدر تمويل جديد'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>نوع المصدر</Label>
              <Select value={routingForm.source_type} onValueChange={v => setRoutingForm({...routingForm, source_type: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="purchase">مشتريات</SelectItem>
                  <SelectItem value="staking">ستاكينج</SelectItem>
                  <SelectItem value="platform_payment">مدفوعات المنصة</SelectItem>
                  <SelectItem value="early_access">الشراء المبكر</SelectItem>
                  <SelectItem value="fee">رسوم</SelectItem>
                  <SelectItem value="game">ألعاب</SelectItem>
                  <SelectItem value="manual">يدوي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>النسبة %</Label><Input type="number" value={routingForm.routing_percentage} onChange={e => setRoutingForm({...routingForm, routing_percentage: +e.target.value})} /></div>
            <div><Label>الوصف</Label><Textarea value={routingForm.description} onChange={e => setRoutingForm({...routingForm, description: e.target.value})} /></div>
            <div className="flex items-center gap-2">
              <Switch checked={routingForm.is_active} onCheckedChange={v => setRoutingForm({...routingForm, is_active: v})} />
              <Label>نشط</Label>
            </div>
            <Button onClick={saveRouting} className="w-full">{editingRoutingId ? 'حفظ' : 'إضافة'}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Charity Dialog */}
      <Dialog open={charityDialogOpen} onOpenChange={setCharityDialogOpen}>
        <DialogContent dir="rtl">
          <DialogHeader><DialogTitle className="font-cairo">{editingCharityId ? 'تعديل المخرج' : 'مخرج جديد'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>الاسم</Label><Input value={charityForm.name} onChange={e => setCharityForm({...charityForm, name: e.target.value})} /></div>
              <div><Label>Name (EN)</Label><Input value={charityForm.name_en} onChange={e => setCharityForm({...charityForm, name_en: e.target.value})} /></div>
            </div>
            <div><Label>الوصف</Label><Textarea value={charityForm.description} onChange={e => setCharityForm({...charityForm, description: e.target.value})} /></div>
            <div><Label>نسبة التخصيص %</Label><Input type="number" value={charityForm.allocation_percentage} onChange={e => setCharityForm({...charityForm, allocation_percentage: +e.target.value})} /></div>
            <div className="flex items-center gap-2">
              <Switch checked={charityForm.is_active} onCheckedChange={v => setCharityForm({...charityForm, is_active: v})} />
              <Label>نشط</Label>
            </div>
            <Button onClick={saveCharity} className="w-full">{editingCharityId ? 'حفظ' : 'إضافة'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

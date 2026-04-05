import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Award, Plus, Trash2, UserPlus, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AdminPageShell from "@/components/admin/AdminPageShell";

interface BadgeData {
  id: string;
  name: string;
  name_en: string | null;
  description: string | null;
  description_en: string | null;
  icon_emoji: string;
  badge_color: string;
  is_active: boolean;
  created_at: string;
}

interface UserBadgeData {
  id: string;
  user_id: string;
  badge_id: string;
  granted_at: string;
  reason: string | null;
}

export default function BadgesAdmin() {
  const { toast } = useToast();
  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showGrantDialog, setShowGrantDialog] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<BadgeData | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [grantedBadges, setGrantedBadges] = useState<any[]>([]);

  const [formName, setFormName] = useState('');
  const [formNameEn, setFormNameEn] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formDescEn, setFormDescEn] = useState('');
  const [formEmoji, setFormEmoji] = useState('⭐');
  const [formColor, setFormColor] = useState('#D4AF37');

  const [grantUserId, setGrantUserId] = useState('');
  const [grantReason, setGrantReason] = useState('');
  const [grantBadgeId, setGrantBadgeId] = useState('');

  const fetchBadges = async () => {
    setLoading(true);
    const { data } = await supabase.from('badges').select('*').order('created_at', { ascending: false });
    if (data) setBadges(data as BadgeData[]);
    setLoading(false);
  };

  const fetchUsers = async () => {
    const { data } = await supabase.from('profiles').select('user_id, full_name, email');
    if (data) setUsers(data);
  };

  const fetchGrantedBadges = async () => {
    const { data } = await supabase.from('user_badges').select('*, badges(name, icon_emoji)');
    if (data) setGrantedBadges(data);
  };

  useEffect(() => {
    fetchBadges();
    fetchUsers();
    fetchGrantedBadges();
  }, []);

  const handleCreate = async () => {
    if (!formName.trim()) return;
    const { error } = await supabase.from('badges').insert({
      name: formName, name_en: formNameEn || null,
      description: formDesc || null, description_en: formDescEn || null,
      icon_emoji: formEmoji, badge_color: formColor,
    });
    if (error) {
      toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'تم إنشاء البادج بنجاح' });
      setShowCreateDialog(false);
      setFormName(''); setFormNameEn(''); setFormDesc(''); setFormDescEn('');
      fetchBadges();
    }
  };

  const handleGrant = async () => {
    if (!grantUserId || !grantBadgeId) return;
    const { error } = await supabase.from('user_badges').insert({
      user_id: grantUserId, badge_id: grantBadgeId, reason: grantReason || null,
    });
    if (error) {
      toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'تم منح البادج بنجاح' });
      setShowGrantDialog(false);
      setGrantUserId(''); setGrantBadgeId(''); setGrantReason('');
      fetchGrantedBadges();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('badges').delete().eq('id', id);
    if (!error) { fetchBadges(); fetchGrantedBadges(); }
  };

  const handleRevoke = async (id: string) => {
    const { error } = await supabase.from('user_badges').delete().eq('id', id);
    if (!error) fetchGrantedBadges();
  };

  const EMOJI_OPTIONS = [
    '⭐', '🏆', '👑', '💎', '🔥', '⚡', '🎖️', '🛡️',
    '☥', '𓂀', '𓌀', '𓊽', '𓆣', '𓁹', '𓃭', '𓅃',
    '𓋹', '𓊛', '𓂋', '𓇳', '𓆃', '𓃒', '𓂧', '𓈖',
    '𓏏', '𓍯', '𓊝', '𓁷', '𓆏', '𓃠', '𓅓', '𓇌',
  ];

  return (
    <AdminPageShell withContainer containerClassName="max-w-4xl">
      <div className="space-y-6" dir="rtl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl sm:text-2xl font-bold font-cairo flex items-center gap-2 leading-tight">
            <Award className="w-6 h-6 text-primary shrink-0" />
            إدارة البادجات
          </h1>
          <div className="flex w-full sm:w-auto gap-2">
            <Button onClick={() => setShowGrantDialog(true)} variant="outline" size="sm" className="flex-1 sm:flex-none">
              <UserPlus className="w-4 h-4 ml-1" /> منح بادج
            </Button>
            <Button onClick={() => setShowCreateDialog(true)} size="sm" className="flex-1 sm:flex-none">
              <Plus className="w-4 h-4 ml-1" /> بادج جديد
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader><CardTitle className="font-cairo">البادجات المتاحة</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>
            ) : (
              <div className="overflow-x-auto">
                <Table className="min-w-[640px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right font-cairo">الأيقونة</TableHead>
                      <TableHead className="text-right font-cairo">الاسم</TableHead>
                      <TableHead className="text-right font-cairo">الوصف</TableHead>
                      <TableHead className="text-right font-cairo">إجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {badges.map(badge => (
                      <TableRow key={badge.id}>
                        <TableCell><span className="text-2xl" style={{ color: badge.badge_color }}>{badge.icon_emoji}</span></TableCell>
                        <TableCell className="font-cairo">{badge.name}</TableCell>
                        <TableCell className="font-cairo text-sm text-muted-foreground">{badge.description || '-'}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(badge.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="font-cairo">البادجات الممنوحة</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table className="min-w-[700px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right font-cairo">البادج</TableHead>
                    <TableHead className="text-right font-cairo">المستخدم</TableHead>
                    <TableHead className="text-right font-cairo">السبب</TableHead>
                    <TableHead className="text-right font-cairo">التاريخ</TableHead>
                    <TableHead className="text-right font-cairo">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grantedBadges.map((ub: any) => {
                    const u = users.find(u => u.user_id === ub.user_id);
                    return (
                      <TableRow key={ub.id}>
                        <TableCell className="text-xl">{(ub.badges as any)?.icon_emoji} {(ub.badges as any)?.name}</TableCell>
                        <TableCell className="font-cairo text-sm">{u?.full_name || ub.user_id?.slice(0, 8)}</TableCell>
                        <TableCell className="font-cairo text-sm text-muted-foreground">{ub.reason || '-'}</TableCell>
                        <TableCell className="text-sm">{new Date(ub.granted_at).toLocaleDateString('ar-SA')}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => handleRevoke(ub.id)} className="text-destructive text-xs">سحب</Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-cairo">إنشاء بادج جديد</DialogTitle>
              <DialogDescription className="font-cairo">أنشئ بادج مخصص لتوزيعه على المستخدمين</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div><Label className="font-cairo">الاسم (عربي)</Label><Input value={formName} onChange={e => setFormName(e.target.value)} dir="rtl" /></div>
              <div><Label className="font-cairo">الاسم (إنجليزي)</Label><Input value={formNameEn} onChange={e => setFormNameEn(e.target.value)} dir="ltr" /></div>
              <div><Label className="font-cairo">الوصف</Label><Textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} dir="rtl" /></div>
              <div>
                <Label className="font-cairo">الأيقونة</Label>
                <div className="flex gap-2 flex-wrap mt-1">
                  {EMOJI_OPTIONS.map(e => (
                    <button key={e} type="button" onClick={() => setFormEmoji(e)}
                      className={`text-2xl p-2 rounded-lg border-2 ${formEmoji === e ? 'border-primary bg-primary/10' : 'border-border'}`}>{e}</button>
                  ))}
                </div>
              </div>
              <div><Label className="font-cairo">اللون</Label><Input type="color" value={formColor} onChange={e => setFormColor(e.target.value)} className="w-20 h-10" /></div>
              <Button onClick={handleCreate} className="w-full font-cairo">إنشاء البادج</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showGrantDialog} onOpenChange={setShowGrantDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-cairo">منح بادج لمستخدم</DialogTitle>
              <DialogDescription className="font-cairo">اختر البادج والمستخدم</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="font-cairo">البادج</Label>
                <Select value={grantBadgeId} onValueChange={setGrantBadgeId}>
                  <SelectTrigger><SelectValue placeholder="اختر بادج" /></SelectTrigger>
                  <SelectContent>
                    {badges.filter(b => b.is_active).map(b => (
                      <SelectItem key={b.id} value={b.id}>{b.icon_emoji} {b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="font-cairo">المستخدم</Label>
                <Select value={grantUserId} onValueChange={setGrantUserId}>
                  <SelectTrigger><SelectValue placeholder="اختر مستخدم" /></SelectTrigger>
                  <SelectContent>
                    {users.map(u => (
                      <SelectItem key={u.user_id} value={u.user_id}>{u.full_name || u.email || u.user_id.slice(0, 8)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div><Label className="font-cairo">السبب (اختياري)</Label><Input value={grantReason} onChange={e => setGrantReason(e.target.value)} dir="rtl" /></div>
              <Button onClick={handleGrant} className="w-full font-cairo">منح البادج</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminPageShell>
  );
}

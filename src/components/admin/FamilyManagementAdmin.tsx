import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Users, CheckCircle, XCircle, Clock, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface FamilyMemberAdmin {
  id: string;
  user_id: string;
  relationship: string;
  full_name: string;
  date_of_birth: string | null;
  national_id: string | null;
  document_front_url: string | null;
  document_back_url: string | null;
  verification_status: string;
  verification_notes: string | null;
  created_at: string;
}

export default function FamilyManagementAdmin() {
  const { toast } = useToast();
  const [members, setMembers] = useState<FamilyMemberAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<FamilyMemberAdmin | null>(null);
  const [notes, setNotes] = useState("");

  useEffect(() => { fetchMembers(); }, []);

  const fetchMembers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('family_members')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    if (error) console.error(error);
    setMembers(data || []);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('family_members')
      .update({ verification_status: status, verification_notes: notes || null, verified_at: status === 'verified' ? new Date().toISOString() : null })
      .eq('id', id);
    if (error) {
      toast({ title: "خطأ", description: "حدث خطأ", variant: "destructive" });
    } else {
      toast({ title: "تم التحديث", description: `تم ${status === 'verified' ? 'توثيق' : 'رفض'} العضو` });
      setSelectedMember(null);
      setNotes("");
      fetchMembers();
    }
  };

  const getRelLabel = (r: string) => r === 'spouse' ? 'الزوجة' : r === 'child' ? 'ابن/ابنة' : r === 'mother' ? 'الأم' : r;

  if (loading) return <div className="text-center p-8">جاري التحميل...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <Users className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold arabic-text">إدارة طلبات العائلة</h1>
      </div>

      {members.length === 0 ? (
        <Card><CardContent className="text-center py-12 arabic-text">لا توجد طلبات عائلة</CardContent></Card>
      ) : (
        <div className="grid gap-4">
          {members.map((m) => (
            <Card key={m.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold arabic-text">{m.full_name}</p>
                    <p className="text-sm text-muted-foreground arabic-text">{getRelLabel(m.relationship)}</p>
                    <p className="text-xs text-muted-foreground">User: {m.user_id.slice(0, 8)}...</p>
                    {m.national_id && <p className="text-xs text-muted-foreground">ID: {m.national_id}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={m.verification_status === 'verified' ? 'default' : m.verification_status === 'rejected' ? 'destructive' : 'secondary'}>
                      {m.verification_status === 'verified' ? 'موثق' : m.verification_status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}
                    </Badge>
                    <Button size="sm" variant="outline" onClick={() => { setSelectedMember(m); setNotes(m.verification_notes || ""); }}>
                      <Eye className="w-4 h-4 ml-1" /> مراجعة
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="arabic-text">مراجعة طلب العائلة</DialogTitle>
            <DialogDescription className="arabic-text">
              مراجعة وتوثيق أو رفض طلب إضافة فرد العائلة
            </DialogDescription>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-4" dir="rtl">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><strong>الاسم:</strong> {selectedMember.full_name}</div>
                <div><strong>القرابة:</strong> {getRelLabel(selectedMember.relationship)}</div>
                {selectedMember.date_of_birth && <div><strong>تاريخ الميلاد:</strong> {new Date(selectedMember.date_of_birth).toLocaleDateString('ar-EG')}</div>}
                {selectedMember.national_id && <div><strong>رقم الهوية:</strong> {selectedMember.national_id}</div>}
              </div>
              <div>
                <label className="text-sm font-medium arabic-text">ملاحظات المراجعة</label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="أضف ملاحظاتك..." />
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => updateStatus(selectedMember.id, 'verified')}>
                  <CheckCircle className="w-4 h-4 ml-1" /> توثيق
                </Button>
                <Button variant="destructive" className="flex-1" onClick={() => updateStatus(selectedMember.id, 'rejected')}>
                  <XCircle className="w-4 h-4 ml-1" /> رفض
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

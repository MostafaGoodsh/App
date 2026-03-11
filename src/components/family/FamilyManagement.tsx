import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Users, Plus, Trash2, CheckCircle, Clock, XCircle, Upload, Baby, Heart, UserCircle } from "lucide-react";

interface FamilyMember {
  id: string;
  relationship: string;
  full_name: string;
  date_of_birth: string | null;
  national_id: string | null;
  document_front_url: string | null;
  document_back_url: string | null;
  verification_status: string;
  verification_notes: string | null;
  verified_at: string | null;
  is_active: boolean;
  created_at: string;
}

const RELATIONSHIP_OPTIONS = [
  { value: 'spouse', label: 'الزوجة', icon: Heart, emoji: '💑' },
  { value: 'child', label: 'ابن/ابنة (أقل من 16)', icon: Baby, emoji: '👶' },
  { value: 'mother', label: 'الأم', icon: UserCircle, emoji: '👩' },
];

export default function FamilyManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    relationship: '',
    full_name: '',
    date_of_birth: '',
    national_id: '',
  });
  const [documentFrontFile, setDocumentFrontFile] = useState<File | null>(null);
  const [documentBackFile, setDocumentBackFile] = useState<File | null>(null);

  useEffect(() => {
    if (user) fetchMembers();
  }, [user]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('family_members')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching family members:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ relationship: '', full_name: '', date_of_birth: '', national_id: '' });
    setDocumentFrontFile(null);
    setDocumentBackFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.relationship || !formData.full_name) return;

    // Validate child age
    if (formData.relationship === 'child' && formData.date_of_birth) {
      const age = (Date.now() - new Date(formData.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000);
      if (age >= 16) {
        toast({ title: "خطأ", description: "يجب أن يكون عمر الطفل أقل من 16 عام", variant: "destructive" });
        return;
      }
    }

    // Check spouse limit
    if (formData.relationship === 'spouse') {
      const existingSpouse = members.find(m => m.relationship === 'spouse');
      if (existingSpouse) {
        toast({ title: "خطأ", description: "لا يمكن إضافة أكثر من زوجة واحدة", variant: "destructive" });
        return;
      }
    }

    // Check mother limit
    if (formData.relationship === 'mother') {
      const existingMother = members.find(m => m.relationship === 'mother');
      if (existingMother) {
        toast({ title: "خطأ", description: "تم إضافة الأم بالفعل", variant: "destructive" });
        return;
      }
    }

    setSubmitting(true);
    try {
      let frontUrl = null;
      let backUrl = null;

      // Upload documents if provided
      if (documentFrontFile) {
        const timestamp = Date.now();
        const { data, error } = await supabase.storage
          .from('identity-documents')
          .upload(`${user.id}/family/front_${timestamp}.${documentFrontFile.name.split('.').pop()}`, documentFrontFile);
        if (error) throw error;
        frontUrl = data.path;
      }

      if (documentBackFile) {
        const timestamp = Date.now();
        const { data, error } = await supabase.storage
          .from('identity-documents')
          .upload(`${user.id}/family/back_${timestamp}.${documentBackFile.name.split('.').pop()}`, documentBackFile);
        if (error) throw error;
        backUrl = data.path;
      }

      const { error } = await supabase
        .from('family_members')
        .insert([{
          user_id: user.id,
          relationship: formData.relationship,
          full_name: formData.full_name,
          date_of_birth: formData.date_of_birth || null,
          national_id: formData.national_id || null,
          document_front_url: frontUrl,
          document_back_url: backUrl,
        }]);

      if (error) throw error;

      toast({ title: "تم الإضافة", description: "تم إضافة فرد العائلة بنجاح وسيتم مراجعة المستندات" });
      setShowDialog(false);
      resetForm();
      fetchMembers();
    } catch (error) {
      console.error('Error adding family member:', error);
      toast({ title: "خطأ", description: "حدث خطأ أثناء إضافة فرد العائلة", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا العضو؟')) return;
    try {
      const { error } = await supabase
        .from('family_members')
        .update({ is_active: false })
        .eq('id', id);
      if (error) throw error;
      toast({ title: "تم الحذف", description: "تم حذف فرد العائلة" });
      fetchMembers();
    } catch (error) {
      toast({ title: "خطأ", description: "حدث خطأ أثناء الحذف", variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified': return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />موثق</Badge>;
      case 'pending': return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />قيد المراجعة</Badge>;
      case 'rejected': return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />مرفوض</Badge>;
      default: return null;
    }
  };

  const getRelationshipLabel = (rel: string) => {
    return RELATIONSHIP_OPTIONS.find(r => r.value === rel)?.label || rel;
  };
  const getRelationshipEmoji = (rel: string) => {
    return RELATIONSHIP_OPTIONS.find(r => r.value === rel)?.emoji || '👤';
  };

  if (loading) {
    return <div className="flex justify-center p-8 arabic-text">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6" dir="rtl">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <CardTitle className="arabic-text">إدارة العائلة</CardTitle>
            </div>
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
              <DialogTrigger asChild>
                <Button size="sm" onClick={resetForm}>
                  <Plus className="h-4 w-4 ml-1" />
                  إضافة فرد
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="arabic-text">إضافة فرد من العائلة</DialogTitle>
                  <DialogDescription className="arabic-text">
                    أضف أفراد عائلتك للحصول على مكافآت إضافية
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
                  <div>
                    <Label className="arabic-text">صلة القرابة</Label>
                    <Select value={formData.relationship} onValueChange={(v) => setFormData({...formData, relationship: v})}>
                      <SelectTrigger><SelectValue placeholder="اختر صلة القرابة" /></SelectTrigger>
                      <SelectContent>
                        {RELATIONSHIP_OPTIONS.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.emoji} {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="arabic-text">الاسم الكامل</Label>
                    <Input
                      value={formData.full_name}
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                      placeholder="الاسم كما في الوثيقة الرسمية"
                      required
                    />
                  </div>

                  <div>
                    <Label className="arabic-text">تاريخ الميلاد</Label>
                    <Input
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label className="arabic-text">الرقم القومي / رقم الهوية</Label>
                    <Input
                      value={formData.national_id}
                      onChange={(e) => setFormData({...formData, national_id: e.target.value})}
                      placeholder="أدخل رقم الهوية"
                    />
                  </div>

                  <div>
                    <Label className="arabic-text">صورة الوثيقة (أمام)</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setDocumentFrontFile(e.target.files?.[0] || null)}
                    />
                  </div>

                  <div>
                    <Label className="arabic-text">صورة الوثيقة (خلف)</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setDocumentBackFile(e.target.files?.[0] || null)}
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1" disabled={submitting}>
                      {submitting ? 'جاري الإضافة...' : 'إضافة'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                      إلغاء
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <CardDescription className="arabic-text">
            أضف أفراد عائلتك (الزوجة، الأبناء أقل من 16، الأم) للحصول على بادج العائلة وزيادة التعدين
          </CardDescription>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="arabic-text">لم تقم بإضافة أي فرد من العائلة بعد</p>
              <p className="text-sm arabic-text mt-1">أضف عائلتك للحصول على مكافآت إضافية</p>
            </div>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getRelationshipEmoji(member.relationship)}</span>
                    <div>
                      <p className="font-medium arabic-text">{member.full_name}</p>
                      <p className="text-sm text-muted-foreground arabic-text">{getRelationshipLabel(member.relationship)}</p>
                      {member.date_of_birth && (
                        <p className="text-xs text-muted-foreground">
                          {new Date(member.date_of_birth).toLocaleDateString('ar-EG')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(member.verification_status)}
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(member.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

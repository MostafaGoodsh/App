import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Save, RefreshCw, Plus, Edit, Trash2, ArrowUp, ArrowDown, Home } from "lucide-react";

interface HomePageCard {
  id: string;
  title: string;
  title_en: string | null;
  description: string | null;
  description_en: string | null;
  slug: string;
  card_type: string;
  display_order: number;
  is_active: boolean;
  background_image: string | null;
  background_color: string;
  background_gradient: string;
  icon_url: string | null;
  font_size: string;
  font_family: string;
  font_weight: string;
  title_font_size: string;
  content_font_size: string;
  text_color: string;
  route_path: string | null;
  page_content: string | null;
  page_content_en: string | null;
  external_widget_url: string | null;
  widget_type: string | null;
  widget_config: any;
}

export default function HomePageCardsManagement() {
  const [cards, setCards] = useState<HomePageCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingCard, setEditingCard] = useState<HomePageCard | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchCards = async () => {
    try {
      const { data, error } = await supabase
        .from('home_page_cards')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCards(data || []);
    } catch (error) {
      console.error('Error fetching cards:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل البطاقات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleMoveUp = async (card: HomePageCard) => {
    const index = cards.findIndex(c => c.id === card.id);
    if (index === 0) return;

    const prevCard = cards[index - 1];
    
    try {
      await Promise.all([
        supabase.from('home_page_cards').update({ display_order: prevCard.display_order }).eq('id', card.id),
        supabase.from('home_page_cards').update({ display_order: card.display_order }).eq('id', prevCard.id)
      ]);
      
      await fetchCards();
      toast({ title: "تم التحديث", description: "تم تغيير ترتيب البطاقة" });
    } catch (error) {
      toast({ title: "خطأ", description: "فشل في تحديث الترتيب", variant: "destructive" });
    }
  };

  const handleMoveDown = async (card: HomePageCard) => {
    const index = cards.findIndex(c => c.id === card.id);
    if (index === cards.length - 1) return;

    const nextCard = cards[index + 1];
    
    try {
      await Promise.all([
        supabase.from('home_page_cards').update({ display_order: nextCard.display_order }).eq('id', card.id),
        supabase.from('home_page_cards').update({ display_order: card.display_order }).eq('id', nextCard.id)
      ]);
      
      await fetchCards();
      toast({ title: "تم التحديث", description: "تم تغيير ترتيب البطاقة" });
    } catch (error) {
      toast({ title: "خطأ", description: "فشل في تحديث الترتيب", variant: "destructive" });
    }
  };

  const openCreateDialog = () => {
    setEditingCard({
      id: '',
      title: '',
      title_en: '',
      description: '',
      description_en: '',
      slug: '',
      card_type: 'custom',
      display_order: cards.length + 1,
      is_active: true,
      background_image: '',
      background_color: '#1a1a2e',
      background_gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      icon_url: '',
      font_size: 'medium',
      font_family: 'Cairo',
      font_weight: 'normal',
      title_font_size: 'large',
      content_font_size: 'medium',
      text_color: '#ffffff',
      route_path: '',
      page_content: '',
      page_content_en: '',
      external_widget_url: '',
      widget_type: 'none',
      widget_config: {}
    });
    setDialogOpen(true);
  };

  const openEditDialog = (card: HomePageCard) => {
    setEditingCard(card);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingCard) return;
    
    setSaving(true);
    try {
      if (editingCard.id) {
        const { error } = await supabase
          .from('home_page_cards')
          .update(editingCard)
          .eq('id', editingCard.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('home_page_cards')
          .insert([editingCard]);
        
        if (error) throw error;
      }

      toast({ title: "تم الحفظ", description: "تم حفظ البطاقة بنجاح" });
      setDialogOpen(false);
      await fetchCards();
    } catch (error) {
      console.error('Error saving card:', error);
      toast({ title: "خطأ", description: "فشل في حفظ البطاقة", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه البطاقة؟')) return;
    
    try {
      const { error } = await supabase
        .from('home_page_cards')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({ title: "تم الحذف", description: "تم حذف البطاقة بنجاح" });
      await fetchCards();
    } catch (error) {
      toast({ title: "خطأ", description: "فشل في حذف البطاقة", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            إدارة بطاقات الصفحة الرئيسية
          </CardTitle>
          <Button onClick={openCreateDialog}>
            <Plus className="w-4 h-4 mr-2" />
            إضافة بطاقة جديدة
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الترتيب</TableHead>
                <TableHead>العنوان</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cards.map((card, index) => (
                <TableRow key={card.id}>
                  <TableCell>{card.display_order}</TableCell>
                  <TableCell>{card.title}</TableCell>
                  <TableCell>{card.card_type}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${card.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {card.is_active ? 'نشط' : 'غير نشط'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => handleMoveUp(card)} disabled={index === 0}>
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleMoveDown(card)} disabled={index === cards.length - 1}>
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => openEditDialog(card)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(card.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCard?.id ? 'تحرير البطاقة' : 'إضافة بطاقة جديدة'}</DialogTitle>
          </DialogHeader>
          
          {editingCard && (
            <Tabs defaultValue="basic" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">أساسي</TabsTrigger>
                <TabsTrigger value="styling">التصميم</TabsTrigger>
                <TabsTrigger value="fonts">الخطوط</TabsTrigger>
                <TabsTrigger value="widgets">الويدجتات</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>العنوان (عربي)</Label>
                    <Input value={editingCard.title} onChange={(e) => setEditingCard({...editingCard, title: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>العنوان (English)</Label>
                    <Input value={editingCard.title_en || ''} onChange={(e) => setEditingCard({...editingCard, title_en: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>الوصف (عربي)</Label>
                  <Textarea value={editingCard.description || ''} onChange={(e) => setEditingCard({...editingCard, description: e.target.value})} rows={3} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Slug</Label>
                    <Input value={editingCard.slug} onChange={(e) => setEditingCard({...editingCard, slug: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>نوع البطاقة</Label>
                    <Select value={editingCard.card_type} onValueChange={(value) => setEditingCard({...editingCard, card_type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">عادي</SelectItem>
                        <SelectItem value="learning">تعلم</SelectItem>
                        <SelectItem value="reels">ريلز</SelectItem>
                        <SelectItem value="updates">تحديثات</SelectItem>
                        <SelectItem value="tasks">مهام</SelectItem>
                        <SelectItem value="callout">استدعاء</SelectItem>
                        <SelectItem value="identity">هوية</SelectItem>
                        <SelectItem value="wallet">محفظة</SelectItem>
                        <SelectItem value="anubis">أنوبيس</SelectItem>
                        <SelectItem value="live_stream">البث المباشر</SelectItem>
                        <SelectItem value="custom">مخصص</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>مسار الصفحة</Label>
                  <Input value={editingCard.route_path || ''} onChange={(e) => setEditingCard({...editingCard, route_path: e.target.value})} placeholder="/page-route" />
                </div>
              </TabsContent>

              <TabsContent value="styling" className="space-y-4">
                <div className="space-y-2">
                  <Label>صورة الخلفية (URL)</Label>
                  <Input value={editingCard.background_image || ''} onChange={(e) => setEditingCard({...editingCard, background_image: e.target.value})} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>لون الخلفية</Label>
                    <Input type="color" value={editingCard.background_color} onChange={(e) => setEditingCard({...editingCard, background_color: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>لون النص</Label>
                    <Input type="color" value={editingCard.text_color} onChange={(e) => setEditingCard({...editingCard, text_color: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Gradient الخلفية</Label>
                  <Input value={editingCard.background_gradient} onChange={(e) => setEditingCard({...editingCard, background_gradient: e.target.value})} />
                </div>
              </TabsContent>

              <TabsContent value="fonts" className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>نوع الخط</Label>
                    <Select value={editingCard.font_family} onValueChange={(value) => setEditingCard({...editingCard, font_family: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cairo">Cairo</SelectItem>
                        <SelectItem value="Amiri">Amiri</SelectItem>
                        <SelectItem value="Tajawal">Tajawal</SelectItem>
                        <SelectItem value="Arial">Arial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>سمك الخط</Label>
                    <Select value={editingCard.font_weight} onValueChange={(value) => setEditingCard({...editingCard, font_weight: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">عادي</SelectItem>
                        <SelectItem value="bold">عريض</SelectItem>
                        <SelectItem value="light">خفيف</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>حجم النص</Label>
                    <Select value={editingCard.font_size} onValueChange={(value) => setEditingCard({...editingCard, font_size: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">صغير</SelectItem>
                        <SelectItem value="medium">متوسط</SelectItem>
                        <SelectItem value="large">كبير</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="widgets" className="space-y-4">
                <div className="space-y-2">
                  <Label>نوع الويدجت</Label>
                  <Select value={editingCard.widget_type || 'none'} onValueChange={(value) => setEditingCard({...editingCard, widget_type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">بدون</SelectItem>
                      <SelectItem value="iframe">iFrame</SelectItem>
                      <SelectItem value="dexscreener">DexScreener</SelectItem>
                      <SelectItem value="pumpfun">Pump.fun</SelectItem>
                      <SelectItem value="wallet_balance">رصيد المحفظة</SelectItem>
                      <SelectItem value="custom_embed">كود مخصص</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {editingCard.widget_type && editingCard.widget_type !== 'none' && (
                  <div className="space-y-2">
                    <Label>رابط/كود الويدجت</Label>
                    <Textarea 
                      value={editingCard.external_widget_url || ''} 
                      onChange={(e) => setEditingCard({...editingCard, external_widget_url: e.target.value})} 
                      rows={4}
                      placeholder="أدخل رابط URL أو كود الويدجت"
                    />
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              حفظ
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
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
import { 
  Plus, 
  Save, 
  Trash2, 
  Edit, 
  RefreshCw, 
  Home, 
  ArrowUp, 
  ArrowDown,
  Eye,
  EyeOff
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

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
  created_at: string;
  updated_at: string;
}

export default function HomePageCardsManagement() {
  const [cards, setCards] = useState<HomePageCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<HomePageCard | null>(null);
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
    const currentIndex = cards.findIndex(c => c.id === card.id);
    if (currentIndex <= 0) return;

    const prevCard = cards[currentIndex - 1];
    
    try {
      await supabase
        .from('home_page_cards')
        .update({ display_order: card.display_order })
        .eq('id', prevCard.id);

      await supabase
        .from('home_page_cards')
        .update({ display_order: prevCard.display_order })
        .eq('id', card.id);

      await fetchCards();
      
      toast({
        title: "تم التحديث",
        description: "تم تحديث ترتيب البطاقات",
      });
    } catch (error) {
      console.error('Error moving card:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث الترتيب",
        variant: "destructive",
      });
    }
  };

  const handleMoveDown = async (card: HomePageCard) => {
    const currentIndex = cards.findIndex(c => c.id === card.id);
    if (currentIndex >= cards.length - 1) return;

    const nextCard = cards[currentIndex + 1];
    
    try {
      await supabase
        .from('home_page_cards')
        .update({ display_order: card.display_order })
        .eq('id', nextCard.id);

      await supabase
        .from('home_page_cards')
        .update({ display_order: nextCard.display_order })
        .eq('id', card.id);

      await fetchCards();
      
      toast({
        title: "تم التحديث",
        description: "تم تحديث ترتيب البطاقات",
      });
    } catch (error) {
      console.error('Error moving card:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث الترتيب",
        variant: "destructive",
      });
    }
  };

  const openCreateDialog = () => {
    setSelectedCard({
      id: '',
      title: '',
      title_en: '',
      description: '',
      description_en: '',
      slug: '',
      card_type: 'standard',
      display_order: cards.length,
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
      widget_config: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    setDialogOpen(true);
  };

  const openEditDialog = (card: HomePageCard) => {
    setSelectedCard(card);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selectedCard) return;

    setSaving(true);
    try {
      const cardData = {
        title: selectedCard.title,
        title_en: selectedCard.title_en,
        description: selectedCard.description,
        description_en: selectedCard.description_en,
        slug: selectedCard.slug,
        card_type: selectedCard.card_type,
        display_order: selectedCard.display_order,
        is_active: selectedCard.is_active,
        background_image: selectedCard.background_image,
        background_color: selectedCard.background_color,
        background_gradient: selectedCard.background_gradient,
        icon_url: selectedCard.icon_url,
        font_size: selectedCard.font_size,
        font_family: selectedCard.font_family,
        font_weight: selectedCard.font_weight,
        title_font_size: selectedCard.title_font_size,
        content_font_size: selectedCard.content_font_size,
        text_color: selectedCard.text_color,
        route_path: selectedCard.route_path,
        page_content: selectedCard.page_content,
        page_content_en: selectedCard.page_content_en,
        external_widget_url: selectedCard.external_widget_url,
        widget_type: selectedCard.widget_type,
        widget_config: selectedCard.widget_config,
        updated_at: new Date().toISOString(),
      };

      if (selectedCard.id) {
        const { error } = await supabase
          .from('home_page_cards')
          .update(cardData)
          .eq('id', selectedCard.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('home_page_cards')
          .insert(cardData);

        if (error) throw error;
      }

      toast({
        title: "تم الحفظ",
        description: "تم حفظ البطاقة بنجاح",
      });

      setDialogOpen(false);
      await fetchCards();
    } catch (error: any) {
      console.error('Error saving card:', error);
      toast({
        title: "خطأ",
        description: error.message || "فشل في حفظ البطاقة",
        variant: "destructive",
      });
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

      toast({
        title: "تم الحذف",
        description: "تم حذف البطاقة بنجاح",
      });

      await fetchCards();
    } catch (error) {
      console.error('Error deleting card:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف البطاقة",
        variant: "destructive",
      });
    }
  };

  const toggleActive = async (card: HomePageCard) => {
    try {
      const { error } = await supabase
        .from('home_page_cards')
        .update({ is_active: !card.is_active })
        .eq('id', card.id);

      if (error) throw error;

      await fetchCards();
      
      toast({
        title: "تم التحديث",
        description: card.is_active ? "تم إخفاء البطاقة" : "تم تفعيل البطاقة",
      });
    } catch (error) {
      console.error('Error toggling active:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث الحالة",
        variant: "destructive",
      });
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
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="arabic-text flex items-center gap-2">
              <Home className="h-5 w-5" />
              إدارة بطاقات الصفحة الرئيسية
            </CardTitle>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateDialog} className="arabic-text">
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة بطاقة جديدة
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="arabic-text">
                    {selectedCard?.id ? 'تعديل البطاقة' : 'إضافة بطاقة جديدة'}
                  </DialogTitle>
                </DialogHeader>

                {selectedCard && (
                  <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid w-full grid-cols-5">
                      <TabsTrigger value="basic">أساسي</TabsTrigger>
                      <TabsTrigger value="content">المحتوى</TabsTrigger>
                      <TabsTrigger value="styling">التصميم</TabsTrigger>
                      <TabsTrigger value="fonts">الخطوط</TabsTrigger>
                      <TabsTrigger value="widgets">الويدجتات</TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">العنوان (عربي)</Label>
                          <Input
                            id="title"
                            value={selectedCard.title}
                            onChange={(e) => setSelectedCard({ ...selectedCard, title: e.target.value })}
                            placeholder="عنوان البطاقة"
                            dir="rtl"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="title_en">العنوان (إنجليزي)</Label>
                          <Input
                            id="title_en"
                            value={selectedCard.title_en || ''}
                            onChange={(e) => setSelectedCard({ ...selectedCard, title_en: e.target.value })}
                            placeholder="Card Title"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="slug">المعرّف (Slug)</Label>
                          <Input
                            id="slug"
                            value={selectedCard.slug}
                            onChange={(e) => setSelectedCard({ ...selectedCard, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                            placeholder="card-slug"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="card_type">نوع البطاقة</Label>
                          <Select
                            value={selectedCard.card_type}
                            onValueChange={(value) => setSelectedCard({ ...selectedCard, card_type: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="standard">قياسي</SelectItem>
                              <SelectItem value="learning">تعلم</SelectItem>
                              <SelectItem value="reels">فيديوهات قصيرة</SelectItem>
                              <SelectItem value="updates">تحديثات</SelectItem>
                              <SelectItem value="tasks">مهام</SelectItem>
                              <SelectItem value="callout">استدعاء</SelectItem>
                              <SelectItem value="identity">هوية</SelectItem>
                              <SelectItem value="wallet">محفظة</SelectItem>
                              <SelectItem value="anubis">أنوبيس</SelectItem>
                              <SelectItem value="custom">مخصص</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="route_path">مسار الصفحة</Label>
                        <Input
                          id="route_path"
                          value={selectedCard.route_path || ''}
                          onChange={(e) => setSelectedCard({ ...selectedCard, route_path: e.target.value })}
                          placeholder="/page-path"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="display_order">ترتيب العرض</Label>
                          <Input
                            id="display_order"
                            type="number"
                            value={selectedCard.display_order}
                            onChange={(e) => setSelectedCard({ ...selectedCard, display_order: parseInt(e.target.value) })}
                          />
                        </div>
                        <div className="flex items-center space-x-2 pt-8">
                          <Switch
                            checked={selectedCard.is_active}
                            onCheckedChange={(checked) => setSelectedCard({ ...selectedCard, is_active: checked })}
                          />
                          <Label>نشط</Label>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="content" className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="description">الوصف (عربي)</Label>
                        <Textarea
                          id="description"
                          value={selectedCard.description || ''}
                          onChange={(e) => setSelectedCard({ ...selectedCard, description: e.target.value })}
                          placeholder="وصف البطاقة..."
                          rows={3}
                          dir="rtl"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description_en">الوصف (إنجليزي)</Label>
                        <Textarea
                          id="description_en"
                          value={selectedCard.description_en || ''}
                          onChange={(e) => setSelectedCard({ ...selectedCard, description_en: e.target.value })}
                          placeholder="Card description..."
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="page_content">محتوى الصفحة (عربي - HTML)</Label>
                        <Textarea
                          id="page_content"
                          value={selectedCard.page_content || ''}
                          onChange={(e) => setSelectedCard({ ...selectedCard, page_content: e.target.value })}
                          placeholder="محتوى الصفحة الداخلية بصيغة HTML..."
                          rows={8}
                          dir="rtl"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="page_content_en">محتوى الصفحة (إنجليزي - HTML)</Label>
                        <Textarea
                          id="page_content_en"
                          value={selectedCard.page_content_en || ''}
                          onChange={(e) => setSelectedCard({ ...selectedCard, page_content_en: e.target.value })}
                          placeholder="Page content in HTML..."
                          rows={8}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="styling" className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="background_image">صورة الخلفية (URL)</Label>
                        <Input
                          id="background_image"
                          value={selectedCard.background_image || ''}
                          onChange={(e) => setSelectedCard({ ...selectedCard, background_image: e.target.value })}
                          placeholder="/lovable-uploads/image.jpg"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="icon_url">أيقونة (URL)</Label>
                        <Input
                          id="icon_url"
                          value={selectedCard.icon_url || ''}
                          onChange={(e) => setSelectedCard({ ...selectedCard, icon_url: e.target.value })}
                          placeholder="/lovable-uploads/icon.png"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="background_color">لون الخلفية</Label>
                          <Input
                            id="background_color"
                            value={selectedCard.background_color}
                            onChange={(e) => setSelectedCard({ ...selectedCard, background_color: e.target.value })}
                            placeholder="#1a1a2e"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="text_color">لون النص</Label>
                          <Input
                            id="text_color"
                            value={selectedCard.text_color}
                            onChange={(e) => setSelectedCard({ ...selectedCard, text_color: e.target.value })}
                            placeholder="#ffffff"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="background_gradient">تدرج الخلفية (CSS)</Label>
                        <Input
                          id="background_gradient"
                          value={selectedCard.background_gradient}
                          onChange={(e) => setSelectedCard({ ...selectedCard, background_gradient: e.target.value })}
                          placeholder="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="fonts" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="font_family">نوع الخط</Label>
                          <Select
                            value={selectedCard.font_family}
                            onValueChange={(value) => setSelectedCard({ ...selectedCard, font_family: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Cairo">Cairo</SelectItem>
                              <SelectItem value="Tajawal">Tajawal</SelectItem>
                              <SelectItem value="Amiri">Amiri</SelectItem>
                              <SelectItem value="Almarai">Almarai</SelectItem>
                              <SelectItem value="Arial">Arial</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="font_weight">وزن الخط</Label>
                          <Select
                            value={selectedCard.font_weight}
                            onValueChange={(value) => setSelectedCard({ ...selectedCard, font_weight: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="bold">Bold</SelectItem>
                              <SelectItem value="light">Light</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="title_font_size">حجم خط العنوان</Label>
                          <Select
                            value={selectedCard.title_font_size}
                            onValueChange={(value) => setSelectedCard({ ...selectedCard, title_font_size: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="small">صغير</SelectItem>
                              <SelectItem value="medium">متوسط</SelectItem>
                              <SelectItem value="large">كبير</SelectItem>
                              <SelectItem value="xlarge">كبير جداً</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="content_font_size">حجم خط المحتوى</Label>
                          <Select
                            value={selectedCard.content_font_size}
                            onValueChange={(value) => setSelectedCard({ ...selectedCard, content_font_size: value })}
                          >
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

                        <div className="space-y-2">
                          <Label htmlFor="font_size">حجم الخط العام</Label>
                          <Select
                            value={selectedCard.font_size}
                            onValueChange={(value) => setSelectedCard({ ...selectedCard, font_size: value })}
                          >
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
                        <Label htmlFor="widget_type">نوع الويدجت</Label>
                        <Select
                          value={selectedCard.widget_type || 'none'}
                          onValueChange={(value) => setSelectedCard({ ...selectedCard, widget_type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">بدون</SelectItem>
                            <SelectItem value="iframe">Iframe مخصص</SelectItem>
                            <SelectItem value="dexscreener">Dexscreener Chart</SelectItem>
                            <SelectItem value="pumpfun">Pump.fun Widget</SelectItem>
                            <SelectItem value="wallet_balance">رصيد المحفظة</SelectItem>
                            <SelectItem value="custom_embed">كود مخصص</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {selectedCard.widget_type && selectedCard.widget_type !== 'none' && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="external_widget_url">رابط الويدجت / الكود</Label>
                            <Textarea
                              id="external_widget_url"
                              value={selectedCard.external_widget_url || ''}
                              onChange={(e) => setSelectedCard({ ...selectedCard, external_widget_url: e.target.value })}
                              placeholder="https://example.com/widget أو كود HTML"
                              rows={4}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="widget_config">إعدادات الويدجت (JSON)</Label>
                            <Textarea
                              id="widget_config"
                              value={JSON.stringify(selectedCard.widget_config || {}, null, 2)}
                              onChange={(e) => {
                                try {
                                  setSelectedCard({ ...selectedCard, widget_config: JSON.parse(e.target.value) });
                                } catch (err) {
                                  // Invalid JSON, do nothing
                                }
                              }}
                              placeholder='{"height": "400px", "theme": "dark"}'
                              rows={4}
                            />
                          </div>
                        </>
                      )}

                      <div className="text-sm text-muted-foreground space-y-2 p-4 bg-muted rounded-lg">
                        <p className="font-semibold">أمثلة على الاستخدام:</p>
                        <p><strong>Dexscreener:</strong> https://dexscreener.com/solana/token-address</p>
                        <p><strong>Pump.fun:</strong> https://pump.fun/coin/token-address</p>
                        <p><strong>Iframe:</strong> أي رابط URL صالح</p>
                      </div>
                    </TabsContent>
                  </Tabs>
                )}

                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    إلغاء
                  </Button>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? (
                      <>
                        <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                        جاري الحفظ...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 ml-2" />
                        حفظ
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الترتيب</TableHead>
                <TableHead className="text-right">العنوان</TableHead>
                <TableHead className="text-right">النوع</TableHead>
                <TableHead className="text-right">المسار</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cards.map((card, index) => (
                <TableRow key={card.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{card.display_order}</span>
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMoveUp(card)}
                          disabled={index === 0}
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMoveDown(card)}
                          disabled={index === cards.length - 1}
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="arabic-text">{card.title}</TableCell>
                  <TableCell className="arabic-text">{card.card_type}</TableCell>
                  <TableCell>{card.route_path}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleActive(card)}
                    >
                      {card.is_active ? (
                        <Eye className="h-4 w-4 text-green-500" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(card)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(card.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {cards.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              لا توجد بطاقات. قم بإضافة بطاقة جديدة للبدء.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
import { useState, useEffect, useCallback } from "react";
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
import { Save, RefreshCw, Plus, Edit, Trash2, ArrowUp, ArrowDown, Home, Eye, EyeOff, Clock, Upload, Loader2, ImageIcon } from "lucide-react";

const SPECIAL_CARD_TYPES = ['tasks', 'anubis', 'reels', 'live_stream'];

const compressImage = (file: File, maxWidth = 1200, quality = 0.8): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas not supported'));
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error('Compression failed')),
        'image/jpeg',
        quality
      );
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

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
  is_coming_soon: boolean;
  title_text_align: string;
  description_text_align: string;
  card_size: string;
  card_shape: string;
  card_animation: string;
  min_height: string;
  card_opacity: number;
}

export default function HomePageCardsManagement() {
  const [cards, setCards] = useState<HomePageCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingCard, setEditingCard] = useState<HomePageCard | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const isImageRequired = useCallback((card: HomePageCard | null) => {
    if (!card) return false;
    return !SPECIAL_CARD_TYPES.includes(card.card_type);
  }, []);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editingCard) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: "خطأ", description: "يجب اختيار ملف صورة", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "خطأ", description: "حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const compressed = await compressImage(file);
      const compressedFile = new File([compressed], "home-card.jpg", { type: "image/jpeg" });
      const formData = new FormData();
      formData.append("file", compressedFile);

      const { data, error: uploadError } = await supabase.functions.invoke("upload-content-background", {
        body: formData,
      });

      if (uploadError) throw uploadError;
      if (!data?.success || !data?.url) {
        throw new Error(data?.error || "فشل في رفع الصورة");
      }

      setEditingCard({ ...editingCard, background_image: data.url });
      toast({ title: "تم رفع الصورة بنجاح" });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({ title: "خطأ", description: error.message || "فشل في رفع الصورة", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

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
      widget_config: {},
      is_coming_soon: false,
      title_text_align: 'center',
      description_text_align: 'center',
      card_size: 'large',
      card_shape: 'rounded',
      card_animation: 'none',
      min_height: '',
      card_opacity: 1,
    });
    setDialogOpen(true);
  };

  const openEditDialog = (card: HomePageCard) => {
    setEditingCard(card);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingCard) return;
    
    // التحقق من الحقول المطلوبة
    if (!editingCard.title || !editingCard.slug) {
      toast({ 
        title: "خطأ", 
        description: "العنوان والـ Slug مطلوبان", 
        variant: "destructive" 
      });
      return;
    }
    
    setSaving(true);
    try {
      const isNewCard = !editingCard.id || editingCard.id === '';
      
      // تجهيز البيانات
      const cardData: any = {
        title: editingCard.title,
        slug: editingCard.slug,
        card_type: editingCard.card_type,
        display_order: editingCard.display_order,
        is_active: editingCard.is_active,
        background_color: editingCard.background_color,
        background_gradient: editingCard.background_gradient,
        font_size: editingCard.font_size,
        font_family: editingCard.font_family,
        font_weight: editingCard.font_weight,
        title_font_size: editingCard.title_font_size,
        content_font_size: editingCard.content_font_size,
        text_color: editingCard.text_color,
        title_en: editingCard.title_en || null,
        description: editingCard.description || null,
        description_en: editingCard.description_en || null,
        background_image: editingCard.background_image || null,
        icon_url: editingCard.icon_url || null,
        route_path: editingCard.route_path || null,
        page_content: editingCard.page_content || null,
        page_content_en: editingCard.page_content_en || null,
        external_widget_url: editingCard.external_widget_url || null,
        widget_type: editingCard.widget_type || null,
        widget_config: editingCard.widget_config || {},
        is_coming_soon: editingCard.is_coming_soon || false,
        title_text_align: editingCard.title_text_align || 'center',
        description_text_align: editingCard.description_text_align || 'center'
      };

      if (isNewCard) {
        const { data, error } = await supabase
          .from('home_page_cards')
          .insert([cardData])
          .select();
        
        if (error) {
          console.error('Insert error:', error);
          throw error;
        }
        console.log('Inserted card:', data);
      } else {
        const { data, error, count } = await supabase
          .from('home_page_cards')
          .update(cardData)
          .eq('id', editingCard.id)
          .select();
        
        if (error) {
          console.error('Update error:', error);
          throw error;
        }
        
        if (!data || data.length === 0) {
          throw new Error('لم يتم تحديث أي بطاقة - تحقق من صلاحيات الإدارة');
        }
        console.log('Updated card:', data);
      }

      toast({ title: "تم الحفظ", description: "تم حفظ البطاقة بنجاح" });
      setDialogOpen(false);
      setEditingCard(null);
      await fetchCards();
    } catch (error: any) {
      console.error('Error saving card:', error);
      toast({ 
        title: "خطأ", 
        description: error.message || error.details || "فشل في حفظ البطاقة", 
        variant: "destructive" 
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

  const handleToggleVisibility = async (card: HomePageCard) => {
    try {
      const { error } = await supabase
        .from('home_page_cards')
        .update({ is_active: !card.is_active })
        .eq('id', card.id);
      
      if (error) throw error;
      
      toast({ title: card.is_active ? "تم إخفاء البطاقة" : "تم إظهار البطاقة" });
      await fetchCards();
    } catch (error) {
      toast({ title: "خطأ", description: "فشل في تحديث الحالة", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 font-cairo text-base sm:text-lg">
            <Home className="h-5 w-5" />
            إدارة بطاقات الصفحة الرئيسية
          </CardTitle>
          <Button onClick={openCreateDialog} size="sm">
            <Plus className="w-4 h-4 ml-1" />
            إضافة بطاقة
          </Button>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">الترتيب</TableHead>
                <TableHead className="text-xs">العنوان</TableHead>
                <TableHead className="text-xs hidden sm:table-cell">النوع</TableHead>
                <TableHead className="text-xs">الحالة</TableHead>
                <TableHead className="text-xs">قريباً</TableHead>
                <TableHead className="text-xs">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cards.map((card, index) => (
                <TableRow key={card.id}>
                  <TableCell className="text-xs">{card.display_order}</TableCell>
                  <TableCell className="text-xs font-cairo max-w-[120px] truncate">{card.title}</TableCell>
                  <TableCell className="text-xs hidden sm:table-cell">{card.card_type}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant={card.is_active ? "default" : "secondary"}
                      className="h-7 px-2 text-xs"
                      onClick={() => handleToggleVisibility(card)}
                    >
                      {card.is_active ? <Eye className="h-3 w-3 ml-1" /> : <EyeOff className="h-3 w-3 ml-1" />}
                      {card.is_active ? 'ظاهر' : 'مخفي'}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant={card.is_coming_soon ? "destructive" : "outline"}
                      className="h-7 px-2 text-xs"
                      onClick={async () => {
                        try {
                          const { error } = await supabase
                            .from('home_page_cards')
                            .update({ is_coming_soon: !card.is_coming_soon })
                            .eq('id', card.id);
                          if (error) throw error;
                          toast({ title: card.is_coming_soon ? "تم إلغاء التعليق" : "تم تعليق البطاقة" });
                          await fetchCards();
                        } catch (error) {
                          toast({ title: "خطأ", description: "فشل في التحديث", variant: "destructive" });
                        }
                      }}
                    >
                      <Clock className="h-3 w-3 ml-1" />
                      {card.is_coming_soon ? 'معلّق' : '-'}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleMoveUp(card)} disabled={index === 0}>
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleMoveDown(card)} disabled={index === cards.length - 1}>
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEditDialog(card)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleDelete(card.id)}>
                        <Trash2 className="h-3 w-3" />
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
                  <Label className="flex items-center gap-1">
                    <ImageIcon className="h-4 w-4" />
                    صورة الخلفية {isImageRequired(editingCard) && <span className="text-destructive">*</span>}
                  </Label>
                  <div className="flex items-center gap-3">
                    <label className="flex-1 cursor-pointer">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="cursor-pointer"
                      />
                    </label>
                    {uploading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
                  </div>
                  {editingCard.background_image && (
                    <div className="mt-2 flex items-center gap-3">
                      <img
                        src={editingCard.background_image}
                        alt="معاينة"
                        className="w-24 h-16 object-cover rounded border"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs text-destructive"
                        onClick={() => setEditingCard({...editingCard, background_image: ''})}
                      >
                        <Trash2 className="h-3 w-3 ml-1" />
                        حذف
                      </Button>
                    </div>
                  )}
                  {isImageRequired(editingCard) && !editingCard.background_image && (
                    <p className="text-xs text-destructive">صورة الخلفية مطلوبة لهذا النوع من البطاقات</p>
                  )}
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
                {/* Text Alignment */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>محاذاة العنوان | Title Align</Label>
                    <Select value={editingCard.title_text_align || 'center'} onValueChange={(value) => setEditingCard({...editingCard, title_text_align: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="right">يمين (Right)</SelectItem>
                        <SelectItem value="center">وسط (Center)</SelectItem>
                        <SelectItem value="left">يسار (Left)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>محاذاة الوصف | Description Align</Label>
                    <Select value={editingCard.description_text_align || 'center'} onValueChange={(value) => setEditingCard({...editingCard, description_text_align: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="right">يمين (Right)</SelectItem>
                        <SelectItem value="center">وسط (Center)</SelectItem>
                        <SelectItem value="left">يسار (Left)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

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
            <Button onClick={handleSave} disabled={saving || uploading || (isImageRequired(editingCard) && !editingCard?.background_image)}>
              {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              حفظ
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Save, X, Upload, ArrowUp, ArrowDown, Link, CreditCard, Settings2, ExternalLink } from "lucide-react";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ActionButton {
  label: string;
  label_en?: string;
  url: string;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost';
}

interface ServiceOption {
  id: string;
  name: string;
  name_en?: string;
  description?: string;
  isEnabled: boolean;
}

interface WidgetConfig {
  action_buttons?: ActionButton[];
  services?: ServiceOption[];
  show_payment_gateway?: boolean;
  payment_type?: 'presale' | 'liquidity' | 'services' | 'vault';
  payment_title?: string;
  payment_description?: string;
}

interface RoadmapCard {
  id: string;
  title: string;
  title_en?: string;
  slug: string;
  description?: string;
  description_en?: string;
  background_gradient: string;
  display_order: number;
  is_active: boolean;
  page_title?: string;
  page_title_en?: string;
  page_content?: string;
  page_content_en?: string;
  icon_url?: string;
  page_cover_image?: string;
  page_background?: string;
  page_text_color?: string;
  font_size?: string;
  font_family?: string;
  font_weight?: string;
  title_font_size?: string;
  content_font_size?: string;
  external_widget_url?: string;
  widget_type?: string;
  widget_config?: WidgetConfig;
}

const RoadmapCardsManagement = () => {
  const [cards, setCards] = useState<RoadmapCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCard, setEditingCard] = useState<Partial<RoadmapCard> | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const { data, error } = await supabase
        .from('roadmap_cards')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      // Cast data to handle widget_config JSON type
      const typedData = (data || []).map(card => ({
        ...card,
        widget_config: card.widget_config as WidgetConfig | undefined
      })) as RoadmapCard[];
      setCards(typedData);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل البيانات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingCard) return;

    try {
      // Cast widget_config to any to handle JSON type compatibility
      const cardToSave = {
        ...editingCard,
        widget_config: editingCard.widget_config as any
      };

      if (editingCard.id) {
        const { error } = await supabase
          .from('roadmap_cards')
          .update(cardToSave)
          .eq('id', editingCard.id);

        if (error) throw error;
        toast({ title: "تم التحديث بنجاح" });
      } else {
        const { error } = await supabase
          .from('roadmap_cards')
          .insert([cardToSave as any]);

        if (error) throw error;
        toast({ title: "تم الإضافة بنجاح" });
      }

      setIsDialogOpen(false);
      setEditingCard(null);
      fetchCards();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ البيانات",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('roadmap_cards')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "تم الحذف بنجاح" });
      fetchCards();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف البيانات",
        variant: "destructive",
      });
    }
  };

  const handleMoveUp = async (card: RoadmapCard) => {
    const currentIndex = cards.findIndex(c => c.id === card.id);
    if (currentIndex === 0) return;
    
    const prevCard = cards[currentIndex - 1];
    
    try {
      await supabase.from('roadmap_cards').update({ display_order: card.display_order }).eq('id', prevCard.id);
      await supabase.from('roadmap_cards').update({ display_order: prevCard.display_order }).eq('id', card.id);
      
      toast({ title: "تم تغيير الترتيب" });
      fetchCards();
    } catch (error) {
      console.error('Error:', error);
      toast({ title: "خطأ", description: "فشل في تغيير الترتيب", variant: "destructive" });
    }
  };

  const handleMoveDown = async (card: RoadmapCard) => {
    const currentIndex = cards.findIndex(c => c.id === card.id);
    if (currentIndex === cards.length - 1) return;
    
    const nextCard = cards[currentIndex + 1];
    
    try {
      await supabase.from('roadmap_cards').update({ display_order: card.display_order }).eq('id', nextCard.id);
      await supabase.from('roadmap_cards').update({ display_order: nextCard.display_order }).eq('id', card.id);
      
      toast({ title: "تم تغيير الترتيب" });
      fetchCards();
    } catch (error) {
      console.error('Error:', error);
      toast({ title: "خطأ", description: "فشل في تغيير الترتيب", variant: "destructive" });
    }
  };

  const openCreateDialog = () => {
    setEditingCard({
      title: '',
      slug: '',
      background_gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display_order: cards.length + 1,
      is_active: true,
      font_family: 'Cairo',
      font_size: 'medium',
      font_weight: 'normal',
      title_font_size: 'large',
      content_font_size: 'medium',
      widget_type: 'none',
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (card: RoadmapCard) => {
    setEditingCard(card);
    setIsDialogOpen(true);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, fieldName: 'icon_url' | 'page_cover_image') => {
    const file = event.target.files?.[0];
    if (!file) return;

    // التحقق من نوع الملف
    if (!file.type.startsWith('image/')) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار ملف صورة فقط",
        variant: "destructive",
      });
      return;
    }

    // التحقق من حجم الملف (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "خطأ",
        description: "حجم الصورة يجب أن يكون أقل من 5 ميجابايت",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const folderName = fieldName === 'icon_url' ? 'roadmap-icons' : 'roadmap-covers';
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${folderName}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // حذف الصورة القديمة إذا وجدت
      const oldImageUrl = editingCard?.[fieldName];
      if (oldImageUrl && oldImageUrl.includes('avatars/')) {
        const oldPath = oldImageUrl.split('avatars/')[1];
        await supabase.storage.from('avatars').remove([oldPath]);
      }

      setEditingCard({ ...editingCard, [fieldName]: publicUrl });

      toast({
        title: "تم رفع الصورة بنجاح",
        description: fieldName === 'icon_url' ? "تم تحميل الأيقونة بنجاح" : "تم تحميل صورة الغلاف بنجاح",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "خطأ",
        description: "فشل في رفع الصورة",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">الكروت ({cards.length})</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="ml-2 h-4 w-4" />
              إضافة كارت جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCard?.id ? 'تعديل الكارت' : 'إضافة كارت جديد'}
              </DialogTitle>
              <DialogDescription>
                أدخل تفاصيل الكارت
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="basic" className="py-4">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="basic">الأساسي</TabsTrigger>
                <TabsTrigger value="actions">الأزرار</TabsTrigger>
                <TabsTrigger value="fonts">الفونتات</TabsTrigger>
                <TabsTrigger value="widgets">Widgets</TabsTrigger>
                <TabsTrigger value="advanced">متقدم</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>العنوان (عربي)</Label>
                    <Input
                      value={editingCard?.title || ''}
                      onChange={(e) => setEditingCard({ ...editingCard, title: e.target.value })}
                      placeholder="العنوان بالعربية"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Title (English)</Label>
                    <Input
                      value={editingCard?.title_en || ''}
                      onChange={(e) => setEditingCard({ ...editingCard, title_en: e.target.value })}
                      placeholder="Title in English"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Slug (URL)</Label>
                  <Input
                    value={editingCard?.slug || ''}
                    onChange={(e) => setEditingCard({ ...editingCard, slug: e.target.value })}
                    placeholder="white-paper"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>الوصف (عربي)</Label>
                    <Textarea
                      value={editingCard?.description || ''}
                      onChange={(e) => setEditingCard({ ...editingCard, description: e.target.value })}
                      placeholder="الوصف بالعربية"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description (English)</Label>
                    <Textarea
                      value={editingCard?.description_en || ''}
                      onChange={(e) => setEditingCard({ ...editingCard, description_en: e.target.value })}
                      placeholder="Description in English"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>أيقونة الكارت</Label>
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'icon_url')}
                      disabled={uploading}
                      className="flex-1"
                    />
                    {uploading && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Upload className="h-4 w-4 animate-pulse" />
                        جاري الرفع...
                      </div>
                    )}
                  </div>
                  {editingCard?.icon_url && (
                    <div className="mt-2">
                      <img 
                        src={editingCard.icon_url} 
                        alt="Icon preview" 
                        className="w-20 h-20 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>خلفية الكارت (Gradient)</Label>
                  <Input
                    value={editingCard?.background_gradient || ''}
                    onChange={(e) => setEditingCard({ ...editingCard, background_gradient: e.target.value })}
                    placeholder="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  />
                  <div 
                    className="w-full h-20 rounded-lg border"
                    style={{ background: editingCard?.background_gradient }}
                  />
                </div>

                <div className="border-t pt-4 mt-4">
                  <h3 className="text-lg font-semibold mb-4">محتوى الصفحة الداخلية</h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label>عنوان الصفحة (عربي)</Label>
                      <Input
                        value={editingCard?.page_title || ''}
                        onChange={(e) => setEditingCard({ ...editingCard, page_title: e.target.value })}
                        placeholder="عنوان الصفحة الداخلية"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Page Title (English)</Label>
                      <Input
                        value={editingCard?.page_title_en || ''}
                        onChange={(e) => setEditingCard({ ...editingCard, page_title_en: e.target.value })}
                        placeholder="Internal page title"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <Label>صورة غلاف الصفحة</Label>
                    <div className="flex gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'page_cover_image')}
                        disabled={uploading}
                        className="flex-1"
                      />
                    </div>
                    {editingCard?.page_cover_image && (
                      <div className="mt-2">
                        <img 
                          src={editingCard.page_cover_image} 
                          alt="Cover preview" 
                          className="w-full h-40 object-cover rounded-lg border"
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label>المحتوى (عربي)</Label>
                      <Textarea
                        value={editingCard?.page_content || ''}
                        onChange={(e) => setEditingCard({ ...editingCard, page_content: e.target.value })}
                        placeholder="اكتب المحتوى هنا..."
                        rows={10}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Content (English)</Label>
                      <Textarea
                        value={editingCard?.page_content_en || ''}
                        onChange={(e) => setEditingCard({ ...editingCard, page_content_en: e.target.value })}
                        placeholder="Write content here..."
                        rows={10}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>ترتيب العرض</Label>
                    <Input
                      type="number"
                      value={editingCard?.display_order || 0}
                      onChange={(e) => setEditingCard({ ...editingCard, display_order: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse pt-8">
                    <Switch
                      checked={editingCard?.is_active}
                      onCheckedChange={(checked) => setEditingCard({ ...editingCard, is_active: checked })}
                    />
                    <Label>نشط</Label>
                  </div>
                </div>
              </TabsContent>

              {/* Actions & Payment Tab */}
              <TabsContent value="actions" className="space-y-6">
                {/* Payment Gateway Section */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      بوابة الدفع
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>تفعيل بوابة الدفع في هذه الصفحة</Label>
                      <Switch
                        checked={editingCard?.widget_config?.show_payment_gateway || false}
                        onCheckedChange={(checked) => setEditingCard({
                          ...editingCard,
                          widget_config: {
                            ...editingCard?.widget_config,
                            show_payment_gateway: checked
                          }
                        })}
                      />
                    </div>

                    {editingCard?.widget_config?.show_payment_gateway && (
                      <div className="space-y-4 pt-2 border-t">
                        <div className="space-y-2">
                          <Label>نوع الدفع</Label>
                          <Select
                            value={editingCard?.widget_config?.payment_type || 'presale'}
                            onValueChange={(value) => setEditingCard({
                              ...editingCard,
                              widget_config: {
                                ...editingCard?.widget_config,
                                payment_type: value as 'presale' | 'liquidity' | 'services' | 'vault'
                              }
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="اختر نوع الدفع" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="presale">البيع المسبق (Pre-sale)</SelectItem>
                              <SelectItem value="liquidity">السيولة (Liquidity)</SelectItem>
                              <SelectItem value="services">الخدمات (Services)</SelectItem>
                              <SelectItem value="vault">الخزينة (Vault)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>عنوان بوابة الدفع</Label>
                            <Input
                              value={editingCard?.widget_config?.payment_title || ''}
                              onChange={(e) => setEditingCard({
                                ...editingCard,
                                widget_config: {
                                  ...editingCard?.widget_config,
                                  payment_title: e.target.value
                                }
                              })}
                              placeholder="شراء نقاط XP"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>وصف بوابة الدفع</Label>
                            <Input
                              value={editingCard?.widget_config?.payment_description || ''}
                              onChange={(e) => setEditingCard({
                                ...editingCard,
                                widget_config: {
                                  ...editingCard?.widget_config,
                                  payment_description: e.target.value
                                }
                              })}
                              placeholder="اشترِ نقاط XP بسهولة"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Action Buttons Section */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Link className="h-5 w-5" />
                      أزرار الإجراءات
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      أضف أزرار للروابط المهمة مثل White Paper، Telegram، إلخ
                    </p>

                    {(editingCard?.widget_config?.action_buttons || []).map((button, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">زر {index + 1}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const buttons = [...(editingCard?.widget_config?.action_buttons || [])];
                              buttons.splice(index, 1);
                              setEditingCard({
                                ...editingCard,
                                widget_config: {
                                  ...editingCard?.widget_config,
                                  action_buttons: buttons
                                }
                              });
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            value={button.label || ''}
                            onChange={(e) => {
                              const buttons = [...(editingCard?.widget_config?.action_buttons || [])];
                              buttons[index] = { ...buttons[index], label: e.target.value };
                              setEditingCard({
                                ...editingCard,
                                widget_config: {
                                  ...editingCard?.widget_config,
                                  action_buttons: buttons
                                }
                              });
                            }}
                            placeholder="النص (عربي)"
                          />
                          <Input
                            value={button.label_en || ''}
                            onChange={(e) => {
                              const buttons = [...(editingCard?.widget_config?.action_buttons || [])];
                              buttons[index] = { ...buttons[index], label_en: e.target.value };
                              setEditingCard({
                                ...editingCard,
                                widget_config: {
                                  ...editingCard?.widget_config,
                                  action_buttons: buttons
                                }
                              });
                            }}
                            placeholder="Label (English)"
                          />
                        </div>
                        <Input
                          value={button.url || ''}
                          onChange={(e) => {
                            const buttons = [...(editingCard?.widget_config?.action_buttons || [])];
                            buttons[index] = { ...buttons[index], url: e.target.value };
                            setEditingCard({
                              ...editingCard,
                              widget_config: {
                                ...editingCard?.widget_config,
                                action_buttons: buttons
                              }
                            });
                          }}
                          placeholder="الرابط (https://...)"
                        />
                        <Select
                          value={button.variant || 'default'}
                          onValueChange={(value) => {
                            const buttons = [...(editingCard?.widget_config?.action_buttons || [])];
                            buttons[index] = { ...buttons[index], variant: value as ActionButton['variant'] };
                            setEditingCard({
                              ...editingCard,
                              widget_config: {
                                ...editingCard?.widget_config,
                                action_buttons: buttons
                              }
                            });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="نوع الزر" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="default">رئيسي (ذهبي)</SelectItem>
                            <SelectItem value="secondary">ثانوي</SelectItem>
                            <SelectItem value="outline">محدد</SelectItem>
                            <SelectItem value="ghost">شفاف</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ))}

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        const buttons = [...(editingCard?.widget_config?.action_buttons || [])];
                        buttons.push({ label: '', url: '', variant: 'default' });
                        setEditingCard({
                          ...editingCard,
                          widget_config: {
                            ...editingCard?.widget_config,
                            action_buttons: buttons
                          }
                        });
                      }}
                    >
                      <Plus className="h-4 w-4 ml-2" />
                      إضافة زر
                    </Button>
                  </CardContent>
                </Card>

                {/* Services Section */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Settings2 className="h-5 w-5" />
                      الخدمات / الخيارات
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      أضف خدمات أو خيارات يمكن للمستخدم الاختيار منها
                    </p>

                    {(editingCard?.widget_config?.services || []).map((service, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">خدمة {index + 1}</span>
                          <div className="flex gap-2 items-center">
                            <Switch
                              checked={service.isEnabled}
                              onCheckedChange={(checked) => {
                                const services = [...(editingCard?.widget_config?.services || [])];
                                services[index] = { ...services[index], isEnabled: checked };
                                setEditingCard({
                                  ...editingCard,
                                  widget_config: {
                                    ...editingCard?.widget_config,
                                    services: services
                                  }
                                });
                              }}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const services = [...(editingCard?.widget_config?.services || [])];
                                services.splice(index, 1);
                                setEditingCard({
                                  ...editingCard,
                                  widget_config: {
                                    ...editingCard?.widget_config,
                                    services: services
                                  }
                                });
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            value={service.name || ''}
                            onChange={(e) => {
                              const services = [...(editingCard?.widget_config?.services || [])];
                              services[index] = { ...services[index], name: e.target.value };
                              setEditingCard({
                                ...editingCard,
                                widget_config: {
                                  ...editingCard?.widget_config,
                                  services: services
                                }
                              });
                            }}
                            placeholder="اسم الخدمة (عربي)"
                          />
                          <Input
                            value={service.name_en || ''}
                            onChange={(e) => {
                              const services = [...(editingCard?.widget_config?.services || [])];
                              services[index] = { ...services[index], name_en: e.target.value };
                              setEditingCard({
                                ...editingCard,
                                widget_config: {
                                  ...editingCard?.widget_config,
                                  services: services
                                }
                              });
                            }}
                            placeholder="Service Name (English)"
                          />
                        </div>
                        <Textarea
                          value={service.description || ''}
                          onChange={(e) => {
                            const services = [...(editingCard?.widget_config?.services || [])];
                            services[index] = { ...services[index], description: e.target.value };
                            setEditingCard({
                              ...editingCard,
                              widget_config: {
                                ...editingCard?.widget_config,
                                services: services
                              }
                            });
                          }}
                          placeholder="وصف الخدمة"
                          rows={2}
                        />
                      </div>
                    ))}

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        const services = [...(editingCard?.widget_config?.services || [])];
                        services.push({ 
                          id: crypto.randomUUID(), 
                          name: '', 
                          isEnabled: true 
                        });
                        setEditingCard({
                          ...editingCard,
                          widget_config: {
                            ...editingCard?.widget_config,
                            services: services
                          }
                        });
                      }}
                    >
                      <Plus className="h-4 w-4 ml-2" />
                      إضافة خدمة
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="fonts" className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-muted-foreground">
                    تحكم في خطوط وأحجام النصوص في الصفحة الداخلية
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>نوع الخط</Label>
                    <select
                      className="w-full p-2 rounded-md border bg-background"
                      value={editingCard?.font_family || 'Cairo'}
                      onChange={(e) => setEditingCard({ ...editingCard, font_family: e.target.value })}
                    >
                      <option value="Cairo">Cairo</option>
                      <option value="Tajawal">Tajawal</option>
                      <option value="Amiri">Amiri</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Inter">Inter</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>سُمك الخط</Label>
                    <select
                      className="w-full p-2 rounded-md border bg-background"
                      value={editingCard?.font_weight || 'normal'}
                      onChange={(e) => setEditingCard({ ...editingCard, font_weight: e.target.value })}
                    >
                      <option value="normal">عادي</option>
                      <option value="medium">متوسط</option>
                      <option value="semibold">نصف سميك</option>
                      <option value="bold">سميك</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>حجم العنوان</Label>
                    <select
                      className="w-full p-2 rounded-md border bg-background"
                      value={editingCard?.title_font_size || 'large'}
                      onChange={(e) => setEditingCard({ ...editingCard, title_font_size: e.target.value })}
                    >
                      <option value="small">صغير</option>
                      <option value="medium">متوسط</option>
                      <option value="large">كبير</option>
                      <option value="xlarge">كبير جداً</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>حجم المحتوى</Label>
                    <select
                      className="w-full p-2 rounded-md border bg-background"
                      value={editingCard?.content_font_size || 'medium'}
                      onChange={(e) => setEditingCard({ ...editingCard, content_font_size: e.target.value })}
                    >
                      <option value="small">صغير</option>
                      <option value="medium">متوسط</option>
                      <option value="large">كبير</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>الحجم العام</Label>
                    <select
                      className="w-full p-2 rounded-md border bg-background"
                      value={editingCard?.font_size || 'medium'}
                      onChange={(e) => setEditingCard({ ...editingCard, font_size: e.target.value })}
                    >
                      <option value="small">صغير</option>
                      <option value="medium">متوسط</option>
                      <option value="large">كبير</option>
                    </select>
                  </div>
                </div>

                <div className="border rounded-lg p-4" style={{ 
                  fontFamily: editingCard?.font_family || 'Cairo',
                  fontWeight: editingCard?.font_weight || 'normal'
                }}>
                  <h3 className="mb-2" style={{ fontSize: editingCard?.title_font_size === 'xlarge' ? '2rem' : editingCard?.title_font_size === 'large' ? '1.5rem' : editingCard?.title_font_size === 'medium' ? '1.25rem' : '1rem' }}>
                    معاينة العنوان
                  </h3>
                  <p style={{ fontSize: editingCard?.content_font_size === 'large' ? '1.125rem' : editingCard?.content_font_size === 'medium' ? '1rem' : '0.875rem' }}>
                    هذا نص تجريبي لمعاينة الخط والحجم المختار. يمكنك رؤية كيف سيظهر المحتوى في الصفحة.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="widgets" className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-muted-foreground">
                    أضف widgets خارجية مثل عرض العملات من DexScreener أو Pump.fun أو رصيد محفظة
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>نوع الـ Widget</Label>
                  <select
                    className="w-full p-2 rounded-md border bg-background"
                    value={editingCard?.widget_type || 'none'}
                    onChange={(e) => setEditingCard({ ...editingCard, widget_type: e.target.value })}
                  >
                    <option value="none">بدون Widget</option>
                    <option value="iframe">Iframe مخصص</option>
                    <option value="dexscreener">DexScreener Chart</option>
                    <option value="pumpfun">Pump.fun Token</option>
                    <option value="wallet_balance">رصيد محفظة</option>
                    <option value="custom_embed">Embed Code مخصص</option>
                  </select>
                </div>

                {editingCard?.widget_type && editingCard.widget_type !== 'none' && (
                  <div className="space-y-2">
                    <Label>رابط أو كود الـ Widget</Label>
                    <Textarea
                      value={editingCard?.external_widget_url || ''}
                      onChange={(e) => setEditingCard({ ...editingCard, external_widget_url: e.target.value })}
                      placeholder={
                        editingCard.widget_type === 'dexscreener' ? 'https://dexscreener.com/solana/...' :
                        editingCard.widget_type === 'pumpfun' ? 'https://pump.fun/coin/...' :
                        editingCard.widget_type === 'wallet_balance' ? 'عنوان المحفظة' :
                        editingCard.widget_type === 'custom_embed' ? 'ضع كود الـ embed هنا' :
                        'ضع الرابط أو الكود هنا'
                      }
                      rows={3}
                    />
                  </div>
                )}

                {editingCard?.widget_type === 'dexscreener' && editingCard?.external_widget_url && (
                  <div className="border rounded-lg p-2">
                    <p className="text-sm text-muted-foreground mb-2">معاينة Widget</p>
                    <iframe
                      src={editingCard.external_widget_url}
                      className="w-full h-64 rounded"
                      title="Widget Preview"
                    />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-muted-foreground">
                    هذه الإعدادات للمطورين فقط. يمكنك استخدام HTML وJSON لإنشاء صفحات متقدمة بمكونات مخصصة.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label>خلفية الصفحة (CSS)</Label>
                    <Input
                      value={editingCard?.page_background || ''}
                      onChange={(e) => setEditingCard({ ...editingCard, page_background: e.target.value })}
                      placeholder="#ffffff أو linear-gradient(...)"
                    />
                    <div 
                      className="w-full h-16 rounded-lg border"
                      style={{ background: editingCard?.page_background || '#ffffff' }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>لون النص (Hex)</Label>
                    <Input
                      value={editingCard?.page_text_color || ''}
                      onChange={(e) => setEditingCard({ ...editingCard, page_text_color: e.target.value })}
                      placeholder="#000000"
                    />
                    <div 
                      className="w-full h-16 rounded-lg border flex items-center justify-center"
                      style={{ 
                        background: editingCard?.page_background || '#ffffff',
                        color: editingCard?.page_text_color || '#000000'
                      }}
                    >
                      نص تجريبي
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>محتوى HTML (عربي)</Label>
                    <Textarea
                      value={editingCard?.page_content || ''}
                      onChange={(e) => setEditingCard({ ...editingCard, page_content: e.target.value })}
                      placeholder="<div>...</div>"
                      rows={12}
                      className="font-mono text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>HTML Content (English)</Label>
                    <Textarea
                      value={editingCard?.page_content_en || ''}
                      onChange={(e) => setEditingCard({ ...editingCard, page_content_en: e.target.value })}
                      placeholder="<div>...</div>"
                      rows={12}
                      className="font-mono text-sm"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                <X className="ml-2 h-4 w-4" />
                إلغاء
              </Button>
              <Button onClick={handleSave}>
                <Save className="ml-2 h-4 w-4" />
                حفظ
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>العنوان</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>الترتيب</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead className="text-left">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cards.map((card) => (
            <TableRow key={card.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-8 h-8 rounded-full"
                    style={{ background: card.background_gradient }}
                  />
                  {card.title}
                </div>
              </TableCell>
              <TableCell className="font-mono text-sm">{card.slug}</TableCell>
              <TableCell>{card.display_order}</TableCell>
              <TableCell>
                {card.is_active ? (
                  <span className="text-green-600">نشط</span>
                ) : (
                  <span className="text-gray-500">غير نشط</span>
                )}
              </TableCell>
              <TableCell className="text-left">
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMoveUp(card)}
                    disabled={cards.findIndex(c => c.id === card.id) === 0}
                    title="تحريك للأعلى"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMoveDown(card)}
                    disabled={cards.findIndex(c => c.id === card.id) === cards.length - 1}
                    title="تحريك للأسفل"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(card)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                        <AlertDialogDescription>
                          هل أنت متأكد من حذف "{card.title}"؟
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(card.id)}>
                          حذف
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default RoadmapCardsManagement;

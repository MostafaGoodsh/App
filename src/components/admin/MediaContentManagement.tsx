import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, Play, FileText, Image } from "lucide-react";

interface MediaContent {
  id: string;
  title: string;
  description: string | null;
  media_type: string;
  media_url: string | null;
  article_content: string | null;
  points_reward: number;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

const MediaContentManagement = () => {
  const [content, setContent] = useState<MediaContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<MediaContent | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    media_type: 'article' as string,
    media_url: '',
    article_content: '',
    points_reward: 10,
    is_active: true,
    display_order: 0
  });

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('daily_media_content')
        .select('*')
        .order('display_order');

      if (error) throw error;
      setContent(data || []);
    } catch (error) {
      console.error('Error fetching content:', error);
      toast.error('خطأ في جلب المحتوى');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingContent) {
        const { error } = await supabase
          .from('daily_media_content')
          .update(formData)
          .eq('id', editingContent.id);

        if (error) throw error;
        toast.success('تم تحديث المحتوى بنجاح');
      } else {
        const { error } = await supabase
          .from('daily_media_content')
          .insert([formData]);

        if (error) throw error;
        toast.success('تم إضافة المحتوى بنجاح');
      }

      setIsDialogOpen(false);
      resetForm();
      fetchContent();
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('خطأ في حفظ المحتوى');
    }
  };

  const handleEdit = (contentItem: MediaContent) => {
    setEditingContent(contentItem);
    setFormData({
      title: contentItem.title,
      description: contentItem.description || '',
      media_type: contentItem.media_type,
      media_url: contentItem.media_url || '',
      article_content: contentItem.article_content || '',
      points_reward: contentItem.points_reward,
      is_active: contentItem.is_active,
      display_order: contentItem.display_order
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المحتوى؟')) return;

    try {
      const { error } = await supabase
        .from('daily_media_content')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('تم حذف المحتوى بنجاح');
      fetchContent();
    } catch (error) {
      console.error('Error deleting content:', error);
      toast.error('خطأ في حذف المحتوى');
    }
  };

  const resetForm = () => {
    setEditingContent(null);
    setFormData({
      title: '',
      description: '',
      media_type: 'article',
      media_url: '',
      article_content: '',
      points_reward: 10,
      is_active: true,
      display_order: 0
    });
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'video': return <Play className="h-4 w-4" />;
      case 'article': return <FileText className="h-4 w-4" />;
      case 'image': return <Image className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  if (loading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>إدارة محتوى الوسائط</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 ml-2" />
                إضافة محتوى جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingContent ? 'تعديل المحتوى' : 'إضافة محتوى جديد'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">العنوان</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">الوصف</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="media_type">نوع الوسائط</Label>
                  <Select
                    value={formData.media_type}
                    onValueChange={(value: string) => 
                      setFormData(prev => ({ ...prev, media_type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="article">مقال</SelectItem>
                      <SelectItem value="video">فيديو</SelectItem>
                      <SelectItem value="image">صورة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {formData.media_type !== 'article' && (
                  <div>
                    <Label htmlFor="media_url">رابط الوسائط</Label>
                    <Input
                      id="media_url"
                      type="url"
                      value={formData.media_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, media_url: e.target.value }))}
                    />
                  </div>
                )}
                
                {formData.media_type === 'article' && (
                  <div>
                    <Label htmlFor="article_content">محتوى المقال</Label>
                    <Textarea
                      id="article_content"
                      value={formData.article_content}
                      onChange={(e) => setFormData(prev => ({ ...prev, article_content: e.target.value }))}
                      rows={6}
                    />
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="points_reward">نقاط المكافأة</Label>
                    <Input
                      id="points_reward"
                      type="number"
                      min="1"
                      value={formData.points_reward}
                      onChange={(e) => setFormData(prev => ({ ...prev, points_reward: parseInt(e.target.value) }))}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="display_order">ترتيب العرض</Label>
                    <Input
                      id="display_order"
                      type="number"
                      min="0"
                      value={formData.display_order}
                      onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    إلغاء
                  </Button>
                  <Button type="submit">
                    {editingContent ? 'تحديث' : 'إضافة'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>النوع</TableHead>
                <TableHead>العنوان</TableHead>
                <TableHead>الوصف</TableHead>
                <TableHead>النقاط</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الترتيب</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {content.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getMediaIcon(item.media_type)}
                      <span className="text-sm">
                        {item.media_type === 'video' ? 'فيديو' : 
                         item.media_type === 'article' ? 'مقال' : 'صورة'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell className="max-w-xs truncate">{item.description}</TableCell>
                  <TableCell>{item.points_reward}</TableCell>
                  <TableCell>
                    <Badge variant={item.is_active ? "default" : "secondary"}>
                      {item.is_active ? 'نشط' : 'غير نشط'}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.display_order}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {content.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              لا يوجد محتوى متاح
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MediaContentManagement;
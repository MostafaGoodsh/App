import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CheckCircle, XCircle, BookOpen, Calendar, Edit, Trash2, Tag } from "lucide-react";
import LearningEditDialog from "./LearningEditDialog";

interface LearningContent {
  id: string;
  title: string;
  content: string;
  content_type: string;
  difficulty_level: string;
  tags: string[];
  is_published: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export default function LearningManagement() {
  const [content, setContent] = useState<LearningContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchLearningContent();
  }, []);

  const fetchLearningContent = async () => {
    try {
      const { data, error } = await supabase
        .from("learning_content")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setContent(data || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل في تحميل محتوى التعلم",
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePublishStatus = async (contentId: string, newStatus: boolean) => {
    setProcessingId(contentId);
    try {
      const { error } = await supabase
        .from("learning_content")
        .update({ 
          is_published: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", contentId);

      if (error) throw error;

      toast({
        title: "تم التحديث",
        description: `تم ${newStatus ? 'نشر' : 'إخفاء'} المحتوى بنجاح`,
      });

      await fetchLearningContent();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل في تحديث حالة المحتوى",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const deleteContent = async (contentId: string) => {
    setProcessingId(contentId);
    try {
      const { error } = await supabase
        .from("learning_content")
        .delete()
        .eq("id", contentId);

      if (error) throw error;

      toast({
        title: "تم الحذف",
        description: "تم حذف المحتوى بنجاح",
      });

      await fetchLearningContent();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل في حذف المحتوى",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'مبتدئ':
      case 'beginner':
        return "bg-success/10 text-success border-success/20";
      case 'متوسط':
      case 'intermediate':
        return "bg-warning/10 text-warning border-warning/20";
      case 'متقدم':
      case 'advanced':
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted/10 text-muted-foreground border-muted/20";
    }
  };

  const getStatusColor = (isPublished: boolean) => {
    return isPublished 
      ? "bg-success/10 text-success border-success/20"
      : "bg-muted/10 text-muted-foreground border-muted/20";
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">إدارة محتوى التعلم</h1>
          <p className="text-muted-foreground">إدارة وتحرير محتوى التعلم</p>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">إدارة محتوى التعلم</h1>
        <p className="text-muted-foreground">إدارة وتحرير محتوى التعلم</p>
      </div>

      <div className="grid gap-4">
        {content.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">لا يوجد محتوى تعليمي</p>
            </CardContent>
          </Card>
        ) : (
          content.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {new Date(item.created_at).toLocaleDateString("ar-SA")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={getStatusColor(item.is_published)}>
                      <div className="flex items-center gap-1">
                        {item.is_published ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        {item.is_published ? "منشور" : "مخفي"}
                      </div>
                    </Badge>
                    <Switch
                      checked={item.is_published}
                      onCheckedChange={(checked) => togglePublishStatus(item.id, checked)}
                      disabled={processingId === item.id}
                    />
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">نوع المحتوى</p>
                    <p className="text-sm font-medium">{item.content_type || "غير محدد"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">مستوى الصعوبة</p>
                    <Badge variant="outline" className={getDifficultyColor(item.difficulty_level)}>
                      {item.difficulty_level || "غير محدد"}
                    </Badge>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">المحتوى</p>
                  <p className="text-sm line-clamp-3">
                    {item.content ? item.content.substring(0, 200) + "..." : "لا يوجد محتوى"}
                  </p>
                </div>

                {item.tags && item.tags.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">العلامات</p>
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                <div className="flex gap-2 justify-between items-center">
                <div className="flex gap-2">
                    <LearningEditDialog 
                      content={item} 
                      onContentUpdated={fetchLearningContent}
                      disabled={processingId === item.id}
                    />
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={processingId === item.id}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          حذف
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>حذف المحتوى</AlertDialogTitle>
                          <AlertDialogDescription>
                            هل أنت متأكد من حذف المحتوى "{item.title}"؟ هذا الإجراء لا يمكن التراجع عنه.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteContent(item.id)}
                            disabled={processingId === item.id}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            حذف المحتوى
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    آخر تحديث: {new Date(item.updated_at).toLocaleDateString("ar-SA")}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
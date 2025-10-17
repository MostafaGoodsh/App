import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  User, 
  Calendar, 
  FileText, 
  MessageSquare,
  Languages,
  AlignRight,
  AlignLeft,
  Tag
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface PendingContent {
  id: string;
  title: string;
  content: string;
  content_type: string;
  category: string;
  language: string;
  text_direction: string;
  difficulty_level: string;
  tags: string[];
  author_name: string;
  submission_notes: string;
  created_at: string;
  created_by: string;
  media_urls: string[];
}

export const ContentApprovalManagement = () => {
  const [pendingContent, setPendingContent] = useState<PendingContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [selectedContent, setSelectedContent] = useState<PendingContent | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingContent();
  }, []);

  const fetchPendingContent = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('learning_content')
        .select(`
          id,
          title,
          content,
          content_type,
          category,
          language,
          text_direction,
          difficulty_level,
          tags,
          author_name,
          submission_notes,
          created_at,
          created_by,
          media_urls
        `)
        .eq('approval_status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingContent((data as any[]) || []);
    } catch (error) {
      console.error('Error fetching pending content:', error);
      toast({
        title: "خطأ في تحميل البيانات",
        description: "حدث خطأ أثناء تحميل المحتوى المعلق",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (contentId: string, action: 'approve' | 'reject') => {
    setProcessingId(contentId);
    
    try {
      const { error } = await supabase.rpc(
        action === 'approve' ? 'approve_content' : 'reject_content',
        {
          p_content_id: contentId,
          p_admin_notes: adminNotes.trim() || null
        }
      );

      if (error) throw error;

      toast({
        title: action === 'approve' ? "تم القبول" : "تم الرفض",
        description: `تم ${action === 'approve' ? 'قبول' : 'رفض'} المحتوى بنجاح`
      });

      // إعادة تحميل المحتوى المعلق
      fetchPendingContent();
      setAdminNotes('');
      setSelectedContent(null);

    } catch (error) {
      console.error(`Error ${action}ing content:`, error);
      toast({
        title: "خطأ في العملية",
        description: `حدث خطأ أثناء ${action === 'approve' ? 'قبول' : 'رفض'} المحتوى`,
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getContentTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      article: 'مقال',
      tutorial: 'درس تعليمي',
      guide: 'دليل',
      news: 'أخبار',
      analysis: 'تحليل',
      video: 'فيديو',
      podcast: 'بودكاست'
    };
    return types[type] || type;
  };

  const getCategoryLabel = (category: string) => {
    const categories: Record<string, string> = {
      crypto: 'مالي Crypto',
      general: 'عام General',
      divine: 'ديني Divine'
    };
    return categories[category] || category;
  };

  const getDifficultyLabel = (level: string) => {
    const levels: Record<string, string> = {
      beginner: 'مبتدئ',
      intermediate: 'متوسط',
      advanced: 'متقدم',
      expert: 'خبير'
    };
    return levels[level] || level;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Clock className="w-6 h-6 text-primary" />
          المحتوى في انتظار الموافقة
          <Badge variant="secondary" className="ml-2">
            {pendingContent.length}
          </Badge>
        </h2>
      </div>

      {pendingContent.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">لا يوجد محتوى في انتظار الموافقة</h3>
            <p className="text-muted-foreground">جميع المحتويات المرسلة تمت مراجعتها</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {pendingContent.map((content) => (
            <Card key={content.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-lg" dir={content.text_direction}>
                      {content.title}
                    </CardTitle>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">
                        {getContentTypeLabel(content.content_type)}
                      </Badge>
                      <Badge variant="outline">
                        {getCategoryLabel(content.category)}
                      </Badge>
                      <Badge variant="outline">
                        {getDifficultyLabel(content.difficulty_level)}
                      </Badge>
                      {content.language && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Languages className="w-3 h-3" />
                          {content.language === 'ar' ? 'عربي' : content.language === 'en' ? 'English' : 'ثنائي'}
                        </Badge>
                      )}
                      {content.text_direction && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          {content.text_direction === 'rtl' ? <AlignRight className="w-3 h-3" /> : <AlignLeft className="w-3 h-3" />}
                          {content.text_direction === 'rtl' ? 'RTL' : 'LTR'}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        معاينة
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle dir={content.text_direction}>
                          {content.title}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="prose max-w-none" dir={content.text_direction}>
                          <div className="whitespace-pre-wrap">{content.content}</div>
                        </div>
                        
                        {content.media_urls && content.media_urls.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2">الوسائط المرفقة:</h4>
                            <div className="space-y-2">
                              {content.media_urls.map((url, index) => (
                                <div key={index} className="p-2 bg-muted rounded text-sm font-mono">
                                  <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                    {url}
                                  </a>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {content.tags && content.tags.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <Tag className="w-4 h-4" />
                              الكلمات المفتاحية:
                            </h4>
                            <div className="flex flex-wrap gap-1">
                              {content.tags.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {content.content && (
                  <div className="text-sm text-muted-foreground" dir={content.text_direction}>
                    {content.content.substring(0, 200)}...
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {content.author_name || 'غير محدد'}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(content.created_at).toLocaleDateString('ar')}
                    </div>
                  </div>
                </div>

                {content.submission_notes && (
                  <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 mb-1">
                      <MessageSquare className="w-4 h-4" />
                      <span className="font-medium">ملاحظات المؤلف:</span>
                    </div>
                    <p className="text-sm text-blue-600 dark:text-blue-300" dir={content.text_direction}>
                      {content.submission_notes}
                    </p>
                  </div>
                )}

                <div className="space-y-3 pt-2 border-t">
                  <div className="space-y-2">
                    <Label htmlFor={`admin-notes-${content.id}`}>ملاحظات الإدارة (اختياري):</Label>
                    <Textarea
                      id={`admin-notes-${content.id}`}
                      value={selectedContent?.id === content.id ? adminNotes : ''}
                      onChange={(e) => {
                        setAdminNotes(e.target.value);
                        setSelectedContent(content);
                      }}
                      placeholder="اكتب ملاحظاتك حول المحتوى..."
                      className="min-h-[60px]"
                    />
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleApproval(content.id, 'reject')}
                      disabled={processingId === content.id}
                      className="flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      رفض
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleApproval(content.id, 'approve')}
                      disabled={processingId === content.id}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                    >
                      {processingId === content.id ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      {processingId === content.id ? 'جاري المعالجة...' : 'موافقة'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
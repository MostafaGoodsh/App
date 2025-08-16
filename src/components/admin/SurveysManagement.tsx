import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CheckCircle, XCircle, ClipboardList, Calendar, Edit, Trash2 } from "lucide-react";
import SurveyEditDialog from "./SurveyEditDialog";

interface Survey {
  id: string;
  title: string;
  description: string;
  questions: any;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export default function SurveysManagement() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      const { data, error } = await supabase
        .from("surveys")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSurveys(data || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل في تحميل الاستبيانات",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSurveyStatus = async (surveyId: string, newStatus: boolean) => {
    setProcessingId(surveyId);
    try {
      const { error } = await supabase
        .from("surveys")
        .update({ 
          is_active: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", surveyId);

      if (error) throw error;

      toast({
        title: "تم التحديث",
        description: `تم ${newStatus ? 'تفعيل' : 'إلغاء تفعيل'} الاستبيان بنجاح`,
      });

      await fetchSurveys();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل في تحديث حالة الاستبيان",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const deleteSurvey = async (surveyId: string) => {
    setProcessingId(surveyId);
    try {
      const { error } = await supabase
        .from("surveys")
        .delete()
        .eq("id", surveyId);

      if (error) throw error;

      toast({
        title: "تم الحذف",
        description: "تم حذف الاستبيان بنجاح",
      });

      await fetchSurveys();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل في حذف الاستبيان",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? "bg-success/10 text-success border-success/20"
      : "bg-muted/10 text-muted-foreground border-muted/20";
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">إدارة الاستبيانات</h1>
          <p className="text-muted-foreground">إدارة وتحرير الاستبيانات</p>
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
        <h1 className="text-2xl font-bold">إدارة الاستبيانات</h1>
        <p className="text-muted-foreground">إدارة وتحرير الاستبيانات</p>
      </div>

      <div className="grid gap-4">
        {surveys.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">لا توجد استبيانات</p>
            </CardContent>
          </Card>
        ) : (
          surveys.map((survey) => (
            <Card key={survey.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ClipboardList className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle className="text-lg">{survey.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {new Date(survey.created_at).toLocaleDateString("ar-SA")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={getStatusColor(survey.is_active)}>
                      <div className="flex items-center gap-1">
                        {survey.is_active ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        {survey.is_active ? "نشط" : "معطل"}
                      </div>
                    </Badge>
                    <Switch
                      checked={survey.is_active}
                      onCheckedChange={(checked) => toggleSurveyStatus(survey.id, checked)}
                      disabled={processingId === survey.id}
                    />
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">الوصف</p>
                  <p className="text-sm">{survey.description || "لا يوجد وصف"}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">عدد الأسئلة</p>
                  <p className="text-sm font-medium">
                    {Array.isArray(survey.questions) ? survey.questions.length : 0} سؤال
                  </p>
                </div>

                <Separator />

                <div className="flex gap-2 justify-between items-center">
                <div className="flex gap-2">
                    <SurveyEditDialog 
                      survey={survey} 
                      onSurveyUpdated={fetchSurveys}
                      disabled={processingId === survey.id}
                    />
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={processingId === survey.id}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          حذف
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>حذف الاستبيان</AlertDialogTitle>
                          <AlertDialogDescription>
                            هل أنت متأكد من حذف الاستبيان "{survey.title}"؟ هذا الإجراء لا يمكن التراجع عنه.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteSurvey(survey.id)}
                            disabled={processingId === survey.id}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            حذف الاستبيان
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    آخر تحديث: {new Date(survey.updated_at).toLocaleDateString("ar-SA")}
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
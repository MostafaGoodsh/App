import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Plus, Trash2 } from "lucide-react";

interface Question {
  id: string;
  type: 'text' | 'multiple_choice' | 'rating';
  question: string;
  options?: string[];
  required: boolean;
}

interface Survey {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  is_active: boolean;
}

interface SurveyEditDialogProps {
  survey?: Survey;
  onSurveyUpdated: () => Promise<void>;
  disabled?: boolean;
}

export default function SurveyEditDialog({ survey, onSurveyUpdated, disabled }: SurveyEditDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(survey?.title || "");
  const [description, setDescription] = useState(survey?.description || "");
  const [questions, setQuestions] = useState<Question[]>(survey?.questions || []);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const isCreateMode = !survey;

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type: 'text',
      question: '',
      required: false
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: string, field: keyof Question, value: any) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const addOption = (questionId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (question) {
      const options = question.options || [];
      updateQuestion(questionId, 'options', [...options, '']);
    }
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    const question = questions.find(q => q.id === questionId);
    if (question && question.options) {
      const newOptions = [...question.options];
      newOptions[optionIndex] = value;
      updateQuestion(questionId, 'options', newOptions);
    }
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    const question = questions.find(q => q.id === questionId);
    if (question && question.options) {
      const newOptions = question.options.filter((_, index) => index !== optionIndex);
      updateQuestion(questionId, 'options', newOptions);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "عنوان الاستبيان مطلوب",
      });
      return;
    }

    // Validate questions
    const invalidQuestions = questions.filter(q => !q.question.trim());
    if (invalidQuestions.length > 0) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يجب إدخال نص لجميع الأسئلة",
      });
      return;
    }

    setLoading(true);
    try {
      if (isCreateMode) {
        const { data: userData } = await supabase.auth.getUser();
        
        const { error } = await supabase
          .from("surveys")
          .insert({
            title: title.trim(),
            description: description.trim() || null,
            questions: questions as any,
            is_active: false,
            created_by: userData.user?.id
          });

        if (error) throw error;

        toast({
          title: "تم الإنشاء",
          description: "تم إنشاء الاستبيان بنجاح",
        });
      } else {
        const { error } = await supabase
          .from("surveys")
          .update({
            title: title.trim(),
            description: description.trim() || null,
            questions: questions as any,
            updated_at: new Date().toISOString()
          })
          .eq("id", survey!.id);

        if (error) throw error;

        toast({
          title: "تم الحفظ",
          description: "تم تحديث الاستبيان بنجاح",
        });
      }

      setOpen(false);
      await onSurveyUpdated();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: isCreateMode ? "فشل في إنشاء الاستبيان" : "فشل في تحديث الاستبيان",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      if (survey) {
        setTitle(survey.title);
        setDescription(survey.description || "");
        setQuestions(survey.questions || []);
      } else {
        setTitle("");
        setDescription("");
        setQuestions([]);
      }
    }
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant={isCreateMode ? "default" : "outline"} size="sm" disabled={disabled}>
          {isCreateMode ? <Plus className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
          {isCreateMode ? "إنشاء استبيان جديد" : "تحرير"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isCreateMode ? "إنشاء استبيان جديد" : "تحرير الاستبيان"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">عنوان الاستبيان *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="أدخل عنوان الاستبيان"
              />
            </div>
            <div>
              <Label htmlFor="description">الوصف</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="أدخل وصف الاستبيان"
              />
            </div>
          </div>

          {/* إدارة الأسئلة */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-lg font-semibold">الأسئلة</Label>
              <Button onClick={addQuestion} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                إضافة سؤال
              </Button>
            </div>

            {questions.map((question, index) => (
              <Card key={question.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">سؤال {index + 1}</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeQuestion(question.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>نص السؤال *</Label>
                      <Textarea
                        value={question.question}
                        onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                        placeholder="أدخل نص السؤال"
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label>نوع السؤال</Label>
                      <Select 
                        value={question.type} 
                        onValueChange={(value: 'text' | 'multiple_choice' | 'rating') => 
                          updateQuestion(question.id, 'type', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">نص مفتوح</SelectItem>
                          <SelectItem value="multiple_choice">اختيار متعدد</SelectItem>
                          <SelectItem value="rating">تقييم</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {question.type === 'multiple_choice' && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label>الخيارات</Label>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addOption(question.id)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          إضافة خيار
                        </Button>
                      </div>
                      {question.options?.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex gap-2">
                          <Input
                            value={option}
                            onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                            placeholder={`الخيار ${optionIndex + 1}`}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeOption(question.id, optionIndex)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`required-${question.id}`}
                      checked={question.required}
                      onChange={(e) => updateQuestion(question.id, 'required', e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor={`required-${question.id}`}>سؤال مطلوب</Label>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              إلغاء
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? (isCreateMode ? "جاري الإنشاء..." : "جاري الحفظ...") : (isCreateMode ? "إنشاء" : "حفظ")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
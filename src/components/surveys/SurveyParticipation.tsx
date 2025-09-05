import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, Star } from "lucide-react";

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
}

interface SurveyParticipationProps {
  survey: Survey;
  disabled?: boolean;
}

export default function SurveyParticipation({ survey, disabled }: SurveyParticipationProps) {
  const [open, setOpen] = useState(false);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleResponseChange = (questionId: string, value: string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async () => {
    // التحقق من الأسئلة المطلوبة
    const requiredQuestions = survey.questions.filter(q => q.required);
    const missingAnswers = requiredQuestions.filter(q => !responses[q.id] || responses[q.id].trim() === '');
    
    if (missingAnswers.length > 0) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يجب الإجابة على جميع الأسئلة المطلوبة",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("survey_responses")
        .insert({
          survey_id: survey.id,
          user_id: userData.user?.id,
          responses: responses
        });

      if (error) throw error;

      toast({
        title: "تم الإرسال",
        description: "تم إرسال إجاباتك بنجاح، شكراً لك",
      });

      setOpen(false);
      setResponses({});
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل في إرسال الإجابات، حاول مرة أخرى",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderQuestion = (question: Question, index: number) => {
    const questionKey = question.id;

    switch (question.type) {
      case 'text':
        return (
          <div key={questionKey} className="space-y-3">
            <Label className="text-base font-medium">
              {index + 1}. {question.question}
              {question.required && <span className="text-destructive mr-1">*</span>}
            </Label>
            <Textarea
              value={responses[questionKey] || ''}
              onChange={(e) => handleResponseChange(questionKey, e.target.value)}
              placeholder="اكتب إجابتك هنا..."
              rows={3}
            />
          </div>
        );

      case 'multiple_choice':
        return (
          <div key={questionKey} className="space-y-3">
            <Label className="text-base font-medium">
              {index + 1}. {question.question}
              {question.required && <span className="text-destructive mr-1">*</span>}
            </Label>
            <RadioGroup
              value={responses[questionKey] || ''}
              onValueChange={(value) => handleResponseChange(questionKey, value)}
            >
              {question.options?.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value={option} id={`${questionKey}-${optionIndex}`} />
                  <Label htmlFor={`${questionKey}-${optionIndex}`} className="cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 'rating':
        return (
          <div key={questionKey} className="space-y-3">
            <Label className="text-base font-medium">
              {index + 1}. {question.question}
              {question.required && <span className="text-destructive mr-1">*</span>}
            </Label>
            <RadioGroup
              value={responses[questionKey] || ''}
              onValueChange={(value) => handleResponseChange(questionKey, value)}
            >
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <div key={rating} className="flex items-center space-x-1 space-x-reverse">
                    <RadioGroupItem value={rating.toString()} id={`${questionKey}-${rating}`} />
                    <Label htmlFor={`${questionKey}-${rating}`} className="cursor-pointer flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      {rating}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full mt-4" disabled={disabled}>
          <ClipboardList className="h-4 w-4 ml-2" />
          المشاركة في الاستبيان
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{survey.title}</DialogTitle>
          {survey.description && (
            <p className="text-muted-foreground">{survey.description}</p>
          )}
        </DialogHeader>
        
        <div className="space-y-6">
          {survey.questions.map((question, index) => (
            <Card key={question.id}>
              <CardContent className="pt-6">
                {renderQuestion(question, index)}
              </CardContent>
            </Card>
          ))}
          
          <div className="flex gap-2 justify-end pt-4">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              إلغاء
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "جاري الإرسال..." : "إرسال الإجابات"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
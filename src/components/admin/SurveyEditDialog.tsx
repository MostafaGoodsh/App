import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Edit } from "lucide-react";

interface Survey {
  id: string;
  title: string;
  description: string;
  questions: any;
  is_active: boolean;
}

interface SurveyEditDialogProps {
  survey: Survey;
  onSurveyUpdated: () => Promise<void>;
  disabled?: boolean;
}

export default function SurveyEditDialog({ survey, onSurveyUpdated, disabled }: SurveyEditDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(survey.title);
  const [description, setDescription] = useState(survey.description || "");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "عنوان الاستبيان مطلوب",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("surveys")
        .update({
          title: title.trim(),
          description: description.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq("id", survey.id);

      if (error) throw error;

      toast({
        title: "تم الحفظ",
        description: "تم تحديث الاستبيان بنجاح",
      });

      setOpen(false);
      await onSurveyUpdated();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل في تحديث الاستبيان",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setTitle(survey.title);
      setDescription(survey.description || "");
    }
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled}>
          <Edit className="h-4 w-4 mr-2" />
          تحرير
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>تحرير الاستبيان</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
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
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="أدخل وصف الاستبيان"
              rows={3}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              إلغاء
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "جاري الحفظ..." : "حفظ"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
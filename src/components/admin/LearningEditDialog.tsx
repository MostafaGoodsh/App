import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit } from "lucide-react";

interface LearningContent {
  id: string;
  title: string;
  content: string;
  content_type: string;
  difficulty_level: string;
  tags: string[];
  is_published: boolean;
}

interface LearningEditDialogProps {
  content: LearningContent;
  onContentUpdated: () => Promise<void>;
  disabled?: boolean;
}

export default function LearningEditDialog({ content, onContentUpdated, disabled }: LearningEditDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(content.title);
  const [contentText, setContentText] = useState(content.content || "");
  const [contentType, setContentType] = useState(content.content_type || "article");
  const [difficultyLevel, setDifficultyLevel] = useState(content.difficulty_level || "beginner");
  const [tagsText, setTagsText] = useState(content.tags?.join(", ") || "");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "عنوان المحتوى مطلوب",
      });
      return;
    }

    setLoading(true);
    try {
      const tags = tagsText.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0);
      
      const { error } = await supabase
        .from("learning_content")
        .update({
          title: title.trim(),
          content: contentText.trim() || null,
          content_type: contentType,
          difficulty_level: difficultyLevel,
          tags: tags.length > 0 ? tags : null,
          updated_at: new Date().toISOString()
        })
        .eq("id", content.id);

      if (error) throw error;

      toast({
        title: "تم الحفظ",
        description: "تم تحديث المحتوى بنجاح",
      });

      setOpen(false);
      await onContentUpdated();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل في تحديث المحتوى",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setTitle(content.title);
      setContentText(content.content || "");
      setContentType(content.content_type || "article");
      setDifficultyLevel(content.difficulty_level || "beginner");
      setTagsText(content.tags?.join(", ") || "");
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
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>تحرير المحتوى التعليمي</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">عنوان المحتوى *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="أدخل عنوان المحتوى"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="content-type">نوع المحتوى</Label>
              <Select value={contentType} onValueChange={setContentType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="article">مقال</SelectItem>
                  <SelectItem value="video">فيديو</SelectItem>
                  <SelectItem value="tutorial">تدريب</SelectItem>
                  <SelectItem value="guide">دليل</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="difficulty">مستوى الصعوبة</Label>
              <Select value={difficultyLevel} onValueChange={setDifficultyLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">مبتدئ</SelectItem>
                  <SelectItem value="intermediate">متوسط</SelectItem>
                  <SelectItem value="advanced">متقدم</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="content">المحتوى</Label>
            <Textarea
              id="content"
              value={contentText}
              onChange={(e) => setContentText(e.target.value)}
              placeholder="أدخل نص المحتوى التعليمي"
              rows={6}
            />
          </div>

          <div>
            <Label htmlFor="tags">العلامات (مفصولة بفواصل)</Label>
            <Input
              id="tags"
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              placeholder="مثال: بيتكوين, أساسيات, تشفير"
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
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, X } from "lucide-react";

interface LearningContent {
  id: string;
  title: string;
  content: string;
  content_type: string;
  media_type?: string;
  media_urls?: string[];
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
  const [mediaType, setMediaType] = useState(content.media_type || "text");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [difficultyLevel, setDifficultyLevel] = useState(content.difficulty_level || "beginner");
  const [tagsText, setTagsText] = useState(content.tags?.join(", ") || "");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const uploadFiles = async (files: File[]): Promise<string[]> => {
    const uploadPromises = files.map(async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `learning/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('learning-media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('learning-media')
        .getPublicUrl(filePath);

      return data.publicUrl;
    });

    return Promise.all(uploadPromises);
  };

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
      
      let mediaUrls: string[] = [];
      
      if (selectedFiles.length > 0) {
        mediaUrls = await uploadFiles(selectedFiles);
      }

      const updateData: any = {
        title: title.trim(),
        content: contentText.trim() || null,
        content_type: contentType,
        media_type: mediaType,
        difficulty_level: difficultyLevel,
        tags: tags.length > 0 ? tags : null,
        updated_at: new Date().toISOString()
      };

      // Only update media_urls if new files were uploaded
      if (mediaUrls.length > 0) {
        updateData.media_urls = mediaUrls;
      }

      const { error } = await supabase
        .from("learning_content")
        .update(updateData)
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
      setMediaType(content.media_type || "text");
      setDifficultyLevel(content.difficulty_level || "beginner");
      setTagsText(content.tags?.join(", ") || "");
      setSelectedFiles([]);
    }
    setOpen(newOpen);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
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
              <Label htmlFor="media-type">نوع الوسائط</Label>
              <Select value={mediaType} onValueChange={setMediaType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">نص</SelectItem>
                  <SelectItem value="image">صورة</SelectItem>
                  <SelectItem value="video">فيديو</SelectItem>
                  <SelectItem value="mixed">مختلط</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* File Upload Section */}
          {(mediaType === "image" || mediaType === "video" || mediaType === "mixed") && (
            <div className="space-y-2">
              <Label>رفع الملفات</Label>
              <Input
                type="file"
                multiple
                accept={mediaType === "image" ? "image/*" : mediaType === "video" ? "video/*" : "image/*,video/*"}
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setSelectedFiles(prev => [...prev, ...files]);
                }}
              />
              
              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                      <span className="text-sm truncate">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Current Media Display */}
          {content.media_urls && content.media_urls.length > 0 && (
            <div className="space-y-2">
              <Label>الوسائط الحالية</Label>
              <div className="grid grid-cols-2 gap-2">
                {content.media_urls.map((url, index) => {
                  const isVideo = url.includes('.mp4') || url.includes('.webm');
                  return (
                    <div key={index} className="relative">
                      {isVideo ? (
                        <video 
                          src={url} 
                          className="w-full h-20 object-cover rounded"
                          controls
                        />
                      ) : (
                        <img 
                          src={url} 
                          alt="Media" 
                          className="w-full h-20 object-cover rounded"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

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
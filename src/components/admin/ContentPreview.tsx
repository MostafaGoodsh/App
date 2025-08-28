import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Image, Zap, MousePointer, Eye, EyeOff } from "lucide-react";

interface AppContent {
  id: string;
  content_key: string;
  content_type: string;
  text_content?: string;
  image_url?: string;
  alt_text?: string;
  position_order: number;
  is_active: boolean;
}

interface ContentPreviewProps {
  content: AppContent;
  onEdit: (content: AppContent) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
}

export default function ContentPreview({ content, onEdit, onDelete, onToggleActive }: ContentPreviewProps) {
  const getContentIcon = () => {
    switch (content.content_type) {
      case 'text':
        return <FileText className="h-4 w-4" />;
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'msra_mining_card':
        return <Zap className="h-4 w-4" />;
      case 'hero_button':
        return <MousePointer className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getContentTypeLabel = () => {
    switch (content.content_type) {
      case 'text':
        return 'نص';
      case 'image':
        return 'صورة';
      case 'msra_mining_card':
        return 'كارت التعدين';
      case 'hero_button':
        return 'زر الصفحة الرئيسية';
      default:
        return content.content_type;
    }
  };

  const renderContentPreview = () => {
    switch (content.content_type) {
      case 'text':
        return (
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground line-clamp-3">
              {content.text_content || "لا يوجد نص"}
            </p>
          </div>
        );
      
      case 'image':
        return (
          <div className="space-y-2">
            {content.image_url && (
              <img 
                src={content.image_url} 
                alt={content.alt_text || "صورة المحتوى"} 
                className="w-full h-32 object-cover rounded-lg border"
              />
            )}
            {content.alt_text && (
              <p className="text-xs text-muted-foreground">{content.alt_text}</p>
            )}
          </div>
        );
      
      case 'msra_mining_card':
        return (
          <div className="space-y-3">
            {content.image_url && (
              <img 
                src={content.image_url} 
                alt={content.alt_text || "خلفية كارت التعدين"} 
                className="w-full h-24 object-cover rounded-lg border"
              />
            )}
            <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">كارت التعدين Ms-Ra</span>
              </div>
              <p className="text-xs font-medium">
                {content.text_content || "عنوان الكارت"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {content.alt_text || "وصف كارت التعدين"}
              </p>
            </div>
          </div>
        );
      
      case 'hero_button':
        return (
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground mb-2">معاينة الزر:</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="pointer-events-none"
            >
              {content.text_content || "نص الزر"}
            </Button>
          </div>
        );
      
      default:
        return (
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">نوع محتوى غير معروف</p>
          </div>
        );
    }
  };

  return (
    <Card className={`transition-all duration-200 ${!content.is_active ? 'opacity-60 border-dashed' : ''}`}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {getContentIcon()}
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-sm truncate">{content.content_key}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {getContentTypeLabel()}
                </Badge>
                <Badge 
                  variant={content.is_active ? "default" : "secondary"} 
                  className={`text-xs ${content.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}
                >
                  {content.is_active ? "نشط" : "غير نشط"}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  ترتيب: {content.position_order}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Preview */}
        <div className="mb-4">
          {renderContentPreview()}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(content)}
              className="h-8"
            >
              تعديل
            </Button>
            <Button
              variant={content.is_active ? "outline" : "default"}
              size="sm"
              onClick={() => onToggleActive(content.id, !content.is_active)}
              className="h-8"
            >
              {content.is_active ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            </Button>
          </div>
          
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(content.id)}
            className="h-8"
          >
            حذف
          </Button>
        </div>
      </div>
    </Card>
  );
}
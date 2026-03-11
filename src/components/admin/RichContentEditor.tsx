import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { 
  AlignLeft, AlignCenter, AlignRight, AlignJustify, 
  Bold, Italic, Minus, Space, List, Heading1, Heading2,
  Type
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RichContentEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}

export function RichContentEditor({ value, onChange, placeholder, rows = 6, className }: RichContentEditorProps) {
  const [textAlign, setTextAlign] = useState<string>('right');
  const [fontSize, setFontSize] = useState<string>('base');

  const insertAtCursor = (before: string, after: string = '') => {
    const textarea = document.getElementById('rich-editor') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end);
    const newText = value.substring(0, start) + before + selected + after + value.substring(end);
    onChange(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  };

  const insertText = (text: string) => {
    const textarea = document.getElementById('rich-editor') as HTMLTextAreaElement;
    if (!textarea) return;
    const pos = textarea.selectionStart;
    const newText = value.substring(0, pos) + text + value.substring(pos);
    onChange(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(pos + text.length, pos + text.length);
    }, 0);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 rounded-lg border bg-muted/30">
        {/* Text Alignment */}
        <ToggleGroup type="single" value={textAlign} onValueChange={(v) => v && setTextAlign(v)} size="sm">
          <ToggleGroupItem value="right" aria-label="محاذاة يمين">
            <AlignRight className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="center" aria-label="محاذاة وسط">
            <AlignCenter className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="left" aria-label="محاذاة يسار">
            <AlignLeft className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="justify" aria-label="محاذاة ضبط">
            <AlignJustify className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>

        <div className="w-px h-6 bg-border mx-1 self-center" />

        {/* Font Size */}
        <ToggleGroup type="single" value={fontSize} onValueChange={(v) => v && setFontSize(v)} size="sm">
          <ToggleGroupItem value="sm" aria-label="صغير">
            <Type className="h-3 w-3" />
          </ToggleGroupItem>
          <ToggleGroupItem value="base" aria-label="عادي">
            <Type className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="lg" aria-label="كبير">
            <Type className="h-5 w-5" />
          </ToggleGroupItem>
        </ToggleGroup>

        <div className="w-px h-6 bg-border mx-1 self-center" />

        {/* Formatting */}
        <Button type="button" variant="ghost" size="sm" onClick={() => insertAtCursor('**', '**')} title="غامق">
          <Bold className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => insertAtCursor('*', '*')} title="مائل">
          <Italic className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => insertAtCursor('## ')} title="عنوان">
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => insertAtCursor('### ')} title="عنوان فرعي">
          <Heading2 className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1 self-center" />

        {/* Spacing & Separators */}
        <Button type="button" variant="ghost" size="sm" onClick={() => insertText('\n\n---\n\n')} title="فاصل">
          <Minus className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => insertText('\n\n')} title="مسافة">
          <Space className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => insertAtCursor('• ')} title="قائمة">
          <List className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor */}
      <Textarea
        id="rich-editor"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={cn(
          "min-h-[120px]",
          textAlign === 'right' && 'text-right',
          textAlign === 'center' && 'text-center',
          textAlign === 'left' && 'text-left',
          textAlign === 'justify' && 'text-justify',
          fontSize === 'sm' && 'text-sm',
          fontSize === 'base' && 'text-base',
          fontSize === 'lg' && 'text-lg',
        )}
        dir={textAlign === 'left' ? 'ltr' : 'rtl'}
      />

      {/* Preview hint */}
      <p className="text-xs text-muted-foreground arabic-text">
        يمكنك استخدام: **غامق** | *مائل* | ## عنوان | --- فاصل | • قائمة
      </p>
    </div>
  );
}

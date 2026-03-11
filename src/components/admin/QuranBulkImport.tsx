import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Standard Madinah Mushaf Surah-Page mapping (Warsh)
const QURAN_SURAH_MAP: { start: number; end: number; name: string }[] = [
  { start: 1, end: 1, name: "سورة الفاتحة" },
  { start: 2, end: 49, name: "سورة البقرة" },
  { start: 50, end: 76, name: "سورة آل عمران" },
  { start: 77, end: 106, name: "سورة النساء" },
  { start: 107, end: 127, name: "سورة المائدة" },
  { start: 128, end: 150, name: "سورة الأنعام" },
  { start: 151, end: 176, name: "سورة الأعراف" },
  { start: 177, end: 186, name: "سورة الأنفال" },
  { start: 187, end: 207, name: "سورة التوبة" },
  { start: 208, end: 221, name: "سورة يونس" },
  { start: 222, end: 235, name: "سورة هود" },
  { start: 236, end: 248, name: "سورة يوسف" },
  { start: 249, end: 255, name: "سورة الرعد" },
  { start: 256, end: 261, name: "سورة إبراهيم" },
  { start: 262, end: 267, name: "سورة الحجر" },
  { start: 268, end: 281, name: "سورة النحل" },
  { start: 282, end: 293, name: "سورة الإسراء" },
  { start: 294, end: 304, name: "سورة الكهف" },
  { start: 305, end: 312, name: "سورة مريم" },
  { start: 313, end: 321, name: "سورة طه" },
  { start: 322, end: 331, name: "سورة الأنبياء" },
  { start: 332, end: 341, name: "سورة الحج" },
  { start: 342, end: 349, name: "سورة المؤمنون" },
  { start: 350, end: 359, name: "سورة النور" },
  { start: 360, end: 366, name: "سورة الفرقان" },
  { start: 367, end: 376, name: "سورة الشعراء" },
  { start: 377, end: 385, name: "سورة النمل" },
  { start: 386, end: 396, name: "سورة القصص" },
  { start: 397, end: 404, name: "سورة العنكبوت" },
  { start: 405, end: 410, name: "سورة الروم" },
  { start: 411, end: 414, name: "سورة لقمان" },
  { start: 415, end: 417, name: "سورة السجدة" },
  { start: 418, end: 427, name: "سورة الأحزاب" },
  { start: 428, end: 434, name: "سورة سبأ" },
  { start: 435, end: 440, name: "سورة فاطر" },
  { start: 441, end: 445, name: "سورة يس" },
  { start: 446, end: 452, name: "سورة الصافات" },
  { start: 453, end: 458, name: "سورة ص" },
  { start: 459, end: 467, name: "سورة الزمر" },
  { start: 468, end: 476, name: "سورة غافر" },
  { start: 477, end: 482, name: "سورة فصلت" },
  { start: 483, end: 489, name: "سورة الشورى" },
  { start: 490, end: 495, name: "سورة الزخرف" },
  { start: 496, end: 498, name: "سورة الدخان" },
  { start: 499, end: 502, name: "سورة الجاثية" },
  { start: 503, end: 506, name: "سورة الأحقاف" },
  { start: 507, end: 510, name: "سورة محمد" },
  { start: 511, end: 515, name: "سورة الفتح" },
  { start: 516, end: 518, name: "سورة الحجرات" },
  { start: 519, end: 520, name: "سورة ق" },
  { start: 521, end: 523, name: "سورة الذاريات" },
  { start: 524, end: 525, name: "سورة الطور" },
  { start: 526, end: 528, name: "سورة النجم" },
  { start: 529, end: 531, name: "سورة القمر" },
  { start: 532, end: 534, name: "سورة الرحمن" },
  { start: 535, end: 537, name: "سورة الواقعة" },
  { start: 538, end: 541, name: "سورة الحديد" },
  { start: 542, end: 545, name: "سورة المجادلة" },
  { start: 546, end: 548, name: "سورة الحشر" },
  { start: 549, end: 551, name: "سورة الممتحنة" },
  { start: 552, end: 553, name: "سورة الصف" },
  { start: 554, end: 554, name: "سورة الجمعة" },
  { start: 555, end: 556, name: "سورة المنافقون" },
  { start: 557, end: 558, name: "سورة التغابن" },
  { start: 559, end: 560, name: "سورة الطلاق" },
  { start: 561, end: 562, name: "سورة التحريم" },
  { start: 563, end: 564, name: "سورة الملك" },
  { start: 565, end: 566, name: "سورة القلم" },
  { start: 567, end: 568, name: "سورة الحاقة" },
  { start: 569, end: 570, name: "سورة المعارج" },
  { start: 571, end: 572, name: "سورة نوح" },
  { start: 573, end: 574, name: "سورة الجن" },
  { start: 575, end: 575, name: "سورة المزمل" },
  { start: 576, end: 577, name: "سورة المدثر" },
  { start: 578, end: 578, name: "سورة القيامة" },
  { start: 579, end: 580, name: "سورة الإنسان" },
  { start: 581, end: 581, name: "سورة المرسلات" },
  { start: 582, end: 583, name: "سورة النبأ" },
  { start: 584, end: 584, name: "سورة النازعات" },
  { start: 585, end: 604, name: "سور قصيرة" },
];

function getSurahForPage(pageNum: number): string {
  for (const s of QURAN_SURAH_MAP) {
    if (pageNum >= s.start && pageNum <= s.end) {
      return s.name;
    }
  }
  return "غير معروف";
}

function getJuzForPage(pageNum: number): number {
  const juzPages = [1,22,42,62,82,102,122,142,162,182,202,222,242,262,282,302,322,342,362,382,402,422,442,462,482,502,522,542,562,582];
  for (let i = juzPages.length - 1; i >= 0; i--) {
    if (pageNum >= juzPages[i]) return i + 1;
  }
  return 1;
}

interface QuranBulkImportProps {
  onImportComplete: () => void;
}

const QuranBulkImport = ({ onImportComplete }: QuranBulkImportProps) => {
  const [baseUrl, setBaseUrl] = useState("");
  const [startPage, setStartPage] = useState(1);
  const [endPage, setEndPage] = useState(604);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [open, setOpen] = useState(false);

  const handleImport = async () => {
    if (!baseUrl.trim()) {
      toast.error("الرجاء إدخال رابط القاعدة");
      return;
    }

    setImporting(true);
    setProgress(0);

    try {
      const batchSize = 20;
      let imported = 0;

      for (let batch = startPage; batch <= endPage; batch += batchSize) {
        const batchEnd = Math.min(batch + batchSize - 1, endPage);
        const pages = [];

        for (let i = batch; i <= batchEnd; i++) {
          const surahName = getSurahForPage(i);
          const juz = getJuzForPage(i);
          
          let imageUrl = baseUrl;
          if (baseUrl.includes('{page}')) {
            imageUrl = baseUrl.replace('{page}', String(i));
          } else if (baseUrl.toLowerCase().endsWith('.pdf')) {
            imageUrl = `${baseUrl}#page=${i}`;
          }

          pages.push({
            page_number: i,
            surah_name: surahName,
            juz_number: juz,
            arabic_text: `صفحة ${i} - ${surahName}`,
            arabic_image_url: imageUrl,
            is_active: true,
          });
        }

        const { error } = await supabase
          .from('quran_pages')
          .upsert(pages, { onConflict: 'page_number' });

        if (error) throw error;

        imported += pages.length;
        setProgress(Math.round((imported / (endPage - startPage + 1)) * 100));
      }

      toast.success(`تم استيراد ${imported} صفحة بنجاح`);
      onImportComplete();
      setOpen(false);
    } catch (error) {
      console.error('Import error:', error);
      toast.error('حدث خطأ أثناء الاستيراد');
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="h-4 w-4" />
          استيراد مكثف
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>استيراد صفحات القرآن</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>رابط القاعدة (استخدم {'{page}'} للرقم أو رابط PDF)</Label>
            <Input
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://example.com/quran/{page}.jpg"
              dir="ltr"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>من صفحة</Label>
              <Input
                type="number"
                value={startPage}
                onChange={(e) => setStartPage(Number(e.target.value))}
                min={1}
                max={604}
              />
            </div>
            <div>
              <Label>إلى صفحة</Label>
              <Input
                type="number"
                value={endPage}
                onChange={(e) => setEndPage(Number(e.target.value))}
                min={1}
                max={604}
              />
            </div>
          </div>
          {importing && (
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">جاري الاستيراد... {progress}%</div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
          <Button onClick={handleImport} disabled={importing} className="w-full gap-2">
            {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {importing ? 'جاري الاستيراد...' : 'بدء الاستيراد'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuranBulkImport;

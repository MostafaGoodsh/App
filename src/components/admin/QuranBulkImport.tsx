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

const QURAN_SURAH_MAP: { start: number; end: number; name: string; juz: number }[] = [
  { start: 1, end: 1, name: "سورة الفاتحة", juz: 1 },
  { start: 2, end: 49, name: "سورة البقرة", juz: 1 },
  { start: 50, end: 76, name: "سورة آل عمران", juz: 3 },
  { start: 77, end: 106, name: "سورة النساء", juz: 4 },
  { start: 107, end: 127, name: "سورة المائدة", juz: 6 },
  { start: 128, end: 150, name: "سورة الأنعام", juz: 7 },
  { start: 151, end: 176, name: "سورة الأعراف", juz: 8 },
  { start: 177, end: 186, name: "سورة الأنفال", juz: 9 },
  { start: 187, end: 207, name: "سورة التوبة", juz: 10 },
  { start: 208, end: 221, name: "سورة يونس", juz: 11 },
  { start: 222, end: 235, name: "سورة هود", juz: 11 },
  { start: 236, end: 249, name: "سورة يوسف", juz: 12 },
  { start: 249, end: 255, name: "سورة الرعد", juz: 13 },
  { start: 255, end: 261, name: "سورة إبراهيم", juz: 13 },
  { start: 262, end: 267, name: "سورة الحجر", juz: 14 },
  { start: 268, end: 281, name: "سورة النحل", juz: 14 },
  { start: 282, end: 293, name: "سورة الإسراء", juz: 15 },
  { start: 294, end: 304, name: "سورة الكهف", juz: 15 },
  { start: 305, end: 312, name: "سورة مريم", juz: 16 },
  { start: 312, end: 321, name: "سورة طه", juz: 16 },
  { start: 322, end: 331, name: "سورة الأنبياء", juz: 17 },
  { start: 332, end: 341, name: "سورة الحج", juz: 17 },
  { start: 342, end: 349, name: "سورة المؤمنون", juz: 18 },
  { start: 350, end: 359, name: "سورة النور", juz: 18 },
  { start: 359, end: 366, name: "سورة الفرقان", juz: 18 },
  { start: 367, end: 376, name: "سورة الشعراء", juz: 19 },
  { start: 377, end: 385, name: "سورة النمل", juz: 19 },
  { start: 385, end: 396, name: "سورة القصص", juz: 20 },
  { start: 396, end: 404, name: "سورة العنكبوت", juz: 20 },
  { start: 404, end: 410, name: "سورة الروم", juz: 21 },
  { start: 411, end: 414, name: "سورة لقمان", juz: 21 },
  { start: 415, end: 417, name: "سورة السجدة", juz: 21 },
  { start: 418, end: 427, name: "سورة الأحزاب", juz: 21 },
  { start: 428, end: 434, name: "سورة سبأ", juz: 22 },
  { start: 434, end: 440, name: "سورة فاطر", juz: 22 },
  { start: 440, end: 445, name: "سورة يس", juz: 22 },
  { start: 446, end: 452, name: "سورة الصافات", juz: 23 },
  { start: 453, end: 458, name: "سورة ص", juz: 23 },
  { start: 458, end: 467, name: "سورة الزمر", juz: 23 },
  { start: 467, end: 476, name: "سورة غافر", juz: 24 },
  { start: 477, end: 482, name: "سورة فصلت", juz: 24 },
  { start: 483, end: 489, name: "سورة الشورى", juz: 25 },
  { start: 489, end: 495, name: "سورة الزخرف", juz: 25 },
  { start: 496, end: 498, name: "سورة الدخان", juz: 25 },
  { start: 499, end: 502, name: "سورة الجاثية", juz: 25 },
  { start: 502, end: 506, name: "سورة الأحقاف", juz: 26 },
  { start: 507, end: 510, name: "سورة محمد", juz: 26 },
  { start: 511, end: 515, name: "سورة الفتح", juz: 26 },
  { start: 515, end: 518, name: "سورة الحجرات", juz: 26 },
  { start: 518, end: 520, name: "سورة ق", juz: 26 },
  { start: 521, end: 523, name: "سورة الذاريات", juz: 26 },
  { start: 523, end: 525, name: "سورة الطور", juz: 27 },
  { start: 526, end: 528, name: "سورة النجم", juz: 27 },
  { start: 528, end: 531, name: "سورة القمر", juz: 27 },
  { start: 531, end: 534, name: "سورة الرحمن", juz: 27 },
  { start: 534, end: 537, name: "سورة الواقعة", juz: 27 },
  { start: 537, end: 541, name: "سورة الحديد", juz: 27 },
  { start: 542, end: 545, name: "سورة المجادلة", juz: 28 },
  { start: 545, end: 548, name: "سورة الحشر", juz: 28 },
  { start: 549, end: 551, name: "سورة الممتحنة", juz: 28 },
  { start: 551, end: 553, name: "سورة الصف", juz: 28 },
  { start: 553, end: 554, name: "سورة الجمعة", juz: 28 },
  { start: 554, end: 556, name: "سورة المنافقون", juz: 28 },
  { start: 556, end: 558, name: "سورة التغابن", juz: 28 },
  { start: 558, end: 560, name: "سورة الطلاق", juz: 28 },
  { start: 560, end: 562, name: "سورة التحريم", juz: 28 },
  { start: 562, end: 564, name: "سورة الملك", juz: 29 },
  { start: 564, end: 566, name: "سورة القلم", juz: 29 },
  { start: 566, end: 568, name: "سورة الحاقة", juz: 29 },
  { start: 568, end: 570, name: "سورة المعارج", juz: 29 },
  { start: 570, end: 572, name: "سورة نوح", juz: 29 },
  { start: 572, end: 574, name: "سورة الجن", juz: 29 },
  { start: 574, end: 575, name: "سورة المزمل", juz: 29 },
  { start: 575, end: 577, name: "سورة المدثر", juz: 29 },
  { start: 577, end: 578, name: "سورة القيامة", juz: 29 },
  { start: 578, end: 580, name: "سورة الإنسان", juz: 29 },
  { start: 580, end: 581, name: "سورة المرسلات", juz: 29 },
  { start: 582, end: 583, name: "سورة النبأ", juz: 30 },
  { start: 583, end: 584, name: "سورة النازعات", juz: 30 },
  { start: 585, end: 604, name: "سور قصيرة", juz: 30 },
];

function getSurahForPage(pageNum: number): { name: string; juz: number } {
  for (const s of QURAN_SURAH_MAP) {
    if (pageNum >= s.start && pageNum <= s.end) {
      return { name: s.name, juz: s.juz };
    }
  }
  return { name: "غير معروف", juz: 1 };
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
          const surahInfo = getSurahForPage(i);
          const juz = getJuzForPage(i);
          
          let imageUrl = baseUrl;
          if (baseUrl.includes('{page}')) {
            imageUrl = baseUrl.replace('{page}', String(i));
          } else if (baseUrl.toLowerCase().endsWith('.pdf')) {
            imageUrl = `${baseUrl}#page=${i}`;
          }

          pages.push({
            page_number: i,
            surah_name: surahInfo.name,
            juz_number: juz,
            arabic_text: `صفحة ${i} - ${surahInfo.name}`,
            image_url: imageUrl,
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

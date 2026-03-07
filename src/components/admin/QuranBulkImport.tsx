import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link2, Upload, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Quran page-to-surah mapping (simplified: page ranges for each surah)
const QURAN_SURAH_MAP: { start: number; end: number; name: string; juz: number }[] = [
  { start: 1, end: 1, name: "سورة الفاتحة", juz: 1 },
  { start: 2, end: 49, name: "سورة البقرة", juz: 1 },
  { start: 50, end: 76, name: "سورة آل عمران", juz: 3 },
  { start: 77, end: 106, name: "سورة النساء", juz: 4 },
  { start: 106, end: 127, name: "سورة المائدة", juz: 6 },
  { start: 128, end: 150, name: "سورة الأنعام", juz: 7 },
  { start: 151, end: 176, name: "سورة الأعراف", juz: 8 },
  { start: 177, end: 186, name: "سورة الأنفال", juz: 9 },
  { start: 187, end: 207, name: "سورة التوبة", juz: 10 },
  { start: 208, end: 221, name: "سورة يونس", juz: 11 },
  { start: 221, end: 235, name: "سورة هود", juz: 11 },
  { start: 235, end: 248, name: "سورة يوسف", juz: 12 },
  { start: 249, end: 255, name: "سورة الرعد", juz: 13 },
  { start: 255, end: 261, name: "سورة إبراهيم", juz: 13 },
  { start: 262, end: 267, name: "سورة الحجر", juz: 14 },
  { start: 267, end: 281, name: "سورة النحل", juz: 14 },
  { start: 282, end: 293, name: "سورة الإسراء", juz: 15 },
  { start: 293, end: 304, name: "سورة الكهف", juz: 15 },
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
  { start: 520, end: 523, name: "سورة الذاريات", juz: 26 },
  { start: 523, end: 525, name: "سورة الطور", juz: 27 },
  { start: 526, end: 528, name: "سورة النجم", juz: 27 },
  { start: 528, end: 531, name: "سورة القمر", juz: 27 },
  { start: 531, end: 534, name: "سورة الرحمن", juz: 27 },
  { start: 534, end: 537, name: "سورة الواقعة", juz: 27 },
  { start: 537, end: 541, name: "سورة الحديد", juz: 27 },
  { start: 542, end: 545, name: "سورة المجادلة", juz: 28 },
  { start: 545, end: 548, name: "سورة الحشر", juz: 28 },
  { start: 549, end: 551, name: "سورة الممتحنة", juz: 28 },
  { start: 551, end: 552, name: "سورة الصف", juz: 28 },
  { start: 553, end: 554, name: "سورة الجمعة", juz: 28 },
  { start: 554, end: 555, name: "سورة المنافقون", juz: 28 },
  { start: 556, end: 557, name: "سورة التغابن", juz: 28 },
  { start: 558, end: 559, name: "سورة الطلاق", juz: 28 },
  { start: 560, end: 561, name: "سورة التحريم", juz: 28 },
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
  { start: 585, end: 585, name: "سورة عبس", juz: 30 },
  { start: 586, end: 586, name: "سورة التكوير", juz: 30 },
  { start: 587, end: 587, name: "سورة الانفطار", juz: 30 },
  { start: 587, end: 588, name: "سورة المطففين", juz: 30 },
  { start: 589, end: 589, name: "سورة الانشقاق", juz: 30 },
  { start: 590, end: 590, name: "سورة البروج", juz: 30 },
  { start: 591, end: 591, name: "سورة الطارق", juz: 30 },
  { start: 591, end: 592, name: "سورة الأعلى", juz: 30 },
  { start: 592, end: 593, name: "سورة الغاشية", juz: 30 },
  { start: 593, end: 594, name: "سورة الفجر", juz: 30 },
  { start: 594, end: 595, name: "سورة البلد", juz: 30 },
  { start: 595, end: 595, name: "سورة الشمس", juz: 30 },
  { start: 595, end: 596, name: "سورة الليل", juz: 30 },
  { start: 596, end: 596, name: "سورة الضحى", juz: 30 },
  { start: 596, end: 596, name: "سورة الشرح", juz: 30 },
  { start: 597, end: 597, name: "سورة التين", juz: 30 },
  { start: 597, end: 597, name: "سورة العلق", juz: 30 },
  { start: 598, end: 598, name: "سورة القدر", juz: 30 },
  { start: 598, end: 599, name: "سورة البينة", juz: 30 },
  { start: 599, end: 599, name: "سورة الزلزلة", juz: 30 },
  { start: 599, end: 600, name: "سورة العاديات", juz: 30 },
  { start: 600, end: 600, name: "سورة القارعة", juz: 30 },
  { start: 600, end: 600, name: "سورة التكاثر", juz: 30 },
  { start: 601, end: 601, name: "سورة العصر", juz: 30 },
  { start: 601, end: 601, name: "سورة الهمزة", juz: 30 },
  { start: 601, end: 601, name: "سورة الفيل", juz: 30 },
  { start: 602, end: 602, name: "سورة قريش", juz: 30 },
  { start: 602, end: 602, name: "سورة الماعون", juz: 30 },
  { start: 602, end: 602, name: "سورة الكوثر", juz: 30 },
  { start: 603, end: 603, name: "سورة الكافرون", juz: 30 },
  { start: 603, end: 603, name: "سورة النصر", juz: 30 },
  { start: 603, end: 603, name: "سورة المسد", juz: 30 },
  { start: 604, end: 604, name: "سورة الإخلاص", juz: 30 },
  { start: 604, end: 604, name: "سورة الفلق", juz: 30 },
  { start: 604, end: 604, name: "سورة الناس", juz: 30 },
];

function getSurahForPage(pageNum: number): { name: string; juz: number } {
  for (const s of QURAN_SURAH_MAP) {
    if (pageNum >= s.start && pageNum <= s.end) {
      return { name: s.name, juz: s.juz };
    }
  }
  // Calculate juz from page number as fallback
  const juz = Math.ceil(pageNum / 20);
  return { name: "غير محدد", juz: Math.min(juz, 30) };
}

function getJuzForPage(pageNum: number): number {
  // Standard Quran juz page boundaries
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [urlPattern, setUrlPattern] = useState("");
  const [importMode, setImportMode] = useState<"pattern" | "pdf">("pattern");
  const [startPage, setStartPage] = useState("1");
  const [endPage, setEndPage] = useState("604");
  const [pointsReward, setPointsReward] = useState("10");
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");

  const handleBulkImport = async (e: React.FormEvent) => {
    e.preventDefault();

    if (importMode === "pattern" && !urlPattern.includes("{page}")) {
      toast.error("يجب أن يحتوي الرابط على {page} كعنصر نائب لرقم الصفحة");
      return;
    }

    if (importMode === "pdf" && !urlPattern.trim()) {
      toast.error("يرجى إدخال رابط ملف PDF");
      return;
    }

    const start = parseInt(startPage);
    const end = parseInt(endPage);
    if (start > end || start < 1 || end > 604) {
      toast.error("تحقق من نطاق الصفحات (1-604)");
      return;
    }

    setImporting(true);
    setProgress(0);

    const totalPages = end - start + 1;
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    // Get existing pages to skip duplicates
    const { data: existingPages } = await supabase
      .from("quran_pages")
      .select("page_number");
    const existingSet = new Set(existingPages?.map((p) => p.page_number) || []);

    // Process in batches of 10
    const batchSize = 10;
    for (let i = start; i <= end; i += batchSize) {
      const batch = [];
      for (let j = i; j < Math.min(i + batchSize, end + 1); j++) {
        if (existingSet.has(j)) {
          skipCount++;
          continue;
        }

        const imageUrl = importMode === "pdf" 
          ? `${urlPattern.trim()}#page=${j}` 
          : urlPattern.replace(/\{page\}/g, j.toString());
        const surahInfo = getSurahForPage(j);
        const juzNumber = getJuzForPage(j);

        batch.push({
          page_number: j,
          juz_number: juzNumber,
          surah_name: surahInfo.name,
          arabic_text: "",
          arabic_image_url: imageUrl,
          points_reward: parseInt(pointsReward),
          display_order: j,
          is_active: true,
        });
      }

      if (batch.length > 0) {
        const { error } = await supabase.from("quran_pages").insert(batch);
        if (error) {
          console.error("Batch insert error:", error);
          errorCount += batch.length;
        } else {
          successCount += batch.length;
        }
      }

      const processed = Math.min(i + batchSize - start, totalPages);
      setProgress((processed / totalPages) * 100);
      setProgressText(`${processed} / ${totalPages}`);
    }

    setImporting(false);
    setDialogOpen(false);

    toast.success(
      `تم استيراد ${successCount} صفحة بنجاح` +
        (skipCount > 0 ? ` | تم تخطي ${skipCount} موجودة` : "") +
        (errorCount > 0 ? ` | فشل ${errorCount}` : "")
    );

    onImportComplete();
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg" className="shadow-lg hover:shadow-xl transition-all">
          <Link2 className="h-5 w-5 ml-2" />
          استيراد من روابط خارجية
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl" dir="rtl">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-xl font-bold flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Upload className="h-5 w-5 text-primary" />
            </div>
            استيراد صفحات القرآن من روابط خارجية
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleBulkImport} className="space-y-5 pt-4">
          {/* Mode Selector */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={importMode === "pattern" ? "default" : "outline"}
              onClick={() => setImportMode("pattern")}
              className="flex-1"
              size="sm"
            >
              🔗 روابط صور منفصلة
            </Button>
            <Button
              type="button"
              variant={importMode === "pdf" ? "default" : "outline"}
              onClick={() => setImportMode("pdf")}
              className="flex-1"
              size="sm"
            >
              📄 رابط ملف PDF
            </Button>
          </div>

          <div className="space-y-2">
            <Label className="text-base font-semibold">
              {importMode === "pdf" ? "رابط ملف PDF" : "نمط الرابط (URL Pattern)"}
            </Label>
            <Input
              value={urlPattern}
              onChange={(e) => setUrlPattern(e.target.value)}
              placeholder={importMode === "pdf" 
                ? "https://archive.org/download/WARSHMADINAHE/WARSH__MADINAH.pdf" 
                : "https://example.com/quran/page_{page}.jpg"}
              dir="ltr"
              required
              className="font-mono text-sm"
            />
            <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              {importMode === "pdf" ? (
                <div>
                  <p className="font-semibold mb-1">الصق رابط ملف PDF مباشرة</p>
                  <p>سيتم تخزين الرابط مع رقم كل صفحة تلقائياً</p>
                  <p>مثال: <code className="bg-muted px-1 rounded text-[10px]">https://archive.org/.../WARSH.pdf</code></p>
                </div>
              ) : (
                <div>
                  <p className="font-semibold mb-1">استخدم <code className="bg-muted px-1 rounded">{"{page}"}</code> كعنصر نائب لرقم الصفحة</p>
                  <p>مثال: <code className="bg-muted px-1 rounded">https://quran-images.com/page_{"{page}"}.png</code></p>
                  <p>سيتم استبدال <code className="bg-muted px-1 rounded">{"{page}"}</code> بأرقام الصفحات تلقائياً</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-base font-semibold">من صفحة</Label>
              <Input
                type="number"
                min="1"
                max="604"
                value={startPage}
                onChange={(e) => setStartPage(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-base font-semibold">إلى صفحة</Label>
              <Input
                type="number"
                min="1"
                max="604"
                value={endPage}
                onChange={(e) => setEndPage(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-base font-semibold">النقاط لكل صفحة</Label>
            <Input
              type="number"
              value={pointsReward}
              onChange={(e) => setPointsReward(e.target.value)}
              required
            />
          </div>

          <div className="bg-muted/30 p-3 rounded-lg border text-sm text-muted-foreground space-y-1">
            <p>✓ سيتم تحديد اسم السورة ورقم الجزء تلقائياً لكل صفحة</p>
            <p>✓ سيتم تخطي الصفحات الموجودة مسبقاً</p>
            <p>✓ عدد الصفحات: <strong className="text-foreground">{Math.max(0, parseInt(endPage || "0") - parseInt(startPage || "0") + 1)}</strong></p>
          </div>

          {importing && (
            <div className="space-y-2">
              <Progress value={progress} className="h-3" />
              <p className="text-sm text-center text-muted-foreground">{progressText}</p>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-2 border-t">
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={importing}>
              إلغاء
            </Button>
            <Button type="submit" disabled={importing} className="shadow-md">
              {importing ? "⏳ جاري الاستيراد..." : "🚀 بدء الاستيراد"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default QuranBulkImport;

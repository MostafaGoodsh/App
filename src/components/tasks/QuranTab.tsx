import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, BookOpen, CheckCircle2, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";

interface QuranPageRecord {
  id: string;
  page_number: number;
  surah_name: string;
  juz_number: number;
  points_reward?: number | null;
}

interface QuranVerse {
  id: number;
  text: string;
}

interface QuranSurah {
  id: number;
  name: string;
  transliteration?: string;
  total_verses: number;
  verses: QuranVerse[];
}

const getMinimumReadingTime = (verseCount: number) => {
  return Math.max(20, Math.min(90, verseCount * 3));
};

const QuranTab = () => {
  const { user } = useAuth();
  const { t, dir } = useLanguage();
  const [surahs, setSurahs] = useState<QuranSurah[]>([]);
  const [pageRecords, setPageRecords] = useState<QuranPageRecord[]>([]);
  const [completedPages, setCompletedPages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [readingPageId, setReadingPageId] = useState<string | null>(null);
  const [readingStartTime, setReadingStartTime] = useState<number | null>(null);
  const [readingProgress, setReadingProgress] = useState(0);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setLoading(true);
      await Promise.all([fetchQuranText(), fetchPageRecords(), fetchCompletedPages()]);
      setLoading(false);
    };

    load();
  }, [user]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (readingPageId && readingStartTime) {
      const currentSurah = surahs[currentPageIndex];
      if (currentSurah) {
        const minTime = getMinimumReadingTime(currentSurah.verses.length);
        interval = setInterval(() => {
          const elapsed = (Date.now() - readingStartTime) / 1000;
          const progress = Math.min(100, (elapsed / minTime) * 100);
          setReadingProgress(progress);
          if (progress >= 100) handleCompleteReading(readingPageId);
        }, 1000);
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [readingPageId, readingStartTime, currentPageIndex, surahs]);

  const fetchQuranText = async () => {
    try {
      const res = await fetch("https://cdn.jsdelivr.net/npm/quran-json@3.1.2/dist/quran.json");
      const data = await res.json();
      setSurahs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching quran text:", error);
      toast.error(t("تعذر تحميل نص القرآن", "Failed to load Quran text"));
    }
  };

  const fetchPageRecords = async () => {
    try {
      const { data, error } = await supabase
        .from("quran_pages")
        .select("id, page_number, surah_name, juz_number, points_reward")
        .eq("is_active", true)
        .order("page_number");
      if (error) throw error;
      setPageRecords(data || []);
    } catch (error) {
      console.error("Error fetching quran page records:", error);
      setPageRecords([]);
    }
  };

  const fetchCompletedPages = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("user_quran_completions")
        .select("page_id")
        .eq("user_id", user.id);
      if (error) throw error;
      setCompletedPages((data || []).map((d) => d.page_id));
    } catch (error) {
      console.error("Error fetching completed pages:", error);
    }
  };

  const currentSurah = surahs[currentPageIndex];
  const fallbackPageId = useMemo(
    () => `surah-${currentSurah?.id ?? currentPageIndex + 1}`,
    [currentSurah?.id, currentPageIndex]
  );
  const currentRecord = useMemo(() => {
    if (!currentSurah) return null;
    return (
      pageRecords.find((record) => record.page_number === currentSurah.id) ??
      pageRecords.find((record) => record.surah_name === currentSurah.name) ??
      null
    );
  }, [currentSurah, pageRecords]);

  const currentPageId = currentRecord?.id || fallbackPageId;
  const isCompleted = completedPages.includes(currentPageId);
  const isReading = readingPageId === currentPageId;
  const minReadingTime = currentSurah ? getMinimumReadingTime(currentSurah.verses.length) : 0;

  const handleStartReading = (pageId: string) => {
    setReadingPageId(pageId);
    setReadingStartTime(Date.now());
    setReadingProgress(0);
  };

  const handleCompleteReading = async (pageId: string) => {
    if (!user || !readingStartTime || !currentSurah || !currentRecord) return;

    try {
      setCompletedPages((prev) => [...prev, pageId]);
      setReadingPageId(null);
      setReadingStartTime(null);

      const pointsReward = currentRecord.points_reward || 5;

      const { error } = await supabase.from("user_quran_completions").insert([
        {
          user_id: user.id,
          page_id: pageId,
          reading_time_seconds: Math.floor((Date.now() - readingStartTime) / 1000),
          points_earned: pointsReward,
        },
      ]);
      if (error) throw error;

      const { data: xpToken } = await supabase
        .from("internal_tokens")
        .select("id")
        .eq("symbol", "XP")
        .eq("is_active", true)
        .single();

      if (xpToken) {
        const { data: existing } = await supabase
          .from("internal_wallet_balances")
          .select("balance")
          .eq("user_id", user.id)
          .eq("token_id", xpToken.id)
          .maybeSingle();

        if (existing) {
          await supabase
            .from("internal_wallet_balances")
            .update({ balance: existing.balance + pointsReward, updated_at: new Date().toISOString() })
            .eq("user_id", user.id)
            .eq("token_id", xpToken.id);
        } else {
          await supabase.from("internal_wallet_balances").insert({
            user_id: user.id,
            token_id: xpToken.id,
            balance: pointsReward,
          });
        }
      }

      toast.success(`${t("تم إكمال القراءة!", "Reading completed!")} +${pointsReward} XP 🎉`);
      setReadingProgress(0);
    } catch (error) {
      console.error("Error completing quran reading:", error);
      setCompletedPages((prev) => prev.filter((id) => id !== pageId));
      toast.error(t("حدث خطأ أثناء إكمال القراءة", "Error completing reading"));
    }
  };

  const handleNextPage = () => {
    if (currentPageIndex < surahs.length - 1) {
      setCurrentPageIndex((prev) => prev + 1);
      setReadingPageId(null);
      setReadingStartTime(null);
      setReadingProgress(0);
    }
  };

  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex((prev) => prev - 1);
      setReadingPageId(null);
      setReadingStartTime(null);
      setReadingProgress(0);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-4 text-muted-foreground">{t("جاري تحميل القرآن...", "Loading Quran...")}</p>
      </div>
    );
  }

  if (surahs.length === 0) {
    return (
      <div className="text-center py-20">
        <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground text-lg">{t("القرآن غير متاح حالياً", "Quran is unavailable right now")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={dir}>
      <div className="flex items-center justify-between gap-2">
        <Button onClick={handlePrevPage} disabled={currentPageIndex === 0} variant="outline" size="sm">
          <ChevronRight className="h-4 w-4" />
        </Button>

        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-1">{t("السورة", "Surah")}</div>
          <div className="text-lg sm:text-2xl font-bold text-primary">
            {currentSurah.id} / {surahs.length}
          </div>
        </div>

        <Button onClick={handleNextPage} disabled={currentPageIndex === surahs.length - 1} variant="outline" size="sm">
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-primary">{currentSurah.name}</span>
            <div className="flex items-center gap-2">
              {currentRecord && (
                <span className="text-xs text-muted-foreground">
                  {t("الجزء", "Juz")} {currentRecord.juz_number}
                </span>
              )}
              <span className="text-xs bg-primary/15 text-primary px-2 py-0.5 rounded-full font-bold">
                +{currentRecord?.points_reward || 5} XP
              </span>
            </div>
          </div>

          <div className="bg-muted/30 rounded-lg p-4 sm:p-5">
            <p className="font-arabic text-lg sm:text-xl leading-loose text-foreground whitespace-pre-wrap text-right">
              {currentSurah.verses.map((verse) => (
                <span key={verse.id}>
                  {verse.text}
                  <span className="inline-flex items-center justify-center mx-1 text-primary/70 text-sm font-mono align-middle">
                    ﴿{verse.id.toLocaleString("ar-EG")}﴾
                  </span>{" "}
                </span>
              ))}
            </p>
          </div>

          {isReading && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  {t("جاري القراءة...", "Reading...")} ({Math.ceil(minReadingTime - (readingProgress / 100) * minReadingTime)} {t("ثانية متبقية", "seconds left")})
                </span>
              </div>
              <Progress value={readingProgress} className="h-2" />
            </div>
          )}

          <div className="flex justify-center">
            {!currentRecord ? (
              <Button variant="outline" disabled className="gap-2">
                <BookOpen className="h-4 w-4" />
                {t("العرض متاح - المكافأة غير مفعلة حالياً", "Text is available - reward is unavailable now")}
              </Button>
            ) : isCompleted ? (
              <Button variant="outline" disabled className="gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                {t("تم إكمال القراءة", "Reading completed")}
              </Button>
            ) : isReading ? (
              <Button variant="outline" disabled className="gap-2">
                <Clock className="h-4 w-4 animate-spin" />
                {t("جاري القراءة...", "Reading...")}
              </Button>
            ) : (
              <Button onClick={() => handleStartReading(currentPageId)} className="gap-2">
                <BookOpen className="h-4 w-4" />
                {t("ابدأ القراءة", "Start reading")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuranTab;

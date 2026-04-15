import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, BookOpen, CheckCircle2, Bookmark, Navigation } from "lucide-react";
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

const XP_PER_10_AYAHS = 5;

const QuranTab = () => {
  const { user } = useAuth();
  const { t, dir } = useLanguage();
  const [surahs, setSurahs] = useState<QuranSurah[]>([]);
  const [pageRecords, setPageRecords] = useState<QuranPageRecord[]>([]);
  const [completedPages, setCompletedPages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [readAyahs, setReadAyahs] = useState<Set<string>>(new Set());
  const [sessionXpEarned, setSessionXpEarned] = useState(0);
  const [lastMilestone, setLastMilestone] = useState(0);
  const lastAyahRef = useRef<HTMLSpanElement>(null);
  const [hasBookmark, setHasBookmark] = useState(false);

  const storageKey = user ? `quran-bookmark-${user.id}` : null;

  // Load bookmark on mount
  useEffect(() => {
    if (!storageKey) return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const bookmark = JSON.parse(saved);
        setCurrentPageIndex(bookmark.surahIndex ?? 0);
        setReadAyahs(new Set(bookmark.readAyahs ?? []));
        setLastMilestone(bookmark.lastMilestone ?? 0);
        setSessionXpEarned(bookmark.sessionXp ?? 0);
        setHasBookmark(true);
      }
    } catch {}
  }, [storageKey]);

  // Save bookmark whenever readAyahs or surah changes
  useEffect(() => {
    if (!storageKey || readAyahs.size === 0) return;
    const bookmark = {
      surahIndex: currentPageIndex,
      readAyahs: Array.from(readAyahs),
      lastMilestone,
      sessionXp: sessionXpEarned,
    };
    localStorage.setItem(storageKey, JSON.stringify(bookmark));
    setHasBookmark(true);
  }, [readAyahs, currentPageIndex, lastMilestone, sessionXpEarned, storageKey]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchQuranText(), fetchPageRecords(), fetchCompletedPages()]);
      setLoading(false);
    };
    load();
  }, [user]);

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

  const creditXP = useCallback(async (amount: number) => {
    if (!user) return;
    try {
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
            .update({ balance: existing.balance + amount, updated_at: new Date().toISOString() })
            .eq("user_id", user.id)
            .eq("token_id", xpToken.id);
        } else {
          await supabase.from("internal_wallet_balances").insert({
            user_id: user.id,
            token_id: xpToken.id,
            balance: amount,
          });
        }
      }
    } catch (err) {
      console.error("Error crediting XP:", err);
    }
  }, [user]);

  const handleAyahClick = useCallback((surahId: number, verseId: number) => {
    const key = `${surahId}-${verseId}`;
    setReadAyahs(prev => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);

      // Check milestones
      const totalRead = next.size;
      const currentMilestoneCount = Math.floor(totalRead / 10);
      
      if (currentMilestoneCount > lastMilestone) {
        const newRewards = (currentMilestoneCount - lastMilestone) * XP_PER_10_AYAHS;
        setLastMilestone(currentMilestoneCount);
        setSessionXpEarned(prev => prev + newRewards);
        creditXP(newRewards);
        toast.success(`+${newRewards} XP 🎉 (${totalRead} ${t("آية", "ayahs")})`);
      }

      return next;
    });
  }, [lastMilestone, creditXP, t]);

  const handleMarkSurahComplete = async () => {
    if (!user || !currentSurah) return;
    const pageId = currentPageId;
    try {
      setCompletedPages(prev => [...prev, pageId]);
      const pointsReward = currentRecord?.points_reward || 5;

      await supabase.from("user_quran_completions").insert([{
        user_id: user.id,
        page_id: pageId,
        reading_time_seconds: 0,
        points_earned: pointsReward,
      }]);

      await creditXP(pointsReward);
      toast.success(`${t("تم إكمال السورة!", "Surah completed!")} +${pointsReward} XP 🎉`);
    } catch (error) {
      console.error("Error completing surah:", error);
      setCompletedPages(prev => prev.filter(id => id !== pageId));
      toast.error(t("حدث خطأ", "An error occurred"));
    }
  };

  const handleNextPage = () => {
    if (currentPageIndex < surahs.length - 1) {
      setCurrentPageIndex(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(prev => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
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

  const readCount = readAyahs.size;
  const totalVerses = currentSurah?.verses.length || 0;
  const readPct = totalVerses > 0 ? Math.round((readCount / totalVerses) * 100) : 0;

  return (
    <div className="space-y-4" dir={dir}>
      {/* Go to bookmark */}
      {hasBookmark && (
        <Button
          variant="default"
          size="sm"
          className="w-full gap-2"
          onClick={() => {
            if (!storageKey) return;
            try {
              const saved = localStorage.getItem(storageKey);
              if (saved) {
                const bookmark = JSON.parse(saved);
                setCurrentPageIndex(bookmark.surahIndex ?? 0);
                setReadAyahs(new Set(bookmark.readAyahs ?? []));
                setLastMilestone(bookmark.lastMilestone ?? 0);
                setSessionXpEarned(bookmark.sessionXp ?? 0);
                setTimeout(() => lastAyahRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
              }
            } catch {}
          }}
        >
          <Navigation className="h-4 w-4" />
          {t("انتقل لآخر توقف", "Go to last bookmark")}
        </Button>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between gap-2">
        <Button onClick={handlePrevPage} disabled={currentPageIndex === 0} variant="outline" size="sm">
          <ChevronRight className="h-4 w-4" />
        </Button>
        <div className="text-center">
          <div className="text-xs text-muted-foreground">{t("السورة", "Surah")}</div>
          <div className="text-lg font-bold text-primary">
            {currentSurah.id} / {surahs.length}
          </div>
        </div>
        <Button onClick={handleNextPage} disabled={currentPageIndex === surahs.length - 1} variant="outline" size="sm">
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-4 sm:p-6 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-primary">{currentSurah.name}</span>
            <div className="flex items-center gap-2">
              {currentRecord && (
                <span className="text-xs text-muted-foreground">
                  {t("الجزء", "Juz")} {currentRecord.juz_number}
                </span>
              )}
              <span className="text-xs bg-primary/15 text-primary px-2 py-0.5 rounded-full font-bold">
                {XP_PER_10_AYAHS} XP / 10 {t("آيات", "ayahs")}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${readPct}%` }}
              />
            </div>
            <span>{readCount}/{totalVerses}</span>
            {sessionXpEarned > 0 && (
              <span className="text-primary font-bold">+{sessionXpEarned} XP</span>
            )}
          </div>

          {/* Quran text - CENTER aligned */}
          <div className="bg-muted/30 rounded-lg p-4 sm:p-6">
            <p className="font-arabic text-lg sm:text-xl leading-[2.5] text-foreground text-center">
              {currentSurah.verses.map((verse) => {
                const key = `${currentSurah.id}-${verse.id}`;
                const isRead = readAyahs.has(key);
                return (
                  <span
                    key={verse.id}
                    onClick={() => handleAyahClick(currentSurah.id, verse.id)}
                    className={`cursor-pointer transition-colors duration-200 px-0.5 rounded-sm inline ${
                      isRead
                        ? 'bg-primary/20 text-primary'
                        : 'hover:bg-primary/10'
                    }`}
                  >
                    {verse.text}
                    <span className="inline-flex items-center justify-center mx-1 text-primary/70 text-sm font-mono align-middle select-none">
                      ﴿{verse.id.toLocaleString("ar-EG")}﴾
                    </span>{" "}
                  </span>
                );
              })}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
            {isCompleted ? (
              <Button variant="outline" disabled className="gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                {t("تم إكمال السورة", "Surah completed")}
              </Button>
            ) : (
              <Button
                onClick={handleMarkSurahComplete}
                variant="outline"
                className="gap-2"
                disabled={readCount === 0}
              >
                <Bookmark className="h-4 w-4" />
                {t("تم - حفظ مكان التوقف", "Done - Save bookmark")}
              </Button>
            )}
            <p className="text-xs text-muted-foreground text-center">
              {t("اضغط على كل آية لتظليلها وتسجيل قراءتك", "Tap each ayah to mark it as read")}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuranTab;

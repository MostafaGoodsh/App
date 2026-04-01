import { useState, useEffect, useRef, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { Loader2, BookmarkCheck, ChevronUp, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Surah {
  number: number;
  name: string;
  englishName: string;
  ayahs: Ayah[];
}

interface Ayah {
  number: number;
  numberInSurah: number;
  text: string;
  juz: number;
  page: number;
}

const BISMILLAH = "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ";

const QuranScroll = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookmarkAyah, setBookmarkAyah] = useState<{ surah: number; ayah: number } | null>(null);
  const [savingBookmark, setSavingBookmark] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const surahRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  useEffect(() => {
    fetchQuranText();
    if (user) fetchBookmark();
  }, [user]);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 600);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchQuranText = async () => {
    try {
      const res = await fetch("https://api.alquran.cloud/v1/quran/quran-uthmani");
      const json = await res.json();
      if (json.code === 200 && json.data?.surahs) {
        setSurahs(json.data.surahs);
      } else {
        throw new Error("Invalid API response");
      }
    } catch (err) {
      console.error("Error fetching Quran text:", err);
      setError(t("حدث خطأ في تحميل النص", "Error loading text"));
    } finally {
      setLoading(false);
    }
  };

  const fetchBookmark = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from("quran_bookmarks")
        .select("page_number")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        // page_number stores surah number, we reuse the field
        setBookmarkAyah({ surah: data.page_number, ayah: 1 });
      }
    } catch (err) {
      console.error("Error fetching bookmark:", err);
    }
  };

  const scrollToSurah = useCallback((surahNum: number) => {
    const el = surahRefs.current.get(surahNum);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  useEffect(() => {
    if (!loading && bookmarkAyah && surahs.length > 0) {
      setTimeout(() => scrollToSurah(bookmarkAyah.surah), 300);
    }
  }, [loading, bookmarkAyah, surahs.length, scrollToSurah]);

  const saveBookmark = async (surahNumber: number, surahName: string) => {
    if (!user) {
      toast.error(t("يجب تسجيل الدخول أولاً"));
      return;
    }
    setSavingBookmark(true);
    try {
      // We reuse quran_bookmarks table, storing surah number in page_number
      const { data: pageData } = await supabase
        .from("quran_pages")
        .select("id")
        .eq("page_number", surahNumber)
        .limit(1)
        .maybeSingle();

      const pageId = pageData?.id || crypto.randomUUID();

      const { error } = await supabase
        .from("quran_bookmarks")
        .upsert(
          {
            user_id: user.id,
            page_id: pageId,
            page_number: surahNumber,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );
      if (error) throw error;
      setBookmarkAyah({ surah: surahNumber, ayah: 1 });
      toast.success(`${t("تم حفظ العلامة عند سورة")} ${surahName} ✅`);
    } catch (err) {
      console.error("Error saving bookmark:", err);
      toast.error(t("حدث خطأ أثناء حفظ العلامة"));
    } finally {
      setSavingBookmark(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">{t("جاري تحميل القرآن الكريم...", "Loading Holy Quran...")}</p>
      </div>
    );
  }

  if (error || surahs.length === 0) {
    return (
      <div className="text-center py-20" dir="rtl">
        <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground text-lg">
          {error || t("لا توجد بيانات متاحة حالياً")}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" dir="rtl">
      <Helmet>
        <title>{t("القرآن الكريم", "Holy Quran")} | MS-RA</title>
        <meta
          name="description"
          content={t("قراءة القرآن الكريم بالتمرير المتواصل", "Read the Holy Quran with continuous scrolling")}
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri+Quran&display=swap"
          rel="stylesheet"
        />
      </Helmet>

      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="container mx-auto flex items-center justify-between max-w-2xl">
          <h1 className="font-cairo text-lg font-bold text-foreground">
            {t("القرآن الكريم", "Holy Quran")}
          </h1>
          <div className="flex items-center gap-2">
            {bookmarkAyah && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => scrollToSurah(bookmarkAyah.surah)}
              >
                <BookmarkCheck className="h-3.5 w-3.5 text-primary" />
                {t("سورة")} {bookmarkAyah.surah}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Continuous Text */}
      <div className="container mx-auto max-w-2xl px-4 py-6">
        {surahs.map((surah) => {
          const isBookmarked = bookmarkAyah?.surah === surah.number;

          return (
            <div
              key={surah.number}
              ref={(el) => {
                if (el) surahRefs.current.set(surah.number, el);
              }}
              className="mb-10"
            >
              {/* Surah Header */}
              <div className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-xl px-4 py-3 mb-4">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="text-xs font-mono px-2 py-0.5">
                    {surah.number}
                  </Badge>
                  <div>
                    <h2 className="text-lg font-bold text-foreground font-cairo">
                      {surah.name}
                    </h2>
                    <span className="text-xs text-muted-foreground">
                      {surah.englishName} • {surah.ayahs.length} {t("آية", "ayahs")}
                    </span>
                  </div>
                </div>
                <Button
                  variant={isBookmarked ? "default" : "ghost"}
                  size="sm"
                  className={`h-8 px-2 text-xs gap-1 ${
                    isBookmarked ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                  }`}
                  onClick={() => saveBookmark(surah.number, surah.name)}
                  disabled={savingBookmark}
                >
                  <BookmarkCheck className="h-3.5 w-3.5" />
                  {isBookmarked ? t("محفوظ", "Saved") : t("حفظ", "Save")}
                </Button>
              </div>

              {/* Bismillah - except for Surah 1 (Al-Fatiha) and Surah 9 (At-Tawbah) */}
              {surah.number !== 1 && surah.number !== 9 && (
                <p className="text-center text-xl mb-4 text-primary/80" style={{ fontFamily: "'Amiri Quran', serif" }}>
                  {BISMILLAH}
                </p>
              )}

              {/* Continuous Ayahs */}
              <div
                className="leading-[2.8] text-xl sm:text-2xl text-foreground text-justify"
                style={{ fontFamily: "'Amiri Quran', serif", wordSpacing: "0.05em" }}
              >
                {surah.ayahs.map((ayah) => {
                  // Remove bismillah from beginning of first ayah (except Al-Fatiha)
                  let text = ayah.text;
                  if (ayah.numberInSurah === 1 && surah.number !== 1) {
                    text = text.replace(BISMILLAH, "").trim();
                  }
                  if (!text) return null;

                  return (
                    <span key={ayah.number}>
                      {text}
                      <span className="inline-flex items-center justify-center mx-1 text-primary/70 text-sm font-mono align-middle">
                        ﴿{ayah.numberInSurah.toLocaleString("ar-EG")}﴾
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Scroll to top */}
      {showScrollTop && (
        <Button
          variant="secondary"
          size="icon"
          className="fixed bottom-20 left-4 z-40 h-10 w-10 rounded-full shadow-lg"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <ChevronUp className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
};

export default QuranScroll;

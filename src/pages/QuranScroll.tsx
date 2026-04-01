import { useState, useEffect, useRef, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { Loader2, BookmarkCheck, ChevronUp, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface QuranPage {
  id: string;
  page_number: number;
  surah_name: string;
  juz_number: number;
  arabic_image_url?: string;
  points_reward?: number | null;
}

const getArchiveIdentifier = (pdfUrl: string) => {
  try {
    const parsedUrl = new URL(pdfUrl);
    const pathParts = parsedUrl.pathname.split("/").filter(Boolean);
    const itemsIndex = pathParts.indexOf("items");
    if (itemsIndex !== -1 && pathParts[itemsIndex + 1]) return pathParts[itemsIndex + 1];
    const downloadIndex = pathParts.indexOf("download");
    if (downloadIndex !== -1 && pathParts[downloadIndex + 1]) return pathParts[downloadIndex + 1];
    return null;
  } catch { return null; }
};

const isPdfUrl = (url: string) => /\.pdf($|[?#])/i.test(url);

const getDisplayUrl = (url: string) => {
  if (!isPdfUrl(url)) return url;
  const [baseUrl, hash = ""] = url.split("#");
  const pageMatch = hash.match(/page=(\d+)/i);
  if (!pageMatch) return url;
  const identifier = getArchiveIdentifier(baseUrl);
  if (identifier) {
    return `https://archive.org/download/${identifier}/page/n${Number(pageMatch[1])}.jpg`;
  }
  return url;
};

const QuranScroll = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [pages, setPages] = useState<QuranPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookmarkPage, setBookmarkPage] = useState<number | null>(null);
  const [savingBookmark, setSavingBookmark] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  useEffect(() => {
    fetchPages();
    if (user) fetchBookmark();
  }, [user]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 600);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchPages = async () => {
    try {
      const { data, error } = await supabase
        .from("quran_pages")
        .select("id, page_number, surah_name, juz_number, arabic_image_url, points_reward")
        .eq("is_active", true)
        .order("page_number");
      if (error) throw error;
      setPages(data || []);
    } catch (err) {
      console.error("Error fetching quran pages:", err);
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
      if (data) setBookmarkPage(data.page_number);
    } catch (err) {
      console.error("Error fetching bookmark:", err);
    }
  };

  const scrollToPage = useCallback((pageNum: number) => {
    const el = pageRefs.current.get(pageNum);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  // Scroll to bookmark after pages load
  useEffect(() => {
    if (!loading && bookmarkPage && pages.length > 0) {
      // Small delay to let images mount
      setTimeout(() => scrollToPage(bookmarkPage), 300);
    }
  }, [loading, bookmarkPage, pages.length, scrollToPage]);

  const saveBookmark = async (page: QuranPage) => {
    if (!user) {
      toast.error(t("يجب تسجيل الدخول أولاً"));
      return;
    }
    setSavingBookmark(true);
    try {
      const { error } = await supabase
        .from("quran_bookmarks")
        .upsert(
          {
            user_id: user.id,
            page_id: page.id,
            page_number: page.page_number,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );
      if (error) throw error;
      setBookmarkPage(page.page_number);
      toast.success(
        `${t("تم حفظ العلامة عند الصفحة")} ${page.page_number} ✅`
      );
    } catch (err) {
      console.error("Error saving bookmark:", err);
      toast.error(t("حدث خطأ أثناء حفظ العلامة"));
    } finally {
      setSavingBookmark(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (pages.length === 0) {
    return (
      <div className="text-center py-20" dir="rtl">
        <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground text-lg">
          {t("لا توجد صفحات متاحة حالياً")}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" dir="rtl" ref={containerRef}>
      <Helmet>
        <title>{t("القرآن الكريم - سكرول", "Quran - Scroll")} | MS-RA</title>
        <meta
          name="description"
          content={t(
            "قراءة القرآن الكريم بالتمرير المتواصل",
            "Read the Holy Quran with continuous scrolling"
          )}
        />
      </Helmet>

      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="font-cairo text-lg font-bold text-foreground">
            {t("القرآن الكريم", "Holy Quran")}
          </h1>
          <div className="flex items-center gap-2">
            {bookmarkPage && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => scrollToPage(bookmarkPage)}
              >
                <BookmarkCheck className="h-3.5 w-3.5 text-primary" />
                {t("الصفحة")} {bookmarkPage}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Pages */}
      <div className="container mx-auto px-2 sm:px-4 py-4 space-y-1">
        {pages.map((page) => {
          const imageUrl = page.arabic_image_url
            ? getDisplayUrl(page.arabic_image_url)
            : null;
          const isBookmarked = bookmarkPage === page.page_number;

          return (
            <div
              key={page.id}
              ref={(el) => {
                if (el) pageRefs.current.set(page.page_number, el);
              }}
              className="relative"
            >
              {/* Page info bar */}
              <div className="flex items-center justify-between px-2 py-1.5 bg-muted/50 rounded-t-lg">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0 font-mono"
                  >
                    {page.page_number}
                  </Badge>
                  <span className="text-xs font-medium text-foreground">
                    {page.surah_name}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {t("الجزء")} {page.juz_number}
                  </span>
                </div>
                <Button
                  variant={isBookmarked ? "default" : "ghost"}
                  size="sm"
                  className={`h-7 px-2 text-[10px] gap-1 ${
                    isBookmarked
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground"
                  }`}
                  onClick={() => saveBookmark(page)}
                  disabled={savingBookmark}
                >
                  <BookmarkCheck className="h-3 w-3" />
                  {isBookmarked
                    ? t("محفوظ", "Saved")
                    : t("حفظ هنا", "Save here")}
                </Button>
              </div>

              {/* Image */}
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={`${t("الصفحة")} ${page.page_number} - ${page.surah_name}`}
                  className="w-full rounded-b-lg border border-t-0 border-border"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-48 bg-muted/30 rounded-b-lg border border-t-0 border-border flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">
                    {t("لا توجد صورة")}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Scroll to top button */}
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

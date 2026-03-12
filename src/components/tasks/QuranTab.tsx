import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, BookOpen, CheckCircle2, Clock, ZoomIn, ExternalLink } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import SectionIntroduction from "./SectionIntroduction";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface QuranPage {
  id: string;
  page_number: number;
  surah_name: string;
  juz_number: number;
  arabic_text: string;
  arabic_image_url?: string;
  translation_image_url?: string;
}

const getMinimumReadingTime = (pageNumber: number, textLength: number) => {
  return Math.max(30, Math.min(120, Math.floor(textLength / 10)));
};

const formatQuranText = (text: string) => {
  const basmala = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ";
  let formattedText = text;
  let extractedBasmala: string | null = null;

  if (text.includes(basmala)) {
    extractedBasmala = basmala;
    formattedText = text.replace(basmala, "").trim();
  }

  return { basmala: extractedBasmala, text: formattedText };
};

const isPdfUrl = (url: string) => /\.pdf($|[?#])/i.test(url);

const getPdfBaseAndPage = (url: string) => {
  const [baseUrl, hash = ""] = url.split("#");
  const pageMatch = hash.match(/page=(\d+)/i);
  return { baseUrl, pageNumber: pageMatch ? Number(pageMatch[1]) : null };
};

const getArchiveIdentifier = (pdfUrl: string) => {
  try {
    const parsedUrl = new URL(pdfUrl);
    const pathParts = parsedUrl.pathname.split("/").filter(Boolean);

    const itemsIndex = pathParts.indexOf("items");
    if (itemsIndex !== -1 && pathParts[itemsIndex + 1]) {
      return pathParts[itemsIndex + 1];
    }

    const downloadIndex = pathParts.indexOf("download");
    if (downloadIndex !== -1 && pathParts[downloadIndex + 1]) {
      return pathParts[downloadIndex + 1];
    }

    return null;
  } catch {
    return null;
  }
};

const getArchivePageImageUrl = (pdfUrl: string, pageNumber: number | null) => {
  if (!pageNumber) return null;
  const identifier = getArchiveIdentifier(pdfUrl);
  if (!identifier) return null;
  return `https://archive.org/download/${identifier}/page/n${pageNumber}.jpg`;
};

const getPdfViewerUrl = (url: string) => {
  if (!isPdfUrl(url)) return url;
  const { baseUrl, pageNumber } = getPdfBaseAndPage(url);
  return pageNumber ? `${baseUrl}#page=${pageNumber}` : baseUrl;
};

const getBestQuranDisplay = (url: string) => {
  if (!isPdfUrl(url)) {
    return { displayUrl: url, openUrl: url, isPdf: false, useIframe: false };
  }

  const { baseUrl, pageNumber } = getPdfBaseAndPage(url);
  const archiveImageUrl = getArchivePageImageUrl(baseUrl, pageNumber);

  if (archiveImageUrl) {
    return { displayUrl: archiveImageUrl, openUrl: url, isPdf: true, useIframe: false };
  }

  return {
    displayUrl: getPdfViewerUrl(url),
    openUrl: url,
    isPdf: true,
    useIframe: true,
  };
};

const QuranTab = () => {
  const { user } = useAuth();
  const [quranPages, setQuranPages] = useState<QuranPage[]>([]);
  const [completedPages, setCompletedPages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [readingPageId, setReadingPageId] = useState<string | null>(null);
  const [readingStartTime, setReadingStartTime] = useState<number | null>(null);
  const [readingProgress, setReadingProgress] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchQuranPages();
      fetchCompletedPages();
    }
  }, [user]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (readingPageId && readingStartTime) {
      const currentPage = quranPages.find(p => p.id === readingPageId);
      if (currentPage) {
        const minTime = getMinimumReadingTime(currentPage.page_number, currentPage.arabic_text.length);
        interval = setInterval(() => {
          const elapsed = (Date.now() - readingStartTime) / 1000;
          const progress = Math.min(100, (elapsed / minTime) * 100);
          setReadingProgress(progress);
          if (progress >= 100) {
            handleCompleteReading(readingPageId);
          }
        }, 1000);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [readingPageId, readingStartTime, quranPages]);

  const fetchQuranPages = async () => {
    try {
      const { data, error } = await supabase
        .from('quran_pages')
        .select('*')
        .eq('is_active', true)
        .order('page_number');

      if (error) throw error;
      setQuranPages(data || []);
    } catch (error) {
      console.error('Error fetching quran pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompletedPages = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('user_quran_completions')
        .select('page_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setCompletedPages((data || []).map(d => d.page_id));
    } catch (error) {
      console.error('Error fetching completed pages:', error);
    }
  };

  const handleStartReading = (pageId: string) => {
    setReadingPageId(pageId);
    setReadingStartTime(Date.now());
    setReadingProgress(0);
  };

  const handleCompleteReading = async (pageId: string) => {
    if (!user || !readingStartTime) return;

    const currentPage = quranPages.find(p => p.id === pageId);
    if (!currentPage) return;

    try {
      setCompletedPages(prev => [...prev, pageId]);
      setReadingPageId(null);
      setReadingStartTime(null);
      
      const { error } = await supabase
        .from('user_quran_completions')
        .insert([{
          user_id: user.id,
          page_id: pageId,
          reading_time_seconds: Math.floor((Date.now() - readingStartTime) / 1000),
        }]);

      if (error) throw error;
      toast.success('تم إكمال القراءة بنجاح! 🎉');
      setReadingProgress(0);
    } catch (error) {
      console.error('Error completing quran page:', error);
      setCompletedPages(prev => prev.filter(id => id !== pageId));
      toast.error('حدث خطأ أثناء إكمال القراءة');
    }
  };

  const currentPage = quranPages[currentPageIndex];
  const isCompleted = currentPage ? completedPages.includes(currentPage.id) : false;
  const isReading = currentPage ? readingPageId === currentPage.id : false;
  const minReadingTime = currentPage ? getMinimumReadingTime(currentPage.page_number, currentPage.arabic_text.length) : 0;
  const formattedText = currentPage ? formatQuranText(currentPage.arabic_text) : { basmala: null, text: "" };

  const handleNextPage = () => {
    if (currentPageIndex < quranPages.length - 1) {
      setCurrentPageIndex(prev => prev + 1);
      setReadingPageId(null);
      setReadingStartTime(null);
      setReadingProgress(0);
    }
  };

  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(prev => prev - 1);
      setReadingPageId(null);
      setReadingStartTime(null);
      setReadingProgress(0);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-4 text-muted-foreground">جاري تحميل الصفحات...</p>
      </div>
    );
  }

  if (quranPages.length === 0) {
    return (
      <div className="text-center py-20">
        <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground text-lg">لا توجد صفحات متاحة حالياً</p>
        <p className="text-muted-foreground text-sm mt-2">سيتم إضافة صفحات القرآن قريباً</p>
      </div>
    );
  }

  return (
    <>
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden">
          {selectedImage && (
            isPdfUrl(selectedImage) ? (
              <iframe
                src={getPdfViewerUrl(selectedImage)}
                title="Quran Page Full Screen"
                className="w-full h-[90vh]"
              />
            ) : (
              <img
                src={selectedImage}
                alt="Quran Page Full Screen"
                className="w-full h-full object-contain"
                loading="lazy"
              />
            )
          )}
        </DialogContent>
      </Dialog>

      <div className="space-y-6" dir="rtl">
        <SectionIntroduction sectionType="quran" />
      
        {/* Navigation Header */}
        <div className="flex items-center justify-between gap-2">
          <Button
            onClick={handlePrevPage}
            disabled={currentPageIndex === 0}
            variant="outline"
            size="sm"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">الصفحة</div>
            <div className="text-lg sm:text-2xl font-bold text-primary">
              {currentPage?.page_number || (currentPageIndex + 1)} / {quranPages.length}
            </div>
          </div>
          
          <Button
            onClick={handleNextPage}
            disabled={currentPageIndex === quranPages.length - 1}
            variant="outline"
            size="sm"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {currentPage && (
          <Card className="overflow-hidden">
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-primary">{currentPage.surah_name}</span>
                <span className="text-xs text-muted-foreground">الجزء {currentPage.juz_number}</span>
              </div>

              {currentPage.arabic_image_url && (
                <div
                  className="relative cursor-pointer group"
                  onClick={() => setSelectedImage(currentPage.arabic_image_url!)}
                >
                  {isPdfUrl(currentPage.arabic_image_url) ? (
                    <div className="rounded-lg border border-border overflow-hidden bg-muted/20">
                      <iframe
                        src={getPdfViewerUrl(currentPage.arabic_image_url)}
                        title={`صفحة ${currentPage.page_number}`}
                        className="w-full h-[420px]"
                      />
                    </div>
                  ) : (
                    <img
                      src={currentPage.arabic_image_url}
                      alt={`صفحة ${currentPage.page_number}`}
                      className="w-full rounded-lg border border-border"
                      loading="lazy"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="flex items-center gap-2 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <ZoomIn className="h-8 w-8" />
                      {isPdfUrl(currentPage.arabic_image_url) && <ExternalLink className="h-5 w-5" />}
                    </div>
                  </div>
                </div>
              )}

              {formattedText.basmala && (
                <p className="text-center text-lg font-arabic text-primary font-bold py-2">
                  {formattedText.basmala}
                </p>
              )}

              {formattedText.text && (
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="font-arabic text-base sm:text-lg leading-loose text-foreground whitespace-pre-wrap">
                    {formattedText.text}
                  </p>
                </div>
              )}

              {isReading && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>جاري القراءة... ({Math.ceil(minReadingTime - (readingProgress / 100 * minReadingTime))} ثانية متبقية)</span>
                  </div>
                  <Progress value={readingProgress} className="h-2" />
                </div>
              )}

              <div className="flex justify-center">
                {isCompleted ? (
                  <Button variant="outline" disabled className="gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    تم إكمال القراءة
                  </Button>
                ) : isReading ? (
                  <Button variant="outline" disabled className="gap-2">
                    <Clock className="h-4 w-4 animate-spin" />
                    جاري القراءة...
                  </Button>
                ) : (
                  <Button onClick={() => handleStartReading(currentPage.id)} className="gap-2">
                    <BookOpen className="h-4 w-4" />
                    ابدأ القراءة
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};

export default QuranTab;

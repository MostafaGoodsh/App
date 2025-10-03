import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Coins, BookOpen, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import SectionIntroduction from "./SectionIntroduction";

interface QuranPage {
  id: string;
  page_number: number;
  juz_number: number;
  surah_name: string;
  arabic_text: string;
  translation_text: string | null;
  arabic_image_url: string | null;
  translation_image_url: string | null;
  points_reward: number;
  is_active: boolean;
}

// دالة لفصل البسملة وإضافة أرقام الآيات
const formatQuranText = (text: string) => {
  const basmala = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ";
  let formattedText = text;
  let hasBasmala = false;
  
  // فصل البسملة إذا كانت موجودة في بداية النص
  if (text.includes(basmala)) {
    hasBasmala = true;
    formattedText = text.replace(basmala, "").trim();
  }
  
  return { basmala: hasBasmala ? basmala : null, text: formattedText };
};

const QuranTab = () => {
  const { user } = useAuth();
  const [quranPages, setQuranPages] = useState<QuranPage[]>([]);
  const [completedPages, setCompletedPages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [readingPageId, setReadingPageId] = useState<string | null>(null);
  const [readingStartTime, setReadingStartTime] = useState<number | null>(null);
  const [readingProgress, setReadingProgress] = useState(0);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // حساب وقت القراءة بناءً على طول النص
  const getMinimumReadingTime = (pageNumber: number, textLength: number) => {
    // أول صفحتين: 30 ثانية
    if (pageNumber <= 2) return 30;
    
    // الصفحات الطويلة (أكثر من 500 حرف): 60 ثانية
    if (textLength > 500) return 60;
    
    // باقي الصفحات: 45 ثانية
    return 45;
  };

  useEffect(() => {
    if (user) {
      fetchQuranPages();
      fetchCompletedPages();
    }
  }, [user]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (readingPageId && readingStartTime) {
      const currentPage = quranPages.find(p => p.id === readingPageId);
      if (currentPage) {
        const minTime = getMinimumReadingTime(currentPage.page_number, currentPage.arabic_text.length);
        
        interval = setInterval(() => {
          const elapsedSeconds = Math.floor((Date.now() - readingStartTime) / 1000);
          const progress = Math.min((elapsedSeconds / minTime) * 100, 100);
          setReadingProgress(progress);
        }, 100);
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
      // إزالة قيد التاريخ للسماح بإكمال المزيد من الصفحات
      const { data, error } = await supabase
        .from('user_quran_completions')
        .select('page_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setCompletedPages(data?.map(completion => completion.page_id) || []);
    } catch (error) {
      console.error('Error fetching completed pages:', error);
    }
  };

  const startReading = (pageId: string) => {
    setReadingPageId(pageId);
    setReadingStartTime(Date.now());
    setReadingProgress(0);
  };

  const completeReading = async (pageId: string, pointsReward: number) => {
    if (!user || !readingStartTime) return;

    const currentPage = quranPages.find(p => p.id === pageId);
    if (!currentPage) return;

    const readingTimeSeconds = Math.floor((Date.now() - readingStartTime) / 1000);
    const minTime = getMinimumReadingTime(currentPage.page_number, currentPage.arabic_text.length);

    if (readingTimeSeconds < minTime) {
      toast.error(`يجب قراءة الصفحة للوقت المحدد. لقد قرأت ${readingTimeSeconds} ثانية من ${minTime} ثانية`);
      return;
    }

    try {
      setCompletedPages(prev => [...prev, pageId]);
      
      const { error } = await supabase
        .from('user_quran_completions')
        .insert({
          user_id: user.id,
          page_id: pageId,
          reading_time_seconds: readingTimeSeconds,
          points_earned: pointsReward
        });

      if (error) throw error;

      toast.success(`بارك الله فيك! حصلت على ${pointsReward} نقطة`);
      setReadingPageId(null);
      setReadingStartTime(null);
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
      const nextPage = quranPages[currentPageIndex + 1];
      setCurrentPageIndex(prev => prev + 1);
      setReadingPageId(null);
      setReadingStartTime(null);
      setReadingProgress(0);
      
      // عرض رسالة إذا انتقلنا لسورة جديدة
      if (currentPage && nextPage.surah_name !== currentPage.surah_name) {
        toast.success(`انتقلت إلى سورة ${nextPage.surah_name}`);
      }
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
      <div className="flex items-center justify-center py-20">
        <div className="space-y-4 text-center">
          <div className="h-20 w-20 mx-auto bg-gradient-to-br from-primary/20 to-primary/5 animate-pulse rounded-2xl" />
          <p className="text-muted-foreground animate-pulse">جاري تحميل صفحات القرآن الكريم...</p>
        </div>
      </div>
    );
  }

  if (quranPages.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl w-32 h-32 mx-auto mb-6 flex items-center justify-center shadow-lg">
          <BookOpen className="h-16 w-16 text-primary" />
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-2">لا توجد صفحات قرآن متاحة</h3>
        <p className="text-muted-foreground">سيتم إضافة صفحات القرآن الكريم قريباً</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Section Introduction */}
      <SectionIntroduction sectionType="quran" />
      
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-3 sm:p-4 rounded-2xl border border-primary/20">
        <Button
          onClick={handlePrevPage}
          disabled={currentPageIndex === 0}
          variant="outline"
          size="sm"
          className="gap-2 shadow-md hover:shadow-xl transition-all disabled:opacity-50 w-full sm:w-auto text-xs sm:text-sm"
        >
          <ChevronRight className="h-4 w-4" />
          السابقة
        </Button>
        
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-1">الصفحة</div>
          <div className="text-lg sm:text-2xl font-bold text-primary">
            {currentPageIndex + 1} / {quranPages.length}
          </div>
        </div>
        
        <Button
          onClick={handleNextPage}
          disabled={currentPageIndex === quranPages.length - 1}
          variant="outline"
          size="sm"
          className="gap-2 shadow-md hover:shadow-xl transition-all disabled:opacity-50 w-full sm:w-auto text-xs sm:text-sm"
        >
          التالية
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* Quran Page Display */}
      {currentPage && (
        <Card className={`transition-all duration-300 border-2 shadow-2xl ${
          isReading 
            ? 'border-primary shadow-[0_0_50px_rgba(var(--primary)/0.3)] scale-[1.01]' 
            : isCompleted 
            ? 'border-primary/50 bg-gradient-to-br from-primary/5 to-transparent'
            : 'border-border hover:border-primary/30 hover:shadow-xl'
        }`}>
          <CardContent className="p-4 sm:p-6 lg:p-8">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-primary/20">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    if (!isReading && !isCompleted) {
                      startReading(currentPage.id);
                    }
                  }}
                  className="flex-shrink-0 transition-transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isCompleted}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-10 w-10 text-primary animate-scale-in drop-shadow-lg" />
                  ) : (
                    <Circle className="h-10 w-10 text-muted-foreground hover:text-primary transition-colors" />
                  )}
                </button>
                
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <BookOpen className="h-6 w-6 text-primary" />
                    <h3 className="font-bold text-2xl text-foreground">
                      {currentPage.surah_name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge variant="secondary" className="text-sm px-3 py-1.5 shadow-md">
                      صفحة {currentPage.page_number}
                    </Badge>
                    <Badge variant="outline" className="text-sm px-3 py-1.5">
                      الجزء {currentPage.juz_number}
                    </Badge>
                    <Badge variant="outline" className="text-sm px-3 py-1.5 gap-1">
                      <Clock className="h-4 w-4" />
                      {minReadingTime}ث
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 bg-gradient-to-br from-primary/20 to-primary/10 px-4 py-3 rounded-xl shadow-lg border border-primary/30">
                <Coins className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold text-foreground">{currentPage.points_reward}</span>
              </div>
            </div>

            {/* Arabic Page Image or Text */}
            <div className="relative mb-4 sm:mb-6">
              {currentPage.arabic_image_url ? (
                <div className="bg-gradient-to-br from-amber-50/50 via-white to-amber-50/30 dark:from-primary/5 dark:via-background dark:to-primary/10 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-2 sm:border-4 border-double border-primary/30 shadow-inner">
                  {/* Decorative corners */}
                  <div className="absolute top-1 right-1 sm:top-2 sm:right-2 w-6 h-6 sm:w-8 sm:h-8 border-t-2 sm:border-t-4 border-r-2 sm:border-r-4 border-primary/30 rounded-tr-lg"></div>
                  <div className="absolute top-1 left-1 sm:top-2 sm:left-2 w-6 h-6 sm:w-8 sm:h-8 border-t-2 sm:border-t-4 border-l-2 sm:border-l-4 border-primary/30 rounded-tl-lg"></div>
                  <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 w-6 h-6 sm:w-8 sm:h-8 border-b-2 sm:border-b-4 border-r-2 sm:border-r-4 border-primary/30 rounded-br-lg"></div>
                  <div className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 w-6 h-6 sm:w-8 sm:h-8 border-b-2 sm:border-b-4 border-l-2 sm:border-l-4 border-primary/30 rounded-bl-lg"></div>
                  
                  <img 
                    src={currentPage.arabic_image_url} 
                    alt={`صفحة ${currentPage.page_number} - ${currentPage.surah_name}`}
                    className="w-full h-auto rounded-lg"
                  />
                </div>
              ) : (
                <div 
                  className="bg-gradient-to-br from-amber-50/50 via-white to-amber-50/30 dark:from-primary/5 dark:via-background dark:to-primary/10 p-4 sm:p-6 lg:p-10 rounded-2xl sm:rounded-3xl text-center border-2 sm:border-4 border-double border-primary/30 shadow-inner"
                  style={{
                    backgroundImage: `
                      linear-gradient(45deg, transparent 48%, rgba(var(--primary)/0.05) 49%, rgba(var(--primary)/0.05) 51%, transparent 52%),
                      linear-gradient(-45deg, transparent 48%, rgba(var(--primary)/0.05) 49%, rgba(var(--primary)/0.05) 51%, transparent 52%)
                    `,
                    backgroundSize: '20px 20px'
                  }}
                >
                  {/* Decorative corners */}
                  <div className="absolute top-1 right-1 sm:top-2 sm:right-2 w-6 h-6 sm:w-8 sm:h-8 border-t-2 sm:border-t-4 border-r-2 sm:border-r-4 border-primary/30 rounded-tr-lg"></div>
                  <div className="absolute top-1 left-1 sm:top-2 sm:left-2 w-6 h-6 sm:w-8 sm:h-8 border-t-2 sm:border-t-4 border-l-2 sm:border-l-4 border-primary/30 rounded-tl-lg"></div>
                  <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 w-6 h-6 sm:w-8 sm:h-8 border-b-2 sm:border-b-4 border-r-2 sm:border-r-4 border-primary/30 rounded-br-lg"></div>
                  <div className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 w-6 h-6 sm:w-8 sm:h-8 border-b-2 sm:border-b-4 border-l-2 sm:border-l-4 border-primary/30 rounded-bl-lg"></div>
                  
                  {/* البسملة في سطر منفصل */}
                  {formattedText.basmala && (
                    <div className="mb-6 pb-4 border-b-2 border-primary/20">
                      <p 
                        className="font-arabic text-2xl sm:text-3xl text-primary font-bold"
                        dir="rtl"
                        style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                      >
                        {formattedText.basmala}
                      </p>
                    </div>
                  )}
                  
                  {/* النص القرآني */}
                  <p 
                    className="font-arabic text-xl sm:text-2xl leading-[2.8] sm:leading-[3.2] text-foreground/95 font-semibold tracking-wide"
                    dir="rtl"
                    style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
                    dangerouslySetInnerHTML={{ 
                      __html: formattedText.text.replace(/(\d+)/g, ' ﴿$1﴾ ')
                    }}
                  />
                </div>
              )}
            </div>

            {/* Translation - Image or Text */}
            {(currentPage.translation_image_url || currentPage.translation_text) && (
              <div className="mb-6">
                {currentPage.translation_image_url ? (
                  <div className="bg-gradient-to-br from-muted/50 to-muted/30 p-4 sm:p-6 rounded-2xl border-2 border-border shadow-md" dir="ltr">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-1 w-12 bg-primary/40 rounded-full"></div>
                      <span className="text-xs font-semibold text-primary uppercase tracking-wider">Translation</span>
                    </div>
                    <img 
                      src={currentPage.translation_image_url} 
                      alt={`Translation - Page ${currentPage.page_number}`}
                      className="w-full h-auto rounded-lg"
                    />
                  </div>
                ) : currentPage.translation_text && (
                  <div className="bg-gradient-to-br from-muted/50 to-muted/30 p-4 sm:p-6 rounded-2xl border-2 border-border shadow-md" dir="ltr">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-1 w-12 bg-primary/40 rounded-full"></div>
                      <span className="text-xs font-semibold text-primary uppercase tracking-wider">Translation</span>
                    </div>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed text-left">
                      {currentPage.translation_text}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Reading Progress */}
            {isReading && (
              <div className="space-y-4 bg-gradient-to-br from-primary/15 via-primary/10 to-transparent p-6 rounded-2xl border-2 border-primary/40 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Clock className="h-7 w-7 text-primary animate-pulse" />
                      <div className="absolute inset-0 h-7 w-7 text-primary animate-ping opacity-30"></div>
                    </div>
                    <div>
                      <span className="block text-lg font-bold text-foreground">
                        جاري القراءة... ({Math.floor(readingProgress)}%)
                      </span>
                      <span className="text-sm text-muted-foreground">
                        استمر في القراءة حتى اكتمال الوقت
                      </span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-sm px-3 py-2 font-medium">
                    الحد الأدنى: {minReadingTime}ث
                  </Badge>
                </div>
                
                <Progress value={readingProgress} className="h-4 shadow-inner" />
                
                {readingProgress >= 100 && (
                  <Button
                    onClick={() => completeReading(currentPage.id, currentPage.points_reward)}
                    className="w-full shadow-xl hover:shadow-2xl transition-all text-lg py-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                    size="lg"
                  >
                    <CheckCircle2 className="h-6 w-6 ml-2" />
                    إنهاء القراءة واحصل على {currentPage.points_reward} نقطة
                  </Button>
                )}
              </div>
            )}

            {/* Completion Badge */}
            {isCompleted && (
              <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent p-4 rounded-2xl border-2 border-primary/40 text-center">
                <Badge variant="default" className="bg-primary text-primary-foreground shadow-lg px-6 py-2.5 text-base">
                  <CheckCircle2 className="h-5 w-5 ml-2" />
                  ✓ تم إكمال هذه الصفحة - بارك الله فيك
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuranTab;
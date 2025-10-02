import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Coins, BookOpen, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface QuranPage {
  id: string;
  page_number: number;
  juz_number: number;
  surah_name: string;
  arabic_text: string;
  translation_text: string | null;
  points_reward: number;
  is_active: boolean;
}

const QuranTab = () => {
  const { user } = useAuth();
  const [quranPages, setQuranPages] = useState<QuranPage[]>([]);
  const [completedPages, setCompletedPages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [readingPageId, setReadingPageId] = useState<string | null>(null);
  const [readingStartTime, setReadingStartTime] = useState<number | null>(null);
  const [readingProgress, setReadingProgress] = useState(0);

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

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {quranPages.map((page) => {
        const isCompleted = completedPages.includes(page.id);
        const isReading = readingPageId === page.id;
        const minReadingTime = getMinimumReadingTime(page.page_number, page.arabic_text.length);
        
        return (
          <Card 
            key={page.id}
            className={`transition-all duration-300 ${
              isReading 
                ? 'border-primary shadow-xl ring-2 ring-primary/20' 
                : isCompleted 
                ? 'border-primary/50 bg-gradient-to-br from-primary/5 to-transparent'
                : 'border-border hover:border-primary/30 hover:shadow-md'
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <button
                  onClick={() => {
                    if (!isReading && !isCompleted) {
                      startReading(page.id);
                    }
                  }}
                  className="flex-shrink-0 mt-1 transition-transform hover:scale-110"
                  disabled={isCompleted}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-7 w-7 text-primary animate-scale-in" />
                  ) : (
                    <Circle className="h-7 w-7 text-muted-foreground hover:text-primary transition-colors" />
                  )}
                </button>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <BookOpen className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold text-lg text-foreground">
                        صفحة {page.page_number} - {page.surah_name}
                      </h4>
                      <Badge variant="secondary" className="text-xs px-2 py-1">
                        الجزء {page.juz_number}
                      </Badge>
                      <Badge variant="outline" className="text-xs px-2 py-1">
                        ⏱️ {minReadingTime}ث
                      </Badge>
                    </div>
                    
                    {/* النص العربي */}
                    <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-6 rounded-xl mb-3 text-right border border-primary/20" dir="rtl">
                      <p className="font-arabic text-xl leading-[2.5] text-foreground">
                        {page.arabic_text}
                      </p>
                    </div>
                    
                    {/* الترجمة */}
                    {page.translation_text && (
                      <div className="bg-muted/30 p-4 rounded-xl border border-border" dir="ltr">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {page.translation_text}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* شريط التقدم للقراءة */}
                  {isReading && (
                    <div className="space-y-3 bg-gradient-to-r from-primary/10 to-transparent p-4 rounded-xl border border-primary/30">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-primary animate-pulse" />
                          <span className="font-medium text-foreground">
                            جاري القراءة... ({Math.floor(readingProgress)}%)
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground font-medium">
                          الحد الأدنى: {minReadingTime}ث
                        </span>
                      </div>
                      <Progress value={readingProgress} className="h-3" />
                      
                      {readingProgress >= 100 && (
                        <Button
                          onClick={() => completeReading(page.id, page.points_reward)}
                          className="w-full shadow-lg hover:shadow-xl transition-all"
                          size="lg"
                        >
                          <CheckCircle2 className="h-5 w-5 ml-2" />
                          إنهاء القراءة واحصل على {page.points_reward} نقطة
                        </Button>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex items-center gap-2 bg-primary/10 px-3 py-2 rounded-lg">
                      <Coins className="h-5 w-5 text-primary" />
                      <span className="text-sm font-semibold text-foreground">{page.points_reward} نقطة</span>
                    </div>
                    
                    {isCompleted && (
                      <Badge variant="default" className="bg-primary text-primary-foreground shadow-md px-3 py-1.5">
                        ✓ مكتملة
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
      
      {quranPages.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-muted/50 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
            <BookOpen className="h-12 w-12 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-lg">لا توجد صفحات قرآن متاحة حالياً</p>
        </div>
      )}
    </div>
  );
};

export default QuranTab;
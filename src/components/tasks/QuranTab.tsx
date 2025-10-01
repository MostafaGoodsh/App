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

  const MINIMUM_READING_TIME = 120; // دقيقتان بالثواني

  useEffect(() => {
    if (user) {
      fetchQuranPages();
      fetchCompletedPages();
    }
  }, [user]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (readingPageId && readingStartTime) {
      interval = setInterval(() => {
        const elapsedSeconds = Math.floor((Date.now() - readingStartTime) / 1000);
        const progress = Math.min((elapsedSeconds / MINIMUM_READING_TIME) * 100, 100);
        setReadingProgress(progress);
      }, 100);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [readingPageId, readingStartTime]);

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
        .eq('user_id', user.id)
        .eq('completed_date', new Date().toISOString().split('T')[0]);

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

    const readingTimeSeconds = Math.floor((Date.now() - readingStartTime) / 1000);

    if (readingTimeSeconds < MINIMUM_READING_TIME) {
      toast.error(`يجب قراءة الصفحة لمدة دقيقتين على الأقل. لقد قرأت ${Math.floor(readingTimeSeconds / 60)} دقيقة و ${readingTimeSeconds % 60} ثانية`);
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
    <div className="space-y-3">
      {quranPages.map((page) => {
        const isCompleted = completedPages.includes(page.id);
        const isReading = readingPageId === page.id;
        
        return (
          <Card 
            key={page.id}
            className={`transition-all ${isReading ? 'border-primary shadow-lg' : 'border-border'}`}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <button
                  onClick={() => {
                    if (!isReading && !isCompleted) {
                      startReading(page.id);
                    }
                  }}
                  className="flex-shrink-0 mt-1"
                  disabled={isCompleted}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-6 w-6 text-primary animate-scale-in" />
                  ) : (
                    <Circle className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" />
                  )}
                </button>
                
                <div className="flex-1 space-y-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <h4 className="font-medium text-foreground">
                        صفحة {page.page_number} - {page.surah_name}
                      </h4>
                      <Badge variant="secondary" className="text-xs">
                        الجزء {page.juz_number}
                      </Badge>
                    </div>
                    
                    {/* النص العربي */}
                    <div className="bg-muted/30 p-4 rounded-lg mb-2 text-right" dir="rtl">
                      <p className="font-arabic text-lg leading-loose text-foreground">
                        {page.arabic_text}
                      </p>
                    </div>
                    
                    {/* الترجمة */}
                    {page.translation_text && (
                      <div className="bg-muted/20 p-3 rounded-lg" dir="ltr">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {page.translation_text}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* شريط التقدم للقراءة */}
                  {isReading && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-primary animate-pulse" />
                          <span className="text-muted-foreground">
                            جاري القراءة... ({Math.floor(readingProgress)}%)
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          الحد الأدنى: دقيقتان
                        </span>
                      </div>
                      <Progress value={readingProgress} className="h-2" />
                      
                      {readingProgress >= 100 && (
                        <Button
                          onClick={() => completeReading(page.id, page.points_reward)}
                          className="w-full"
                          size="sm"
                        >
                          <CheckCircle2 className="h-4 w-4 ml-2" />
                          إنهاء القراءة
                        </Button>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <Coins className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">{page.points_reward} نقطة</span>
                    </div>
                    
                    {isCompleted && (
                      <Badge variant="default" className="bg-primary text-primary-foreground">
                        مكتملة ✓
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
        <div className="text-center py-8 text-muted-foreground">
          <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>لا توجد صفحات قرآن متاحة حالياً</p>
        </div>
      )}
    </div>
  );
};

export default QuranTab;
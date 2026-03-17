import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface ReelsCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  is_active: boolean;
  display_order: number;
}

const ReelsCategories = () => {
  const [categories, setCategories] = useState<ReelsCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, dir } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const { data } = await supabase.from('reels_categories').select('*').eq('is_active', true).order('display_order', { ascending: true });
        if (data) setCategories(data);
      } catch (error) { console.error('Error fetching categories:', error); }
      finally { setLoading(false); }
    };
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="animate-pulse space-y-4">
            {[...Array(6)].map((_, i) => <div key={i} className="bg-card/30 rounded-xl h-32"></div>)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <div className="bg-gradient-to-b from-primary/10 to-background p-6 border-b border-border/20">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="p-2">
              <ArrowRight className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold">{t("أقسام الفيديوهات القصيرة")}</h1>
          </div>
          <p className="text-muted-foreground">{t("اختر القسم الذي تريد مشاهدة محتواه")}</p>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category) => (
            <div key={category.id} onClick={() => navigate(`/reels?category=${category.id}`)} className="group cursor-pointer">
              <div className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:border-primary/30 hover:bg-card/50">
                <div className="flex items-center gap-4 mb-3">
                  <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{category.title}</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {category.description || t('مجموعة من الفيديوهات المختارة في هذا القسم', 'A selection of videos in this category')}
                </p>
                <div className="mt-4 w-8 h-0.5 bg-gradient-to-r from-primary to-primary/50 group-hover:w-16 transition-all duration-300"></div>
              </div>
            </div>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🎬</div>
            <h3 className="text-xl font-bold text-muted-foreground mb-2">{t("لا توجد أقسام متاحة حالياً")}</h3>
            <p className="text-muted-foreground">{t("سيتم إضافة أقسام جديدة قريباً")}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReelsCategories;

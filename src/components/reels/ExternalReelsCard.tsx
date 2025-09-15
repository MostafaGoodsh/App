import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAppContent } from '@/hooks/useAppContent';

interface ReelsCardContent {
  id: string;
  title: string;
  description: string;
  background_image_url: string;
  is_active: boolean;
}

interface ReelsCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  is_active: boolean;
  display_order: number;
}

export const ExternalReelsCard = () => {
  const [cardContent, setCardContent] = useState<ReelsCardContent | null>(null);
  const [categories, setCategories] = useState<ReelsCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const { getContent, getAltText } = useAppContent();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch card content
      const { data: cardData } = await supabase
        .from('reels_card_content')
        .select('*')
        .eq('is_active', true)
        .single();

      if (cardData) {
        setCardContent(cardData);
      }

      // Fetch categories
      const { data: categoriesData } = await supabase
        .from('reels_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (categoriesData) {
        setCategories(categoriesData);
      }
    } catch (error) {
      console.error('Error fetching reels data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse bg-card/30 backdrop-blur-sm rounded-xl h-80"></div>;
  }

  const displayTitle = cardContent?.title || getContent('reels_card_title', 'الفيديوهات القصيرة');
  const displayDescription = cardContent?.description || getContent('reels_card_description', 'شاهد مجموعة مختارة من الفيديوهات التعليمية القصيرة');
  const backgroundImage = cardContent?.background_image_url || '/lovable-uploads/placeholder.png';

  return (
    <Link to="/reels" className="group">
      <article className="relative overflow-hidden rounded-xl border border-border/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:border-primary/30 cursor-pointer bg-card/30 backdrop-blur-sm">
        <img 
          src={backgroundImage}
          alt={getAltText('reels_card_image', 'خلفية كارت الريلز')} 
          className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-all duration-300" 
          loading="lazy" 
        />
        <div className="relative p-8 min-h-[280px] md:min-h-[320px] flex flex-col justify-between bg-gradient-to-t from-background/90 via-background/60 to-transparent">
          <div>
            <h2 className="font-cairo text-2xl md:text-3xl mb-3 group-hover:text-primary transition-colors duration-300 font-bold">
              {displayTitle}
            </h2>
            <p className="font-cairo text-sm md:text-base text-muted-foreground/90 leading-relaxed mb-6">
              {displayDescription}
            </p>
          </div>
          
          {categories.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground/90 mb-3">الأقسام المتاحة:</h3>
              <div className="grid grid-cols-2 gap-3">
                {categories.slice(0, 4).map((category) => (
                  <div 
                    key={category.id}
                    className="bg-background/20 backdrop-blur-sm rounded-lg p-3 border border-border/30 group-hover:border-primary/30 transition-all duration-300"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-sm font-medium text-foreground/80">
                        {category.title}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              {categories.length > 4 && (
                <div className="text-center">
                  <span className="text-sm text-muted-foreground">
                    +{categories.length - 4} أقسام أخرى
                  </span>
                </div>
              )}
            </div>
          )}
          
          <div className="mt-4 w-12 h-0.5 bg-gradient-to-r from-primary to-primary/50 group-hover:w-20 transition-all duration-300"></div>
        </div>
      </article>
    </Link>
  );
};
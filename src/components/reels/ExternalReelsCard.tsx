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

export const ExternalReelsCard = () => {
  const [cardContent, setCardContent] = useState<ReelsCardContent | null>(null);
  const [loading, setLoading] = useState(true);
  const { getContent, getAltText } = useAppContent();

  useEffect(() => {
    fetchCardContent();
  }, []);

  const fetchCardContent = async () => {
    try {
      setLoading(true);
      
      const { data: cardData } = await supabase
        .from('reels_card_content')
        .select('*')
        .eq('is_active', true)
        .single();

      if (cardData) {
        setCardContent(cardData);
      }
    } catch (error) {
      console.error('Error fetching reels card content:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse bg-card/30 backdrop-blur-sm rounded-xl h-80"></div>;
  }

  const displayTitle = cardContent?.title || getContent('reels_card_title', 'Reels | فيديو قصير');
  const displayDescription = cardContent?.description || getContent('reels_card_description', 'شاهد مجموعة مختارة من الفيديوهات التعليمية القصيرة');
  const backgroundImage = (cardContent?.background_image_url && cardContent.background_image_url.trim() !== '') 
    ? cardContent.background_image_url 
    : '/lovable-uploads/egyptian-ankh-reels-bg.jpg';

  return (
    <Link to="/reels-categories" className="group">
      <article className="relative overflow-hidden rounded-xl border border-border/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:border-primary/30 cursor-pointer bg-card/30 backdrop-blur-sm">
        <img 
          src={backgroundImage}
          alt={getAltText('reels_card_image', 'خلفية كارت الريلز')} 
          className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-all duration-300" 
          loading="lazy" 
        />
        <div className="relative p-8 min-h-[280px] md:min-h-[320px] flex flex-col justify-end bg-gradient-to-t from-background/90 via-background/60 to-transparent">
          <h2 className="font-cairo text-2xl md:text-3xl mb-3 group-hover:text-primary transition-colors duration-300 font-bold">
            {displayTitle}
          </h2>
          <p className="font-cairo text-sm md:text-base text-muted-foreground/90 leading-relaxed">
            {displayDescription}
          </p>
          <div className="mt-4 w-12 h-0.5 bg-gradient-to-r from-primary to-primary/50 group-hover:w-20 transition-all duration-300"></div>
        </div>
      </article>
    </Link>
  );
};
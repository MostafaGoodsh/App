import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AppContent {
  id: string;
  content_key: string;
  content_type: string;
  text_content?: string;
  image_url?: string;
  alt_text?: string;
  position_order: number;
  is_active: boolean;
}

export const useAppContent = () => {
  const [content, setContent] = useState<Record<string, AppContent>>({});
  const [loading, setLoading] = useState(true);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('app_content')
        .select('*')
        .eq('is_active', true)
        .order('position_order', { ascending: true });

      if (error) throw error;

      const contentMap = (data || []).reduce((acc, item) => {
        acc[item.content_key] = item;
        return acc;
      }, {} as Record<string, AppContent>);

      setContent(contentMap);
    } catch (error) {
      console.error('Error fetching app content:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
    
    // Listen for real-time updates from Supabase
    const subscription = supabase
      .channel('app_content_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'app_content' },
        () => {
          console.log('Real-time content update detected');
          fetchContent();
        }
      )
      .subscribe();

    // Listen for custom events from content management
    const handleCustomUpdate = () => {
      console.log('Custom content update event received');
      fetchContent();
    };

    window.addEventListener('app-content-updated', handleCustomUpdate);
    window.addEventListener('app-content-refresh', handleCustomUpdate);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('app-content-updated', handleCustomUpdate);
      window.removeEventListener('app-content-refresh', handleCustomUpdate);
    };
  }, []);

  const getContent = (key: string, fallback = '') => {
    const item = content[key];
    if (!item) return fallback;
    
    if (item.content_type === 'text' || item.content_type === 'msra_mining_card') {
      return item.text_content || fallback;
    }
    
    return item.image_url || fallback;
  };

  const getContentItem = (key: string) => {
    return content[key] || null;
  };

  const getAltText = (key: string, fallback = '') => {
    const item = content[key];
    return item?.alt_text || fallback;
  };

  return {
    content,
    loading,
    getContent,
    getContentItem,
    getAltText,
    refetch: fetchContent
  };
};
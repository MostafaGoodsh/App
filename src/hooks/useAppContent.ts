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
    setLoading(true);
    try {
      console.log('Fetching app content...');
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

      console.log('Content loaded:', Object.keys(contentMap));
      setContent(contentMap);
    } catch (error) {
      console.error('Error fetching app content:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
    
    // Listen for real-time updates
    const channelName = `app_content_changes_${Math.random().toString(36).slice(2)}`;
    const subscription = supabase
      .channel(channelName)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'app_content' },
        (payload) => {
          console.log('Content changed:', payload);
          fetchContent();
        }
      )
      .subscribe();

    // Listen for custom events
    const handleContentUpdate = () => {
      console.log('Custom content update event received');
      fetchContent();
    };

    window.addEventListener('app-content-updated', handleContentUpdate);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('app-content-updated', handleContentUpdate);
    };
  }, []);

  const getContent = (key: string, fallback = '') => {
    const item = content[key];
    if (!item) return fallback;
    
    // For text-based content types, return text_content
    if (
      item.content_type === 'text' || 
      item.content_type === 'msra_mining_card' ||
      item.content_type === 'hero_content' ||
      item.content_type === 'hero_button' ||
      item.content_type === 'wallet_card' ||
      item.content_type === 'learning_card' ||
      item.content_type === 'updates_content' ||
      item.content_type === 'stable_coin_content' ||
      item.content_type === 'rwa_content' ||
      item.content_type === 'call_out_content' ||
      item.content_type === 'sidebar_content' ||
      item.content_type === 'admin_content'
    ) {
      return item.text_content || fallback;
    }
    
    // For image content, return image_url
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
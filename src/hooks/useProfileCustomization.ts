import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ProfileCustomization {
  layout_type: string;
  card_arrangement: string[];
  background_image: string | null;
  background_color: string;
  background_gradient: string | null;
  theme_mode: string;
  header_font_size: string;
  content_font_size: string;
  font_family: string;
  font_weight: string;
  show_stats: boolean;
  show_activity: boolean;
  show_follow_stats: boolean;
  show_todo_list: boolean;
  profile_visibility: string;
  show_social_links: boolean;
  show_join_date: boolean;
}

const DEFAULT_CUSTOMIZATION: ProfileCustomization = {
  layout_type: 'standard',
  card_arrangement: ['overview', 'stats', 'activity'],
  background_image: null,
  background_color: '#ffffff',
  background_gradient: null,
  theme_mode: 'auto',
  header_font_size: 'large',
  content_font_size: 'medium',
  font_family: 'Cairo',
  font_weight: 'normal',
  show_stats: true,
  show_activity: true,
  show_follow_stats: true,
  show_todo_list: true,
  profile_visibility: 'public',
  show_social_links: true,
  show_join_date: true,
};

export const useProfileCustomization = (userId?: string) => {
  const { user } = useAuth();
  const [customization, setCustomization] = useState<ProfileCustomization>(DEFAULT_CUSTOMIZATION);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const targetUserId = userId || user?.id;
    if (!targetUserId) {
      setLoading(false);
      return;
    }

    const fetchCustomization = async () => {
      try {
        const { data, error } = await supabase
          .from('profile_customization')
          .select('*')
          .eq('user_id', targetUserId)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching profile customization:', error);
          return;
        }

        if (data) {
          setCustomization({
            layout_type: data.layout_type || DEFAULT_CUSTOMIZATION.layout_type,
            card_arrangement: Array.isArray(data.card_arrangement)
              ? (data.card_arrangement as string[])
              : DEFAULT_CUSTOMIZATION.card_arrangement,
            background_image: data.background_image,
            background_color: data.background_color || DEFAULT_CUSTOMIZATION.background_color,
            background_gradient: data.background_gradient,
            theme_mode: data.theme_mode || DEFAULT_CUSTOMIZATION.theme_mode,
            header_font_size: data.header_font_size || DEFAULT_CUSTOMIZATION.header_font_size,
            content_font_size: data.content_font_size || DEFAULT_CUSTOMIZATION.content_font_size,
            font_family: data.font_family || DEFAULT_CUSTOMIZATION.font_family,
            font_weight: data.font_weight || DEFAULT_CUSTOMIZATION.font_weight,
            show_stats: data.show_stats ?? DEFAULT_CUSTOMIZATION.show_stats,
            show_activity: data.show_activity ?? DEFAULT_CUSTOMIZATION.show_activity,
            show_follow_stats: data.show_follow_stats ?? DEFAULT_CUSTOMIZATION.show_follow_stats,
            show_todo_list: data.show_todo_list ?? DEFAULT_CUSTOMIZATION.show_todo_list,
            profile_visibility: data.profile_visibility || DEFAULT_CUSTOMIZATION.profile_visibility,
            show_social_links: data.show_social_links ?? DEFAULT_CUSTOMIZATION.show_social_links,
            show_join_date: data.show_join_date ?? DEFAULT_CUSTOMIZATION.show_join_date,
          });
        }
      } catch (error) {
        console.error('Error fetching profile customization:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomization();
  }, [userId, user?.id]);

  // Helper to get font size in CSS
  const getFontSize = (size: string) => {
    const sizes: Record<string, string> = {
      small: '0.875rem',
      medium: '1rem',
      large: '1.25rem',
      xlarge: '1.5rem',
    };
    return sizes[size] || '1rem';
  };

  // Generate style object for the profile container
  const containerStyle: React.CSSProperties = {
    fontFamily: customization.font_family,
    fontWeight: customization.font_weight === 'bold' ? 700 : customization.font_weight === 'light' ? 300 : 400,
  };

  // Generate background style
  const backgroundStyle: React.CSSProperties = {
    ...(customization.background_gradient
      ? { background: customization.background_gradient }
      : customization.background_image
        ? { backgroundImage: `url('${customization.background_image}')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }
        : {}),
  };

  return {
    customization,
    loading,
    containerStyle,
    backgroundStyle,
    getFontSize,
  };
};

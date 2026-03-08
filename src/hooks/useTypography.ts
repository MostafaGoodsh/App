import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TypographySetting {
  id: string;
  section_key: string;
  font_family: string;
  font_size: string;
  font_weight: string;
  text_color: string;
  text_align: string;
  title_font_family: string;
  title_font_size: string;
  title_font_weight: string;
  title_text_color: string;
  title_text_align: string;
  line_height: string;
  letter_spacing: string;
  is_active: boolean;
}

const SIZE_MAP: Record<string, string> = {
  xs: '0.75rem',
  small: '0.875rem',
  medium: '1rem',
  large: '1.25rem',
  xl: '1.5rem',
  '2xl': '2rem',
};

const WEIGHT_MAP: Record<string, number> = {
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
};

const LINE_HEIGHT_MAP: Record<string, string> = {
  tight: '1.25',
  normal: '1.5',
  relaxed: '1.75',
  loose: '2',
};

const LETTER_SPACING_MAP: Record<string, string> = {
  tight: '-0.025em',
  normal: '0',
  wide: '0.05em',
};

export function getTypographyStyles(setting: TypographySetting | null | undefined, type: 'title' | 'content' = 'content') {
  if (!setting) return {};

  if (type === 'title') {
    return {
      fontFamily: `'${setting.title_font_family}', sans-serif`,
      fontSize: SIZE_MAP[setting.title_font_size] || '1rem',
      fontWeight: WEIGHT_MAP[setting.title_font_weight] || 400,
      color: setting.title_text_color || undefined,
      textAlign: (setting.title_text_align || 'right') as any,
    };
  }

  return {
    fontFamily: `'${setting.font_family}', sans-serif`,
    fontSize: SIZE_MAP[setting.font_size] || '1rem',
    fontWeight: WEIGHT_MAP[setting.font_weight] || 400,
    color: setting.text_color || undefined,
    textAlign: (setting.text_align || 'right') as any,
    lineHeight: LINE_HEIGHT_MAP[setting.line_height] || '1.5',
    letterSpacing: LETTER_SPACING_MAP[setting.letter_spacing] || '0',
  };
}

let cachedSettings: TypographySetting[] | null = null;

export function useTypography(sectionKey?: string) {
  const [settings, setSettings] = useState<TypographySetting[]>(cachedSettings || []);
  const [loading, setLoading] = useState(!cachedSettings);

  useEffect(() => {
    if (cachedSettings) {
      setSettings(cachedSettings);
      setLoading(false);
      return;
    }

    const fetch = async () => {
      try {
        const { data } = await supabase
          .from('app_typography_settings')
          .select('*')
          .eq('is_active', true);
        
        if (data) {
          cachedSettings = data as unknown as TypographySetting[];
          setSettings(cachedSettings);
        }
      } catch (e) {
        console.error('Error fetching typography:', e);
      } finally {
        setLoading(false);
      }
    };

    fetch();

    // Listen for realtime changes
    const channel = supabase
      .channel('typography_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_typography_settings' }, async () => {
        const { data } = await supabase.from('app_typography_settings').select('*').eq('is_active', true);
        if (data) {
          cachedSettings = data as unknown as TypographySetting[];
          setSettings(cachedSettings);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const getSetting = (key: string) => settings.find(s => s.section_key === key) || null;

  if (sectionKey) {
    return { setting: getSetting(sectionKey), settings, loading, getSetting, getTypographyStyles };
  }

  return { setting: null, settings, loading, getSetting, getTypographyStyles };
}

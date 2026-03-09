export interface HomePageCard {
  id: string;
  title: string;
  title_en: string | null;
  description: string | null;
  description_en: string | null;
  slug: string;
  card_type: string;
  display_order: number;
  is_active: boolean;
  background_image: string | null;
  background_color: string | null;
  background_gradient: string | null;
  icon_url: string | null;
  route_path: string | null;
  is_coming_soon: boolean;
  title_text_align: string | null;
  description_text_align: string | null;
  font_family: string | null;
  font_size: string | null;
  font_weight: string | null;
  text_color: string | null;
  title_font_size: string | null;
  content_font_size: string | null;
}

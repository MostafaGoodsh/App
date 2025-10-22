-- Create home_page_cards table for managing homepage cards with advanced features
CREATE TABLE IF NOT EXISTS public.home_page_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  title_en TEXT,
  description TEXT,
  description_en TEXT,
  slug TEXT NOT NULL UNIQUE,
  card_type VARCHAR(50) NOT NULL DEFAULT 'standard',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  -- Styling
  background_image TEXT,
  background_color TEXT DEFAULT '#1a1a2e',
  background_gradient TEXT DEFAULT 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  icon_url TEXT,
  
  -- Typography
  font_size VARCHAR(20) DEFAULT 'medium',
  font_family VARCHAR(50) DEFAULT 'Cairo',
  font_weight VARCHAR(20) DEFAULT 'normal',
  title_font_size VARCHAR(20) DEFAULT 'large',
  content_font_size VARCHAR(20) DEFAULT 'medium',
  text_color TEXT DEFAULT '#ffffff',
  
  -- Routing and Content
  route_path TEXT,
  page_content TEXT,
  page_content_en TEXT,
  
  -- External Widget Integration
  external_widget_url TEXT,
  widget_type VARCHAR(50),
  widget_config JSONB DEFAULT '{}'::jsonb,
  
  -- Meta
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  
  CONSTRAINT valid_card_type CHECK (card_type IN ('standard', 'learning', 'reels', 'updates', 'tasks', 'callout', 'identity', 'wallet', 'anubis', 'custom')),
  CONSTRAINT valid_widget_type CHECK (widget_type IS NULL OR widget_type IN ('iframe', 'dexscreener', 'pumpfun', 'wallet_balance', 'custom_embed', 'none'))
);

-- Enable RLS
ALTER TABLE public.home_page_cards ENABLE ROW LEVEL SECURITY;

-- Policies for home_page_cards
CREATE POLICY "Anyone can view active home page cards"
  ON public.home_page_cards
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage home page cards"
  ON public.home_page_cards
  FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Create profile_customization table for managing profile layout and appearance
CREATE TABLE IF NOT EXISTS public.profile_customization (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  
  -- Layout Settings
  layout_type VARCHAR(50) DEFAULT 'standard',
  card_arrangement JSONB DEFAULT '["overview", "stats", "activity"]'::jsonb,
  
  -- Visual Settings
  background_image TEXT,
  background_color TEXT DEFAULT '#ffffff',
  background_gradient TEXT,
  theme_mode VARCHAR(20) DEFAULT 'auto',
  
  -- Typography
  header_font_size VARCHAR(20) DEFAULT 'large',
  content_font_size VARCHAR(20) DEFAULT 'medium',
  font_family VARCHAR(50) DEFAULT 'Cairo',
  font_weight VARCHAR(20) DEFAULT 'normal',
  
  -- Widget Integration
  show_stats BOOLEAN DEFAULT true,
  show_activity BOOLEAN DEFAULT true,
  show_follow_stats BOOLEAN DEFAULT true,
  show_todo_list BOOLEAN DEFAULT true,
  external_widgets JSONB DEFAULT '[]'::jsonb,
  
  -- Privacy
  profile_visibility VARCHAR(20) DEFAULT 'public',
  show_social_links BOOLEAN DEFAULT true,
  show_join_date BOOLEAN DEFAULT true,
  
  -- Meta
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT valid_layout_type CHECK (layout_type IN ('standard', 'compact', 'extended', 'minimal')),
  CONSTRAINT valid_theme_mode CHECK (theme_mode IN ('light', 'dark', 'auto')),
  CONSTRAINT valid_profile_visibility CHECK (profile_visibility IN ('public', 'private', 'followers_only'))
);

-- Enable RLS
ALTER TABLE public.profile_customization ENABLE ROW LEVEL SECURITY;

-- Policies for profile_customization
CREATE POLICY "Users can view their own profile customization"
  ON public.profile_customization
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile customization"
  ON public.profile_customization
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile customization"
  ON public.profile_customization
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profile customizations"
  ON public.profile_customization
  FOR SELECT
  USING (is_admin(auth.uid()));

-- Create indexes for performance
CREATE INDEX idx_home_page_cards_display_order ON public.home_page_cards(display_order);
CREATE INDEX idx_home_page_cards_is_active ON public.home_page_cards(is_active);
CREATE INDEX idx_home_page_cards_slug ON public.home_page_cards(slug);
CREATE INDEX idx_profile_customization_user_id ON public.profile_customization(user_id);

-- Insert default home page cards
INSERT INTO public.home_page_cards (title, title_en, description, description_en, slug, card_type, display_order, route_path, background_image) VALUES
('التعلم', 'Learning', 'تعلم كل شيء عن العملات الرقمية ومنصة مصر', 'Learn everything about crypto and Egypt platform', 'learning', 'learning', 1, '/learning', '/lovable-uploads/placeholder.png'),
('الفيديوهات القصيرة', 'Reels', 'شاهد مجموعة مختارة من الفيديوهات التعليمية القصيرة', 'Watch curated educational short videos', 'reels', 'reels', 2, '/reels', '/lovable-uploads/egyptian-ankh-reels-bg.jpg'),
('آخر التحديثات', 'Updates', 'تابع آخر التحديثات والأخبار حول المنصة', 'Follow latest updates and news about the platform', 'updates', 'updates', 3, '/updates', '/lovable-uploads/updates-bg.jpg'),
('المهام اليومية', 'Daily Tasks', 'أكمل المهام اليومية واحصل على النقاط', 'Complete daily tasks and earn points', 'daily-tasks', 'tasks', 4, '/daily-tasks', '/lovable-uploads/70f695e0-7133-47ea-82e8-7cca2196e7f4.png'),
('استدعاء شرفي', 'Call Out', 'نداء تقدير و الهام و زخم', 'Call of appreciation and inspiration', 'call-out', 'callout', 5, '/call-out', '/lovable-uploads/sphinx-bg.jpg'),
('الهوية الرقمية', 'Identity', 'توثيق الهوية والحصول على حساب موثق', 'Verify identity and get verified account', 'identity', 'identity', 6, '/identity', '/lovable-uploads/placeholder.png'),
('الخزانة الرقمية', 'Wallet', 'محفظتك الرقمية الآمنة لإدارة الأصول', 'Your secure digital wallet for asset management', 'wallet', 'wallet', 7, '/wallet', '/lovable-uploads/placeholder.png'),
('أنوبيس', 'Anubis', 'اضغط لاكتشاف أسرار أنوبيس القديمة', 'Discover the ancient secrets of Anubis', 'anubis', 'anubis', 8, '/anubis', '/lovable-uploads/df3653c9-cca9-4f53-b0e2-3aa1eded6852.png')
ON CONFLICT (slug) DO NOTHING;
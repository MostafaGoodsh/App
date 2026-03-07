
-- جدول منتجات/خدمات المتعاونين
CREATE TABLE public.market_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL REFERENCES public.market_locations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_en TEXT,
  description TEXT,
  price NUMERIC,
  currency TEXT DEFAULT 'EGP',
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.market_products ENABLE ROW LEVEL SECURITY;

-- الجميع يمكنهم رؤية المنتجات النشطة
CREATE POLICY "Anyone can view active products"
  ON public.market_products FOR SELECT
  USING (is_active = true);

-- صاحب الموقع يمكنه إضافة/تعديل/حذف منتجاته
CREATE POLICY "Location owner can manage products"
  ON public.market_products FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.market_locations ml
      WHERE ml.id = location_id AND ml.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.market_locations ml
      WHERE ml.id = location_id AND ml.user_id = auth.uid()
    )
  );

-- الأدمن يمكنه إدارة كل المنتجات
CREATE POLICY "Admins can manage all products"
  ON public.market_products FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- إضافة حقل cover_image و bio للموقع
ALTER TABLE public.market_locations ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
ALTER TABLE public.market_locations ADD COLUMN IF NOT EXISTS bio TEXT;

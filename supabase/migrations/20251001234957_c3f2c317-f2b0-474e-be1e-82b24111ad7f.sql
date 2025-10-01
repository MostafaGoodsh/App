-- إنشاء جدول صفحات القرآن
CREATE TABLE public.quran_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_number INTEGER NOT NULL UNIQUE,
  juz_number INTEGER NOT NULL,
  surah_name TEXT NOT NULL,
  arabic_text TEXT NOT NULL,
  translation_text TEXT,
  points_reward INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- إنشاء جدول إكمال صفحات القرآن من قبل المستخدمين
CREATE TABLE public.user_quran_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  page_id UUID NOT NULL REFERENCES public.quran_pages(id) ON DELETE CASCADE,
  completed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reading_time_seconds INTEGER NOT NULL,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, page_id, completed_date)
);

-- إضافة سياسات RLS لجدول صفحات القرآن
ALTER TABLE public.quran_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active quran pages"
  ON public.quran_pages FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage quran pages"
  ON public.quran_pages FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- إضافة سياسات RLS لجدول إكمال القرآن
ALTER TABLE public.user_quran_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own quran completions"
  ON public.user_quran_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quran completions"
  ON public.user_quran_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all quran completions"
  ON public.user_quran_completions FOR SELECT
  USING (is_admin(auth.uid()));

-- إضافة trigger لتحديث updated_at
CREATE TRIGGER update_quran_pages_updated_at
  BEFORE UPDATE ON public.quran_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- إنشاء فهارس لتحسين الأداء
CREATE INDEX idx_quran_pages_page_number ON public.quran_pages(page_number);
CREATE INDEX idx_quran_pages_juz_number ON public.quran_pages(juz_number);
CREATE INDEX idx_user_quran_completions_user_date ON public.user_quran_completions(user_id, completed_date);

-- إضافة بيانات تجريبية (صفحة واحدة كمثال)
INSERT INTO public.quran_pages (page_number, juz_number, surah_name, arabic_text, translation_text, display_order) VALUES
(1, 1, 'الفاتحة', 'بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ ١ ٱلۡحَمۡدُ لِلَّهِ رَبِّ ٱلۡعَٰلَمِينَ ٢ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ ٣ مَٰلِكِ يَوۡمِ ٱلدِّينِ ٤ إِيَّاكَ نَعۡبُدُ وَإِيَّاكَ نَسۡتَعِينُ ٥ ٱهۡدِنَا ٱلصِّرَٰطَ ٱلۡمُسۡتَقِيمَ ٦ صِرَٰطَ ٱلَّذِينَ أَنۡعَمۡتَ عَلَيۡهِمۡ غَيۡرِ ٱلۡمَغۡضُوبِ عَلَيۡهِمۡ وَلَا ٱلضَّآلِّينَ ٧', 'In the name of Allah, the Entirely Merciful, the Especially Merciful. [All] praise is [due] to Allah, Lord of the worlds - The Entirely Merciful, the Especially Merciful, Sovereign of the Day of Recompense. It is You we worship and You we ask for help. Guide us to the straight path - The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.', 1);
-- إضافة كروت RWA و Stable Coin إلى خارطة الطريق
INSERT INTO public.roadmap_cards (
  title,
  title_en,
  slug,
  description,
  description_en,
  background_gradient,
  display_order,
  is_active,
  page_title,
  page_title_en,
  page_content,
  page_content_en
) VALUES 
(
  'الأصول الحقيقية',
  'Real World Assets',
  'rwa',
  'استثمر في الأصول المصرية المرمزة',
  'Invest in tokenized Egyptian assets',
  'from-amber-500 via-orange-600 to-red-700',
  100,
  true,
  'MSR-RWA | الأصول الحقيقية المرمزة',
  'MSR-RWA | Tokenized Real World Assets',
  '## منصة MSR-RWA للأصول الحقيقية المرمزة

استثمر في الأصول المصرية الحقيقية من خلال تقنية البلوك تشين

### أنواع الأصول:
- العقارات المصرية
- الأصول الثقافية والتراثية
- الأصول التجارية

### المزايا:
- استثمار آمن ومضمون
- سيولة عالية
- عوائد مستدامة
- شفافية كاملة

قريباً...',
  '## MSR-RWA Platform for Tokenized Real Assets

Invest in real Egyptian assets through blockchain technology

### Asset Types:
- Egyptian Real Estate
- Cultural & Heritage Assets
- Commercial Assets

### Benefits:
- Safe and Secure Investment
- High Liquidity
- Sustainable Returns
- Full Transparency

Coming Soon...'
),
(
  'العملة المستقرة',
  'Stable Coin',
  'stable-coin',
  'عملة مستقرة مدعومة بأصول مصرية',
  'Stable coin backed by Egyptian assets',
  'from-green-500 via-emerald-600 to-teal-700',
  101,
  true,
  'MSR Stable Coin | العملة المستقرة',
  'MSR Stable Coin',
  '## عملة MSR المستقرة

عملة رقمية مستقرة مدعومة بأصول مصرية حقيقية

### المميزات الرئيسية:
- **الاستقرار والثبات**: قيمة مستقرة مدعومة بأصول حقيقية
- **النمو المستدام**: عوائد ثابتة ومضمونة
- **الأمان الكامل**: محمية بأصول مصرية ملموسة

### كيف تعمل؟
1. كل عملة مدعومة بقيمة حقيقية من الأصول
2. قابلة للتحويل والاستخدام في أي وقت
3. عوائد ثابتة ومستقرة

### قريباً:
- الورقة البيضاء (Whitepaper)
- إطلاق العملة
- التداول والشراء

قريباً...',
  '## MSR Stable Coin

A stable digital currency backed by real Egyptian assets

### Key Features:
- **Stability**: Stable value backed by real assets
- **Sustainable Growth**: Fixed and guaranteed returns
- **Complete Security**: Protected by tangible Egyptian assets

### How it Works:
1. Each coin is backed by real asset value
2. Convertible and usable anytime
3. Fixed and stable returns

### Coming Soon:
- Whitepaper
- Coin Launch
- Trading & Purchase

Coming Soon...'
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  title_en = EXCLUDED.title_en,
  description = EXCLUDED.description,
  description_en = EXCLUDED.description_en,
  page_title = EXCLUDED.page_title,
  page_title_en = EXCLUDED.page_title_en,
  page_content = EXCLUDED.page_content,
  page_content_en = EXCLUDED.page_content_en,
  is_active = true;


## المشاكل المطلوب حلها

1. **الخطوط صغرت قوي** - التعديل السابق في `index.css` خلى `html font-size: 14px` على الموبايل و `13px` على الشاشات الصغيرة + أحجام headings ثابتة صغيرة - ده أثر سلبي على القراءة
2. **صورة الصقر (Hero) كانت واخدة الصفحة** - الـ hero section حالياً `min-h-[60vh]` وده كبير قوي على موبايل 360px - محتاج يتقلل
3. **العجلة اختفت** - العجلة اتنقلت لنظام الكروت الديناميكية (card_type: wheel) بس مفيش كارت بالنوع ده في قاعدة البيانات - محتاج نرجعها hardcoded في Index.tsx أو نتأكد من وجودها
4. **كارت "Earn" مفيهوش صفحة داخلية** - كارت موجود في home_page_cards بس مفيش page_content - الحل: CardPage.tsx بيعرض "قريباً" لو مفيش محتوى وده سليم، بس لازم نتأكد الـ slug صح

## الخطة

### 1. إصلاح أحجام الخطوط في CSS
**ملف: `src/index.css`**
- إزالة تصغير `html font-size` من media queries (شيل `font-size: 14px` و `13px`)
- إزالة أحجام headings الثابتة الصغيرة (`h1: 1.25rem` etc.)
- الإبقاء على تقليل padding الـ container فقط لاستغلال العرض

### 2. تصغير Hero Section على الموبايل
**ملف: `src/pages/Index.tsx`**
- تغيير `min-h-[60vh]` إلى `min-h-[40vh]` على الموبايل
- تقليل padding السفلي من `pb-12` لـ `pb-6`

### 3. إرجاع العجلة للصفحة الرئيسية
**ملف: `src/pages/Index.tsx`**
- إضافة import لـ `WheelOfFortune` ووضعها قبل `RoadmapCardsGrid` مباشرة كـ fallback
- الإبقاء على دعم الكارت الديناميكي في DynamicHomeCards كمان

### 4. كارت Earn - إضافة محتوى افتراضي
**ملف: `src/pages/CardPage.tsx`**
- الصفحة تعمل صح بالفعل - لو مفيش `page_content` بتعرض "قريباً". المشكلة إن الكارت محتاج `page_content` يتضاف من الإدارة، أو لو الـ slug مش مظبوط محتاج نصلحه. هنتأكد إن الـ routing سليم ونحسّن رسالة "قريباً" تكون أوضح.

### تفاصيل تقنية

```text
index.css:
  - Remove: html { font-size: 14px } @ max-width 768px
  - Remove: html { font-size: 13px } @ max-width 400px  
  - Remove: h1/h2/h3 forced sizes
  - Keep: container padding + table sizing

Index.tsx:
  - Hero: min-h-[40vh] md:min-h-[60vh]
  - Add: import WheelOfFortune
  - Add: <WheelOfFortune /> before RoadmapCardsGrid

CardPage.tsx:
  - Improve empty state message for cards without content
```


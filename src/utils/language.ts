// أدوات مساعدة للتعامل مع اللغة والمحاذاة

export type Language = "ar" | "en";
export type TextDirection = "rtl" | "ltr";

/**
 * استنتاج اتجاه النص من اللغة
 */
export function getTextDirection(language?: Language): TextDirection {
  return language === "en" ? "ltr" : "rtl";
}

/**
 * الحصول على الخط المناسب للغة
 */
export function getFontFamily(language?: Language): string {
  return language === "en" ? "font-playfair" : "font-cairo";
}

/**
 * الحصول على كلاس اللغة المناسب
 */
export function getLanguageClass(language?: Language): string {
  return `lang-${language || "ar"}`;
}

/**
 * الحصول على كلاس المحتوى المناسب
 */
export function getContentClass(language?: Language): string {
  return `content-${language || "ar"}`;
}

/**
 * التحقق من كون النص عربي
 */
export function isArabic(text?: string): boolean {
  if (!text) return false;
  // التحقق من وجود أحرف عربية
  const arabicRegex = /[\u0600-\u06FF]/;
  return arabicRegex.test(text);
}

/**
 * تحديد اللغة تلقائياً من النص
 */
export function detectLanguage(text?: string): Language {
  return isArabic(text) ? "ar" : "en";
}

/**
 * الحصول على خصائص CSS المناسبة للغة
 */
export function getLanguageStyles(language?: Language, textDirection?: TextDirection) {
  const lang = language || "ar";
  const dir = textDirection || getTextDirection(lang);
  
  return {
    direction: dir,
    textAlign: dir === "rtl" ? "right" : "left",
    fontFamily: lang === "en" ? "'Playfair Display', serif" : "'Cairo', sans-serif"
  } as React.CSSProperties;
}
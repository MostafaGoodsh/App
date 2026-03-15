import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type AppLanguage = "both" | "ar" | "en" | "fr" | "es" | "de" | "tr" | "zh" | "hi" | "ru" | "pt" | "ja" | "ko";

interface LanguageLabels {
  native: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: Record<AppLanguage, LanguageLabels> = {
  both: { native: "عربي + English", flag: "🌍" },
  ar: { native: "العربية", flag: "🇪🇬" },
  en: { native: "English", flag: "🇬🇧" },
  fr: { native: "Français", flag: "🇫🇷" },
  es: { native: "Español", flag: "🇪🇸" },
  de: { native: "Deutsch", flag: "🇩🇪" },
  tr: { native: "Türkçe", flag: "🇹🇷" },
  zh: { native: "中文", flag: "🇨🇳" },
  hi: { native: "हिन्दी", flag: "🇮🇳" },
  ru: { native: "Русский", flag: "🇷🇺" },
  pt: { native: "Português", flag: "🇧🇷" },
  ja: { native: "日本語", flag: "🇯🇵" },
  ko: { native: "한국어", flag: "🇰🇷" },
};

// Translation dictionary - Arabic is base, English is secondary, others mapped
type TranslationKey = string;
type Translations = Record<AppLanguage, Record<TranslationKey, string>>;

const translations: Translations = {
  both: {},
  ar: {},
  en: {
    "الرئيسية": "Home",
    "المحفظة": "Wallet",
    "التعلم": "Learning",
    "الاستبيانات": "Surveys",
    "البروفايل": "Profile",
    "تسجيل الخروج": "Sign Out",
    "تسجيل الدخول": "Sign In",
    "انضم الآن": "Join Now",
    "التنقل الرئيسي": "Main Navigation",
    "الوصول المبكر": "Early Access",
    "لوحة التحكم": "Admin Panel",
    "رسالة جديدة": "New Message",
    "البث المباشر": "Live Streams",
    "المحفظة (Wallet)": "Wallet",
    "الوصول المبكر (Early Access)": "Early Access",
    "الهوية (Identity)": "Identity",
    "الحقيقة و العلم  (Learning)": "Learning",
    "التأهيل و الاستبيانات (Surveys)": "Surveys",
    "منصة مصر الرقمية": "Egypt Digital Platform",
    "منصة مصر": "Egypt Platform",
    "مصر": "MSR",
    "جاري التحميل...": "Loading...",
    "إدارة المستخدمين": "Users Management",
    "إدارة الوصول المبكر": "Early Access Management",
    "رسائل الدعم": "Support Messages",
    "إدارة الحسابات المعتمدة": "Verified Accounts",
    "إدارة الهوية": "Identity Management",
    "إدارة الاستبيانات": "Surveys Management",
    "إدارة التعلم": "Learning Management",
    "إدارة محتوى التطبيق": "App Content",
    "إدارة التحديثات": "Updates Management",
    "إدارة مستويات التعدين": "Mining Levels",
    "إدارة مواقع المتعاونين": "Market Locations",
    "إدارة الإعلانات": "Announcements",
    "إدارة البادجات": "Badges",
  },
  fr: {
    "الرئيسية": "Accueil",
    "المحفظة": "Portefeuille",
    "التعلم": "Apprentissage",
    "الاستبيانات": "Sondages",
    "البروفايل": "Profil",
    "تسجيل الخروج": "Déconnexion",
    "تسجيل الدخول": "Connexion",
    "انضم الآن": "Rejoignez",
    "التنقل الرئيسي": "Navigation",
    "الوصول المبكر": "Accès anticipé",
    "لوحة التحكم": "Administration",
    "رسالة جديدة": "Nouveau message",
    "البث المباشر": "Diffusion en direct",
    "منصة مصر الرقمية": "Plateforme Numérique d'Égypte",
    "منصة مصر": "Plateforme Égypte",
    "جاري التحميل...": "Chargement...",
  },
  es: {
    "الرئيسية": "Inicio",
    "المحفظة": "Billetera",
    "التعلم": "Aprendizaje",
    "الاستبيانات": "Encuestas",
    "البروفايل": "Perfil",
    "تسجيل الخروج": "Cerrar sesión",
    "تسجيل الدخول": "Iniciar sesión",
    "انضم الآن": "Únete ahora",
    "التنقل الرئيسي": "Navegación",
    "الوصول المبكر": "Acceso anticipado",
    "منصة مصر الرقمية": "Plataforma Digital de Egipto",
    "جاري التحميل...": "Cargando...",
  },
  de: {
    "الرئيسية": "Startseite",
    "المحفظة": "Brieftasche",
    "التعلم": "Lernen",
    "البروفايل": "Profil",
    "تسجيل الخروج": "Abmelden",
    "تسجيل الدخول": "Anmelden",
    "انضم الآن": "Jetzt beitreten",
    "جاري التحميل...": "Laden...",
  },
  tr: {
    "الرئيسية": "Ana Sayfa",
    "المحفظة": "Cüzdan",
    "التعلم": "Öğrenme",
    "البروفايل": "Profil",
    "تسجيل الخروج": "Çıkış",
    "تسجيل الدخول": "Giriş",
    "انضم الآن": "Şimdi Katıl",
    "جاري التحميل...": "Yükleniyor...",
  },
  zh: {
    "الرئيسية": "首页",
    "المحفظة": "钱包",
    "التعلم": "学习",
    "البروفايل": "个人资料",
    "تسجيل الخروج": "退出",
    "تسجيل الدخول": "登录",
    "انضم الآن": "立即加入",
    "جاري التحميل...": "加载中...",
  },
  hi: {
    "الرئيسية": "होम",
    "المحفظة": "वॉलेट",
    "التعلم": "सीखना",
    "البروفايل": "प्रोफ़ाइल",
    "تسجيل الخروج": "लॉग आउट",
    "تسجيل الدخول": "लॉग इन",
    "انضم الآن": "अभी जुड़ें",
  },
  ru: {
    "الرئيسية": "Главная",
    "المحفظة": "Кошелёк",
    "التعلم": "Обучение",
    "البروفايل": "Профиль",
    "تسجيل الخروج": "Выйти",
    "تسجيل الدخول": "Войти",
    "انضم الآن": "Присоединиться",
  },
  pt: {
    "الرئيسية": "Início",
    "المحفظة": "Carteira",
    "التعلم": "Aprendizado",
    "البروفايل": "Perfil",
    "تسجيل الخروج": "Sair",
    "تسجيل الدخول": "Entrar",
    "انضم الآن": "Junte-se agora",
  },
  ja: {
    "الرئيسية": "ホーム",
    "المحفظة": "ウォレット",
    "التعلم": "学習",
    "البروفايل": "プロフィール",
    "تسجيل الخروج": "ログアウト",
    "تسجيل الدخول": "ログイン",
    "انضم الآن": "今すぐ参加",
  },
  ko: {
    "الرئيسية": "홈",
    "المحفظة": "지갑",
    "التعلم": "학습",
    "البروفايل": "프로필",
    "تسجيل الخروج": "로그아웃",
    "تسجيل الدخول": "로그인",
    "انضم الآن": "지금 가입",
  },
};

interface LanguageContextType {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  t: (arabicText: string, englishText?: string) => string;
  dir: "rtl" | "ltr";
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>(() => {
    return (localStorage.getItem("app_language") as AppLanguage) || "both";
  });

  const setLanguage = (lang: AppLanguage) => {
    setLanguageState(lang);
    localStorage.setItem("app_language", lang);
  };

  // Always keep RTL direction since the app is designed RTL-first
  const dir = "rtl" as const;

  useEffect(() => {
    document.documentElement.dir = "rtl";
    document.documentElement.lang = language === "both" ? "ar" : language;
  }, [language]);

  const t = (arabicText: string, englishText?: string): string => {
    if (language === "both") {
      // Default bilingual mode - return both texts
      if (englishText) return `${arabicText} (${englishText})`;
      return arabicText;
    }
    if (language === "ar") return arabicText;
    
    // Check translation dictionary
    const langTranslations = translations[language];
    if (langTranslations && langTranslations[arabicText]) {
      return langTranslations[arabicText];
    }
    
    // Fallback to English text if provided
    if (englishText) {
      if (language === "en") return englishText;
      const enTranslation = translations.en[arabicText];
      return enTranslation || englishText;
    }
    
    // Fallback to English translation
    const enFallback = translations.en[arabicText];
    if (enFallback) return enFallback;
    
    return arabicText;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}

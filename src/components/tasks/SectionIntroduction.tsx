import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

interface SectionIntroductionProps {
  sectionType: string;
}

interface Introduction {
  id: string;
  title: string;
  title_en?: string;
  content: string;
  content_en?: string;
  text_direction: string;
}

const INTRO_FALLBACKS = {
  general: {
    en: {
      title: "Welcome to Daily Tasks",
      content:
        "Consistency in completing tasks and organizing your time is training in discipline and perseverance. Honesty and integrity serve your own growth, while cheating only delays you. After a few weeks, you will notice the impact of honesty and commitment across every part of your life.",
    },
    ru: {
      title: "Добро пожаловать в ежедневные задания",
      content:
        "Регулярное выполнение задач и организация времени развивают дисциплину и настойчивость. Честность и порядочность работают на ваш рост, а обман лишь тормозит вас. Уже через несколько недель вы заметите, как честность и ответственность улучшают все стороны вашей жизни.",
    },
  },
  daily_tasks: {
    en: {
      title: "General Tasks",
      content:
        "Showing up daily at a fixed time strengthens your connection to the platform and reflects your ability to commit, persevere, and stay disciplined. Building your own daily task list and sticking to clear times is a strong indicator of growth—this is what successful founders and achievers around the world do.",
    },
    ru: {
      title: "Общие задачи",
      content:
        "Ежедневное присутствие в одно и то же время укрепляет вашу связь с платформой и показывает уровень вашей дисциплины, настойчивости и ответственности. Создание собственного списка ежедневных задач и соблюдение времени их выполнения — сильный показатель роста; именно так действуют предприниматели и успешные люди по всему миру.",
    },
  },
  media_content: {
    en: { title: "Media Content", content: "Explore the latest educational and media content" },
    ru: { title: "Медиа-контент", content: "Изучайте свежий образовательный и медийный контент" },
  },
  personality_tasks: {
    en: {
      title: "Personality Development Tasks",
      content:
        "Every person shapes their community and country. No matter your background, your daily presence can help build small but lasting habits and move you closer to the version of yourself you want to become. We do not police task completion here—honesty is the true measure of growth, and we value your effort to show up each day.",
    },
    ru: {
      title: "Задачи по развитию личности",
      content:
        "Каждый человек влияет на своё сообщество и страну. Независимо от вашего положения, ежедневное присутствие помогает формировать маленькие, но устойчивые привычки и приближает вас к той версии себя, которой вы хотите стать. Мы не контролируем выполнение задач — здесь честность является настоящей мерой роста, и нам важна ваша попытка возвращаться каждый день.",
    },
  },
} as const;

const SectionIntroduction = ({ sectionType }: SectionIntroductionProps) => {
  const [introduction, setIntroduction] = useState<Introduction | null>(null);
  const [loading, setLoading] = useState(true);
  const { language, dir } = useLanguage();

  useEffect(() => {
    fetchIntroduction();
  }, [sectionType]);

  const fetchIntroduction = async () => {
    try {
      const { data, error } = await supabase
        .from('task_section_introductions')
        .select('*')
        .eq('section_type', sectionType)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      setIntroduction(data);
    } catch (error) {
      console.error('Error fetching introduction:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !introduction) return null;

  const localizedFallback = language === "ru"
    ? INTRO_FALLBACKS[sectionType as keyof typeof INTRO_FALLBACKS]?.ru
    : INTRO_FALLBACKS[sectionType as keyof typeof INTRO_FALLBACKS]?.en;

  const isArabic = language === "ar" || language === "both";
  const displayTitle = isArabic
    ? introduction.title
    : introduction.title_en?.trim() || localizedFallback?.title || introduction.title;
  const displayContent = isArabic
    ? introduction.content
    : introduction.content_en?.trim() || localizedFallback?.content || introduction.content;

  const isArabic = language === "ar" || language === "both";
  const textAlign = isArabic ? "right" : "left";

  return (
    <Card className="mb-6 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
      <CardContent className="p-6" dir={isArabic ? "rtl" : "ltr"}>
        <h2 className="text-xl font-bold mb-3 text-primary" style={{ textAlign }}>
          {displayTitle}
        </h2>
        <p className="text-muted-foreground leading-relaxed whitespace-pre-line" style={{ textAlign }}>
          {displayContent}
        </p>
      </CardContent>
    </Card>
  );
};

export default SectionIntroduction;

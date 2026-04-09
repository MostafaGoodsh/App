import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Helmet } from "react-helmet-async";
import DOMPurify from "dompurify";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import WheelOfFortune from "@/components/tasks/WheelOfFortune";
import SlotMachine from "@/components/games/SlotMachine";
import LuckyDice from "@/components/games/LuckyDice";

const sanitizeHTML = (dirty: string) =>
  DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['p','br','b','i','em','strong','a','ul','ol','li','h1','h2','h3','h4','h5','h6','blockquote','code','pre','img','video','iframe','div','span','table','thead','tbody','tr','th','td'],
    ALLOWED_ATTR: ['href','src','alt','class','style','target','rel','width','height','title','dir','controls','allowfullscreen','frameborder'],
    ALLOW_DATA_ATTR: false,
  });

const CardPage = () => {
  const { slug } = useParams();
  const { t, language, dir } = useLanguage();
  const isArabic = language === "ar" || language === "both";
  const [card, setCard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const { data, error: err } = await supabase
          .from("home_page_cards")
          .select("*")
          .eq("slug", slug)
          .eq("is_active", true)
          .single();
        if (err) throw err;
        setCard(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  if (error || !card) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>{t("لم يتم العثور على الصفحة المطلوبة")}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const displayTitle = (!isArabic && card.title_en) ? card.title_en : card.title;
  const displayDesc = (!isArabic && card.description_en) ? card.description_en : card.description;
  const pageContent = (!isArabic && card.page_content_en) ? card.page_content_en : card.page_content;

  return (
    <>
      <Helmet>
        <title>{displayTitle} - منصة مصر</title>
        <meta name="description" content={displayDesc || displayTitle} />
      </Helmet>

      <main
        className="mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-4xl min-h-screen w-full"
        dir={dir}
        style={{
          fontFamily: card.font_family || "Cairo",
          fontWeight: card.font_weight || "normal",
        }}
      >
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className={`h-4 w-4 ${isArabic ? "ml-2" : "mr-2"}`} />
              {t("العودة للرئيسية")}
            </Button>
          </Link>

          <div
            className="rounded-xl p-8 text-center mb-6 relative overflow-hidden bg-cover bg-center"
            style={{
              backgroundImage: card.background_image
                ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${card.background_image}')`
                : undefined,
              background: !card.background_image
                ? (card.background_gradient || card.background_color || "hsl(var(--card))")
                : undefined,
            }}
          >
            <h1
              className="font-cairo font-bold text-primary mb-3 drop-shadow-lg"
              style={{
                fontSize: card.title_font_size || "1.5rem",
                color: card.text_color || undefined,
                textAlign: (card.title_text_align as any) || "center",
              }}
            >
              {displayTitle}
            </h1>
            {displayDesc && (
              <p className="text-foreground/80 drop-shadow-lg">{displayDesc}</p>
            )}
          </div>
        </div>

        {card.card_type === "wheel" || card.slug === "earn" ? (
          <div className="space-y-6">
            <WheelOfFortune />
            <div className="rounded-2xl bg-black border border-[#D4AF37]/20 p-4">
              <SlotMachine />
            </div>
            <div className="rounded-2xl bg-black border border-[#D4AF37]/20 p-4">
              <LuckyDice />
            </div>
            {pageContent && (
              <div
                className="prose prose-lg max-w-none dark:prose-invert
                  [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg
                  [&_video]:max-w-full [&_video]:h-auto [&_video]:rounded-lg
                  [&_iframe]:max-w-full [&_iframe]:aspect-video"
                style={{ fontSize: card.content_font_size || "1rem" }}
                dangerouslySetInnerHTML={{ __html: sanitizeHTML(pageContent) }}
              />
            )}
          </div>
        ) : pageContent ? (
          <div
            className="prose prose-lg max-w-none dark:prose-invert
              [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg
              [&_video]:max-w-full [&_video]:h-auto [&_video]:rounded-lg
              [&_iframe]:max-w-full [&_iframe]:aspect-video"
            style={{ fontSize: card.content_font_size || "1rem" }}
            dangerouslySetInnerHTML={{ __html: sanitizeHTML(pageContent) }}
          />
        ) : (
          <Card className="text-center py-12">
            <CardHeader>
              <div className="text-4xl mb-4">🚧</div>
              <CardTitle className="text-xl">{t("قريباً", "Coming Soon")}</CardTitle>
              <CardDescription className="text-base mt-2">{t("المحتوى قيد الإعداد وسيتم نشره قريباً، ترقبوا التحديثات!", "Content is being prepared and will be published soon. Stay tuned!")}</CardDescription>
            </CardHeader>
          </Card>
        )}
      </main>
    </>
  );
};

export default CardPage;

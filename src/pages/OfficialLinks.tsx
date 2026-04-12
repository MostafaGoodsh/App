import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ExternalLink, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface OfficialLink {
  id: string;
  title: string;
  title_en: string | null;
  description: string | null;
  description_en: string | null;
  url: string;
  icon_name: string | null;
  icon_url: string | null;
  category: string | null;
  display_order: number;
  is_active: boolean;
}

const categoryLabels: Record<string, { ar: string; en: string }> = {
  social: { ar: "تواصل اجتماعي", en: "Social Media" },
  website: { ar: "مواقع رسمية", en: "Official Websites" },
  community: { ar: "مجتمع", en: "Community" },
  support: { ar: "دعم", en: "Support" },
  blockchain: { ar: "بلوكتشين", en: "Blockchain" },
  other: { ar: "أخرى", en: "Other" },
};

/** Well-known brand icons mapped by domain keyword */
const BRAND_ICONS: Record<string, { emoji: string; bg: string }> = {
  'telegram': { emoji: '✈️', bg: 'bg-blue-500' },
  't.me': { emoji: '✈️', bg: 'bg-blue-500' },
  'twitter': { emoji: '🐦', bg: 'bg-sky-500' },
  'x.com': { emoji: '𝕏', bg: 'bg-black' },
  'facebook': { emoji: '📘', bg: 'bg-blue-600' },
  'instagram': { emoji: '📷', bg: 'bg-pink-500' },
  'youtube': { emoji: '▶️', bg: 'bg-red-600' },
  'tiktok': { emoji: '🎵', bg: 'bg-black' },
  'discord': { emoji: '💬', bg: 'bg-indigo-600' },
  'reddit': { emoji: '🔴', bg: 'bg-orange-600' },
  'linkedin': { emoji: '💼', bg: 'bg-blue-700' },
  'github': { emoji: '🐙', bg: 'bg-gray-800' },
  'whatsapp': { emoji: '💚', bg: 'bg-green-500' },
  'etherscan': { emoji: '⟠', bg: 'bg-blue-900' },
  'bscscan': { emoji: '⛓️', bg: 'bg-yellow-500' },
  'solscan': { emoji: '◎', bg: 'bg-purple-600' },
  'polygonscan': { emoji: '⬡', bg: 'bg-purple-700' },
  'blockchain': { emoji: '⛓️', bg: 'bg-blue-800' },
  'coinmarketcap': { emoji: '📊', bg: 'bg-blue-600' },
  'coingecko': { emoji: '🦎', bg: 'bg-green-600' },
  'dextools': { emoji: '📈', bg: 'bg-cyan-700' },
  'medium': { emoji: '📝', bg: 'bg-black' },
};

function getBrandIcon(url: string): { emoji: string; bg: string } | null {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    for (const [key, value] of Object.entries(BRAND_ICONS)) {
      if (hostname.includes(key)) return value;
    }
  } catch {}
  return null;
}

function getFaviconUrl(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  } catch {
    return '';
  }
}

const OfficialLinks = () => {
  const { t, language, dir } = useLanguage();
  const isArabic = language === "ar" || language === "both";
  const [links, setLinks] = useState<OfficialLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLinks = async () => {
      const { data } = await supabase
        .from("official_links")
        .select("*")
        .eq("is_active", true)
        .order("display_order");
      setLinks((data as OfficialLink[]) || []);
      setLoading(false);
    };
    fetchLinks();
  }, []);

  const grouped = links.reduce<Record<string, OfficialLink[]>>((acc, link) => {
    const cat = link.category || "other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(link);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6" dir={dir}>
      <Helmet>
        <title>{t("القنوات والروابط الرسمية", "Official Channels & Links")} | MS-RA</title>
        <meta name="description" content={t("الروابط والقنوات الرسمية للمنصة", "Official platform links and channels")} />
      </Helmet>

      <Link to="/">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className={`h-4 w-4 ${isArabic ? "ml-2" : "mr-2"}`} />
          {t("العودة للرئيسية", "Back to Home")}
        </Button>
      </Link>

      <div className="text-center mb-8">
        <h1 className="font-cairo text-2xl font-bold mb-2">
          {t("القنوات والروابط الرسمية", "Official Channels & Links")}
        </h1>
        <p className="text-muted-foreground text-sm">
          {t("تابعنا على قنواتنا الرسمية وابقَ على اطلاع", "Follow us on our official channels and stay updated")}
        </p>
      </div>

      {links.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          {t("لا توجد روابط حالياً", "No links available")}
        </p>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([category, catLinks]) => (
            <div key={category}>
              <Badge variant="outline" className="mb-3 text-xs">
                {isArabic
                  ? categoryLabels[category]?.ar || category
                  : categoryLabels[category]?.en || category}
              </Badge>
              <div className="grid gap-3">
                {catLinks.map((link) => {
                  const title = (!isArabic && link.title_en) ? link.title_en : link.title;
                  const desc = (!isArabic && link.description_en) ? link.description_en : link.description;
                  const brand = getBrandIcon(link.url);
                  const iconSrc = link.icon_url || (!brand ? getFaviconUrl(link.url) : '');
                  return (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block group"
                    >
                      <Card className="transition-all hover:border-primary/40 hover:shadow-lg">
                        <CardContent className="p-4 flex items-center gap-3">
                          {brand && !link.icon_url ? (
                            <div className={`w-10 h-10 rounded-lg ${brand.bg} flex items-center justify-center flex-shrink-0 text-white text-lg`}>
                              {brand.emoji}
                            </div>
                          ) : iconSrc ? (
                            <img
                              src={iconSrc}
                              alt=""
                              className="w-10 h-10 rounded-lg object-contain flex-shrink-0 bg-muted/30 p-1"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                const next = (e.target as HTMLImageElement).nextElementSibling;
                                if (next) next.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div className={`w-10 h-10 rounded-lg bg-primary/10 items-center justify-center flex-shrink-0 ${iconSrc || brand ? 'hidden' : 'flex'}`}>
                            <ExternalLink className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-cairo font-medium text-sm truncate">
                              {title}
                            </p>
                            {desc && (
                              <p className="text-xs text-muted-foreground truncate mt-0.5">
                                {desc}
                              </p>
                            )}
                          </div>
                          <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                        </CardContent>
                      </Card>
                    </a>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OfficialLinks;

import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DailyTasksCard from "@/components/engagement/DailyTasksCard";
import AnubisCard from "@/components/AnubisCard";
import { ExternalReelsCard } from "@/components/reels/ExternalReelsCard";
import LiveStreamCard from "@/components/engagement/LiveStreamCard";
import { Skeleton } from "@/components/ui/skeleton";

interface HomePageCard {
  id: string;
  title: string;
  title_en: string | null;
  description: string | null;
  description_en: string | null;
  slug: string;
  card_type: string;
  display_order: number;
  is_active: boolean;
  background_image: string | null;
  background_color: string | null;
  background_gradient: string | null;
  icon_url: string | null;
  route_path: string | null;
  is_coming_soon: boolean;
}

const SpecialCardComponents: Record<string, React.FC> = {
  tasks: DailyTasksCard,
  anubis: AnubisCard,
  reels: ExternalReelsCard,
  live_stream: LiveStreamCard,
};

const LinkCard = ({ card }: { card: HomePageCard }) => (
  <Link to={card.route_path || `/${card.slug}`} className="group">
    <article className="relative overflow-hidden rounded-xl border border-border/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:border-primary/30 cursor-pointer bg-card/30 backdrop-blur-sm">
      {card.background_image && (
        <img
          src={card.background_image}
          alt={card.title}
          className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-all duration-300"
          loading="lazy"
        />
      )}
      <div className="relative p-8 min-h-[280px] md:min-h-[320px] flex flex-col justify-end bg-gradient-to-t from-background/90 via-background/60 to-transparent">
        <h2 className="font-cairo text-2xl md:text-3xl mb-3 text-primary transition-colors duration-300 font-bold">
          {card.title}
        </h2>
        {card.description && (
          <p className="font-cairo text-sm md:text-base text-white/90 leading-relaxed">
            {card.description}
          </p>
        )}
        {card.is_coming_soon && (
          <span className="mt-2 inline-block text-xs bg-primary/20 text-primary px-3 py-1 rounded-full w-fit">
            قريباً
          </span>
        )}
        <div className="mt-4 w-12 h-0.5 bg-gradient-to-r from-primary to-primary/50 group-hover:w-20 transition-all duration-300"></div>
      </div>
    </article>
  </Link>
);

const DynamicHomeCards = () => {
  const [cards, setCards] = useState<HomePageCard[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCards = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("home_page_cards")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      setCards(data || []);
    } catch (error) {
      console.error("Error fetching home page cards:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCards();

    const channel = supabase
      .channel("home_page_cards_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "home_page_cards" }, fetchCards)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchCards]);

  if (loading) {
    return (
      <div className="flex flex-col gap-8">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="w-full h-[280px] rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <>
      {cards.map((card) => {
        const SpecialComponent = SpecialCardComponents[card.card_type];
        if (SpecialComponent) {
          return <SpecialComponent key={card.id} />;
        }
        return <LinkCard key={card.id} card={card} />;
      })}
    </>
  );
};

export default DynamicHomeCards;


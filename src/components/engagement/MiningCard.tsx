import { Link } from "react-router-dom";
import { useAppContent } from "@/hooks/useAppContent";
import { useMining } from "@/hooks/useMining";
import { Pickaxe } from "lucide-react";

const MiningCard = () => {
  const { getContent, getAltText } = useAppContent();
  const { profile, loading } = useMining();

  return (
    <Link to="/mining" className="group">
      <article className="relative overflow-hidden rounded-xl border border-border/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:border-primary/30 cursor-pointer bg-card/30 backdrop-blur-sm">
        <img 
          src={getContent('mining_card_image', '/lovable-uploads/egyptian-cat-bg.jpg')} 
          alt={getAltText('mining_card_image', 'خلفية التعدين المصرية')} 
          className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-all duration-300" 
          loading="lazy" 
        />
        <div className="relative p-8 min-h-[280px] md:min-h-[320px] flex flex-col justify-end bg-gradient-to-t from-background/90 via-background/60 to-transparent">
          <div className="flex items-center gap-3 mb-3">
            <Pickaxe className="h-8 w-8 text-primary" />
            <h2 className="font-cairo text-2xl md:text-3xl group-hover:text-primary transition-colors duration-300 font-bold">
              {getContent('mining_card_title', 'التعدين | Mining')}
            </h2>
          </div>
          
          {!loading && profile && (
            <div className="mb-3 space-y-1">
              <p className="text-sm text-primary font-medium">
                مُعدَّن: {profile.total_mined.toFixed(2)} MSR
              </p>
              <p className="text-sm text-muted-foreground">
                حالة التعدين: {profile.is_mining_active ? 'نشط' : 'متوقف'}
              </p>
            </div>
          )}
          
          <p className="font-cairo text-sm md:text-base text-muted-foreground/90 leading-relaxed">
            {getContent('mining_card_description', 'ابدأ تعدين عملة MSR واكسب المكافآت اليومية من خلال نظام التعدين المتقدم')}
          </p>
          <div className="mt-4 w-12 h-0.5 bg-gradient-to-r from-primary to-primary/50 group-hover:w-20 transition-all duration-300"></div>
        </div>
      </article>
    </Link>
  );
};

export default MiningCard;
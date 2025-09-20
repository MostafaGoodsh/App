import { Link } from "react-router-dom";
import { useAppContent } from "@/hooks/useAppContent";

const MiningCard = () => {
  const { getContent, getAltText } = useAppContent();
  
  return (
    <Link to="/mining" className="group">
      <article className="relative overflow-hidden rounded-xl border border-border/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:border-primary/30 cursor-pointer bg-card/30 backdrop-blur-sm">
        <img 
          src="/lovable-uploads/egyptian-ankh-reels-bg.jpg" 
          alt="خلفية كارت تعدين Ms-Ra" 
          className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-all duration-300" 
          loading="lazy" 
        />
        <div className="relative p-8 min-h-[280px] md:min-h-[320px] flex flex-col justify-end bg-gradient-to-t from-background/90 via-background/60 to-transparent">
          <h2 className="font-cairo text-2xl md:text-3xl mb-3 group-hover:text-primary transition-colors duration-300 font-bold">
            {getContent('mining', '$MsRa Mining')}
          </h2>
          <p className="font-cairo text-sm md:text-base text-muted-foreground/90 leading-relaxed">
            {getContent('mining_feature_desc', 'نظام تعدين متطور يساعدك على كسب العملات الرقمية')}
          </p>
          <div className="mt-4 w-12 h-0.5 bg-gradient-to-r from-primary to-primary/50 group-hover:w-20 transition-all duration-300"></div>
        </div>
      </article>
    </Link>
  );
};

export default MiningCard;
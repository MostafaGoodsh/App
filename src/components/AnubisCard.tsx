import { useAppContent } from "@/hooks/useAppContent";
import { Link } from "react-router-dom";

const AnubisCard = () => {
  const { getContent, getAltText, loading } = useAppContent();

  if (loading) {
    return <div className="animate-pulse bg-card/30 backdrop-blur-sm rounded-xl h-80"></div>;
  }

  const title = getContent('anubis_card_title', '');
  const description = getContent('anubis_card_description', '');
  const backgroundImage = getContent('anubis_card_background', '/lovable-uploads/df3653c9-cca9-4f53-b0e2-3aa1eded6852.png');

  const displayTitle = title || 'الخزانة الرقمية';
  const displayDescription = description || 'خزنة رقمية آمنة لملفاتك الخاصة';

  return (
    <Link to="/anubis" className="group">
      <article 
        className="relative overflow-hidden rounded-xl border border-border/50 cursor-pointer bg-card/30 backdrop-blur-sm group hover:scale-[1.02] hover:shadow-2xl hover:border-primary/30 transition-all duration-300"
      >
        <img 
          src={backgroundImage}
          alt={getAltText('anubis_card_image', 'تمثال أنوبيس المصري الذهبي')}
          className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-all duration-300" 
          loading="lazy" 
        />
        <div className="relative p-8 min-h-[280px] md:min-h-[320px] flex flex-col justify-end bg-gradient-to-t from-background/95 via-background/70 to-transparent">
          <h2 className="font-cairo text-2xl md:text-3xl mb-3 text-primary transition-colors duration-300 font-bold">
            {displayTitle}
          </h2>
          <p className="text-sm md:text-base text-white/90 leading-relaxed">
            {displayDescription}
          </p>
          <div className="mt-4 w-12 h-0.5 bg-gradient-to-r from-primary to-primary/50 group-hover:w-20 transition-all duration-300"></div>
        </div>
      </article>
    </Link>
  );
};

export default AnubisCard;
import { useAppContent } from "@/hooks/useAppContent";

const AnubisCard = () => {
  const { getContent, getAltText, loading } = useAppContent();

  if (loading) {
    return <div className="animate-pulse bg-card/30 backdrop-blur-sm rounded-xl h-80"></div>;
  }

  const title = getContent('anubis_card_title', '');
  const description = getContent('anubis_card_description', '');

  // Don't render if no content is set
  if (!title && !description) {
    return null;
  }

  return (
    <article className="relative overflow-hidden rounded-xl border border-border/50 cursor-pointer bg-card/30 backdrop-blur-sm group hover:scale-[1.02] hover:shadow-2xl hover:border-primary/30 transition-all duration-300">
      <img 
        src="/lovable-uploads/df3653c9-cca9-4f53-b0e2-3aa1eded6852.png"
        alt={getAltText('anubis_card_image', 'تمثال أنوبيس المصري الذهبي')}
        className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-all duration-300" 
        loading="lazy" 
      />
      <div className="relative p-8 min-h-[280px] md:min-h-[320px] flex flex-col justify-end bg-gradient-to-t from-background/95 via-background/70 to-transparent">
        {title && (
          <h2 className="font-playfair text-2xl md:text-3xl mb-3 group-hover:text-primary transition-colors duration-300 font-bold">
            {title}
          </h2>
        )}
        {description && (
          <p className="text-sm md:text-base text-muted-foreground/90 leading-relaxed">
            {description}
          </p>
        )}
        <div className="mt-4 w-12 h-0.5 bg-gradient-to-r from-primary to-primary/50 group-hover:w-20 transition-all duration-300"></div>
      </div>
    </article>
  );
};

export default AnubisCard;
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface RoadmapCardProps {
  title: string;
  titleEn?: string;
  description?: string;
  descriptionEn?: string;
  gradient: string;
  slug: string;
  isComingSoon?: boolean;
}

const RoadmapCard = ({ title, titleEn, description, descriptionEn, gradient, slug, isComingSoon }: RoadmapCardProps) => {
  const content = (
    <article className="relative group cursor-pointer">
      {/* الكارت الدائري */}
      <div 
        className={`w-44 h-44 md:w-52 md:h-52 rounded-full flex items-center justify-center text-center p-6 shadow-lg transition-all duration-300 bg-cover bg-center relative overflow-hidden ${isComingSoon ? 'opacity-60 grayscale' : 'hover:shadow-2xl transform hover:scale-105'}`}
        style={{ 
          backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('/lovable-uploads/egyptian-hieroglyphs-blue-gold.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="relative z-10 flex flex-col gap-1">
          {titleEn && (
            <h3 className="font-cairo text-lg md:text-xl font-bold text-primary leading-tight drop-shadow-lg">
              {titleEn}
            </h3>
          )}
          <p className="text-sm md:text-base text-white/90 drop-shadow-lg">
            {title}
          </p>
        </div>

        {/* Coming Soon Overlay */}
        {isComingSoon && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="bg-destructive text-destructive-foreground px-6 py-1.5 font-cairo font-bold text-sm md:text-base rotate-[-15deg] shadow-lg w-[120%] text-center">
              قريباً
            </div>
          </div>
        )}
      </div>
      
      {/* شريط Next */}
      {!isComingSoon && (
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-32 bg-primary text-primary-foreground px-4 py-1.5 rounded-full flex items-center justify-center gap-2 shadow-md group-hover:bg-primary/90 transition-colors">
          <span className="text-xs font-semibold uppercase">Next</span>
          <ChevronRight className="w-3 h-3" />
        </div>
      )}

      {/* Coming Soon badge */}
      {isComingSoon && (
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-32 bg-destructive text-destructive-foreground px-4 py-1.5 rounded-full flex items-center justify-center gap-2 shadow-md">
          <span className="text-xs font-semibold font-cairo">قريباً</span>
        </div>
      )}
      
      {/* الوصف عند التمرير */}
      {!isComingSoon && (description || descriptionEn) && (
        <div className="absolute inset-0 rounded-full bg-black/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-6 text-center">
          <div className="flex flex-col gap-1">
            {descriptionEn && (
              <p className="font-cairo text-sm md:text-base text-primary font-bold">{descriptionEn}</p>
            )}
            {description && (
              <p className="text-xs md:text-sm text-white/90">{description}</p>
            )}
          </div>
        </div>
      )}
    </article>
  );

  if (isComingSoon) {
    return <div className="cursor-not-allowed">{content}</div>;
  }

  return <Link to={`/roadmap/${slug}`}>{content}</Link>;
};

export default RoadmapCard;

import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface RoadmapCardProps {
  title: string;
  titleEn?: string;
  description?: string;
  descriptionEn?: string;
  gradient: string;
  slug: string;
}

const RoadmapCard = ({ title, titleEn, description, descriptionEn, gradient, slug }: RoadmapCardProps) => {
  return (
    <Link to={`/roadmap/${slug}`}>
      <article className="relative group cursor-pointer">
        {/* الكارت الدائري */}
        <div 
          className="w-40 h-40 md:w-48 md:h-48 rounded-full flex items-center justify-center text-center p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 bg-cover bg-center relative overflow-hidden"
          style={{ 
            backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('/lovable-uploads/egyptian-hieroglyphs-blue-gold.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="relative z-10 flex flex-col gap-1">
            {titleEn && (
              <h3 className="text-white font-bold text-sm md:text-base leading-tight drop-shadow-lg">
                {titleEn}
              </h3>
            )}
            <p className="text-white/90 text-xs font-semibold drop-shadow-lg">
              {title}
            </p>
          </div>
        </div>
        
        {/* شريط Next */}
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-32 bg-primary text-primary-foreground px-4 py-1.5 rounded-full flex items-center justify-center gap-2 shadow-md group-hover:bg-primary/90 transition-colors">
          <span className="text-xs font-semibold uppercase">Next</span>
          <ChevronRight className="w-3 h-3" />
        </div>
        
        {/* الوصف عند التمرير */}
        {(description || descriptionEn) && (
          <div className="absolute inset-0 rounded-full bg-black/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-6 text-center">
            <div className="flex flex-col gap-1">
              {descriptionEn && (
                <p className="text-white text-xs md:text-sm font-semibold">{descriptionEn}</p>
              )}
              {description && (
                <p className="text-white/80 text-xs">{description}</p>
              )}
            </div>
          </div>
        )}
      </article>
    </Link>
  );
};

export default RoadmapCard;

import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface RoadmapCardProps {
  title: string;
  description?: string;
  gradient: string;
  slug: string;
}

const RoadmapCard = ({ title, description, gradient, slug }: RoadmapCardProps) => {
  return (
    <Link to={`/roadmap/${slug}`}>
      <article className="relative group cursor-pointer">
        {/* الكارت الدائري */}
        <div 
          className="w-40 h-40 md:w-48 md:h-48 rounded-full flex items-center justify-center text-center p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          style={{ background: gradient }}
        >
          <h3 className="text-white font-bold text-sm md:text-base leading-tight">
            {title}
          </h3>
        </div>
        
        {/* شريط Next */}
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-32 bg-primary text-primary-foreground px-4 py-1.5 rounded-full flex items-center justify-center gap-2 shadow-md group-hover:bg-primary/90 transition-colors">
          <span className="text-xs font-semibold uppercase">Next</span>
          <ChevronRight className="w-3 h-3" />
        </div>
        
        {/* الوصف عند التمرير */}
        {description && (
          <div className="absolute inset-0 rounded-full bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-6 text-center">
            <p className="text-white text-xs md:text-sm">{description}</p>
          </div>
        )}
      </article>
    </Link>
  );
};

export default RoadmapCard;

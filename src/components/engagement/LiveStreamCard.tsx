import { Link } from "react-router-dom";
import { Video } from "lucide-react";

const LiveStreamCard = () => {
  return (
    <Link to="/live-stream" className="group">
      <article className="relative overflow-hidden rounded-xl border border-border/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:border-primary/30 cursor-pointer bg-card/30 backdrop-blur-sm">
        <img 
          src="/lovable-uploads/egyptian-cat-wings-live.jpg" 
          alt="قطة مصرية مجنحة - منصة البث المباشر" 
          className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-all duration-300" 
          loading="lazy" 
        />
        <div className="relative p-8 min-h-[280px] md:min-h-[320px] flex flex-col justify-end bg-gradient-to-t from-background/90 via-background/60 to-transparent">
          <div className="flex items-center gap-3 mb-3">
            <Video className="w-8 h-8 text-primary" />
            <h2 className="font-cairo text-2xl md:text-3xl text-primary transition-colors duration-300 font-bold">
              Live Stream | البث المباشر
            </h2>
          </div>
          <p className="font-cairo text-sm md:text-base text-white/90 leading-relaxed">
            للأعضاء المعتمدين والمؤثرين - يتطلب موافقة إدارية
          </p>
          <p className="font-cairo text-xs text-white/70 mt-2">
            قدّم طلبك الآن للانضمام إلى منصة البث المباشر
          </p>
          <div className="mt-4 w-12 h-0.5 bg-gradient-to-r from-primary to-primary/50 group-hover:w-20 transition-all duration-300"></div>
        </div>
      </article>
    </Link>
  );
};

export default LiveStreamCard;

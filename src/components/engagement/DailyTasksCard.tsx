import { Clock } from "lucide-react";
import { Link } from "react-router-dom";

const DailyTasksCard = () => {
  return (
    <Link to="/daily-tasks" className="group">
      <article className="relative overflow-hidden rounded-xl border border-border/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:border-primary/30 cursor-pointer bg-card/30 backdrop-blur-sm">
        <img 
          src="/lovable-uploads/70f695e0-7133-47ea-82e8-7cca2196e7f4.png"
          alt="أهرامات مصر عند الغروب - خلفية المهام اليومية" 
          className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-all duration-300" 
          loading="lazy" 
        />
        <div className="relative p-8 min-h-[280px] md:min-h-[320px] flex flex-col justify-end bg-gradient-to-t from-background/90 via-background/60 to-transparent">
          <h2 className="font-cairo text-2xl md:text-3xl mb-3 text-primary transition-colors duration-300 font-bold">
            Tasks | المهام
          </h2>
          <p className="text-sm md:text-base text-white/90 leading-relaxed">
            أكمل المهام اليومية واحصل على النقاط وقم ببناء سلسلة حضورك المتتالي
          </p>
          <div className="mt-4 w-12 h-0.5 bg-gradient-to-r from-primary to-primary/50 group-hover:w-20 transition-all duration-300"></div>
        </div>
      </article>
    </Link>
  );
};

export default DailyTasksCard;
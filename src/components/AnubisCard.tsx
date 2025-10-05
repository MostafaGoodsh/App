import { useAppContent } from "@/hooks/useAppContent";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const AnubisCard = () => {
  const { getContent, getAltText, loading } = useAppContent();
  const [isOpen, setIsOpen] = useState(false);

  if (loading) {
    return <div className="animate-pulse bg-card/30 backdrop-blur-sm rounded-xl h-80"></div>;
  }

  const title = getContent('anubis_card_title', '');
  const description = getContent('anubis_card_description', '');

  // Show card even without content, with placeholder text
  const displayTitle = title || 'أنوبيس - حامي الأسرار';
  const displayDescription = description || 'اضغط لاكتشاف أسرار أنوبيس القديمة';

  const introduction = getContent('anubis_card_introduction', 
    `في أعماق التاريخ المصري القديم، يقف أنوبيس كحارس الأسرار الأبدية وحامي الأرواح في رحلتها إلى العالم الآخر.

إله برأس ابن آوى، يرمز إلى الحماية والولاء والعدالة. في عالم العملات الرقمية، يمثل أنوبيس حماية أصولكم المالية ورقابتها بعناية فائقة.

كما كان أنوبيس يحرس المقابر الملكية ويحمي كنوز الفراعنة، فإن تقنية البلوك تشين تحمي ثروتكم الرقمية بنفس الدقة والأمان.

اكتشفوا كيف تجتمع الحكمة الفرعونية مع التكنولوجيا الحديثة لتوفر لكم أقصى درجات الأمان المالي.`
  );

  return (
    <>
      <article 
        className="relative overflow-hidden rounded-xl border border-border/50 cursor-pointer bg-card/30 backdrop-blur-sm group hover:scale-[1.02] hover:shadow-2xl hover:border-primary/30 transition-all duration-300"
        onClick={() => setIsOpen(true)}
      >
        <img 
          src="/lovable-uploads/df3653c9-cca9-4f53-b0e2-3aa1eded6852.png"
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

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-cairo text-2xl md:text-3xl text-primary">
              {displayTitle}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-6">
            <img 
              src="/lovable-uploads/df3653c9-cca9-4f53-b0e2-3aa1eded6852.png"
              alt={getAltText('anubis_card_image', 'تمثال أنوبيس المصري الذهبي')}
              className="w-full h-64 object-cover rounded-lg mb-6" 
            />
            <div className="prose prose-lg max-w-none text-right" dir="rtl">
              {introduction.split('\n\n').map((paragraph, index) => (
                <p key={index} className="mb-4 text-foreground/90 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AnubisCard;
import { Helmet } from "react-helmet-async";
import { useAppContent } from "@/hooks/useAppContent";

export default function Anubis() {
  const { getContent, getAltText, loading } = useAppContent();

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">جاري التحميل...</div>;
  }

  const title = getContent('anubis_card_title', 'أنوبيس - حامي الأسرار');
  const backgroundImage = getContent('anubis_card_background', '/lovable-uploads/df3653c9-cca9-4f53-b0e2-3aa1eded6852.png');
  const introduction = getContent('anubis_card_introduction', 
    `في أعماق التاريخ المصري القديم، يقف أنوبيس كحارس الأسرار الأبدية وحامي الأرواح في رحلتها إلى العالم الآخر.

إله برأس ابن آوى، يرمز إلى الحماية والولاء والعدالة. في عالم العملات الرقمية، يمثل أنوبيس حماية أصولكم المالية ورقابتها بعناية فائقة.

كما كان أنوبيس يحرس المقابر الملكية ويحمي كنوز الفراعنة، فإن تقنية البلوك تشين تحمي ثروتكم الرقمية بنفس الدقة والأمان.

اكتشفوا كيف تجتمع الحكمة الفرعونية مع التكنولوجيا الحديثة لتوفر لكم أقصى درجات الأمان المالي.`
  );

  return (
    <>
      <Helmet>
        <title>{title} | Crypto-MSR</title>
        <meta name="description" content="اكتشف أسرار أنوبيس وحماية الأصول المالية في عالم العملات الرقمية" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <div className="relative h-[40vh] overflow-hidden">
          <img 
            src={backgroundImage}
            alt={getAltText('anubis_card_image', 'تمثال أنوبيس المصري الذهبي')}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <h1 className="font-cairo text-4xl md:text-5xl text-primary font-bold">
              {title}
            </h1>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 max-w-3xl">
          <div className="prose prose-lg max-w-none text-right" dir="rtl">
            {introduction.split('\n\n').map((paragraph, index) => (
              <p key={index} className="mb-6 text-foreground/90 leading-relaxed text-lg">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

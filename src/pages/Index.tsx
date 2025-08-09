import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";

const Index = () => {
  const canonical = typeof window !== "undefined" ? window.location.href : "/";
  return (
    <>
      <Helmet>
        <title>منصة العملات الرقمية - تصميم أسود وذهبي</title>
        <meta name="description" content="محفظة جاهزة، توثيق هوية، قائمة بيضاء، وصول مبكر، واستبيانات ضمن منصة تعليمية تفاعلية." />
        <link rel="canonical" href={canonical} />
      </Helmet>
      <main>
        <section className="relative min-h-[80vh] flex items-center justify-center bg-background">
          <img
            src="/lovable-uploads/7c40a16a-fee6-43dd-8d4e-c418b98c2022.png"
            alt="هرم مصري عند الغروب - خلفية أسود وذهبي"
            className="absolute inset-0 w-full h-full object-cover opacity-60"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
          <div className="relative z-10 container mx-auto px-4 text-center">
            <h1 className="font-playfair text-4xl md:text-6xl font-bold mb-6">منصة العملات الرقمية - أسود وذهبي</h1>
            <p className="text-muted-foreground text-lg md:text-xl mb-8 max-w-2xl mx-auto">
              محفظة جاهزة، توثيق الهوية، قائمة بيضاء للوصول المبكر، واستبيانات ضمن منصة تعليمية تفاعلية.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button size="lg">انضم إلى القائمة البيضاء</Button>
              <Button variant="outline" size="lg">الوصول المبكر</Button>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12 grid md:grid-cols-3 gap-6">
          {[
            { src: "/lovable-uploads/8563c8f8-a309-40a5-a7d0-fca02071546e.png", alt: "قناع ذهبي مصري - سمة ذهبية مطفأة", title: "محفظة آمنة" },
            { src: "/lovable-uploads/109a2672-ce6d-4b3b-9e14-10a92facf011.png", alt: "نسر ذهبي مصري - هوية ووصول", title: "الهوية والقائمة البيضاء" },
            { src: "/lovable-uploads/e450db26-52c1-4840-9ce2-f2a921c190a3.png", alt: "عين داخل مثلث بأجنحة - منصة تعليمية", title: "تعليم تفاعلي" },
          ].map((card) => (
            <article key={card.title} className="relative overflow-hidden rounded-lg border border-border">
              <img src={card.src} alt={card.alt} className="absolute inset-0 w-full h-full object-cover opacity-40" loading="lazy" />
              <div className="relative p-6 min-h-[220px] flex flex-col justify-end bg-gradient-to-t from-background/80 via-background/40 to-transparent">
                <h2 className="font-playfair text-2xl mb-2">{card.title}</h2>
                <p className="text-sm text-muted-foreground">تجربة سلسة بتصميم أسود وذهبي مع لمسات لازوردية.</p>
              </div>
            </article>
          ))}
        </section>

        <div className="sr-only">
          <img src="/lovable-uploads/45e37627-8629-45b2-ae38-13d37fbeb015.png" alt="عنخ ذهبي" loading="lazy" />
          <img src="/lovable-uploads/b4199737-2df3-4243-bac6-a8b461a4d62e.png" alt="خنفساء مجنحة لازوردية" loading="lazy" />
          <img src="/lovable-uploads/5965d679-8a52-49ee-9711-9c3a04f7368d.png" alt="رمز العنخ الذهبي اللامع" loading="lazy" />
        </div>
      </main>
    </>
  );
};

export default Index;

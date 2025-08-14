import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
const Index = () => {
  const canonical = typeof window !== "undefined" ? window.location.href : "/";
  return (
    <>
      <Helmet>
        <title>Crypto-MSR | محفظة العملات الرقمية</title>
        <meta name="description" content="منصة بسيطة للعملات الرقمية مع محفظة آمنة وتوثيق الهوية | Simple crypto platform with secure wallet and identity verification" />
        <link rel="canonical" href={canonical} />
      </Helmet>
      <main>
        <section className="relative min-h-[85vh] flex items-center justify-center bg-background">
          <img
            src="/lovable-uploads/7c40a16a-fee6-43dd-8d4e-c418b98c2022.png"
            alt="هرم مصري عند الغروب - خلفية أسود وذهبي"
            className="absolute inset-0 w-full h-full object-cover opacity-60"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
          <div className="relative z-10 container mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-8 mb-6">
              <div className="text-sm md:text-base font-playfair text-primary/80 writing-mode-vertical-rl">
                ORIGIN
              </div>
              <div className="flex-1">
                <h1 className="font-playfair text-4xl md:text-6xl lg:text-7xl font-bold text-white/90 mb-4">
                  Crypto-MSR
                </h1>
                <p className="text-2xl md:text-3xl lg:text-4xl text-primary mb-6">
                  محفظة العملات الرقمية الآمنة
                </p>
                
                <div className="mb-6">
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-2">
                    Origin & Fate
                  </h2>
                  <p className="text-xl md:text-2xl lg:text-3xl text-white/80">
                    الأصل و المصير
                  </p>
                </div>

                <p className="text-lg md:text-xl text-white/70 mb-8 italic font-light">
                  From Egypt With Love
                </p>
              </div>
              <div className="text-sm md:text-base font-playfair text-primary/80 writing-mode-vertical-rl">
                FATE
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="w-full sm:w-auto min-w-[200px]"><Link to="/early-access">انضم الآن | Join Now</Link></Button>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-4 flex flex-col gap-8 max-w-lg">
          {[
            { src: "/lovable-uploads/8563c8f8-a309-40a5-a7d0-fca02071546e.png", alt: "قناع ذهبي مصري - سمة ذهبية مطفأة", title: "المحفظة | Wallet", href: "/wallet" },
            { src: "/lovable-uploads/45e37627-8629-45b2-ae38-13d37fbeb015.png", alt: "عنخ ذهبي - هوية ووصول", title: "توثيق الهوية | Identity", href: "/identity" },
            { src: "/lovable-uploads/e450db26-52c1-4840-9ce2-f2a921c190a3.png", alt: "عين داخل مثلث بأجنحة - منصة تعليمية", title: "التعلم | Learning", href: "/learning" },
          ].map((card) => (
            <Link key={card.title} to={card.href} className="group">
              <article className="relative overflow-hidden rounded-xl border border-border/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:border-primary/30 cursor-pointer bg-card/30 backdrop-blur-sm">
                <img src={card.src} alt={card.alt} className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-all duration-300" loading="lazy" />
                <div className="relative p-8 min-h-[280px] md:min-h-[320px] flex flex-col justify-end bg-gradient-to-t from-background/90 via-background/60 to-transparent">
                  <h2 className="font-playfair text-2xl md:text-3xl mb-3 group-hover:text-primary transition-colors duration-300 font-bold">{card.title}</h2>
                  <p className="text-sm md:text-base text-muted-foreground/90 leading-relaxed">تجربة سلسة بتصميم أسود وذهبي مع لمسات لازوردية.</p>
                  <div className="mt-4 w-12 h-0.5 bg-gradient-to-r from-primary to-primary/50 group-hover:w-20 transition-all duration-300"></div>
                </div>
              </article>
            </Link>
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

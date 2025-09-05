import { Helmet } from "react-helmet-async";
import LearningTimeline from "@/components/learning/LearningTimeline";

export default function Learning() {
  const canonical = `${window.location.origin}/learning`;

  return (
    <>
      <Helmet>
        <title>التعلم والتطوير — Black & Gold Crypto</title>
        <meta name="description" content="منصة تعليمية تفاعلية لتعلم العملات الرقمية والتداول مع مجتمع من المتعلمين والخبراء." />
        <link rel="canonical" href={canonical} />
      </Helmet>
      
      <section className="py-8 arabic-content">
        <div className="container mx-auto px-4 mb-8 text-center">
          <h1 className="font-playfair text-3xl md:text-5xl font-bold mb-4 arabic-text">منصة التعلم التفاعلية</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto arabic-text">
            تعلم، شارك، وتفاعل مع مجتمع المتداولين والمستثمرين في العملات الرقمية
          </p>
        </div>
        
        <LearningTimeline />
      </section>
    </>
  );
}
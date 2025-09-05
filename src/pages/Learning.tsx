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
      
      <div 
        className="min-h-screen"
        style={{
          backgroundImage: `url('/lovable-uploads/5f71efaf-8d4b-42c4-993b-f0d50e00f50e.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="min-h-screen bg-background/90">
          <section className="py-8 arabic-content">
        <div className="container mx-auto px-4 mb-8 text-center">
          <h1 className="font-playfair text-3xl md:text-5xl font-bold mb-2 arabic-text">منصة التعلم التفاعلية</h1>
          <h2 className="text-lg md:text-xl font-medium mb-4 text-muted-foreground">Time line</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto arabic-text">
            تعلم، شارك، وتفاعل مع مجتمع المتداولين والمستثمرين في العملات الرقمية
          </p>
        </div>
        
        <LearningTimeline />
          </section>
        </div>
      </div>
    </>
  );
}
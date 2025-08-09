import { Helmet } from "react-helmet-async";

const Learning = () => {
  const canonical = typeof window !== "undefined" ? window.location.href : "/learning";
  return (
    <>
      <Helmet>
        <title>التعلم — منصة تعليمية تفاعلية</title>
        <meta name="description" content="التعلم (Learning) لمحتوى تعليمي تفاعلي حول الأصول الرقمية." />
        <link rel="canonical" href={canonical} />
      </Helmet>
      <section className="container mx-auto px-4 py-16">
        <h1 className="font-playfair text-3xl md:text-5xl font-bold mb-6">التعلم (Learning)</h1>
        <p className="text-muted-foreground max-w-2xl">
          مواد تمهيدية ستُضاف لاحقًا.
        </p>
      </section>
    </>
  );
};

export default Learning;

import { Helmet } from "react-helmet-async";

const Surveys = () => {
  const canonical = typeof window !== "undefined" ? window.location.href : "/surveys";
  return (
    <>
      <Helmet>
        <title>الاستبيانات — آراء وملاحظات</title>
        <meta name="description" content="الاستبيانات (Surveys) لجمع آراء المستخدمين وتحسين التجربة." />
        <link rel="canonical" href={canonical} />
      </Helmet>
      <section className="container mx-auto px-4 py-16">
        <h1 className="font-playfair text-3xl md:text-5xl font-bold mb-6">الاستبيانات (Surveys)</h1>
        <p className="text-muted-foreground max-w-2xl">
          سنضيف نماذج تفاعلية لاستقبال آرائكم.
        </p>
      </section>
    </>
  );
};

export default Surveys;

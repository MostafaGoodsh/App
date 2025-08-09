import { Helmet } from "react-helmet-async";

const Identity = () => {
  const canonical = typeof window !== "undefined" ? window.location.href : "/identity";
  return (
    <>
      <Helmet>
        <title>توثيق الهوية — اعرف عميلك</title>
        <meta name="description" content="توثيق الهوية (Identity Verification) ضمن تجربة آمنة وبسيطة." />
        <link rel="canonical" href={canonical} />
      </Helmet>
      <section className="container mx-auto px-4 py-16">
        <h1 className="font-playfair text-3xl md:text-5xl font-bold mb-6">توثيق الهوية (Identity)</h1>
        <p className="text-muted-foreground max-w-2xl">
          صفحة تمهيدية لتجربة KYC.
        </p>
      </section>
    </>
  );
};

export default Identity;

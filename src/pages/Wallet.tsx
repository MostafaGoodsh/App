import { Helmet } from "react-helmet-async";

const Wallet = () => {
  const canonical = typeof window !== "undefined" ? window.location.href : "/wallet";
  return (
    <>
      <Helmet>
        <title>المحفظة — إدارة الأصول الرقمية</title>
        <meta name="description" content="المحفظة (Wallet) لإدارة الأصول الرقمية بتصميم أسود وذهبي." />
        <link rel="canonical" href={canonical} />
      </Helmet>
      <section className="container mx-auto px-4 py-16">
        <h1 className="font-playfair text-3xl md:text-5xl font-bold mb-6">المحفظة (Wallet)</h1>
        <p className="text-muted-foreground max-w-2xl">
          لوحة أولية لعرض الرصيد والمعاملات. سيتم إضافة الربط لاحقًا.
        </p>
      </section>
    </>
  );
};

export default Wallet;

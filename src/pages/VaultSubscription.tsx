import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Check, CreditCard } from "lucide-react";
import { useState } from "react";
import { useVaultSubscription } from "@/hooks/useVaultSubscription";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const VaultSubscription = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscription, hasAccess, createSubscription } = useVaultSubscription();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const plans = [
    {
      id: "monthly",
      name: "اشتراك شهري",
      price: 99,
      duration: "شهر",
      features: [
        "وصول كامل للخزانة الرقمية",
        "تخزين آمن للملفات",
        "تشفير متقدم",
        "دعم فني 24/7",
      ],
    },
    {
      id: "yearly",
      name: "اشتراك سنوي",
      price: 999,
      duration: "سنة",
      savings: "وفر 180 جنيه",
      features: [
        "جميع مزايا الاشتراك الشهري",
        "خصم 15%",
        "مساحة تخزين إضافية",
        "أولوية في الدعم الفني",
      ],
    },
    {
      id: "lifetime",
      name: "اشتراك مدى الحياة",
      price: 2999,
      duration: "مدى الحياة",
      savings: "أفضل قيمة",
      features: [
        "وصول غير محدود للخزانة",
        "مساحة تخزين غير محدودة",
        "جميع التحديثات المستقبلية",
        "دعم VIP",
      ],
    },
  ];

  const handleSubscribe = async (planId: string, price: number) => {
    setSelectedPlan(planId);
    
    // Here you would integrate with your payment provider
    // For now, we'll create a pending subscription
    await createSubscription.mutateAsync({
      subscription_type: planId,
      payment_amount: price,
      payment_method: "pending",
    });
    
    // Redirect to payment page or show payment modal
    // navigate("/payment");
  };

  // If user already has access, redirect to wallet
  if (hasAccess && subscription?.status === "active") {
    navigate("/wallet");
    return null;
  }

  // If not logged in, redirect to auth
  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <>
      <Helmet>
        <title>اشتراك الخزانة الرقمية - منصة مصر</title>
        <meta name="description" content="اشترك في الخزانة الرقمية للحصول على تخزين آمن ومشفر لملفاتك" />
      </Helmet>
      <div 
        className="min-h-screen py-12"
        style={{
          backgroundImage: `url('/lovable-uploads/5f71efaf-8d4b-42c4-993b-f0d50e00f50e.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="min-h-screen bg-background/90">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-12">
              <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Lock className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-4xl font-bold text-primary mb-4 arabic-text">الخزانة الرقمية</h1>
              <p className="text-xl text-muted-foreground arabic-text">
                احم بياناتك وملفاتك بأعلى مستويات الأمان
              </p>
            </div>

            {subscription?.status === "pending" && (
              <Card className="mb-8 border-yellow-500/50 bg-yellow-50/10">
                <CardContent className="pt-6">
                  <p className="text-center arabic-text">
                    لديك اشتراك قيد المراجعة. سيتم تفعيله بعد تأكيد الدفع.
                  </p>
                </CardContent>
              </Card>
            )}

            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <Card 
                  key={plan.id}
                  className={`relative overflow-hidden transition-all duration-300 hover:scale-105 ${
                    plan.id === "yearly" ? "border-primary shadow-lg" : ""
                  }`}
                >
                  {plan.savings && (
                    <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold arabic-text">
                      {plan.savings}
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-2xl arabic-text">{plan.name}</CardTitle>
                    <CardDescription className="arabic-text">
                      <span className="text-4xl font-bold text-primary">{plan.price}</span>
                      <span className="text-lg"> جنيه</span>
                      <span className="text-sm text-muted-foreground"> / {plan.duration}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 arabic-text">
                          <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full arabic-text"
                      size="lg"
                      variant={plan.id === "yearly" ? "default" : "outline"}
                      onClick={() => handleSubscribe(plan.id, plan.price)}
                      disabled={createSubscription.isPending && selectedPlan === plan.id}
                    >
                      <CreditCard className="w-4 h-4 ml-2" />
                      {createSubscription.isPending && selectedPlan === plan.id
                        ? "جاري المعالجة..."
                        : "اشترك الآن"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="mt-12 bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <h3 className="text-xl font-bold arabic-text">لماذا الخزانة الرقمية؟</h3>
                  <div className="grid md:grid-cols-3 gap-6 text-sm arabic-text">
                    <div>
                      <h4 className="font-bold mb-2">🔒 أمان متقدم</h4>
                      <p className="text-muted-foreground">تشفير من الطراز العسكري لحماية ملفاتك</p>
                    </div>
                    <div>
                      <h4 className="font-bold mb-2">☁️ نسخ احتياطي تلقائي</h4>
                      <p className="text-muted-foreground">لن تفقد بياناتك أبداً</p>
                    </div>
                    <div>
                      <h4 className="font-bold mb-2">📱 وصول من أي مكان</h4>
                      <p className="text-muted-foreground">ملفاتك متاحة على جميع أجهزتك</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default VaultSubscription;

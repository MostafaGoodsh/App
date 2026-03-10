import { UnifiedPaymentGateway } from "@/components/payment/UnifiedPaymentGateway";

const UnifiedPayment = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-cairo text-2xl font-bold mb-6 text-center">بوابة الدفع الموحدة</h1>
      <UnifiedPaymentGateway
        mode="inline"
        purpose="general"
        purposeLabel="دفع عام"
        onPaymentSuccess={(ref) => console.log('Payment success:', ref)}
      />
    </div>
  );
};

export default UnifiedPayment;

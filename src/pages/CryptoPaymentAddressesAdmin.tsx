import { Helmet } from "react-helmet-async";
import AdminPageShell from "@/components/admin/AdminPageShell";
import CryptoPaymentAddressesManagement from "@/components/admin/CryptoPaymentAddressesManagement";

const CryptoPaymentAddressesAdmin = () => {
  return (
    <>
      <Helmet>
        <title>إدارة عناوين الكريبتو - لوحة التحكم</title>
        <meta name="description" content="إضافة وتعديل عناوين شبكات الدفع بالكريبتو" />
      </Helmet>
      <AdminPageShell withContainer>
        <CryptoPaymentAddressesManagement />
      </AdminPageShell>
    </>
  );
};

export default CryptoPaymentAddressesAdmin;

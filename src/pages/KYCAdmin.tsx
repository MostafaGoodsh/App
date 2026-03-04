import { Helmet } from "react-helmet-async";
import KYCManagement from "@/components/admin/KYCManagement";
import AdminPageShell from "@/components/admin/AdminPageShell";

const KYCAdmin = () => {
  return (
    <>
      <Helmet>
        <title>إدارة KYC - لوحة التحكم</title>
        <meta name="description" content="إدارة ومراجعة طلبات التحقق من الهوية" />
      </Helmet>
      <AdminPageShell>
        <KYCManagement />
      </AdminPageShell>
    </>
  );
};

export default KYCAdmin;

import { Helmet } from "react-helmet-async";
import EarlyAccessManagement from "@/components/admin/EarlyAccessManagement";
import RequireAdmin from "@/components/auth/RequireAdmin";
import AdminPageShell from "@/components/admin/AdminPageShell";

const EarlyAccessAdmin = () => {
  return (
    <RequireAdmin>
      <Helmet>
        <title>إدارة الوصول المبكر - لوحة التحكم</title>
        <meta name="description" content="إدارة المستخدمين المسموح لهم بالوصول المبكر" />
      </Helmet>
      <AdminPageShell withContainer>
        <EarlyAccessManagement />
      </AdminPageShell>
    </RequireAdmin>
  );
};

export default EarlyAccessAdmin;

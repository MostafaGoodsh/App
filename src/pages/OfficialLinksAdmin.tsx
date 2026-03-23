import { Helmet } from "react-helmet-async";
import OfficialLinksManagement from "@/components/admin/OfficialLinksManagement";
import RequireAdmin from "@/components/auth/RequireAdmin";
import AdminPageShell from "@/components/admin/AdminPageShell";

const OfficialLinksAdmin = () => {
  return (
    <RequireAdmin>
      <Helmet>
        <title>إدارة الروابط الرسمية - لوحة التحكم</title>
        <meta name="description" content="إدارة الروابط الرسمية للمنصة" />
      </Helmet>
      <AdminPageShell withContainer>
        <OfficialLinksManagement />
      </AdminPageShell>
    </RequireAdmin>
  );
};

export default OfficialLinksAdmin;

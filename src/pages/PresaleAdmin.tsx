import { Helmet } from "react-helmet-async";
import PresaleManagement from "@/components/admin/PresaleManagement";
import RequireAdmin from "@/components/auth/RequireAdmin";
import AdminPageShell from "@/components/admin/AdminPageShell";

const PresaleAdmin = () => {
  return (
    <RequireAdmin>
      <Helmet>
        <title>إدارة البيع المبكر - لوحة التحكم</title>
        <meta name="description" content="إدارة جولات البيع المبكر للتوكن" />
      </Helmet>
      <AdminPageShell withContainer>
        <PresaleManagement />
      </AdminPageShell>
    </RequireAdmin>
  );
};

export default PresaleAdmin;

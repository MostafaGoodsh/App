import { Helmet } from "react-helmet-async";
import UICardSettingsManagement from "@/components/admin/UICardSettingsManagement";
import RequireAdmin from "@/components/auth/RequireAdmin";
import AdminPageShell from "@/components/admin/AdminPageShell";

const UICardSettingsAdmin = () => (
  <RequireAdmin>
    <Helmet>
      <title>إدارة تصميم الكروت - لوحة التحكم</title>
      <meta name="description" content="إدارة تخصيص تصميم جميع الكروت في التطبيق" />
    </Helmet>
    <AdminPageShell withContainer>
      <UICardSettingsManagement />
    </AdminPageShell>
  </RequireAdmin>
);

export default UICardSettingsAdmin;

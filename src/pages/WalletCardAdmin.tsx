import { Helmet } from "react-helmet-async";
import WalletCardManagement from "@/components/admin/WalletCardManagement";
import RequireAdmin from "@/components/auth/RequireAdmin";
import AdminPageShell from "@/components/admin/AdminPageShell";

const WalletCardAdmin = () => {
  return (
    <RequireAdmin>
      <Helmet>
        <title>إدارة كروت المحافظ - لوحة التحكم</title>
        <meta name="description" content="إدارة تخصيص كروت محافظ سولانا وباي وتون" />
      </Helmet>
      <AdminPageShell withContainer>
        <WalletCardManagement />
      </AdminPageShell>
    </RequireAdmin>
  );
};

export default WalletCardAdmin;

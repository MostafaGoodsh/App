import { Helmet } from "react-helmet-async";
import EngagementStatsManagement from "@/components/admin/EngagementStatsManagement";
import AdminPageShell from "@/components/admin/AdminPageShell";

const EngagementStatsAdmin = () => {
  return (
    <>
      <Helmet>
        <title>إحصائيات التفاعل - لوحة التحكم</title>
        <meta name="description" content="إدارة ومتابعة إحصائيات تفاعل المستخدمين والحضور المتتالي" />
      </Helmet>
      <AdminPageShell>
        <EngagementStatsManagement />
      </AdminPageShell>
    </>
  );
};

export default EngagementStatsAdmin;

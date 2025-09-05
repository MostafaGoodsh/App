import { Helmet } from "react-helmet-async";
import EngagementStatsManagement from "@/components/admin/EngagementStatsManagement";

const EngagementStatsAdmin = () => {
  return (
    <>
      <Helmet>
        <title>إحصائيات التفاعل - لوحة التحكم</title>
        <meta name="description" content="إدارة ومتابعة إحصائيات تفاعل المستخدمين والحضور المتتالي" />
      </Helmet>
      <EngagementStatsManagement />
    </>
  );
};

export default EngagementStatsAdmin;
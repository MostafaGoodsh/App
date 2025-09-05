import { Helmet } from "react-helmet-async";
import EngagementStatsManagement from "@/components/admin/EngagementStatsManagement";

const EngagementStatsAdmin = () => {
  return (
    <>
      <Helmet>
        <title>إحصائيات التفاعل - لوحة التحكم</title>
        <meta name="description" content="إدارة ومتابعة إحصائيات تفاعل المستخدمين والحضور المتتالي" />
      </Helmet>
      <div 
        className="min-h-screen"
        style={{
          backgroundImage: `url('/lovable-uploads/5f71efaf-8d4b-42c4-993b-f0d50e00f50e.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="min-h-screen bg-background/90">
          <EngagementStatsManagement />
        </div>
      </div>
    </>
  );
};

export default EngagementStatsAdmin;
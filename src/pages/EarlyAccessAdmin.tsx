import { Helmet } from "react-helmet-async";
import EarlyAccessManagement from "@/components/admin/EarlyAccessManagement";
import RequireAdmin from "@/components/auth/RequireAdmin";

const EarlyAccessAdmin = () => {
  return (
    <RequireAdmin>
      <Helmet>
        <title>إدارة الوصول المبكر - لوحة التحكم</title>
        <meta name="description" content="إدارة المستخدمين المسموح لهم بالوصول المبكر" />
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
          <div className="container mx-auto p-6">
            <EarlyAccessManagement />
          </div>
        </div>
      </div>
    </RequireAdmin>
  );
};

export default EarlyAccessAdmin;

import { Helmet } from "react-helmet-async";
import KYCManagement from "@/components/admin/KYCManagement";

const KYCAdmin = () => {
  return (
    <>
      <Helmet>
        <title>إدارة KYC - لوحة التحكم</title>
        <meta name="description" content="إدارة ومراجعة طلبات التحقق من الهوية" />
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
          <KYCManagement />
        </div>
      </div>
    </>
  );
};

export default KYCAdmin;
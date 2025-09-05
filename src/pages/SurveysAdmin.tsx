import { Helmet } from "react-helmet-async";
import SurveysManagement from "@/components/admin/SurveysManagement";

const SurveysAdmin = () => {
  return (
    <>
      <Helmet>
        <title>إدارة الاستبيانات - لوحة التحكم</title>
        <meta name="description" content="إدارة وتحرير الاستبيانات" />
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
          <SurveysManagement />
        </div>
      </div>
    </>
  );
};

export default SurveysAdmin;
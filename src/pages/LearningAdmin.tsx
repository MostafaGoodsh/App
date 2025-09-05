import { Helmet } from "react-helmet-async";
import LearningManagement from "@/components/admin/LearningManagement";

const LearningAdmin = () => {
  return (
    <>
      <Helmet>
        <title>إدارة محتوى التعلم - لوحة التحكم</title>
        <meta name="description" content="إدارة وتحرير محتوى التعلم" />
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
          <LearningManagement />
        </div>
      </div>
    </>
  );
};

export default LearningAdmin;
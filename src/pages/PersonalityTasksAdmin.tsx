import { Helmet } from "react-helmet-async";
import PersonalityTasksManagement from "@/components/admin/PersonalityTasksManagement";

const PersonalityTasksAdmin = () => {
  return (
    <>
      <Helmet>
        <title>إدارة مهام تطوير الشخصية - لوحة التحكم</title>
        <meta name="description" content="إدارة وتخصيص مهام تطوير الشخصية" />
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
          <PersonalityTasksManagement />
        </div>
      </div>
    </>
  );
};

export default PersonalityTasksAdmin;
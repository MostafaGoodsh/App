import { Helmet } from "react-helmet-async";
import UsersManagement from "@/components/admin/UsersManagement";

const UsersAdmin = () => {
  return (
    <>
      <Helmet>
        <title>إدارة المستخدمين - لوحة التحكم</title>
        <meta name="description" content="إدارة ومتابعة المستخدمين المسجلين وحالة التحقق" />
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
          <UsersManagement />
        </div>
      </div>
    </>
  );
};

export default UsersAdmin;
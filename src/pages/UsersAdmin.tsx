import { Helmet } from "react-helmet-async";
import UsersManagement from "@/components/admin/UsersManagement";

const UsersAdmin = () => {
  return (
    <>
      <Helmet>
        <title>إدارة المستخدمين - لوحة التحكم</title>
        <meta name="description" content="إدارة ومتابعة المستخدمين المسجلين وحالة التحقق" />
      </Helmet>
      <UsersManagement />
    </>
  );
};

export default UsersAdmin;
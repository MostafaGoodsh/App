import { Helmet } from "react-helmet-async";
import UsersManagement from "@/components/admin/UsersManagement";
import AdminPageShell from "@/components/admin/AdminPageShell";

const UsersAdmin = () => {
  return (
    <>
      <Helmet>
        <title>إدارة المستخدمين - لوحة التحكم</title>
        <meta name="description" content="إدارة ومتابعة المستخدمين المسجلين وحالة التحقق" />
      </Helmet>
      <AdminPageShell>
        <UsersManagement />
      </AdminPageShell>
    </>
  );
};

export default UsersAdmin;

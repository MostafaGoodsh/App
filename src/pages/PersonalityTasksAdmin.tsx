import { Helmet } from "react-helmet-async";
import PersonalityTasksManagement from "@/components/admin/PersonalityTasksManagement";
import AdminPageShell from "@/components/admin/AdminPageShell";

const PersonalityTasksAdmin = () => {
  return (
    <>
      <Helmet>
        <title>إدارة مهام تطوير الشخصية - لوحة التحكم</title>
        <meta name="description" content="إدارة وتخصيص مهام تطوير الشخصية" />
      </Helmet>
      <AdminPageShell>
        <PersonalityTasksManagement />
      </AdminPageShell>
    </>
  );
};

export default PersonalityTasksAdmin;

import { Helmet } from "react-helmet-async";
import DailyTasksManagement from "@/components/admin/DailyTasksManagement";
import AdminPageShell from "@/components/admin/AdminPageShell";

const DailyTasksAdmin = () => {
  return (
    <>
      <Helmet>
        <title>إدارة المهام اليومية - لوحة التحكم</title>
        <meta name="description" content="إدارة وتخصيص المهام اليومية ونظام النقاط" />
      </Helmet>
      <AdminPageShell>
        <DailyTasksManagement />
      </AdminPageShell>
    </>
  );
};

export default DailyTasksAdmin;

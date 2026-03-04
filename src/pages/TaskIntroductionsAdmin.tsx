import { Helmet } from "react-helmet-async";
import TaskIntroductionsManagement from "@/components/admin/TaskIntroductionsManagement";
import AdminPageShell from "@/components/admin/AdminPageShell";

const TaskIntroductionsAdmin = () => {
  return (
    <>
      <Helmet>
        <title>إدارة مقدمات المهام - لوحة التحكم</title>
        <meta name="description" content="إدارة وتخصيص مقدمات أقسام المهام اليومية" />
      </Helmet>
      <AdminPageShell>
        <TaskIntroductionsManagement />
      </AdminPageShell>
    </>
  );
};

export default TaskIntroductionsAdmin;

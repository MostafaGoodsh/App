import { Helmet } from "react-helmet-async";
import DailyTasksManagement from "@/components/admin/DailyTasksManagement";

const DailyTasksAdmin = () => {
  return (
    <>
      <Helmet>
        <title>إدارة المهام اليومية - لوحة التحكم</title>
        <meta name="description" content="إدارة وتخصيص المهام اليومية ونظام النقاط" />
      </Helmet>
      <DailyTasksManagement />
    </>
  );
};

export default DailyTasksAdmin;
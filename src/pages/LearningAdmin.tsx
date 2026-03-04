import { Helmet } from "react-helmet-async";
import LearningManagement from "@/components/admin/LearningManagement";
import AdminPageShell from "@/components/admin/AdminPageShell";

const LearningAdmin = () => {
  return (
    <>
      <Helmet>
        <title>إدارة محتوى التعلم - لوحة التحكم</title>
        <meta name="description" content="إدارة وتحرير محتوى التعلم" />
      </Helmet>
      <AdminPageShell>
        <LearningManagement />
      </AdminPageShell>
    </>
  );
};

export default LearningAdmin;

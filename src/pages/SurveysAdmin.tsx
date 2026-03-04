import { Helmet } from "react-helmet-async";
import SurveysManagement from "@/components/admin/SurveysManagement";
import AdminPageShell from "@/components/admin/AdminPageShell";

const SurveysAdmin = () => {
  return (
    <>
      <Helmet>
        <title>إدارة الاستبيانات - لوحة التحكم</title>
        <meta name="description" content="إدارة وتحرير الاستبيانات" />
      </Helmet>
      <AdminPageShell>
        <SurveysManagement />
      </AdminPageShell>
    </>
  );
};

export default SurveysAdmin;

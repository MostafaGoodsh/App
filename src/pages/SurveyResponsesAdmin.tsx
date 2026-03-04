import { Helmet } from "react-helmet-async";
import SurveyResponsesManagement from "@/components/admin/SurveyResponsesManagement";
import AdminPageShell from "@/components/admin/AdminPageShell";

const SurveyResponsesAdmin = () => {
  return (
    <>
      <Helmet>
        <title>إجابات الاستبيانات - لوحة التحكم</title>
        <meta name="description" content="عرض وإدارة إجابات المستخدمين على الاستبيانات" />
      </Helmet>
      <AdminPageShell>
        <SurveyResponsesManagement />
      </AdminPageShell>
    </>
  );
};

export default SurveyResponsesAdmin;

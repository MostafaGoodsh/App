import { Helmet } from "react-helmet-async";
import SurveyResponsesManagement from "@/components/admin/SurveyResponsesManagement";

const SurveyResponsesAdmin = () => {
  return (
    <>
      <Helmet>
        <title>إجابات الاستبيانات - لوحة التحكم</title>
        <meta name="description" content="عرض وإدارة إجابات المستخدمين على الاستبيانات" />
      </Helmet>
      <SurveyResponsesManagement />
    </>
  );
};

export default SurveyResponsesAdmin;
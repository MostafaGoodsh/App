import { Helmet } from "react-helmet-async";
import SurveysManagement from "@/components/admin/SurveysManagement";

const SurveysAdmin = () => {
  return (
    <>
      <Helmet>
        <title>إدارة الاستبيانات - لوحة التحكم</title>
        <meta name="description" content="إدارة وتحرير الاستبيانات" />
      </Helmet>
      <SurveysManagement />
    </>
  );
};

export default SurveysAdmin;
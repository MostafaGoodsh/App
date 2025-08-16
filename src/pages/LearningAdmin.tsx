import { Helmet } from "react-helmet-async";
import LearningManagement from "@/components/admin/LearningManagement";

const LearningAdmin = () => {
  return (
    <>
      <Helmet>
        <title>إدارة محتوى التعلم - لوحة التحكم</title>
        <meta name="description" content="إدارة وتحرير محتوى التعلم" />
      </Helmet>
      <LearningManagement />
    </>
  );
};

export default LearningAdmin;
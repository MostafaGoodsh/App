import { Helmet } from "react-helmet-async";
import QuranPagesManagement from "@/components/admin/QuranPagesManagement";
import AdminPageShell from "@/components/admin/AdminPageShell";

const QuranPagesAdmin = () => {
  return (
    <>
      <Helmet>
        <title>إدارة صفحات القرآن - لوحة التحكم</title>
        <meta name="description" content="إدارة وتخصيص صفحات القرآن الكريم" />
      </Helmet>
      <AdminPageShell>
        <QuranPagesManagement />
      </AdminPageShell>
    </>
  );
};

export default QuranPagesAdmin;

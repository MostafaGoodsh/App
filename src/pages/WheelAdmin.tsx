import { Helmet } from "react-helmet-async";
import WheelManagement from "@/components/admin/WheelManagement";
import AdminPageShell from "@/components/admin/AdminPageShell";

const WheelAdmin = () => {
  return (
    <>
      <Helmet>
        <title>إدارة عجلة الحظ - لوحة التحكم</title>
        <meta name="description" content="إدارة وتخصيص عجلة الحظ والجوائز" />
      </Helmet>
      <AdminPageShell>
        <WheelManagement />
      </AdminPageShell>
    </>
  );
};

export default WheelAdmin;

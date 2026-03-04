import { Helmet } from "react-helmet-async";
import MediaContentManagement from "@/components/admin/MediaContentManagement";
import AdminPageShell from "@/components/admin/AdminPageShell";

const MediaContentAdmin = () => {
  return (
    <>
      <Helmet>
        <title>إدارة محتوى الوسائط - لوحة التحكم</title>
        <meta name="description" content="إدارة وتخصيص محتوى الوسائط للمهام اليومية" />
      </Helmet>
      <AdminPageShell>
        <MediaContentManagement />
      </AdminPageShell>
    </>
  );
};

export default MediaContentAdmin;

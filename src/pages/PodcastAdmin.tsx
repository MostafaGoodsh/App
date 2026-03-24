import { Helmet } from "react-helmet-async";
import PodcastManagement from "@/components/admin/PodcastManagement";
import RequireAdmin from "@/components/auth/RequireAdmin";
import AdminPageShell from "@/components/admin/AdminPageShell";

const PodcastAdmin = () => (
  <RequireAdmin>
    <Helmet>
      <title>إدارة البودكاست والراديو - لوحة التحكم</title>
    </Helmet>
    <AdminPageShell withContainer>
      <PodcastManagement />
    </AdminPageShell>
  </RequireAdmin>
);

export default PodcastAdmin;

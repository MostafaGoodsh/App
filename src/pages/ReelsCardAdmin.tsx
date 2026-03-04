import { ReelsCardManagement } from '@/components/admin/ReelsCardManagement';
import AdminPageShell from "@/components/admin/AdminPageShell";

const ReelsCardAdmin = () => {
  return (
    <AdminPageShell withContainer>
      <h1 className="mb-4 text-2xl font-bold sm:mb-6 sm:text-3xl">إدارة كارت الريلز</h1>
      <ReelsCardManagement />
    </AdminPageShell>
  );
};

export default ReelsCardAdmin;

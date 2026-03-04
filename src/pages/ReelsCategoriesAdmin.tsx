import { ReelsCategoriesManagement } from '@/components/admin/ReelsCategoriesManagement';
import AdminPageShell from "@/components/admin/AdminPageShell";

const ReelsCategoriesAdmin = () => {
  return (
    <AdminPageShell withContainer>
      <h1 className="mb-4 text-2xl font-bold sm:mb-6 sm:text-3xl">إدارة أقسام الريلز</h1>
      <ReelsCategoriesManagement />
    </AdminPageShell>
  );
};

export default ReelsCategoriesAdmin;

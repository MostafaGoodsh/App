import ContentManagement from "@/components/admin/ContentManagement";
import { ReelsManagement } from "@/components/admin/ReelsManagement";
import AdminPageShell from "@/components/admin/AdminPageShell";

export default function ContentAdmin() {
  return (
    <AdminPageShell>
      <div className="space-y-6">
        <ContentManagement />
        <ReelsManagement />
      </div>
    </AdminPageShell>
  );
}

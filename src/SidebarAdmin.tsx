import AdminPageShell from "@/components/admin/AdminPageShell";
import SidebarManagementAdmin from "@/components/admin/SidebarManagementAdmin";

export default function SidebarAdminPage() {
  return (
    <AdminPageShell withContainer>
      <SidebarManagementAdmin />
    </AdminPageShell>
  );
}

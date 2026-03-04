import UpdatesManagement from "@/components/admin/UpdatesManagement";
import AdminPageShell from "@/components/admin/AdminPageShell";

export default function UpdatesAdmin() {
  return (
    <AdminPageShell backgroundImage="/lovable-uploads/updates-bg.jpg">
      <UpdatesManagement />
    </AdminPageShell>
  );
}

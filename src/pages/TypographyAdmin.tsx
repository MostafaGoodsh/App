import TypographyManagement from "@/components/admin/TypographyManagement";
import AdminPageShell from "@/components/admin/AdminPageShell";

export default function TypographyAdmin() {
  return (
    <AdminPageShell withContainer>
      <TypographyManagement />
    </AdminPageShell>
  );
}

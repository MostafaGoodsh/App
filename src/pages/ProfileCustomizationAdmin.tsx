import ProfileCustomizationManagement from "@/components/admin/ProfileCustomizationManagement";
import AdminPageShell from "@/components/admin/AdminPageShell";

export default function ProfileCustomizationAdmin() {
  return (
    <AdminPageShell withContainer>
      <ProfileCustomizationManagement />
    </AdminPageShell>
  );
}

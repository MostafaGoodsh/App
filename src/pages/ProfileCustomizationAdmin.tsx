import RequireAdmin from "@/components/auth/RequireAdmin";
import ProfileCustomizationManagement from "@/components/admin/ProfileCustomizationManagement";

export default function ProfileCustomizationAdmin() {
  return (
    <RequireAdmin>
      <div className="container mx-auto p-6">
        <ProfileCustomizationManagement />
      </div>
    </RequireAdmin>
  );
}
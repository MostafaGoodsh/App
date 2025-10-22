import { Helmet } from "react-helmet-async";
import ProfileCustomizationManagement from "@/components/admin/ProfileCustomizationManagement";
import RequireAuth from "@/components/auth/RequireAuth";

export default function ProfileSettingsAdmin() {
  return (
    <RequireAuth>
      <Helmet>
        <title>إعدادات البروفايل | Crypto-MSR</title>
        <meta name="description" content="تخصيص وإدارة إعدادات البروفايل" />
      </Helmet>
      <div className="container mx-auto p-6">
        <ProfileCustomizationManagement />
      </div>
    </RequireAuth>
  );
}

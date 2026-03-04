import { Helmet } from "react-helmet-async";
import ProfileCustomizationManagement from "@/components/admin/ProfileCustomizationManagement";
import AdminPageShell from "@/components/admin/AdminPageShell";

export default function ProfileSettingsAdmin() {
  return (
    <>
      <Helmet>
        <title>إعدادات البروفايل | Crypto-MSR</title>
        <meta name="description" content="تخصيص وإدارة إعدادات البروفايل" />
      </Helmet>
      <AdminPageShell withContainer>
        <ProfileCustomizationManagement />
      </AdminPageShell>
    </>
  );
}

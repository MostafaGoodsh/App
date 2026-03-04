import { ConversionSettingsManagement } from "@/components/admin/ConversionSettingsManagement";
import AdminPageShell from "@/components/admin/AdminPageShell";

const ConversionSettingsAdmin = () => {
  return (
    <AdminPageShell withContainer>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">إدارة إعدادات التحويل</h1>
          <p className="text-muted-foreground">
            تكوين نظام تحويل النقاط إلى DevNet tokens
          </p>
        </div>
        <ConversionSettingsManagement />
      </div>
    </AdminPageShell>
  );
};

export default ConversionSettingsAdmin;

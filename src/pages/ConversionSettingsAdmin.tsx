import { ConversionSettingsManagement } from "@/components/admin/ConversionSettingsManagement";

const ConversionSettingsAdmin = () => {
  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-4 sm:py-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">إدارة إعدادات التحويل</h1>
          <p className="text-muted-foreground">
            تكوين نظام تحويل النقاط إلى DevNet tokens
          </p>
        </div>
        
        <ConversionSettingsManagement />
      </div>
    </div>
  );
};

export default ConversionSettingsAdmin;
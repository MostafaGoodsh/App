import { DailyTasksCardManagement } from "@/components/admin/DailyTasksCardManagement";
import AdminPageShell from "@/components/admin/AdminPageShell";

export default function DailyTasksCardAdmin() {
  return (
    <AdminPageShell withContainer>
      <div className="mb-8" dir="rtl">
        <h1 className="text-3xl font-bold mb-2">إدارة كارت المهام اليومية</h1>
        <p className="text-muted-foreground">
          تحكم في العنوان والوصف الذي يظهر على كارت المهام اليومية في الصفحة الرئيسية
        </p>
      </div>
      <DailyTasksCardManagement />
    </AdminPageShell>
  );
}

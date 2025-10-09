import { DailyTasksCardManagement } from "@/components/admin/DailyTasksCardManagement";

export default function DailyTasksCardAdmin() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">إدارة كارت المهام اليومية</h1>
        <p className="text-muted-foreground">
          تحكم في العنوان والوصف الذي يظهر على كارت المهام اليومية في الصفحة الرئيسية
        </p>
      </div>
      
      <DailyTasksCardManagement />
    </div>
  );
}
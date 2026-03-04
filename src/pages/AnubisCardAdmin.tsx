import AnubisCardManagement from "@/components/admin/AnubisCardManagement";
import AdminPageShell from "@/components/admin/AdminPageShell";

export default function AnubisCardAdmin() {
  return (
    <AdminPageShell withContainer>
      <div className="mb-8" dir="rtl">
        <h1 className="text-3xl font-bold mb-2">إدارة كارت أنوبيس</h1>
        <p className="text-muted-foreground">
          تحكم في محتوى كارت أنوبيس - العنوان الخارجي، الوصف، والمقدمة الداخلية
        </p>
      </div>
      <AnubisCardManagement />
    </AdminPageShell>
  );
}

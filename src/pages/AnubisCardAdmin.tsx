import AnubisCardManagement from "@/components/admin/AnubisCardManagement";

export default function AnubisCardAdmin() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">إدارة كارت أنوبيس</h1>
        <p className="text-muted-foreground">
          تحكم في محتوى كارت أنوبيس - العنوان الخارجي، الوصف، والمقدمة الداخلية
        </p>
      </div>
      
      <AnubisCardManagement />
    </div>
  );
}
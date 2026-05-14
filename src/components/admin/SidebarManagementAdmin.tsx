import { useState } from "react";
import { Settings, Eye, EyeOff, GripVertical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface SidebarItem {
  id: string;
  title: string;
  url: string;
  visible: boolean;
  requireAuth: boolean;
}

const defaultItems: SidebarItem[] = [
  { id: "profile", title: "البروفايل", url: "/profile", visible: true, requireAuth: true },
  { id: "home", title: "الرئيسية", url: "/", visible: true, requireAuth: false },
  { id: "wallet", title: "المحفظة", url: "/wallet", visible: true, requireAuth: true },
  { id: "pi-payment", title: "الدفع بـ Pi", url: "/pi-payment", visible: true, requireAuth: false },
  { id: "learning", title: "التعلم", url: "/learning", visible: true, requireAuth: false },
  { id: "live-streams", title: "البث المباشر", url: "/live-streams", visible: true, requireAuth: false },
  { id: "surveys", title: "الاستبيانات", url: "/surveys", visible: true, requireAuth: true },
  { id: "support", title: "رسالة جديدة", url: "/support", visible: true, requireAuth: true },
  { id: "early-access", title: "انضم الآن", url: "/early-access", visible: true, requireAuth: false },
];

export default function SidebarManagementAdmin() {
  const [items, setItems] = useState<SidebarItem[]>(defaultItems);

  const toggleVisibility = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, visible: !item.visible } : item
      )
    );
  };

  const toggleAuth = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, requireAuth: !item.requireAuth } : item
      )
    );
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center gap-3">
        <Settings className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">إدارة الشريط الجانبي</h1>
          <p className="text-muted-foreground text-sm">
            تحكم في ظهور عناصر القائمة وصلاحيات الوصول
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">عناصر القائمة الرئيسية</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-lg border p-3 bg-muted/30"
            >
              <div className="flex items-center gap-3">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.url}</p>
                </div>
                <Badge variant={item.requireAuth ? "secondary" : "outline"} className="text-xs">
                  {item.requireAuth ? "يتطلب تسجيل دخول" : "للجميع"}
                </Badge>
              </div>

              <div className="flex items-center gap-6">
                {/* Toggle: requireAuth */}
                <div className="flex items-center gap-2">
                  <Label htmlFor={`auth-${item.id}`} className="text-xs text-muted-foreground">
                    تسجيل دخول مطلوب
                  </Label>
                  <Switch
                    id={`auth-${item.id}`}
                    checked={item.requireAuth}
                    onCheckedChange={() => toggleAuth(item.id)}
                  />
                </div>

                {/* Toggle: visible */}
                <div className="flex items-center gap-2">
                  {item.visible ? (
                    <Eye className="h-4 w-4 text-primary" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                  <Switch
                    id={`vis-${item.id}`}
                    checked={item.visible}
                    onCheckedChange={() => toggleVisibility(item.id)}
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
        <CardContent className="pt-4">
          <p className="text-sm text-amber-800 dark:text-amber-400">
            💡 <strong>ملاحظة:</strong> لفتح الشريط الجانبي للجميع، تأكد من إزالة{" "}
            <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">requireAuth</code>{" "}
            من عناصر القائمة في ملف <code>AppSidebar.tsx</code>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

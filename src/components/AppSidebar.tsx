import { Link, NavLink, useLocation } from "react-router-dom";
import { Users, BookOpen, ClipboardList, Home, LogOut, LogIn, Shield, Settings, Zap, Star, User, TrendingUp, Calendar, Wallet, Tags, MessageSquare } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/auth";
import { useAppContent } from "@/hooks/useAppContent";

const useMenuItems = (getContent: (key: string, fallback?: string) => string) => [
  { title: getContent("sidebar_profile", "البروفايل"), url: "/profile", icon: User, requireAuth: true },
  { title: getContent("sidebar_home", "الرئيسية"), url: "/", icon: Home },
  { title: getContent("sidebar_wallet", "المحفظة"), url: "/wallet", icon: Wallet, requireAuth: true },
  { title: getContent("sidebar_learning", "التعلم"), url: "/learning", icon: BookOpen },
  { title: getContent("sidebar_surveys", "الاستبيانات"), url: "/surveys", icon: ClipboardList, requireAuth: true },
  { title: getContent("sidebar_support", "رسالة جديدة"), url: "/support", icon: MessageSquare, requireAuth: true },
];

const useAdminMenuItems = (getContent: (key: string, fallback?: string) => string) => [
  { title: getContent("admin_users_management", "إدارة المستخدمين"), url: "/admin/users", icon: Users },
  { title: "رسائل الدعم", url: "/admin/support", icon: MessageSquare },
  { title: "إدارة الحسابات المعتمدة", url: "/admin/verified-accounts", icon: Shield },
  { title: getContent("admin_kyc_management", "إدارة الهوية"), url: "/admin/kyc", icon: Shield },
  { title: getContent("admin_surveys_management", "إدارة الاستبيانات"), url: "/admin/surveys", icon: ClipboardList },
  { title: "إجابات الاستبيانات", url: "/admin/survey-responses", icon: ClipboardList },
  { title: getContent("admin_learning_management", "إدارة التعلم"), url: "/admin/learning", icon: BookOpen },
  { title: "موافقة المحتوى التعليمي", url: "/admin/content-approval", icon: BookOpen },
  { title: getContent("admin_content_management", "إدارة محتوى التطبيق"), url: "/admin/content", icon: Settings },
  { title: getContent("admin_updates_management", "إدارة التحديثات"), url: "/admin/updates", icon: Settings },
  { title: "إدارة كارت أنوبيس", url: "/admin/anubis-card", icon: Star },
  { title: getContent("admin_mining_levels_management", "إدارة مستويات التعدين"), url: "/admin/mining-levels", icon: Zap },
  { title: "إدارة الاستدعاء النشط", url: "/admin/active-callout", icon: Star },
  { title: getContent("admin_callout_personalities_management", "قائمة الاستدعاء الشرفية"), url: "/admin/callout-personalities", icon: Star },
  { title: "إحصائيات التفاعل", url: "/admin/engagement-stats", icon: TrendingUp },
  { title: "المهام اليومية", url: "/admin/daily-tasks", icon: Calendar },
  { title: "إدارة صفحات القرآن", url: "/admin/quran-pages", icon: BookOpen },
  { title: "إدارة الوسائط", url: "/admin/media-content", icon: BookOpen },
  { title: "مهام تطوير الشخصية", url: "/admin/personality-tasks", icon: User },
  { title: "إدارة مقدمات المهام", url: "/admin/task-introductions", icon: Settings },
  { title: "إدارة كارت الريلز", url: "/admin/reels-card", icon: BookOpen },
  { title: "إدارة أقسام الريلز", url: "/admin/reels-categories", icon: Tags },
];

export function AppSidebar() {
  const { open, isMobile } = useSidebar();
  const location = useLocation();
  const { user, isAdmin } = useAuth();
  const { getContent } = useAppContent();
  const currentPath = location.pathname;

  const menuItems = useMenuItems(getContent);
  const adminMenuItems = useAdminMenuItems(getContent);

  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50";

  return (
    <Sidebar 
      className={`${!open && !isMobile ? "w-16" : "w-64"}`} 
      collapsible="icon"
    >
        <SidebarHeader className="p-4">
          <Link to="/" className="font-playfair text-lg font-bold flex items-center gap-2">
            {(!open && !isMobile) ? getContent("app_name", "مصر") : getContent("app_platform_name", "منصة مصر")}
          </Link>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>{getContent("sidebar_main_navigation", "التنقل الرئيسي")}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => {
                  // Hide auth-required items if user is not logged in
                  if (item.requireAuth && !user) return null;
                  
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink to={item.url} className={getNavClass}>
                          <item.icon className="h-4 w-4" />
                          {(open || isMobile) && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>{getContent("sidebar_early_access", "الوصول المبكر")}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/early-access" className={getNavClass}>
                      <Users className="h-4 w-4" />
                      {(open || isMobile) && <span>{getContent("sidebar_join_now", "انضم الآن")}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {isAdmin && (
            <SidebarGroup>
              <SidebarGroupLabel>{getContent("sidebar_admin_panel", "لوحة التحكم")}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminMenuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink to={item.url} className={getNavClass}>
                          <item.icon className="h-4 w-4" />
                          {(open || isMobile) && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>

        <SidebarFooter className="p-4">
          {user ? (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={signOut}
              className="w-full justify-start"
            >
              <LogOut className="h-4 w-4" />
              {(open || isMobile) && <span>{getContent("sidebar_logout", "تسجيل الخروج")}</span>}
            </Button>
          ) : (
            <Button asChild variant="outline" size="sm" className="w-full justify-start">
              <Link to="/auth">
                <LogIn className="h-4 w-4" />
                {(open || isMobile) && <span>{getContent("sidebar_login", "تسجيل الدخول")}</span>}
              </Link>
            </Button>
          )}
        </SidebarFooter>
    </Sidebar>
  );
}
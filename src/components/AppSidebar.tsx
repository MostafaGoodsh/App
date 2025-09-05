import { Link, NavLink, useLocation } from "react-router-dom";
import { Wallet, Users, BookOpen, ClipboardList, Home, LogOut, LogIn, Shield, Settings, Pickaxe, Zap, Star, User, TrendingUp, Calendar } from "lucide-react";
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
  { title: "الرئيسية | Home", url: "/", icon: Home },
  { title: "التعلم | Learning", url: "/learning", icon: BookOpen },
  { title: "المحفظة | Wallet", url: "/wallet", icon: Wallet, requireAuth: true },
  { title: "التعدين | Mining", url: "/mining", icon: Pickaxe, requireAuth: true },
  { title: "الهوية | Identity", url: "/identity", icon: Users, requireAuth: true },
  { title: "الاستبيانات | Surveys", url: "/surveys", icon: ClipboardList, requireAuth: true },
  { title: "البروفايل | Profile", url: "/profile", icon: User, requireAuth: true },
];

const useAdminMenuItems = (getContent: (key: string, fallback?: string) => string) => [
  { title: "إدارة المستخدمين | Users", url: "/admin/users", icon: Users },
  { title: "إدارة الهوية | KYC", url: "/admin/kyc", icon: Shield },
  { title: "إدارة الاستبيانات | Surveys", url: "/admin/surveys", icon: ClipboardList },
  { title: "إجابات الاستبيانات | Responses", url: "/admin/survey-responses", icon: ClipboardList },
  { title: "إدارة التعلم | Learning", url: "/admin/learning", icon: BookOpen },
  { title: "إدارة المحتوى | Content", url: "/admin/content", icon: Settings },
  { title: "إدارة التحديثات | Updates", url: "/admin/updates", icon: Settings },
  { title: "مستويات التعدين | Mining Levels", url: "/admin/mining-levels", icon: Zap },
  { title: "قائمة الشرف | Call Out", url: "/admin/callout-personalities", icon: Star },
  { title: "إحصائيات التفاعل | Stats", url: "/admin/engagement-stats", icon: TrendingUp },
  { title: "المهام اليومية | Daily Tasks", url: "/admin/daily-tasks", icon: Calendar },
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
            <SidebarGroupLabel className="mixed-text">التنقل الرئيسي | Main Navigation</SidebarGroupLabel>
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
                          {(open || isMobile) && <span className="mixed-text">{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="mixed-text">الوصول المبكر | Early Access</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/early-access" className={getNavClass}>
                      <Users className="h-4 w-4" />
                      {(open || isMobile) && <span className="mixed-text">انضم الآن | Join Now</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {isAdmin && (
            <SidebarGroup>
              <SidebarGroupLabel className="mixed-text">لوحة التحكم | Admin Panel</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminMenuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink to={item.url} className={getNavClass}>
                          <item.icon className="h-4 w-4" />
                          {(open || isMobile) && <span className="mixed-text">{item.title}</span>}
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
              {(open || isMobile) && <span className="mixed-text">تسجيل الخروج | Sign Out</span>}
            </Button>
          ) : (
            <Button asChild variant="outline" size="sm" className="w-full justify-start">
              <Link to="/auth">
                <LogIn className="h-4 w-4" />
                {(open || isMobile) && <span className="mixed-text">تسجيل الدخول | Sign In</span>}
              </Link>
            </Button>
          )}
        </SidebarFooter>
    </Sidebar>
  );
}
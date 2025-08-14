import { Link, NavLink, useLocation } from "react-router-dom";
import { Wallet, Users, BookOpen, ClipboardList, Home, LogOut, LogIn } from "lucide-react";
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

const menuItems = [
  { title: "الرئيسية", url: "/", icon: Home },
  { title: "المحفظة", url: "/wallet", icon: Wallet, requireAuth: true },
  { title: "الهوية", url: "/identity", icon: Users, requireAuth: true },
  { title: "التعلم", url: "/learning", icon: BookOpen },
  { title: "الاستبيانات", url: "/surveys", icon: ClipboardList, requireAuth: true },
];

export function AppSidebar() {
  const { open, isMobile } = useSidebar();
  const location = useLocation();
  const { user } = useAuth();
  const currentPath = location.pathname;

  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50";

  return (
    <Sidebar className={`${!open && !isMobile ? "w-16" : "w-64"} relative overflow-hidden`} collapsible="icon">
      <img
        src="/lovable-uploads/7c40a16a-fee6-43dd-8d4e-c418b98c2022.png"
        alt="هرم مصري عند الغروب - خلفية أسود وذهبي"
        className="absolute inset-0 w-full h-full object-cover opacity-20"
      />
      <div className="absolute inset-0 bg-background/85" />
      <div className="relative z-10 h-full flex flex-col">
        <SidebarHeader className="p-4">
          <Link to="/" className="font-playfair text-lg font-bold flex items-center gap-2">
            {(!open && !isMobile) ? "مصر" : "منصة مصر"}
          </Link>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>التنقل الرئيسي</SidebarGroupLabel>
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
            <SidebarGroupLabel>الوصول المبكر</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/early-access" className={getNavClass}>
                      <Users className="h-4 w-4" />
                      {(open || isMobile) && <span>انضم الآن</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
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
              {(open || isMobile) && <span>تسجيل الخروج</span>}
            </Button>
          ) : (
            <Button asChild variant="outline" size="sm" className="w-full justify-start">
              <Link to="/auth">
                <LogIn className="h-4 w-4" />
                {(open || isMobile) && <span>تسجيل الدخول</span>}
              </Link>
            </Button>
          )}
        </SidebarFooter>
      </div>
    </Sidebar>
  );
}
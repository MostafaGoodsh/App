import { Link, NavLink, useLocation } from "react-router-dom";
import { Wallet, Users, BookOpen, ClipboardList, Home, LogOut, LogIn, Shield, Settings } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

const menuItems = [
  { title: "الرئيسية", url: "/", icon: Home },
  { title: "التعلم", url: "/learning", icon: BookOpen },
  { title: "المحفظة", url: "/wallet", icon: Wallet, requireAuth: true },
  { title: "الهوية", url: "/identity", icon: Users, requireAuth: true },
  { title: "الاستبيانات", url: "/surveys", icon: ClipboardList, requireAuth: true },
];

const adminMenuItems = [
  { title: "إدارة الهوية", url: "/admin/kyc", icon: Shield },
  { title: "إدارة الاستبيانات", url: "/admin/surveys", icon: ClipboardList },
  { title: "إدارة التعلم", url: "/admin/learning", icon: BookOpen },
];

export function AppSidebar() {
  const { open, isMobile } = useSidebar();
  const location = useLocation();
  const { user } = useAuth();
  const currentPath = location.pathname;
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc("is_admin", {
          _user_id: user.id,
        });

        if (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
        } else {
          setIsAdmin(data);
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50";

  return (
    <Sidebar 
      className={`${!open && !isMobile ? "w-16" : "w-64"}`} 
      collapsible="icon"
    >
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

          {isAdmin && (
            <SidebarGroup>
              <SidebarGroupLabel>لوحة التحكم</SidebarGroupLabel>
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
    </Sidebar>
  );
}
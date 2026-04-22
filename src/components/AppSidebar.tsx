import { Link, NavLink, useLocation } from "react-router-dom";
import { Users, BookOpen, ClipboardList, Home, LogOut, LogIn, Shield, Settings, Zap, Star, User, TrendingUp, Calendar, Wallet, Tags, MessageSquare, Map, UserCheck, Video, Coins, Award, Megaphone, Globe, Type, Droplets, Disc, Landmark, LayoutGrid, Headphones, Network } from "lucide-react";
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
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export function AppSidebar() {
  const { open, isMobile } = useSidebar();
  const location = useLocation();
  const { user, isAdmin } = useAuth();
  const { getContent } = useAppContent();
  const { t } = useLanguage();

  const menuItems = [
    { title: t("البروفايل"), url: "/profile", icon: User, requireAuth: true },
    { title: t("الرئيسية"), url: "/", icon: Home },
    { title: t("المحفظة"), url: "/wallet", icon: Wallet, requireAuth: true },
    { title: t("الدفع بـ Pi"), url: "/pi-payment", icon: Coins },
    { title: t("التعلم"), url: "/learning", icon: BookOpen },
    { title: t("البث المباشر"), url: "/live-streams", icon: Video },
    { title: t("الاستبيانات"), url: "/surveys", icon: ClipboardList, requireAuth: true },
    { title: t("رسالة جديدة"), url: "/support", icon: MessageSquare, requireAuth: true },
  ];

  const adminMenuItems = [
    { title: t("إدارة المستخدمين"), url: "/admin/users", icon: Users },
    { title: t("إدارة الوصول المبكر"), url: "/admin/early-access", icon: UserCheck },
    { title: t("رسائل الدعم"), url: "/admin/support", icon: MessageSquare },
    { title: t("إدارة الحسابات المعتمدة"), url: "/admin/verified-accounts", icon: Shield },
    { title: t("إدارة الهوية"), url: "/admin/kyc", icon: Shield },
    { title: t("إدارة الاستبيانات"), url: "/admin/surveys", icon: ClipboardList },
    { title: t("إدارة التعلم"), url: "/admin/learning", icon: BookOpen },
    { title: t("إدارة محتوى التطبيق"), url: "/admin/content", icon: Settings },
    { title: t("إدارة التحديثات"), url: "/admin/updates", icon: Settings },
    { title: t("إدارة كارت أنوبيس"), url: "/admin/anubis-card", icon: Star },
    { title: t("إدارة مستويات التعدين"), url: "/admin/mining-levels", icon: Zap },
    { title: t("إدارة الاستدعاء النشط"), url: "/admin/active-callout", icon: Star },
    { title: t("قائمة الاستدعاء الشرفية"), url: "/admin/callout-personalities", icon: Star },
    { title: t("إحصائيات التفاعل"), url: "/admin/engagement-stats", icon: TrendingUp },
    { title: t("المهام اليومية"), url: "/admin/daily-tasks", icon: Calendar },
    { title: t("إدارة صفحات القرآن"), url: "/admin/quran-pages", icon: BookOpen },
    { title: t("إدارة الوسائط"), url: "/admin/media-content", icon: BookOpen },
    { title: t("مهام تطوير الشخصية"), url: "/admin/personality-tasks", icon: User },
    { title: t("إدارة مقدمات المهام"), url: "/admin/task-introductions", icon: Settings },
    { title: t("إدارة أقسام الريلز"), url: "/admin/reels-categories", icon: Tags },
    { title: t("إدارة كارت الاستدعاء"), url: "/admin/callout-card", icon: Star },
    { title: t("إعدادات التحويل"), url: "/admin/conversion-settings", icon: Settings },
    { title: t("إدارة كروت الرودماب"), url: "/admin/roadmap-cards", icon: Map },
    { title: t("إدارة بطاقات الصفحة الرئيسية"), url: "/admin/home-cards", icon: Home },
    { title: t("إعدادات البروفايل"), url: "/admin/profile-settings", icon: User },
    { title: t("إدارة طلبات البث المباشر"), url: "/admin/live-stream-approvals", icon: Video },
    { title: t("إدارة العملات الداخلية"), url: "/admin/internal-tokens", icon: Coins },
    { title: t("إدارة البادجات"), url: "/admin/badges", icon: Award },
    { title: t("إدارة الإعلانات"), url: "/admin/announcements", icon: Megaphone },
    { title: t("إدارة مواقع المتعاونين"), url: "/admin/market-locations", icon: Map },
    { title: "إدارة الخطوط والمحاذاة", url: "/admin/typography", icon: Type },
    { title: t("إدارة مجمع السيولة"), url: "/admin/liquidity-pools", icon: Droplets },
    { title: t("إدارة عجلة الحظ"), url: "/admin/wheel", icon: Disc },
    { title: t("عناوين الدفع بالكريبتو"), url: "/admin/crypto-payment-addresses", icon: Landmark },
    { title: t("إدارة طلبات العائلة"), url: "/admin/family", icon: Users },
    { title: t("إدارة رسالة المنصة"), url: "/admin/platform-message", icon: MessageSquare },
    { title: t("إدارة البيع المبكر"), url: "/admin/presale", icon: Coins },
    { title: t("إدارة الروابط الرسمية"), url: "/admin/official-links", icon: Globe },
    { title: t("إدارة كروت المحافظ"), url: "/admin/wallet-cards", icon: Wallet },
    { title: t("إدارة تصميم الكروت"), url: "/admin/ui-card-settings", icon: LayoutGrid },
    { title: t("إدارة البودكاست والراديو"), url: "/admin/podcast", icon: Headphones },
    { title: t("إدارة البلوكتشين"), url: "/admin/blockchain", icon: Network },
  ];

  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50";

  return (
    <Sidebar
      className={`${!open && !isMobile ? "w-10" : "w-48"}`}
      collapsible="icon"
    >
      <SidebarHeader className="p-4">
        <Link to="/" className="font-playfair text-lg font-bold flex items-center gap-2">
          {(!open && !isMobile) ? getContent("app_name", "مصر") : getContent("app_platform_name", "منصة مصر")}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("التنقل الرئيسي")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                if (item.requireAuth && !user) return null;
                return (
                  <SidebarMenuItem key={item.url}>
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
          <SidebarGroupLabel>{t("الوصول المبكر")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/early-access" className={getNavClass}>
                    <Users className="h-4 w-4" />
                    {(open || isMobile) && <span>{t("انضم الآن")}</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>{t("لوحة التحكم")}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminMenuItems.map((item) => (
                  <SidebarMenuItem key={item.url}>
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

      <SidebarFooter className="p-4 space-y-2">
        <div className="flex items-center justify-center">
          <LanguageSwitcher variant={open || isMobile ? "full" : "icon"} />
        </div>
        {user ? (
          <Button
            variant="outline"
            size="sm"
            onClick={signOut}
            className="w-full justify-start"
          >
            <LogOut className="h-4 w-4" />
            {(open || isMobile) && <span>{t("تسجيل الخروج")}</span>}
          </Button>
        ) : (
          <Button asChild variant="outline" size="sm" className="w-full justify-start">
            <Link to="/auth">
              <LogIn className="h-4 w-4" />
              {(open || isMobile) && <span>{t("تسجيل الدخول")}</span>}
            </Link>
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

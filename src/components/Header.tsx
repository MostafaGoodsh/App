import { Link, NavLink } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/auth";
import { useAppContent } from "@/hooks/useAppContent";
import { NotificationBell } from "@/components/notifications/NotificationBell";

const Header = () => {
  const { user } = useAuth();
  const { getContent } = useAppContent();
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="font-cairo text-base font-bold">
          {getContent('app_name', 'منصة مصر الرقمية')}
        </Link>
        <nav aria-label="التنقل الرئيسي">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavLink to="/wallet" className={navigationMenuTriggerStyle()}>
                  المحفظة (Wallet)
                </NavLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavLink to="/early-access" className={navigationMenuTriggerStyle()}>
                  الوصول المبكر (Early Access)
                </NavLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavLink to="/identity" className={navigationMenuTriggerStyle()}>
                   الهوية (Identity)
                </NavLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavLink to="/learning" className={navigationMenuTriggerStyle()}>
                  الحقيقة و العلم  (Learning)
                </NavLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavLink to="/surveys" className={navigationMenuTriggerStyle()}>
                التأهيل و الاستبيانات (Surveys)
                </NavLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </nav>
        <div className="flex items-center gap-3">
          {user && <NotificationBell />}
          <Button asChild size="default" className="px-5">
            <Link to="/early-access">{getContent('hero_cta', 'انضم الآن')}</Link>
          </Button>
          {user ? (
            <Button size="default" variant="outline" onClick={signOut} className="px-5 border-border/30">تسجيل الخروج</Button>
          ) : (
            <Button asChild size="default" variant="outline" className="px-5 border-border/30">
              <Link to="/auth">تسجيل الدخول</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

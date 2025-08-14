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

const Header = () => {
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="font-playfair text-lg font-bold">
          منصة مصر
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
          <Button asChild size="default" className="px-6">
            <Link to="/early-access">انضم الآن</Link>
          </Button>
          {user ? (
            <Button size="default" variant="outline" onClick={signOut} className="px-6">تسجيل الخروج</Button>
          ) : (
            <Button asChild size="default" variant="outline" className="px-6">
              <Link to="/auth">تسجيل الدخول</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

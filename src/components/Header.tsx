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

const Header = () => {
  const { user } = useAuth();
  const { getContent } = useAppContent();
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="font-playfair text-base font-bold">
          {getContent('app_name', 'منصة مصر')}
        </Link>
        <nav aria-label="التنقل الرئيسي">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavLink to="/wallet" className={`${navigationMenuTriggerStyle()} mixed-text-responsive`}>
                  المحفظة | Wallet
                </NavLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavLink to="/early-access" className={`${navigationMenuTriggerStyle()} mixed-text-responsive`}>
                  الوصول المبكر | Early Access
                </NavLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavLink to="/identity" className={`${navigationMenuTriggerStyle()} mixed-text-responsive`}>
                  الهوية | Identity
                </NavLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavLink to="/learning" className={`${navigationMenuTriggerStyle()} mixed-text-responsive`}>
                  الحقيقة والعلم | Learning
                </NavLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavLink to="/surveys" className={`${navigationMenuTriggerStyle()} mixed-text-responsive`}>
                  التأهيل والاستبيانات | Surveys
                </NavLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </nav>
        <div className="flex items-center gap-3">
          <Button asChild size="default" className="px-6">
            <Link to="/early-access" className="mixed-text-responsive">انضم الآن | Join Now</Link>
          </Button>
          {user ? (
            <Button size="default" variant="outline" onClick={signOut} className="px-6 mixed-text-responsive">تسجيل الخروج | Sign Out</Button>
          ) : (
            <Button asChild size="default" variant="outline" className="px-6">
              <Link to="/auth" className="mixed-text-responsive">تسجيل الدخول | Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

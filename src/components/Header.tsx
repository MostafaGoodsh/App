import { Link, NavLink } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="font-playfair text-xl font-bold">
          منصة العملات الرقمية
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
                  توثيق الهوية (Identity)
                </NavLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavLink to="/learning" className={navigationMenuTriggerStyle()}>
                  التعلم (Learning)
                </NavLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavLink to="/surveys" className={navigationMenuTriggerStyle()}>
                  الاستبيانات (Surveys)
                </NavLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild size="sm">
            <Link to="/early-access">انضم لنا (Early Access)</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;

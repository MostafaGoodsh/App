import { Link, NavLink } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/auth";
import { useAppContent } from "@/hooks/useAppContent";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useProfile } from "@/hooks/useProfile";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUICardSettings } from "@/hooks/useUICardSettings";

const Header = () => {
  const { user } = useAuth();
  const { getContent } = useAppContent();
  const { profile } = useProfile();
  const { t } = useLanguage();
  const { getCardStyle, getCardSetting } = useUICardSettings();
  
  const headerSetting = getCardSetting('header_main');
  const headerStyle = getCardStyle('header_main');
  const hasCustomHeader = headerSetting?.background_image || headerSetting?.background_gradient || headerSetting?.background_color;
  
  console.log("Header rendered, NotificationBell should render");
  
  return (
    <header
      className={`sticky top-0 z-50 border-b ${!hasCustomHeader ? 'bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60' : ''}`}
      style={hasCustomHeader ? { ...headerStyle, position: 'sticky', top: 0, zIndex: 50 } : undefined}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg className="h-14 w-14 text-amber-500 drop-shadow-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="6" r="3"/>
            <path d="M12 9v6"/>
            <path d="M9 12h6"/>
            <path d="M8 21h8"/>
            <path d="M10 18v3"/>
            <path d="M14 18v3"/>
          </svg>
          <Link to="/" className="font-cairo text-base font-bold flex items-center gap-1 text-primary">
            <span className="font-bold">Crypto-msr</span>
            <span>(منصة مصر الرقمية)</span>
          </Link>
        </div>
        <nav aria-label="التنقل الرئيسي">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavLink 
                  to="/wallet" 
                  className="inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors text-white hover:text-primary focus:outline-none"
                >
                  المحفظة (Wallet)
                </NavLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavLink 
                  to="/early-access" 
                  className="inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors text-white hover:text-primary focus:outline-none"
                >
                  الوصول المبكر (Early Access)
                </NavLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavLink 
                  to="/identity" 
                  className="inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors text-white hover:text-primary focus:outline-none"
                >
                   الهوية (Identity)
                </NavLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavLink 
                  to="/learning" 
                  className="inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors text-white hover:text-primary focus:outline-none"
                >
                  الحقيقة و العلم  (Learning)
                </NavLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavLink 
                  to="/surveys" 
                  className="inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors text-white hover:text-primary focus:outline-none"
                >
                التأهيل و الاستبيانات (Surveys)
                </NavLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <NotificationBell />
          {user ? (
            <>
              <Link to="/profile">
                <Avatar className="h-11 w-11 cursor-pointer ring-2 ring-amber-500/30 hover:ring-amber-500/60 transition-all">
                  <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || "Profile"} />
                  <AvatarFallback className="bg-gradient-to-br from-amber-500 to-amber-600 text-white font-semibold">
                    {profile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <Button size="default" variant="outline" onClick={signOut} className="px-5 border-border/30">تسجيل الخروج</Button>
            </>
          ) : (
            <>
              <Button asChild size="default" className="px-5">
                <Link to="/early-access">{getContent('hero_cta', 'انضم الآن')}</Link>
              </Button>
              <Button asChild size="default" variant="outline" className="px-5 border-border/30">
                <Link to="/auth">تسجيل الدخول</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

import { Outlet, Link } from "react-router-dom";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "@/components/AppSidebar";
import { useAppContent } from "@/hooks/useAppContent";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

const MainLayoutContent = () => {
  const { getContent } = useAppContent();
  const { toggleSidebar } = useSidebar();
  const { user } = useAuth();
  const { profile } = useProfile();
  
  return (
    <div className="min-h-screen bg-background text-foreground flex w-full">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <header 
          className="h-16 flex items-center justify-between border-b px-4"
          style={{
            backgroundImage: `url('/lovable-uploads/7c40a16a-fee6-43dd-8d4e-c418b98c2022.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundBlendMode: 'overlay',
            backgroundColor: 'hsl(var(--background) / 0.85)'
          }}
        >
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12"
              onClick={toggleSidebar}
            >
              <span className="text-4xl text-amber-500 drop-shadow-lg">𓋹</span>
              <span className="sr-only">Toggle Sidebar</span>
            </Button>
            <div className="flex flex-col justify-center leading-none">
              <div className="font-playfair text-xs text-muted-foreground -mb-1">
                Crypto-MSR
              </div>
              <div className="font-cairo text-base font-bold">
                {getContent("app_name", "منصة مصر الرقمية")}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            {user && (
              <Link to="/profile">
                <Avatar className="h-11 w-11 cursor-pointer ring-2 ring-amber-500/30 hover:ring-amber-500/60 transition-all">
                  <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || "Profile"} />
                  <AvatarFallback className="bg-gradient-to-br from-amber-500 to-amber-600 text-white font-semibold">
                    {profile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Link>
            )}
          </div>
        </header>
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const MainLayout = () => {
  return (
    <SidebarProvider defaultOpen={true}>
      <MainLayoutContent />
    </SidebarProvider>
  );
};

export default MainLayout;

import { Outlet, Link } from "react-router-dom";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "@/components/AppSidebar";
import { useAppContent } from "@/hooks/useAppContent";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import AnnouncementDialog from "@/components/announcements/AnnouncementDialog";
import GlobalAudioPlayer from "@/components/podcast/GlobalAudioPlayer";
import { useLanguage } from "@/contexts/LanguageContext";
import { MessageSquare } from "lucide-react";
import { useBlockchainKey } from "@/hooks/useBlockchainKey";

const MainLayoutContent = () => {
  const { getContent } = useAppContent();
  const { toggleSidebar } = useSidebar();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { dir } = useLanguage();
  useBlockchainKey(); // Auto-register every authenticated user on Kaleido network
  
  return (
    <div className="min-h-[100dvh] w-full overflow-x-hidden bg-background text-foreground flex" dir={dir}>
      <AppSidebar />
      <div className="flex min-h-[100dvh] min-w-0 flex-1 flex-col">
        <header 
          className="h-16 flex items-center justify-between border-b px-1"
          style={{
            backgroundImage: `url('/lovable-uploads/7c40a16a-fee6-43dd-8d4e-c418b98c2022.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundBlendMode: 'overlay',
            backgroundColor: 'hsl(var(--background) / 0.85)'
          }}
        >
          <div className="flex items-center gap-1">
            {user && (
              <Link to="/profile">
                <Avatar className="h-9 w-9 cursor-pointer ring-2 ring-primary/50 hover:ring-primary transition-all">
                  <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || "Profile"} />
                  <AvatarFallback className="bg-gradient-to-br from-amber-500 to-amber-600 text-white font-semibold">
                    {profile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Link>
            )}
            <Link to="/support">
              <Button variant="ghost" size="icon" className="relative h-9 w-9">
                <MessageSquare className="h-5 w-5" />
              </Button>
            </Link>
            <NotificationBell />
          </div>
          <div className="flex items-center gap-0.5">
            <div className="flex flex-col justify-center leading-none text-left">
              <div className="font-playfair text-xs text-muted-foreground -mb-1">
                Crypto-MSR
              </div>
              <div className="font-cairo text-base font-bold">
                {getContent("app_name", "منصة مصر الرقمية")}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full ring-2 ring-primary/30"
              onClick={toggleSidebar}
            >
              <span className="text-2xl text-primary font-bold">𓋹</span>
              <span className="sr-only">Toggle Sidebar</span>
            </Button>
          </div>
        </header>
        <main className="flex-1 min-h-0 w-full max-w-full overflow-x-hidden overflow-y-auto">
          <Outlet />
        </main>
        <AnnouncementDialog />
        <GlobalAudioPlayer />
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

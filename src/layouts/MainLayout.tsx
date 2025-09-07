import { Outlet } from "react-router-dom";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "@/components/AppSidebar";
import { useAppContent } from "@/hooks/useAppContent";

const MainLayoutContent = () => {
  const { getContent } = useAppContent();
  const { toggleSidebar } = useSidebar();
  
  return (
    <div className="min-h-screen bg-background text-foreground flex w-full">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <header 
          className="h-16 flex items-center border-b px-4"
          style={{
            backgroundImage: `url('/lovable-uploads/7c40a16a-fee6-43dd-8d4e-c418b98c2022.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundBlendMode: 'overlay',
            backgroundColor: 'hsl(var(--background) / 0.85)'
          }}
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={toggleSidebar}
          >
            <span className="text-lg">𓋹</span>
            <span className="sr-only">Toggle Sidebar</span>
          </Button>
          <div className="ml-4 flex flex-col justify-center leading-none">
            <div className="font-playfair text-xs text-muted-foreground -mb-1">
              Crypto-MSR
            </div>
            <div className="font-cairo text-base font-bold">
              {getContent("app_name", "منصة مصر الرقمية")}
            </div>
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

import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useAppContent } from "@/hooks/useAppContent";

const MainLayout = () => {
  const { getContent } = useAppContent();
  
  return (
    <SidebarProvider defaultOpen={true}>
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
            <SidebarTrigger />
            <div className="ml-4 font-playfair text-lg font-bold">
              {getContent("app_name", "Crypto-MSR")}
            </div>
          </header>
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;

import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

const MainLayout = () => {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen bg-background text-foreground flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-16 flex items-center border-b px-4 relative overflow-hidden bg-background">
            <img
              src="/lovable-uploads/7c40a16a-fee6-43dd-8d4e-c418b98c2022.png"
              alt="هرم مصري عند الغروب - خلفية أسود وذهبي"
              className="absolute inset-0 w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-background/80" />
            <div className="relative z-10 flex items-center w-full">
              <SidebarTrigger />
              <div className="ml-4 font-playfair text-lg font-bold">
                Crypto-MSR
              </div>
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

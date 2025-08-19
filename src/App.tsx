import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import MainLayout from "./layouts/MainLayout";
import Wallet from "./pages/Wallet";
import EarlyAccess from "./pages/EarlyAccess";
import Identity from "./pages/Identity";
import Learning from "./pages/Learning";
import Surveys from "./pages/Surveys";
import Auth from "./pages/Auth";
import KYCAdmin from "./pages/KYCAdmin";
import SurveysAdmin from "./pages/SurveysAdmin";
import LearningAdmin from "./pages/LearningAdmin";
import ContentAdmin from "./pages/ContentAdmin";
import RequireAuth from "./components/auth/RequireAuth";
import RequireAdmin from "./components/auth/RequireAdmin";

const queryClient = new QueryClient();

const App = () => {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Index />} />
                <Route path="auth" element={<Auth />} />
                <Route path="wallet" element={<RequireAuth><Wallet /></RequireAuth>} />
                <Route path="early-access" element={<EarlyAccess />} />
                <Route path="identity" element={<RequireAuth><Identity /></RequireAuth>} />
                <Route path="learning" element={<Learning />} />
                <Route path="surveys" element={<RequireAuth><Surveys /></RequireAuth>} />
                <Route path="admin/kyc" element={<RequireAdmin><KYCAdmin /></RequireAdmin>} />
                <Route path="admin/surveys" element={<RequireAdmin><SurveysAdmin /></RequireAdmin>} />
                <Route path="admin/learning" element={<RequireAdmin><LearningAdmin /></RequireAdmin>} />
                <Route path="admin/content" element={<RequireAdmin><ContentAdmin /></RequireAdmin>} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </TooltipProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;

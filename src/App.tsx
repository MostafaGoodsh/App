import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import ErrorBoundary from "./components/ErrorBoundary";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import MainLayout from "./layouts/MainLayout";
import Wallet from "./pages/Wallet";
import EarlyAccess from "./pages/EarlyAccess";
import Identity from "./pages/Identity";
import Learning from "./pages/Learning";
import Surveys from "./pages/Surveys";
import Mining from "./pages/Mining";
import Auth from "./pages/Auth";
import KYCAdmin from "./pages/KYCAdmin";
import SurveysAdmin from "./pages/SurveysAdmin";
import LearningAdmin from "./pages/LearningAdmin";
import ContentAdmin from "./pages/ContentAdmin";
import UsersAdmin from "./pages/UsersAdmin";
import RequireAuth from "./components/auth/RequireAuth";
import RequireAdmin from "./components/auth/RequireAdmin";
import Updates from "./pages/Updates";
import StableCoin from "./pages/StableCoin";
import RWA from "./pages/RWA";
import CallOut from "./pages/CallOut";
import MiningLevelsAdmin from "./pages/MiningLevelsAdmin";
import CalloutPersonalitiesAdmin from "./pages/CalloutPersonalitiesAdmin";
import UpdatesAdmin from "./pages/UpdatesAdmin";
import Profile from "./pages/Profile";
import EngagementStatsAdmin from "./pages/EngagementStatsAdmin";
import DailyTasksAdmin from "./pages/DailyTasksAdmin";
import DailyTasks from "./pages/DailyTasks";

const queryClient = new QueryClient();

const App = () => {
  return (
    <ErrorBoundary>
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
                  <Route path="wallet" element={<Wallet />} />
                  <Route path="mining" element={<RequireAuth><Mining /></RequireAuth>} />
                  <Route path="early-access" element={<EarlyAccess />} />
                  <Route path="identity" element={<RequireAuth><Identity /></RequireAuth>} />
                  <Route path="learning" element={<Learning />} />
                  <Route path="surveys" element={<RequireAuth><Surveys /></RequireAuth>} />
                  <Route path="updates" element={<Updates />} />
                  <Route path="stable-coin" element={<StableCoin />} />
                  <Route path="rwa" element={<RWA />} />
                  <Route path="call-out" element={<CallOut />} />
                  <Route path="profile" element={<RequireAuth><Profile /></RequireAuth>} />
                  <Route path="daily-tasks" element={<RequireAuth><DailyTasks /></RequireAuth>} />
                  <Route path="admin/users" element={<RequireAdmin><UsersAdmin /></RequireAdmin>} />
                  <Route path="admin/kyc" element={<RequireAdmin><KYCAdmin /></RequireAdmin>} />
                  <Route path="admin/surveys" element={<RequireAdmin><SurveysAdmin /></RequireAdmin>} />
                  <Route path="admin/learning" element={<RequireAdmin><LearningAdmin /></RequireAdmin>} />
                  <Route path="admin/content" element={<RequireAdmin><ContentAdmin /></RequireAdmin>} />
                  <Route path="admin/updates" element={<RequireAdmin><UpdatesAdmin /></RequireAdmin>} />
                  <Route path="admin/mining-levels" element={<RequireAdmin><MiningLevelsAdmin /></RequireAdmin>} />
                  <Route path="admin/callout-personalities" element={<RequireAdmin><CalloutPersonalitiesAdmin /></RequireAdmin>} />
                  <Route path="admin/engagement-stats" element={<RequireAdmin><EngagementStatsAdmin /></RequireAdmin>} />
                  <Route path="admin/daily-tasks" element={<RequireAdmin><DailyTasksAdmin /></RequireAdmin>} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </TooltipProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
};

export default App;

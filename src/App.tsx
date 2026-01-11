import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import ErrorBoundary from "./components/ErrorBoundary";
import { SolanaWalletProvider } from "./components/wallet/SolanaWalletProvider";
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
import Support from "./pages/Support";
import SupportAdmin from "./pages/SupportAdmin";
import RequireAuth from "./components/auth/RequireAuth";
import RequireAdmin from "./components/auth/RequireAdmin";
import RequireAccess from "./components/auth/RequireAccess";
import RequireAnubisAccess from "./components/auth/RequireAnubisAccess";
import Updates from "./pages/Updates";
import StableCoin from "./pages/StableCoin";
import RWA from "./pages/RWA";
import CallOut from "./pages/CallOut";
import MiningLevelsAdmin from "./pages/MiningLevelsAdmin";
import CalloutPersonalitiesAdmin from "./pages/CalloutPersonalitiesAdmin";
import CalloutCardAdmin from "./pages/CalloutCardAdmin";
import UpdatesAdmin from "./pages/UpdatesAdmin";
import Profile from "./pages/Profile";
import EngagementStatsAdmin from "./pages/EngagementStatsAdmin";
import DailyTasksAdmin from "./pages/DailyTasksAdmin";
import DailyTasks from "./pages/DailyTasks";
import SurveyResponsesAdmin from "./pages/SurveyResponsesAdmin";
import MediaContentAdmin from "./pages/MediaContentAdmin";
import PersonalityTasksAdmin from "./pages/PersonalityTasksAdmin";
import TaskIntroductionsAdmin from "./pages/TaskIntroductionsAdmin";
import AnubisCardAdmin from "./pages/AnubisCardAdmin";
import AnubisAuth from "./pages/AnubisAuth";
import ConversionSettingsAdmin from "./pages/ConversionSettingsAdmin";
import Reels from "./pages/Reels";
import ReelsCardAdmin from "./pages/ReelsCardAdmin";
import ReelsCategoriesAdmin from "./pages/ReelsCategoriesAdmin";
import ReelsCategories from "./pages/ReelsCategories";
import ContentApprovalAdmin from "./pages/ContentApprovalAdmin";
import ActiveCalloutAdmin from "./pages/ActiveCalloutAdmin";
import VerifiedAccountsAdmin from "./pages/VerifiedAccountsAdmin";
import Recharge from "./pages/Recharge";
import PaymentDemo from "./pages/PaymentDemo";
import PiPayment from "./pages/PiPayment";
import QuranPagesAdmin from "./pages/QuranPagesAdmin";
import DailyTasksCardAdmin from "./pages/DailyTasksCardAdmin";
import TodoIntroductionAdmin from "./pages/TodoIntroductionAdmin";
import RoadmapCardsAdmin from "./pages/RoadmapCardsAdmin";
import RoadmapDetail from "./pages/RoadmapDetail";
import Anubis from "./pages/Anubis";
import AnubisSubscription from "./pages/AnubisSubscription";
import HomePageCardsAdmin from "./pages/HomePageCardsAdmin";
import AnubisSubscriptionsAdmin from "./pages/AnubisSubscriptionsAdmin";
import ProfileSettingsAdmin from "./pages/ProfileSettingsAdmin";
import EarlyAccessAdmin from "./pages/EarlyAccessAdmin";
import Documents from "./pages/Documents";
import AnubisSettingsAdmin from "./pages/AnubisSettingsAdmin";
import LiveStream from "./pages/LiveStream";
import LiveStreamApprovalsAdmin from "./pages/LiveStreamApprovalsAdmin";
import LiveStreamsGallery from "./pages/LiveStreamsGallery";
import LiveStreamViewer from "./pages/LiveStreamViewer";
import MyLiveStreams from "./pages/MyLiveStreams";
import ProfileCustomizationAdmin from "./pages/ProfileCustomizationAdmin";
import PrivacyPolicy from "./pages/PrivacyPolicy";
const queryClient = new QueryClient();

const App = () => {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <SolanaWalletProvider>
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <Routes>
                  <Route path="/" element={<MainLayout />}>
                    <Route index element={<RequireAccess><Index /></RequireAccess>} />
                    <Route path="auth" element={<Auth />} />
                    <Route path="privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="payment-demo" element={<PaymentDemo />} />
                    <Route path="pi-payment" element={<PiPayment />} />
                    <Route path="wallet" element={<RequireAuth><Wallet /></RequireAuth>} />
                    <Route path="recharge" element={<RequireAuth><Recharge /></RequireAuth>} />
                    <Route path="mining" element={<RequireAuth><Mining /></RequireAuth>} />
                    <Route path="early-access" element={<EarlyAccess />} />
                    <Route path="identity" element={<RequireAuth><Identity /></RequireAuth>} />
                    <Route path="documents" element={<RequireAuth><Documents /></RequireAuth>} />
                    <Route path="learning" element={<RequireAccess><Learning /></RequireAccess>} />
                    <Route path="surveys" element={<RequireAuth><Surveys /></RequireAuth>} />
                    <Route path="updates" element={<RequireAccess><Updates /></RequireAccess>} />
                    <Route path="support" element={<RequireAuth><Support /></RequireAuth>} />
                    <Route path="stable-coin" element={<RequireAccess><StableCoin /></RequireAccess>} />
                    <Route path="rwa" element={<RequireAccess><RWA /></RequireAccess>} />
                    <Route path="call-out" element={<RequireAccess><CallOut /></RequireAccess>} />
                    <Route path="reels" element={<RequireAccess><Reels /></RequireAccess>} />
                    <Route path="reels-categories" element={<RequireAccess><ReelsCategories /></RequireAccess>} />
                    <Route path="roadmap/:slug" element={<RequireAccess><RoadmapDetail /></RequireAccess>} />
                    <Route path="anubis" element={<RequireAnubisAccess><Anubis /></RequireAnubisAccess>} />
                    <Route path="anubis-auth" element={<AnubisAuth />} />
                    <Route path="profile" element={<RequireAuth><Profile /></RequireAuth>} />
                    <Route path="daily-tasks" element={<RequireAuth><DailyTasks /></RequireAuth>} />
                    <Route path="live-stream" element={<RequireAuth><LiveStream /></RequireAuth>} />
                    <Route path="live-streams" element={<LiveStreamsGallery />} />
                    <Route path="live-stream/watch/:streamId" element={<LiveStreamViewer />} />
                    <Route path="my-live-streams" element={<RequireAuth><MyLiveStreams /></RequireAuth>} />
                    <Route path="admin/live-stream-approvals" element={<RequireAdmin><LiveStreamApprovalsAdmin /></RequireAdmin>} />
                    <Route path="admin/users" element={<RequireAdmin><UsersAdmin /></RequireAdmin>} />
                    <Route path="admin/support" element={<RequireAdmin><SupportAdmin /></RequireAdmin>} />
                    <Route path="admin/verified-accounts" element={<RequireAdmin><VerifiedAccountsAdmin /></RequireAdmin>} />
                    <Route path="admin/kyc" element={<RequireAdmin><KYCAdmin /></RequireAdmin>} />
                    <Route path="admin/surveys" element={<RequireAdmin><SurveysAdmin /></RequireAdmin>} />
                    <Route path="admin/survey-responses" element={<RequireAdmin><SurveyResponsesAdmin /></RequireAdmin>} />
                    <Route path="admin/learning" element={<RequireAdmin><LearningAdmin /></RequireAdmin>} />
                    <Route path="admin/content-approval" element={<RequireAdmin><ContentApprovalAdmin /></RequireAdmin>} />
                    <Route path="admin/content" element={<RequireAdmin><ContentAdmin /></RequireAdmin>} />
                    <Route path="admin/updates" element={<RequireAdmin><UpdatesAdmin /></RequireAdmin>} />
                    <Route path="admin/anubis-card" element={<RequireAdmin><AnubisCardAdmin /></RequireAdmin>} />
                    <Route path="admin/mining-levels" element={<RequireAdmin><MiningLevelsAdmin /></RequireAdmin>} />
                    <Route path="admin/callout-personalities" element={<RequireAdmin><CalloutPersonalitiesAdmin /></RequireAdmin>} />
                    <Route path="admin/active-callout" element={<RequireAdmin><ActiveCalloutAdmin /></RequireAdmin>} />
                    <Route path="admin/callout-card" element={<RequireAdmin><CalloutCardAdmin /></RequireAdmin>} />
                    <Route path="admin/engagement-stats" element={<RequireAdmin><EngagementStatsAdmin /></RequireAdmin>} />
                    <Route path="admin/daily-tasks" element={<RequireAdmin><DailyTasksAdmin /></RequireAdmin>} />
                    <Route path="admin/media-content" element={<RequireAdmin><MediaContentAdmin /></RequireAdmin>} />
                    <Route path="admin/quran-pages" element={<RequireAdmin><QuranPagesAdmin /></RequireAdmin>} />
                    <Route path="admin/personality-tasks" element={<RequireAdmin><PersonalityTasksAdmin /></RequireAdmin>} />
                    <Route path="admin/task-introductions" element={<RequireAdmin><TaskIntroductionsAdmin /></RequireAdmin>} />
                    <Route path="admin/conversion-settings" element={<RequireAdmin><ConversionSettingsAdmin /></RequireAdmin>} />
                    <Route path="admin/reels-card" element={<RequireAdmin><ReelsCardAdmin /></RequireAdmin>} />
                    <Route path="admin/reels-categories" element={<RequireAdmin><ReelsCategoriesAdmin /></RequireAdmin>} />
                    <Route path="admin/daily-tasks-card" element={<RequireAdmin><DailyTasksCardAdmin /></RequireAdmin>} />
                    <Route path="admin/todo-introduction" element={<RequireAdmin><TodoIntroductionAdmin /></RequireAdmin>} />
                    <Route path="admin/roadmap-cards" element={<RequireAdmin><RoadmapCardsAdmin /></RequireAdmin>} />
                    <Route path="admin/home-cards" element={<RequireAdmin><HomePageCardsAdmin /></RequireAdmin>} />
                    <Route path="admin/anubis-subscriptions" element={<RequireAdmin><AnubisSubscriptionsAdmin /></RequireAdmin>} />
                    <Route path="admin/anubis-settings" element={<RequireAdmin><AnubisSettingsAdmin /></RequireAdmin>} />
                    <Route path="admin/profile-settings" element={<RequireAuth><ProfileSettingsAdmin /></RequireAuth>} />
                    <Route path="admin/early-access" element={<RequireAdmin><EarlyAccessAdmin /></RequireAdmin>} />
                    <Route path="admin/live-stream-approvals" element={<RequireAdmin><LiveStreamApprovalsAdmin /></RequireAdmin>} />
                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Routes>
              </TooltipProvider>
            </BrowserRouter>
          </SolanaWalletProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
};

export default App;

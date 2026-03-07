import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import ErrorBoundary from "./components/ErrorBoundary";
import ScrollToTop from "./components/ScrollToTop";
import { SolanaWalletProvider } from "./components/wallet/SolanaWalletProvider";
import MainLayout from "./layouts/MainLayout";
import RequireAuth from "./components/auth/RequireAuth";
import RequireAdmin from "./components/auth/RequireAdmin";
import RequireAccess from "./components/auth/RequireAccess";
import RequireAnubisAccess from "./components/auth/RequireAnubisAccess";
import { Loader2 } from "lucide-react";
import { LanguageProvider } from "./contexts/LanguageContext";

// Lazy-loaded pages
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Wallet = lazy(() => import("./pages/Wallet"));
const EarlyAccess = lazy(() => import("./pages/EarlyAccess"));
const Identity = lazy(() => import("./pages/Identity"));
const Learning = lazy(() => import("./pages/Learning"));
const Surveys = lazy(() => import("./pages/Surveys"));
const Mining = lazy(() => import("./pages/Mining"));
const Auth = lazy(() => import("./pages/Auth"));
const KYCAdmin = lazy(() => import("./pages/KYCAdmin"));
const SurveysAdmin = lazy(() => import("./pages/SurveysAdmin"));
const LearningAdmin = lazy(() => import("./pages/LearningAdmin"));
const ContentAdmin = lazy(() => import("./pages/ContentAdmin"));
const UsersAdmin = lazy(() => import("./pages/UsersAdmin"));
const Support = lazy(() => import("./pages/Support"));
const SupportAdmin = lazy(() => import("./pages/SupportAdmin"));
const Updates = lazy(() => import("./pages/Updates"));
const StableCoin = lazy(() => import("./pages/StableCoin"));
const RWA = lazy(() => import("./pages/RWA"));
const CallOut = lazy(() => import("./pages/CallOut"));
const MiningLevelsAdmin = lazy(() => import("./pages/MiningLevelsAdmin"));
const CalloutPersonalitiesAdmin = lazy(() => import("./pages/CalloutPersonalitiesAdmin"));
const CalloutCardAdmin = lazy(() => import("./pages/CalloutCardAdmin"));
const UpdatesAdmin = lazy(() => import("./pages/UpdatesAdmin"));
const Profile = lazy(() => import("./pages/Profile"));
const EngagementStatsAdmin = lazy(() => import("./pages/EngagementStatsAdmin"));
const DailyTasksAdmin = lazy(() => import("./pages/DailyTasksAdmin"));
const DailyTasks = lazy(() => import("./pages/DailyTasks"));
const SurveyResponsesAdmin = lazy(() => import("./pages/SurveyResponsesAdmin"));
const MediaContentAdmin = lazy(() => import("./pages/MediaContentAdmin"));
const PersonalityTasksAdmin = lazy(() => import("./pages/PersonalityTasksAdmin"));
const TaskIntroductionsAdmin = lazy(() => import("./pages/TaskIntroductionsAdmin"));
const AnubisCardAdmin = lazy(() => import("./pages/AnubisCardAdmin"));
const AnubisAuth = lazy(() => import("./pages/AnubisAuth"));
const ConversionSettingsAdmin = lazy(() => import("./pages/ConversionSettingsAdmin"));
const Reels = lazy(() => import("./pages/Reels"));
const ReelsCardAdmin = lazy(() => import("./pages/ReelsCardAdmin"));
const ReelsCategoriesAdmin = lazy(() => import("./pages/ReelsCategoriesAdmin"));
const ReelsCategories = lazy(() => import("./pages/ReelsCategories"));
const ContentApprovalAdmin = lazy(() => import("./pages/ContentApprovalAdmin"));
const ActiveCalloutAdmin = lazy(() => import("./pages/ActiveCalloutAdmin"));
const VerifiedAccountsAdmin = lazy(() => import("./pages/VerifiedAccountsAdmin"));
const Recharge = lazy(() => import("./pages/Recharge"));
const PaymentDemo = lazy(() => import("./pages/PaymentDemo"));
const PiPayment = lazy(() => import("./pages/PiPayment"));
const QuranPagesAdmin = lazy(() => import("./pages/QuranPagesAdmin"));
const DailyTasksCardAdmin = lazy(() => import("./pages/DailyTasksCardAdmin"));
const TodoIntroductionAdmin = lazy(() => import("./pages/TodoIntroductionAdmin"));
const RoadmapCardsAdmin = lazy(() => import("./pages/RoadmapCardsAdmin"));
const RoadmapDetail = lazy(() => import("./pages/RoadmapDetail"));
const Anubis = lazy(() => import("./pages/Anubis"));
const AnubisSubscription = lazy(() => import("./pages/AnubisSubscription"));
const HomePageCardsAdmin = lazy(() => import("./pages/HomePageCardsAdmin"));
const AnubisSubscriptionsAdmin = lazy(() => import("./pages/AnubisSubscriptionsAdmin"));
const ProfileSettingsAdmin = lazy(() => import("./pages/ProfileSettingsAdmin"));
const EarlyAccessAdmin = lazy(() => import("./pages/EarlyAccessAdmin"));
const Documents = lazy(() => import("./pages/Documents"));
const AnubisSettingsAdmin = lazy(() => import("./pages/AnubisSettingsAdmin"));
const LiveStream = lazy(() => import("./pages/LiveStream"));
const LiveStreamApprovalsAdmin = lazy(() => import("./pages/LiveStreamApprovalsAdmin"));
const LiveStreamsGallery = lazy(() => import("./pages/LiveStreamsGallery"));
const LiveStreamViewer = lazy(() => import("./pages/LiveStreamViewer"));
const MyLiveStreams = lazy(() => import("./pages/MyLiveStreams"));
const ProfileCustomizationAdmin = lazy(() => import("./pages/ProfileCustomizationAdmin"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const InternalTokensAdmin = lazy(() => import("./pages/InternalTokensAdmin"));
const BadgesAdmin = lazy(() => import("./pages/BadgesAdmin"));
const AnnouncementsAdmin = lazy(() => import("./pages/AnnouncementsAdmin"));
const MarketLocationsAdmin = lazy(() => import("./pages/MarketLocationsAdmin"));
const MarketLocationProfile = lazy(() => import("./pages/MarketLocationProfile"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const App = () => {
  const manifestUrl = `${window.location.origin}/tonconnect-manifest.json`;
  
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <LanguageProvider>
          <TonConnectUIProvider manifestUrl={manifestUrl}>
            <SolanaWalletProvider>
              <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <ScrollToTop />
                  <Suspense fallback={<PageLoader />}>
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
                    <Route path="admin/internal-tokens" element={<RequireAdmin><InternalTokensAdmin /></RequireAdmin>} />
                    <Route path="admin/badges" element={<RequireAdmin><BadgesAdmin /></RequireAdmin>} />
                    <Route path="admin/announcements" element={<RequireAdmin><AnnouncementsAdmin /></RequireAdmin>} />
                    <Route path="market/:id" element={<MarketLocationProfile />} />
                    <Route path="admin/market-locations" element={<RequireAdmin><MarketLocationsAdmin /></RequireAdmin>} />
                      <Route path="*" element={<NotFound />} />
                    </Route>
                  </Routes>
                  </Suspense>
                </TooltipProvider>
              </BrowserRouter>
            </SolanaWalletProvider>
          </TonConnectUIProvider>
          </LanguageProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
};

export default App;

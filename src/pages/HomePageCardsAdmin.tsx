import { Helmet } from "react-helmet-async";
import HomePageCardsManagement from "@/components/admin/HomePageCardsManagement";
import RequireAdmin from "@/components/auth/RequireAdmin";

export default function HomePageCardsAdmin() {
  return (
    <RequireAdmin>
      <Helmet>
        <title>إدارة بطاقات الصفحة الرئيسية | Crypto-MSR Admin</title>
        <meta name="description" content="إدارة وتخصيص بطاقات الصفحة الرئيسية" />
      </Helmet>
      <div className="container mx-auto p-6">
        <HomePageCardsManagement />
      </div>
    </RequireAdmin>
  );
}
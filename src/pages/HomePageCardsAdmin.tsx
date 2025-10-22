import RequireAdmin from "@/components/auth/RequireAdmin";
import HomePageCardsManagement from "@/components/admin/HomePageCardsManagement";

export default function HomePageCardsAdmin() {
  return (
    <RequireAdmin>
      <div className="container mx-auto p-6">
        <HomePageCardsManagement />
      </div>
    </RequireAdmin>
  );
}
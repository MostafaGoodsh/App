import HomePageCardsManagement from "@/components/admin/HomePageCardsManagement";
import AdminPageShell from "@/components/admin/AdminPageShell";

export default function HomePageCardsAdmin() {
  return (
    <AdminPageShell withContainer>
      <HomePageCardsManagement />
    </AdminPageShell>
  );
}
